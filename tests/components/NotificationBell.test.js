import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';
import { resetAgentStatus } from '../../src/composables/useAgentStatus';
import { resetNotifications } from '../../src/composables/useNotifications';

const usePage = vi.fn();
const visit = vi.fn();
const listeners = {};

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    router: { visit: (...a) => visit(...a), reload: vi.fn(), get: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

vi.mock('../../src/composables/useRealtime', () => ({
    useRealtime: () => ({
        echoAvailable: { value: true },
        listenScoped: (suffix, handlers) => {
            listeners.suffix = typeof suffix === 'function' ? suffix() : suffix;
            Object.assign(listeners, handlers);
            return () => {};
        },
    }),
}));

const ROUTES = {
    'escalated.agent.notifications.index': '/support/agent/notifications',
    'escalated.agent.notifications.read-all': '/support/agent/notifications/read-all',
};

function item(id, overrides = {}) {
    return {
        id: `n-${id}`,
        type: 'ticket_assigned',
        title: `ESC-0${id} was assigned to you`,
        body: 'Printer on fire',
        ticket: { id, reference: `ESC-0${id}`, subject: 'Printer on fire' },
        url: `http://localhost:3000/support/agent/tickets/ESC-0${id}`,
        created_at: new Date(Date.now() - id * 60000).toISOString(),
        read_at: null,
        ...overrides,
    };
}

let answers;
let wrapper;

function mountShell({ notifications = { unread_count: 3 }, routes = ROUTES } = {}) {
    usePage.mockReturnValue({
        url: '/support/agent/tickets',
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: { prefix: 'support', is_agent: true, show_powered_by: false, notifications },
        },
    });
    window.route = vi.fn((name, params) => {
        if (name === 'escalated.agent.notifications.read' && routes[name] !== null) {
            return `/support/agent/notifications/${params}/read`;
        }
        if (routes[name]) return routes[name];
        throw new Error('no route');
    });
    wrapper = mount(EscalatedLayout, {
        props: { title: 'Tickets' },
        slots: { default: '<p>content</p>' },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    resetAgentStatus();
    resetNotifications();
    visit.mockReset();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
    answers = [];
    vi.stubGlobal(
        'fetch',
        vi.fn(() => {
            const next = answers.shift();
            if (next) return Promise.resolve(next);
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ unread_count: 2 }) });
        }),
    );
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
    delete window.route;
});

const page = (data, meta = { current_page: 1, last_page: 1 }, unread = 3) => ({
    ok: true,
    json: () => Promise.resolve({ data, meta: { per_page: 20, total: data.length, ...meta }, unread_count: unread }),
});

const bell = () => wrapper.get('[data-testid="esc-notifications-bell"]');

describe('Notification bell', () => {
    it('shows the shared unread count on a bell in the top bar', () => {
        mountShell();
        expect(bell().attributes('aria-label')).toBe('Notifications, 3 unread');
        expect(wrapper.get('[data-testid="esc-notifications-count"]').text()).toBe('3');
    });

    it('shows no count when nothing is unread, and caps a large one', () => {
        mountShell({ notifications: { unread_count: 0 } });
        expect(wrapper.find('[data-testid="esc-notifications-count"]').exists()).toBe(false);
        expect(bell().attributes('aria-label')).toBe('Notifications');
        wrapper.unmount();
        mountShell({ notifications: { unread_count: 140 } });
        expect(wrapper.get('[data-testid="esc-notifications-count"]').text()).toBe('99+');
    });

    it('is not shown without the shared prop or without the feed route', () => {
        mountShell({ notifications: null });
        expect(wrapper.find('[data-testid="esc-notifications-bell"]').exists()).toBe(false);
        wrapper.unmount();
        mountShell({ routes: {} });
        expect(wrapper.find('[data-testid="esc-notifications-bell"]').exists()).toBe(false);
    });

    it('loads the newest notifications when opened', async () => {
        answers.push(page([item(1), item(2, { read_at: new Date().toISOString(), type: 'sla_breached' })]));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        expect(fetch.mock.calls[0][0]).toBe('/support/agent/notifications?page=1');
        const rows = wrapper.findAll('[data-testid="esc-notification"]');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('ESC-01 was assigned to you');
        expect(rows[0].text()).toContain('Printer on fire');
        expect(rows[0].attributes('data-unread')).toBe('true');
        expect(rows[1].attributes('data-unread')).toBeUndefined();
        expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('Notifications');
    });

    it('opens the ticket and marks the notification read', async () => {
        answers.push(page([item(1)]));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notification"]').trigger('click');
        expect(fetch).toHaveBeenLastCalledWith(
            '/support/agent/notifications/n-1/read',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(visit).toHaveBeenCalledWith('http://localhost:3000/support/agent/tickets/ESC-01');
        await flushPromises();
        expect(wrapper.get('[data-testid="esc-notifications-count"]').text()).toBe('2');
    });

    it('marks a notification without a ticket read and stays open', async () => {
        answers.push(
            page([item(1, { url: null, ticket: null, body: null, title: 'A ticket you can no longer view' })]),
        );
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notification"]').trigger('click');
        expect(visit).not.toHaveBeenCalled();
        expect(wrapper.find('[data-testid="esc-notifications"]').exists()).toBe(true);
        expect(wrapper.get('[data-testid="esc-notification"]').attributes('data-unread')).toBeUndefined();
    });

    it('marks all read', async () => {
        answers.push(page([item(1), item(2)]));
        answers.push({ ok: true, json: () => Promise.resolve({ unread_count: 0 }) });
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notifications-read-all"]').trigger('click');
        await flushPromises();
        expect(fetch).toHaveBeenLastCalledWith('/support/agent/notifications/read-all', expect.anything());
        expect(wrapper.findAll('[data-unread="true"]')).toHaveLength(0);
        expect(wrapper.find('[data-testid="esc-notifications-count"]').exists()).toBe(false);
    });

    it('puts things back when mark all read fails', async () => {
        answers.push(page([item(1)]));
        answers.push({ ok: false, status: 500 });
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notifications-read-all"]').trigger('click');
        await flushPromises();
        expect(wrapper.get('[data-testid="esc-notification"]').attributes('data-unread')).toBe('true');
        expect(wrapper.get('[data-testid="esc-notifications-count"]').text()).toBe('3');
    });

    it('pages through older notifications', async () => {
        answers.push(page([item(1)], { current_page: 1, last_page: 2 }));
        answers.push(page([item(2)], { current_page: 2, last_page: 2 }));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notifications-more"]').trigger('click');
        await flushPromises();
        expect(fetch.mock.calls[1][0]).toBe('/support/agent/notifications?page=2');
        expect(wrapper.findAll('[data-testid="esc-notification"]')).toHaveLength(2);
        expect(wrapper.find('[data-testid="esc-notifications-more"]').exists()).toBe(false);
    });

    it('filters to unread only', async () => {
        answers.push(page([item(1)]));
        answers.push(page([], { current_page: 1, last_page: 1 }, 0));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notifications-unread-only"]').trigger('click');
        await flushPromises();
        expect(fetch.mock.calls[1][0]).toBe('/support/agent/notifications?page=1&unread=1');
        expect(wrapper.get('[data-testid="esc-notifications-empty"]').text()).toBe('No unread notifications.');
    });

    it('says so when the feed does not load, and retries', async () => {
        answers.push({ ok: false, status: 500 });
        answers.push(page([item(1)]));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        const failed = wrapper.get('[data-testid="esc-notifications-failed"]');
        await failed.get('button').trigger('click');
        await flushPromises();
        expect(wrapper.findAll('[data-testid="esc-notification"]')).toHaveLength(1);
    });

    it('closes on Escape and returns focus to the bell', async () => {
        answers.push(page([]));
        mountShell();
        await bell().trigger('click');
        await flushPromises();
        await wrapper.get('[data-testid="esc-notifications"]').trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('[data-testid="esc-notifications"]').exists()).toBe(false);
        expect(document.activeElement).toBe(bell().element);
    });

    it("adds notification.created from the agent's channel to the count", async () => {
        mountShell();
        expect(listeners.suffix).toBe('agents.7');
        listeners['.notification.created'](item(9));
        await nextTick();
        expect(wrapper.get('[data-testid="esc-notifications-count"]').text()).toBe('4');
    });
});
