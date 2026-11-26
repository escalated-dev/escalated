import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, config, flushPromises } from '@vue/test-utils';
import TicketShow from '../../src/pages/Agent/TicketShow.vue';
import ChatActionBar from '../../src/components/ChatActionBar.vue';
import ChatComposer from '../../src/components/ChatComposer.vue';
import ChatThread from '../../src/components/ChatThread.vue';

/**
 * The agent ticket view runs a live chat through the backend's chat routes
 * by name: the agent routes (`escalated.agent.chat.*`, escalated-laravel),
 * then the admin ones for an admin, never the visitor's widget routes. It
 * reads the `chat.message` / `chat.typing` broadcasts in the shape
 * escalated-laravel sends them.
 */
const pageProps = { escalated: { prefix: 'support' }, auth: { user: { id: 1, name: 'Agent Ada' } } };

vi.mock('@inertiajs/vue3', () => {
    const form = () => ({ post: vi.fn(), processing: false, errors: {} });
    return {
        useForm: vi.fn(form),
        usePage: vi.fn(() => ({ props: pageProps })),
        router: { post: vi.fn(), reload: vi.fn(), visit: vi.fn() },
        Link: { template: '<a><slot /></a>' },
        Head: { render: () => null },
    };
});

const chatCallbacks = { current: null };
vi.mock('../../src/composables/useChat', () => ({
    useChat: () => ({
        subscribeToChat: (sessionId, callbacks) => {
            chatCallbacks.current = callbacks;
            return () => {};
        },
    }),
}));

vi.mock('../../src/composables/useRealtime', () => ({
    useRealtime: () => ({ echoAvailable: { value: false }, subscribeToTicket: () => () => {} }),
}));

const ticket = {
    id: 11,
    reference: 'ESC-00011',
    subject: 'Live chat',
    channel: 'chat',
    status: 'live',
    chat_session_id: 42,
    guest_name: 'Visitor Vera',
    chat_messages: [],
    replies: [],
    tags: [],
    attachments: [],
    activities: [],
};

const allRoutes = (name, params) => `/${name}/${params ?? ''}`;

/** A route() helper that knows only the names given, throwing for the rest as Ziggy does. */
function routesExcept(...missing) {
    return vi.fn((name, params) => {
        if (missing.some((m) => (m.endsWith('*') ? name.startsWith(m.slice(0, -1)) : name === m))) {
            throw new Error(`no route ${name}`);
        }
        return allRoutes(name, params);
    });
}

function mountPage(routeImpl, ticketOverrides = {}) {
    vi.stubGlobal('route', routeImpl);
    // The bar now sits in TicketDetailPane's header, so the page is mounted
    // for real with the layout and the heavier children stubbed.
    return mount(TicketShow, {
        props: {
            ticket: { ...ticket, ...ticketOverrides },
            departments: [{ id: 5, name: 'Billing' }],
            tags: [],
            cannedResponses: [],
        },
        global: {
            mocks: { route: routeImpl },
            stubs: {
                EscalatedLayout: { template: '<div><slot /></div>' },
                ChatActionBar: true,
                ChatThread: true,
                ChatComposer: true,
                PresenceIndicator: true,
                KnowledgePanel: true,
            },
        },
    });
}

let fetchMock;
beforeEach(() => {
    // The page body sits in EscalatedLayout's default slot; render it.
    config.global.renderStubDefaultSlot = true;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    pageProps.escalated = { prefix: 'support' };
    chatCallbacks.current = null;
    fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ reply_id: 900 }) }));
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    config.global.renderStubDefaultSlot = false;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('Agent/TicketShow chat routes', () => {
    it('uses the agent chat routes for end, transfer and typing', () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        const bar = wrapper.findComponent(ChatActionBar);
        expect(bar.props('endEndpoint')).toBe('/escalated.agent.chat.end/42');
        expect(bar.props('transferEndpoint')).toBe('/escalated.agent.chat.transfer/42');
        expect(wrapper.findComponent(ChatComposer).props('typingEndpoint')).toBe('/escalated.agent.chat.typing/42');
    });

    it('falls back to the admin chat routes for an admin on a host without agent ones', () => {
        pageProps.escalated = { prefix: 'support', is_admin: true };
        const wrapper = mountPage(routesExcept('escalated.agent.chat.*'));

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('/escalated.admin.chat.end/42');
        expect(wrapper.findComponent(ChatActionBar).props('transferEndpoint')).toBe(
            '/escalated.admin.chat.transfer/42',
        );
        expect(wrapper.findComponent(ChatComposer).props('typingEndpoint')).toBe('/escalated.admin.chat.typing/42');
    });

    it('gives an agent who is not an admin no admin route', () => {
        const wrapper = mountPage(routesExcept('escalated.agent.chat.*'));

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('');
        expect(wrapper.findComponent(ChatActionBar).props('transferEndpoint')).toBe('');
    });

    it("treats a shim's '#' placeholder for an unknown route as no endpoint", () => {
        pageProps.escalated = { prefix: 'support', is_admin: true };
        const route = vi.fn((name, params) => (name.includes('.chat.') ? '#' : allRoutes(name, params)));
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('');
        expect(wrapper.findComponent(ChatActionBar).props('transferEndpoint')).toBe('');
    });

    it("never posts typing to the visitor's widget route", () => {
        const wrapper = mountPage(routesExcept('escalated.agent.chat.*', 'escalated.admin.chat.*'));

        const composer = wrapper.findComponent(ChatComposer);
        expect(composer.props('typingEndpoint')).toBe('');
        expect(composer.props('sendEndpoint')).toBe('');
        expect(composer.props('allowAttachments')).toBe(false);
    });
});

describe('Agent/TicketShow chat messages', () => {
    it('shows a chat.message broadcast in the shape the backend sends', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        chatCallbacks.current.onMessage({
            reply_id: 7,
            body: 'Hello, my order is late',
            author: 'Visitor Vera',
            is_agent: false,
            created_at: '2026-11-25T10:00:00Z',
        });
        await flushPromises();

        const messages = wrapper.findComponent(ChatThread).props('messages');
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({
            id: 7,
            body: 'Hello, my order is late',
            is_agent: false,
            author: { name: 'Visitor Vera' },
        });
    });

    it('ignores the same message twice', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));
        const event = { reply_id: 7, body: 'Hi', author: 'Vera', is_agent: false, created_at: '2026-11-25T10:00:00Z' };

        chatCallbacks.current.onMessage(event);
        chatCallbacks.current.onMessage(event);
        await flushPromises();

        expect(wrapper.findComponent(ChatThread).props('messages')).toHaveLength(1);
    });

    it('sends through the agent chat message route and shows the message once', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        wrapper.findComponent(ChatComposer).vm.$emit('send', { body: 'How can I help?', is_internal_note: false });
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('/escalated.agent.chat.message/42');
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({ body: 'How can I help?', is_internal_note: false });

        // The agent's own message comes back on the channel.
        chatCallbacks.current.onMessage({
            reply_id: 900,
            body: 'How can I help?',
            author: 'Agent Ada',
            is_agent: true,
            created_at: '2026-11-25T10:00:05Z',
        });
        await flushPromises();

        const messages = wrapper.findComponent(ChatThread).props('messages');
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({ id: 900, body: 'How can I help?', is_agent: true, author: { id: 1 } });
    });

    it('sends through the ticket reply route on a host without a chat message route', async () => {
        const wrapper = mountPage(routesExcept('escalated.agent.chat.*', 'escalated.admin.chat.*'));

        wrapper.findComponent(ChatComposer).vm.$emit('send', { body: 'Hello', is_internal_note: false });
        await flushPromises();

        expect(fetchMock.mock.calls[0][0]).toBe('/escalated.agent.tickets.reply/ESC-00011');
    });

    it('sends a note through the note route on a host without a chat message route', async () => {
        const wrapper = mountPage(routesExcept('escalated.agent.chat.*', 'escalated.admin.chat.*'));

        wrapper.findComponent(ChatComposer).vm.$emit('send', { body: 'Refund pending', is_internal_note: true });
        await flushPromises();

        expect(fetchMock.mock.calls[0][0]).toBe('/escalated.agent.tickets.note/ESC-00011');
    });

    it('takes back a message the backend refused', async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({}) });
        const wrapper = mountPage(vi.fn(allRoutes));

        wrapper.findComponent(ChatComposer).vm.$emit('send', { body: 'Hello', is_internal_note: false });
        await flushPromises();

        expect(wrapper.findComponent(ChatThread).props('messages')).toHaveLength(0);
    });
});

describe('Agent/TicketShow chat typing', () => {
    it('names the visitor from the chat.typing payload', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        chatCallbacks.current.onTyping({ is_agent: false, user_name: 'Vera' });
        await flushPromises();

        expect(wrapper.findComponent(ChatThread).props('typingUser')).toBe('Vera');
    });

    it('falls back to the guest name when the backend sends none', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        chatCallbacks.current.onTyping({ is_agent: false, user_name: null });
        await flushPromises();

        expect(wrapper.findComponent(ChatThread).props('typingUser')).toBe('Visitor Vera');
    });

    it('does not show an agent typing as the visitor', async () => {
        const wrapper = mountPage(vi.fn(allRoutes));

        chatCallbacks.current.onTyping({ is_agent: true, user_name: 'Agent Ada' });
        await flushPromises();

        expect(wrapper.findComponent(ChatThread).props('typingUser')).toBe(null);
    });
});
