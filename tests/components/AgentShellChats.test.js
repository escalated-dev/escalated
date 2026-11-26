import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';
import ActiveChatsPanel from '../../src/components/ActiveChatsPanel.vue';
import { resetAgentStatus } from '../../src/composables/useAgentStatus';
import { clearToasts, useAgentToasts } from '../../src/composables/useAgentToasts';

/**
 * The agent panel's live chats: the backend shares the agent's active chats
 * (`escalated.active_chats`) and the waiting queue (`escalated.chat_queue`);
 * a chat opens its ticket, and a waiting one is accepted through the chat
 * accept route by name.
 */
const usePage = vi.fn();
const visit = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    router: { visit: (...a) => visit(...a), reload: vi.fn(), get: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const activeChat = {
    id: 3,
    ticket_reference: 'ESC-00003',
    customer_name: 'Vera Visitor',
    last_message: 'Thanks',
    last_message_at: new Date().toISOString(),
};
const waitingChat = { id: 4, ticket_reference: 'ESC-00004', customer_name: 'Walt Waiting', first_message: 'Hello?' };

let wrapper;
function mountShell(escalated = {}) {
    usePage.mockReturnValue({
        url: '/support/agent/tickets',
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: {
                prefix: 'support',
                is_agent: true,
                show_powered_by: false,
                chat_enabled: true,
                active_chats: [activeChat],
                chat_queue: [waitingChat],
                ...escalated,
            },
        },
    });
    wrapper = mount(EscalatedLayout, {
        props: { title: 'Tickets' },
        slots: { default: '<p>content</p>' },
        attachTo: document.body,
    });
    return wrapper;
}

let fetchMock;
beforeEach(() => {
    window.localStorage.clear();
    resetAgentStatus();
    clearToasts();
    usePage.mockReset();
    visit.mockReset();
    fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ sessions: [] }) }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('route', (name, params) => {
        if (!name.startsWith('escalated.agent.chat.')) throw new Error(`no route ${name}`);
        return params === undefined
            ? `/support/agent/chat/${name.split('.').pop()}`
            : `/support/agent/chat/${params}/${name.split('.').pop()}`;
    });
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
});

describe('AgentShell live chats', () => {
    it('hands the shared active chats and queue to the panel', () => {
        mountShell();
        const panel = wrapper.findComponent(ActiveChatsPanel);

        expect(panel.props('chats').map((chat) => chat.id)).toEqual([3]);
        expect(panel.props('queue').map((chat) => chat.id)).toEqual([4]);
        expect(wrapper.get('[data-testid="esc-rail-live-chats"]').text()).toContain('1');
    });

    it('shows no panel while live chat is off', () => {
        mountShell({ chat_enabled: false });
        expect(wrapper.findComponent(ActiveChatsPanel).exists()).toBe(false);
    });

    it('opens the ticket of a chat picked in the panel', async () => {
        mountShell();
        wrapper.findComponent(ActiveChatsPanel).vm.$emit('navigate', activeChat);

        // ticketUrl() asks route() first; this host has only the chat routes.
        expect(visit).toHaveBeenCalledWith('/support/agent/tickets/ESC-00003');
    });

    it('accepts a waiting chat through the agent accept route, then opens it', async () => {
        mountShell();
        wrapper
            .findComponent(ActiveChatsPanel)
            .vm.$emit('accept', wrapper.findComponent(ActiveChatsPanel).props('queue')[0]);
        await flushPromises();

        const accept = fetchMock.mock.calls.find(([url]) => url === '/support/agent/chat/4/accept');
        expect(accept).toBeTruthy();
        expect(accept[1].method).toBe('POST');
        expect(visit).toHaveBeenCalledWith('/support/agent/tickets/ESC-00004');
        // The lists are fetched again afterwards.
        expect(fetchMock.mock.calls.some(([url]) => url === '/support/agent/chat/active')).toBe(true);
        expect(fetchMock.mock.calls.some(([url]) => url === '/support/agent/chat/queue')).toBe(true);
    });

    it('says so when the chat could not be accepted', async () => {
        fetchMock.mockImplementation(async (url) => ({
            ok: !String(url).endsWith('/accept'),
            status: 422,
            json: async () => ({ sessions: [] }),
        }));
        mountShell();
        wrapper.findComponent(ActiveChatsPanel).vm.$emit('accept', waitingChat);
        await flushPromises();

        expect(visit).not.toHaveBeenCalled();
        expect(useAgentToasts().toasts.value.some((item) => item.message === 'Could not accept the chat.')).toBe(true);
    });

    it('offers no accept on a host without a chat accept route', async () => {
        vi.stubGlobal('route', () => {
            throw new Error('no route');
        });
        mountShell();
        wrapper.findComponent(ActiveChatsPanel).vm.$emit('accept', waitingChat);
        await flushPromises();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(visit).not.toHaveBeenCalled();
    });
});
