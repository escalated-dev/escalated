import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TicketIndex from '../../src/pages/Agent/TicketIndex.vue';
import { forgetInbox } from '../../src/utils/agentQueues';
import { forgetMarks, markSeen, ticketUnread } from '../../src/composables/useUnread';
import { clearToasts, useAgentToasts } from '../../src/composables/useAgentToasts';

const usePage = vi.fn();
const router = { get: vi.fn(), visit: vi.fn(), reload: vi.fn(), post: vi.fn() };

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
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
    useRealtime: () => ({ echoAvailable: { value: false }, subscribeToTickets: () => {}, subscribeToAgent: () => {} }),
}));

const tickets = {
    data: [
        { id: 1, reference: 'ESC-1042', subject: 'Export fails', status: 'open', is_unread: true },
        { id: 2, reference: 'ESC-1041', subject: 'SSO loop', status: 'open', is_unread: false },
    ],
    current_page: 1,
    last_page: 1,
    total: 2,
};

let wrapper;

function mountPage({ routes = true, inbox = null } = {}) {
    usePage.mockReturnValue({
        url: '/support/agent/tickets?assigned_to=7',
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: { prefix: 'support', is_agent: true, show_powered_by: false },
            inbox,
        },
    });
    const route = vi.fn((name, params) => {
        if (name === 'escalated.agent.tickets.create') throw new Error('no route');
        if (!routes && /tickets\.(read|unread)$/.test(name)) throw new Error('no route');
        if (name === 'escalated.agent.tickets.index') return '/support/agent/tickets';
        if (name === 'escalated.agent.tickets.bulk') return '/support/agent/tickets/bulk';
        if (name === 'escalated.agent.tickets.read') return `/support/agent/tickets/${params}/read`;
        if (name === 'escalated.agent.tickets.unread') return `/support/agent/tickets/${params}/unread`;
        return `/${name}/${params ?? ''}`;
    });
    vi.stubGlobal('route', route);
    wrapper = mount(TicketIndex, {
        props: { tickets, filters: {}, departments: [], tags: [], inbox },
        global: { mocks: { route } },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    forgetInbox();
    forgetMarks();
    clearToasts();
    Object.values(router).forEach((fn) => fn.mockReset());
    vi.stubGlobal(
        'fetch',
        vi.fn((url) =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ is_unread: String(url).endsWith('/unread') }),
            }),
        ),
    );
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
});

const rows = () => wrapper.findAll('[data-testid="esc-queue-row"]');

async function openRowMenu(index) {
    await rows()[index].get('[data-testid="esc-queue-row-menu"]').trigger('click');
    return rows()[index].findAll('[role="menuitem"]');
}

describe('Unread: the row menu', () => {
    it('offers Mark as read on an unread row and Mark as unread on a read one', async () => {
        mountPage();
        expect((await openRowMenu(0)).map((item) => item.text())).toEqual(['Mark as read']);
        document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect((await openRowMenu(1)).map((item) => item.text())).toEqual(['Mark as unread']);
    });

    it('labels the menu button with the ticket', () => {
        mountPage();
        const button = rows()[0].get('[data-testid="esc-queue-row-menu"]');
        expect(button.attributes('aria-label')).toBe('Actions for ESC-1042');
        expect(button.attributes('aria-haspopup')).toBe('menu');
    });

    it('marks a row read at once and posts to the read route', async () => {
        mountPage({ inbox: { counts: { mine: 2 } } });
        const [item] = await openRowMenu(0);
        await item.trigger('click');
        expect(rows()[0].attributes('data-unread')).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith(
            '/support/agent/tickets/ESC-1042/read',
            expect.objectContaining({ method: 'POST' }),
        );
        await flushPromises();
        expect(router.reload).toHaveBeenCalledWith(expect.objectContaining({ only: ['inbox'] }));
    });

    it('marks a row unread through the unread route', async () => {
        mountPage();
        const [item] = await openRowMenu(1);
        await item.trigger('click');
        await flushPromises();
        expect(rows()[1].attributes('data-unread')).toBe('true');
        expect(rows()[1].find('[data-testid="esc-queue-unread"]').exists()).toBe(true);
        expect(fetch).toHaveBeenCalledWith('/support/agent/tickets/ESC-1041/unread', expect.anything());
    });

    it('puts the row back and says so when the backend refuses', async () => {
        fetch.mockImplementation(() => Promise.resolve({ ok: false, status: 403 }));
        mountPage();
        const [item] = await openRowMenu(0);
        await item.trigger('click');
        await flushPromises();
        expect(rows()[0].attributes('data-unread')).toBe('true');
        expect(useAgentToasts().toasts.value.at(-1)).toMatchObject({ tone: 'error' });
    });

    it('has no row menu when the host has no read and unread routes', () => {
        mountPage({ routes: false });
        expect(wrapper.find('[data-testid="esc-queue-row-menu"]').exists()).toBe(false);
    });

    it('lets fresh rows from the backend replace marks made here', async () => {
        mountPage();
        markSeen(tickets.data[0]);
        expect(ticketUnread(tickets.data[0])).toBe(false);
        await wrapper.setProps({ tickets: { ...tickets, data: tickets.data.map((row) => ({ ...row })) } });
        expect(ticketUnread(tickets.data[0])).toBe(true);
    });
});

describe('Unread: bulk actions', () => {
    it('offers Mark read and Mark unread for the selection when the host can mark', async () => {
        mountPage();
        await rows()[0].get('[data-testid="esc-queue-row-select"]').setValue(true);
        const bar = wrapper.get('[data-testid="esc-bulk-bar"]');
        await bar.get('[data-testid="esc-bulk-mark-read"]').trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/support/agent/tickets/bulk',
            { ticket_ids: [1], action: 'mark_read', value: null },
            expect.any(Object),
        );
        router.post.mock.calls[0][2].onFinish?.();
        await nextTick();
        await bar.get('[data-testid="esc-bulk-mark-unread"]').trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/support/agent/tickets/bulk',
            expect.objectContaining({ action: 'mark_unread' }),
            expect.any(Object),
        );
    });

    it('leaves them out when the host cannot mark', async () => {
        mountPage({ routes: false });
        await rows()[0].get('[data-testid="esc-queue-row-select"]').setValue(true);
        expect(wrapper.find('[data-testid="esc-bulk-mark-read"]').exists()).toBe(false);
    });
});

describe('Unread: the rail', () => {
    it('marks a queue with unread tickets and says how many', () => {
        mountPage({ inbox: { counts: { mine: 24, unassigned: 18, all: 142 }, unread: { mine: 3, all: 0 } } });
        const links = wrapper.findAll('[data-testid="esc-rail-queues"] a');
        const mine = links[0];
        expect(mine.find('[data-testid="esc-rail-unread"]').exists()).toBe(true);
        expect(mine.text()).toContain('3 unread');
        expect(mine.text()).toContain('24');
        expect(links[1].find('[data-testid="esc-rail-unread"]').exists()).toBe(false);
        expect(links[2].find('[data-testid="esc-rail-unread"]').exists()).toBe(false);
    });

    it('shows no unread marker without inbox.unread', () => {
        mountPage({ inbox: { counts: { mine: 24 } } });
        expect(wrapper.find('[data-testid="esc-rail-unread"]').exists()).toBe(false);
    });
});
