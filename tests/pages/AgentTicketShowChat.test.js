import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import TicketShow from '../../src/pages/Agent/TicketShow.vue';
import ChatActionBar from '../../src/components/ChatActionBar.vue';

/**
 * The agent ticket view renders ChatActionBar for a live chat. It never passed
 * a transfer endpoint, so the bar's transfer menu posted nothing on any
 * backend. It now passes the named route escalated-laravel serves chat
 * transfer under, `escalated.admin.chat.transfer`.
 */
vi.mock('@inertiajs/vue3', () => {
    const form = () => ({ post: vi.fn(), processing: false, errors: {} });
    return {
        useForm: vi.fn(form),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support' }, auth: { user: { id: 1 } } } })),
        router: { post: vi.fn(), reload: vi.fn() },
        Link: { template: '<a><slot /></a>' },
    };
});

vi.mock('../../src/composables/useChat', () => ({
    useChat: () => ({ subscribeToChat: () => () => {} }),
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
    replies: [],
    tags: [],
    attachments: [],
    activities: [],
};

function mountPage(routeImpl) {
    vi.stubGlobal('route', routeImpl);
    return shallowMount(TicketShow, {
        props: { ticket, departments: [{ id: 5, name: 'Billing' }], tags: [], cannedResponses: [] },
        global: { mocks: { route: routeImpl } },
    });
}

beforeEach(() => {
    // The page body sits in EscalatedLayout's default slot; render it.
    config.global.renderStubDefaultSlot = true;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    config.global.renderStubDefaultSlot = false;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('Agent/TicketShow chat transfer', () => {
    it('passes the chat transfer route for the live session to ChatActionBar', () => {
        const route = vi.fn((name, params) => `/${name}/${params ?? ''}`);
        const wrapper = mountPage(route);

        const bar = wrapper.findComponent(ChatActionBar);
        expect(bar.exists()).toBe(true);
        expect(bar.props('transferEndpoint')).toBe('/escalated.admin.chat.transfer/42');
        expect(route).toHaveBeenCalledWith('escalated.admin.chat.transfer', 42);
    });

    it('leaves the endpoint empty when the host has no such route', () => {
        const route = vi.fn((name, params) => {
            if (name === 'escalated.admin.chat.transfer') throw new Error(`no route ${name}`);
            return `/${name}/${params ?? ''}`;
        });
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('transferEndpoint')).toBe('');
    });

    it("treats a shim's '#' placeholder for an unknown route as no endpoint", () => {
        const route = vi.fn((name, params) => (name === 'escalated.admin.chat.transfer' ? '#' : `/${name}/${params}`));
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('transferEndpoint')).toBe('');
    });
});

/**
 * End Chat had the same gap: TicketShow passed no end endpoint, so the bar's
 * End Chat posted nothing. It now passes `escalated.admin.chat.end`.
 */
describe('Agent/TicketShow chat end', () => {
    it('passes the chat end route for the live session to ChatActionBar', () => {
        const route = vi.fn((name, params) => `/${name}/${params ?? ''}`);
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('/escalated.admin.chat.end/42');
        expect(route).toHaveBeenCalledWith('escalated.admin.chat.end', 42);
    });

    it('leaves the end endpoint empty when the host has no such route', () => {
        const route = vi.fn((name, params) => {
            if (name === 'escalated.admin.chat.end') throw new Error(`no route ${name}`);
            return `/${name}/${params ?? ''}`;
        });
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('');
    });

    it("treats a shim's '#' placeholder for the end route as no endpoint", () => {
        const route = vi.fn((name, params) => (name === 'escalated.admin.chat.end' ? '#' : `/${name}/${params}`));
        const wrapper = mountPage(route);

        expect(wrapper.findComponent(ChatActionBar).props('endEndpoint')).toBe('');
    });
});
