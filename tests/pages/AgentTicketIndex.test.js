import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TicketIndex from '../../src/pages/Agent/TicketIndex.vue';
import PluginSlot from '../../src/components/PluginSlot.vue';
import { PANEL_ICONS } from '../../src/components/PanelIcon.vue';
import { forgetInbox, recallInbox } from '../../src/utils/agentQueues';

const usePage = vi.fn();
const router = { get: vi.fn(), visit: vi.fn(), reload: vi.fn(), post: vi.fn() };

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    router: {
        get: (...a) => router.get(...a),
        visit: (...a) => router.visit(...a),
        reload: (...a) => router.reload(...a),
        post: (...a) => router.post(...a),
        on: (...a) => (router.on ? router.on(...a) : () => {}),
    },
    useForm: (data) => ({ ...data, post: vi.fn(), processing: false, errors: {} }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/useRealtime', () => ({
    useRealtime: () => ({ echoAvailable: { value: false }, subscribeToTickets: () => {}, subscribeToAgent: () => {} }),
}));

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const tickets = {
    data: [
        {
            id: 1,
            reference: 'ESC-1042',
            subject: 'Unable to export CSV reports',
            description: '<p>Export fails with a <b>server error</b>.</p>',
            priority: 'high',
            status: 'open',
            requester: { name: 'Sarah Chen' },
            updated_at: minutesAgo(12),
            is_unread: true,
            requester_online: true,
        },
        {
            id: 2,
            reference: 'ESC-1041',
            subject: 'SSO login redirect loop',
            description: 'Loops forever.',
            priority: 'urgent',
            status: 'open',
            requester: { name: 'James Wright' },
            updated_at: minutesAgo(34),
            sla_first_response_breached: true,
        },
        {
            id: 3,
            reference: 'ESC-1040',
            subject: 'Custom fields not saved',
            description: 'Gone after refresh.',
            priority: 'low',
            status: 'in_progress',
            requester_name: 'Maria Garcia',
            updated_at: minutesAgo(64),
        },
    ],
    current_page: 1,
    last_page: 1,
    total: 24,
};

const inbox = {
    counts: { mine: 24, unassigned: 18, all: 142 },
    views: [{ id: 'urgent', name: 'Urgent', count: 6, filters: { priority: 'urgent' } }],
    stats: { open: 24, urgent: 6, sla_at_risk: 4, resolved_today: 27 },
};

function pageAt(url) {
    usePage.mockReturnValue({
        url,
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: { prefix: 'support', is_agent: true, show_powered_by: false },
        },
    });
}

let wrapper;

function mountPage(url, props = {}) {
    pageAt(url);
    const route = vi.fn((name, params) => {
        if (name === 'escalated.agent.tickets.create') throw new Error('no route');
        if (name === 'escalated.agent.tickets.index') return '/support/agent/tickets';
        if (name === 'escalated.agent.tickets.show') return `/support/agent/tickets/${params}`;
        return `/${name}`;
    });
    vi.stubGlobal('route', route);
    wrapper = mount(TicketIndex, {
        props: { tickets, filters: {}, departments: [], tags: [], ...props },
        global: { mocks: { route } },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    forgetInbox();
    Object.values(router).forEach((fn) => fn.mockReset());
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
});

const rows = () => wrapper.findAll('[data-testid="esc-queue-row"]');

describe('Agent/TicketIndex without the new props', () => {
    it('renders the ticket rows in a list column with an empty detail pane', () => {
        mountPage('/support/agent/tickets');
        expect(rows()).toHaveLength(3);
        expect(wrapper.get('[data-testid="esc-detail-empty"]').text()).toContain('Select a ticket');
        expect(wrapper.find('[data-testid="esc-stat-strip"]').exists()).toBe(false);
    });

    it('names the queue from the URL and counts the tickets', () => {
        mountPage('/support/agent/tickets');
        expect(wrapper.get('h2').text()).toBe('All tickets');
        expect(wrapper.text()).toContain('24 tickets');
    });

    it('shows each row with initials, reference, subject, a one-line preview and the age', () => {
        mountPage('/support/agent/tickets');
        const first = rows()[0];
        expect(first.text()).toContain('SC');
        expect(first.text()).toContain('ESC-1042');
        expect(first.text()).toContain('Unable to export CSV reports');
        expect(first.text()).toContain('Export fails with a server error.');
        expect(first.text()).toContain('12m ago');
        expect(first.find('a').attributes('href')).toBe('/support/agent/tickets/ESC-1042');
        expect(rows()[2].text()).toContain('MG');
    });

    it('decodes entities in the preview once', () => {
        mountPage('/support/agent/tickets', {
            tickets: { data: [{ ...tickets.data[0], description: '<p>Use &amp;lt;b&amp;gt; &amp; more</p>' }] },
        });
        expect(rows()[0].text()).toContain('Use &lt;b&gt; & more');
    });

    it('marks unread rows, online requesters, priority and SLA breaches', () => {
        mountPage('/support/agent/tickets');
        expect(rows()[0].attributes('data-unread')).toBe('true');
        expect(rows()[1].attributes('data-unread')).toBeUndefined();
        expect(rows()[0].find('[data-testid="esc-queue-live"]').exists()).toBe(true);
        expect(rows()[1].find('[data-testid="esc-queue-live"]').exists()).toBe(false);
        expect(rows()[0].get('[data-testid="esc-queue-priority"]').text()).toBe('High');
        expect(rows()[1].get('[data-testid="esc-queue-priority"]').text()).toBe('Urgent');
        expect(rows()[1].get('[data-testid="esc-queue-sla"]').text()).toContain('SLA breached');
        expect(rows()[0].find('[data-testid="esc-queue-sla"]').exists()).toBe(false);
    });

    it('hides New ticket when the host has no agent create route', () => {
        mountPage('/support/agent/tickets');
        expect(wrapper.text()).not.toContain('New ticket');
    });

    it('keeps the plugin slots', () => {
        mountPage('/support/agent/tickets');
        const slots = wrapper.findAllComponents(PluginSlot).map((s) => s.props('slot'));
        expect(slots).toEqual(['ticket.list.before_filters', 'ticket.list.footer']);
    });

    it('searches as the agent types', async () => {
        vi.useFakeTimers();
        mountPage('/support/agent/tickets');
        await wrapper.get('[data-testid="esc-queue-search"]').setValue('csv');
        vi.advanceTimersByTime(350);
        vi.useRealTimers();
        expect(router.get).toHaveBeenCalledWith(
            '/support/agent/tickets',
            { search: 'csv' },
            expect.objectContaining({ preserveState: true }),
        );
    });

    it('opens the existing filters in a popover', async () => {
        mountPage('/support/agent/tickets');
        expect(wrapper.find('[data-testid="esc-queue-filters"]').exists()).toBe(false);
        await wrapper.get('[data-testid="esc-queue-filter-toggle"]').trigger('click');
        expect(wrapper.find('[data-testid="esc-queue-filters"]').exists()).toBe(true);
    });

    it('moves with j and k, selects with x and opens with Enter', async () => {
        mountPage('/support/agent/tickets');
        const press = (key) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key, cancelable: true }));
        press('j');
        await nextTick();
        press('j');
        await nextTick();
        press('x');
        await nextTick();
        expect(wrapper.findAll('[data-testid="esc-queue-row-select"]')[1].element.checked).toBe(true);
        press('k');
        await nextTick();
        press('Enter');
        expect(router.visit).toHaveBeenCalledWith('/support/agent/tickets/ESC-1042', expect.any(Object));
    });

    it('moves focus between rows with the arrow keys (roving tabindex)', async () => {
        mountPage('/support/agent/tickets');
        const links = () => rows().map((r) => r.get('a'));
        expect(links().map((a) => a.attributes('tabindex'))).toEqual(['0', '-1', '-1']);
        await wrapper.get('[data-testid="esc-queue-rows"]').trigger('keydown', { key: 'ArrowDown' });
        expect(links().map((a) => a.attributes('tabindex'))).toEqual(['-1', '0', '-1']);
        expect(document.activeElement).toBe(links()[1].element);
    });

    it('remembers the list for the ticket page', () => {
        mountPage('/support/agent/tickets');
        expect(recallInbox().tickets.data).toHaveLength(3);
        expect(recallInbox().title).toBe('All tickets');
    });
});

describe('Agent/TicketIndex with inbox and queue', () => {
    it('titles the inbox and says how many are assigned', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox });
        expect(wrapper.get('h2').text()).toBe('My inbox');
        expect(wrapper.text()).toContain('24 tickets assigned to you');
    });

    it('prefers the queue prop for the title', () => {
        mountPage('/support/agent/tickets', { inbox, queue: { key: 'escalations', title: 'Escalations' } });
        expect(wrapper.get('h2').text()).toBe('Escalations');
    });

    it('renders the stat strip from inbox.stats', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox });
        const tiles = wrapper.findAll('[data-testid="esc-stat-strip"] button');
        expect(tiles.map((b) => b.attributes('aria-label'))).toEqual([
            '24 Open',
            '6 Urgent',
            '4 SLA at risk',
            '27 Resolved today',
        ]);
        // One row in a 340px column: SLA at risk shows as "At risk" beside its clock.
        expect(tiles[2].text().replace(/\s+/g, ' ')).toBe('4 At risk');
        expect(tiles[2].attributes('title')).toBe('SLA at risk');
    });

    it('filters the list from a stat tile, and the active tile clears it again', async () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox, filters: { assigned_to: '7' } });
        await wrapper.findAll('[data-testid="esc-stat-strip"] button')[1].trigger('click');
        expect(router.get).toHaveBeenLastCalledWith(
            '/support/agent/tickets',
            { assigned_to: '7', priority: 'urgent' },
            expect.any(Object),
        );

        wrapper.unmount();
        mountPage('/support/agent/tickets', { inbox, filters: { assigned_to: '7', priority: 'urgent' } });
        const urgent = wrapper.findAll('[data-testid="esc-stat-strip"] button')[1];
        expect(urgent.attributes('aria-pressed')).toBe('true');
        await urgent.trigger('click');
        expect(router.get).toHaveBeenLastCalledWith('/support/agent/tickets', { assigned_to: '7' }, expect.any(Object));
    });

    it('omits stat tiles the backend did not count', () => {
        mountPage('/support/agent/tickets', { inbox: { stats: { open: 3 } } });
        expect(wrapper.findAll('[data-testid="esc-stat-strip"] button')).toHaveLength(1);
    });
});

describe('Agent/TicketIndex polish', () => {
    it('lands the first j on the first row instead of skipping it', async () => {
        mountPage('/support/agent/tickets');
        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'j', cancelable: true }));
        await nextTick();
        await nextTick();
        expect(document.activeElement).toBe(rows()[0].get('a').element);
    });

    it('keeps the avatar on hover and swaps in a themed checkbox, never the native one', () => {
        mountPage('/support/agent/tickets');
        const row = rows()[0];
        const avatar = row.get('[data-testid="esc-queue-avatar"]');
        // The circle stays; only its initials make way for the checkbox.
        expect(avatar.classes()).toContain('bg-[var(--esc-panel-active)]');
        expect(avatar.classes().some((c) => c.includes('opacity-0'))).toBe(false);
        const box = row.get('[data-testid="esc-queue-row-select"]');
        expect(box.classes()).toContain('appearance-none');
        expect(box.classes()).toContain('bg-[var(--esc-panel-bg)]');
    });

    it('gives each row age an absolute time tooltip', () => {
        mountPage('/support/agent/tickets');
        const time = rows()[0].get('time');
        expect(time.attributes('datetime')).toBe(tickets.data[0].updated_at);
        expect(time.attributes('title')).toBe(new Date(tickets.data[0].updated_at).toLocaleString());
    });

    it('keeps the list column narrower than the conversation at every desktop width', () => {
        mountPage('/support/agent/tickets');
        const column = wrapper.get('section');
        expect(column.classes()).toEqual(expect.arrayContaining(['lg:w-[360px]', '2xl:w-[400px]']));
    });

    it('keeps the filter popover to the filters: no second search box or dead Save as View', async () => {
        mountPage('/support/agent/tickets', { filters: { status: 'open' } });
        await wrapper.get('[data-testid="esc-queue-filter-toggle"]').trigger('click');
        const pop = wrapper.get('[data-testid="esc-queue-filters"]');
        expect(pop.find('input[aria-label="Search tickets"]').exists()).toBe(false);
        expect(pop.text()).not.toContain('Save as View');
        expect(pop.find('select[aria-label="Filter by status"]').exists()).toBe(true);
    });

    it('closes the filter popover on Escape and on a click outside', async () => {
        mountPage('/support/agent/tickets');
        const toggle = wrapper.get('[data-testid="esc-queue-filter-toggle"]');
        await toggle.trigger('click');
        await wrapper.get('[data-testid="esc-queue-filters"]').trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('[data-testid="esc-queue-filters"]').exists()).toBe(false);
        expect(document.activeElement).toBe(toggle.element);
        await toggle.trigger('click');
        document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect(wrapper.find('[data-testid="esc-queue-filters"]').exists()).toBe(false);
    });

    it('gives every control a visible keyboard focus ring', () => {
        mountPage('/support/agent/tickets', {
            inbox,
            tickets: { ...tickets, last_page: 2, next_page_url: '/x?page=2' },
        });
        const unringed = [...wrapper.element.querySelectorAll('a, button, input:not([type="search"])')]
            .filter((el) => !/focus-visible:(ring|after:ring)/.test(el.className))
            .map((el) => (el.getAttribute('aria-label') || el.textContent).trim());
        expect(unringed).toEqual([]);
    });
});

describe('Agent/TicketIndex states', () => {
    it('marks unread rows with a dot and says so to screen readers', () => {
        mountPage('/support/agent/tickets');
        const dot = rows()[0].get('[data-testid="esc-queue-unread"]');
        expect(dot.text()).toBe('Unread');
        expect(rows()[1].find('[data-testid="esc-queue-unread"]').exists()).toBe(false);
    });

    it('says the queue is empty when nothing narrows it', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { tickets: { data: [] }, filters: { assigned_to: '7' } });
        const empty = wrapper.get('[data-testid="esc-queue-empty"]');
        expect(empty.text()).toContain('No tickets in this queue.');
        expect(empty.find('button').exists()).toBe(false);
    });

    it('offers to clear the search and filters when they leave nothing, keeping the queue', async () => {
        mountPage('/support/agent/tickets?assigned_to=7&search=refund&priority=urgent', {
            tickets: { data: [] },
            filters: { assigned_to: '7', search: 'refund', priority: 'urgent' },
        });
        const empty = wrapper.get('[data-testid="esc-queue-empty"]');
        expect(empty.text()).toContain('No tickets match your search or filters.');
        await empty.get('button').trigger('click');
        expect(router.get).toHaveBeenLastCalledWith('/support/agent/tickets', { assigned_to: 7 }, expect.any(Object));
    });

    it('marks the list busy while a search or filter loads', async () => {
        let listeners = {};
        router.on = vi.fn((event, cb) => {
            listeners[event] = cb;
            return () => {};
        });
        mountPage('/support/agent/tickets');
        listeners.start({
            detail: { visit: { url: new URL('http://x/support/agent/tickets?search=a'), method: 'get' } },
        });
        await nextTick();
        expect(wrapper.get('[data-testid="esc-queue-list"]').attributes('aria-busy')).toBe('true');
        listeners.finish({ detail: { visit: {} } });
        await nextTick();
        expect(wrapper.get('[data-testid="esc-queue-list"]').attributes('aria-busy')).toBeUndefined();
        delete router.on;
        listeners = {};
    });
});

describe('Agent/TicketIndex open filter', () => {
    it('says open in the subline and lets the agent include resolved tickets', async () => {
        mountPage('/support/agent/tickets?assigned_to=7&open=1', { inbox, filters: { assigned_to: '7', open: '1' } });
        expect(wrapper.text()).toContain('24 open tickets assigned to you');
        const toggle = wrapper.get('[data-testid="esc-queue-open-toggle"]');
        expect(toggle.text()).toBe('Include resolved');
        await toggle.trigger('click');
        expect(router.get).toHaveBeenLastCalledWith('/support/agent/tickets', { assigned_to: '7' }, expect.any(Object));
    });

    it('offers to go back to open tickets only', async () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox, filters: { assigned_to: '7' } });
        expect(wrapper.text()).toContain('24 tickets assigned to you');
        const toggle = wrapper.get('[data-testid="esc-queue-open-toggle"]');
        expect(toggle.text()).toBe('Open only');
        await toggle.trigger('click');
        expect(router.get).toHaveBeenLastCalledWith(
            '/support/agent/tickets',
            { assigned_to: '7', open: 1 },
            expect.any(Object),
        );
    });

    it('has no open toggle when the backend sends no counts', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { filters: { assigned_to: '7' } });
        expect(wrapper.find('[data-testid="esc-queue-open-toggle"]').exists()).toBe(false);
    });

    it('clears search and filters back to the open queue', async () => {
        mountPage('/support/agent/tickets?assigned_to=7&open=1&search=x', {
            inbox,
            tickets: { data: [] },
            filters: { assigned_to: '7', open: '1', search: 'x' },
        });
        await wrapper.get('[data-testid="esc-queue-empty"] button').trigger('click');
        expect(router.get).toHaveBeenLastCalledWith(
            '/support/agent/tickets',
            { assigned_to: 7, open: 1 },
            expect.any(Object),
        );
    });

    it('titles a view opened by id', () => {
        mountPage('/support/agent/tickets?view=urgent&open=1', { inbox, filters: { view: 'urgent', open: '1' } });
        expect(wrapper.get('h2').text()).toBe('Urgent');
    });
});

describe('Agent/TicketIndex density', () => {
    it('names the requester on every row, beside the age', () => {
        mountPage('/support/agent/tickets');
        const names = rows().map((row) => row.get('[data-testid="esc-queue-requester"]').text());
        expect(names).toEqual(['Sarah Chen', 'James Wright', 'Maria Garcia']);
        const first = rows()[0].get('[data-testid="esc-queue-requester"]').element.parentElement;
        expect(first.querySelector('time')).not.toBeNull();
    });

    it('keeps the reference with the preview, so each row is three short lines', () => {
        mountPage('/support/agent/tickets');
        const preview = rows()[0].get('[data-testid="esc-queue-preview"]');
        expect(preview.text()).toContain('ESC-1042');
        expect(preview.text()).toContain('Export fails with a server error.');
    });

    it('uses a compact standard row: 8px padding and a 28px avatar', () => {
        mountPage('/support/agent/tickets');
        for (const row of rows()) {
            expect(row.classes()).toContain('py-2');
            expect(row.get('[data-testid="esc-queue-avatar"]').classes()).toEqual(
                expect.arrayContaining(['h-7', 'w-7']),
            );
        }
    });

    it('shows inbox.stats as one compact row of toggles rather than KPI cards', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox });
        const strip = wrapper.get('[data-testid="esc-stat-strip"]');
        const buttons = strip.findAll('button');
        expect(buttons).toHaveLength(4);
        for (const button of buttons) {
            expect(button.classes()).toContain('h-7');
            expect(button.html()).not.toContain('text-[18px]');
        }
        expect(strip.attributes('role')).toBe('group');
        expect(strip.attributes('aria-label')).toBe('Summary');
    });

    it('marks each summary item with its own icon (fire, clock, check), not colour alone', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox });
        const buttons = wrapper.findAll('[data-testid="esc-stat-strip"] button');
        const icons = buttons.map((b) => b.find('svg'));
        icons.forEach((svg) => {
            expect(svg.exists()).toBe(true);
            expect(svg.attributes('aria-hidden')).toBe('true');
        });
        const paths = icons.map((svg) => svg.get('path').attributes('d'));
        expect(new Set(paths).size).toBe(4);
        expect(paths[1]).toBe(PANEL_ICONS.fire);
        expect(paths[2]).toBe(PANEL_ICONS.clock);
        expect(paths[3]).toBe(PANEL_ICONS.check);
    });

    it('keeps the list header to a single title line with a short subline', () => {
        mountPage('/support/agent/tickets?assigned_to=7', { inbox });
        const title = wrapper.get('h2');
        expect(title.classes()).toContain('text-[15px]');
    });
});
