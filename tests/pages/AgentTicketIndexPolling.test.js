import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TicketIndex from '../../src/pages/Agent/TicketIndex.vue';
import { forgetInbox } from '../../src/utils/agentQueues';

/**
 * Without Echo (broadcasting off, or Echo not on window.Echo) the agent ticket
 * list reloads itself on a timer instead of waiting for events that never come.
 */
const router = { get: vi.fn(), visit: vi.fn(), reload: vi.fn(), post: vi.fn() };
const realtime = { echoAvailable: { value: false }, pollInterval: 30000 };
const subscribeToTickets = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        url: '/support/agent/tickets',
        props: { auth: { user: { id: 7, name: 'Mike Agent' } }, escalated: { prefix: 'support', is_agent: true } },
    }),
    router: {
        get: (...a) => router.get(...a),
        visit: (...a) => router.visit(...a),
        reload: (...a) => router.reload(...a),
        post: (...a) => router.post(...a),
        on: () => () => {},
    },
    useForm: (data) => ({ ...data, post: vi.fn(), processing: false, errors: {} }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/useRealtime', () => ({
    useRealtime: () => ({
        echoAvailable: realtime.echoAvailable,
        pollInterval: realtime.pollInterval,
        subscribeToTickets: (...a) => subscribeToTickets(...a),
        subscribeToAgent: () => {},
    }),
}));

const tickets = { data: [], current_page: 1, last_page: 1, total: 0 };
let wrapper;

function mountPage() {
    const route = vi.fn((name) => (name === 'escalated.agent.tickets.index' ? '/support/agent/tickets' : `/${name}`));
    vi.stubGlobal('route', route);
    wrapper = mount(TicketIndex, {
        props: { tickets, filters: {}, departments: [], tags: [] },
        global: { mocks: { route } },
    });
}

beforeEach(() => {
    vi.useFakeTimers();
    forgetInbox();
    Object.values(router).forEach((fn) => fn.mockReset());
    subscribeToTickets.mockReset();
    realtime.echoAvailable = { value: false };
    realtime.pollInterval = 30000;
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

const reloads = () => router.reload.mock.calls.filter(([options]) => options?.only?.includes('tickets'));

describe('Agent/TicketIndex without Echo', () => {
    it('reloads the ticket list every poll interval', () => {
        mountPage();
        expect(reloads()).toHaveLength(0);

        vi.advanceTimersByTime(30000);
        expect(reloads()).toHaveLength(1);
        expect(reloads()[0][0]).toMatchObject({ only: ['tickets', 'inbox'], preserveScroll: true });

        vi.advanceTimersByTime(30000);
        expect(reloads()).toHaveLength(2);
    });

    it('skips a reload while the tab is hidden', () => {
        mountPage();
        const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

        vi.advanceTimersByTime(30000);
        expect(reloads()).toHaveLength(0);
        hidden.mockRestore();
    });

    it('stops polling once the page is left', () => {
        mountPage();
        wrapper.unmount();
        wrapper = null;

        vi.advanceTimersByTime(90000);
        expect(reloads()).toHaveLength(0);
    });

    it('does not poll when polling is turned off', () => {
        realtime.pollInterval = 0;
        mountPage();

        vi.advanceTimersByTime(90000);
        expect(reloads()).toHaveLength(0);
    });
});

describe('Agent/TicketIndex with Echo', () => {
    it('listens for events instead of polling', () => {
        realtime.echoAvailable = { value: true };
        mountPage();

        vi.advanceTimersByTime(90000);
        expect(reloads()).toHaveLength(0);
        expect(subscribeToTickets).toHaveBeenCalled();
    });
});
