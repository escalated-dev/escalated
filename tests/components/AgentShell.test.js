import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';
import AgentShell from '../../src/components/AgentShell.vue';
import { registerAgentCommands } from '../../src/composables/useAgentCommands';

const usePage = vi.fn();
const visit = vi.fn();
const reload = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    router: { visit: (...a) => visit(...a), reload: (...a) => reload(...a), get: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

function pageAt(url, props = {}, escalated = {}) {
    usePage.mockReturnValue({
        url,
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: {
                prefix: 'support',
                is_admin: false,
                is_agent: true,
                show_powered_by: false,
                ...escalated,
            },
            ...props,
        },
    });
}

let wrapper;

function mountLayout(url, props, escalated) {
    pageAt(url, props, escalated);
    wrapper = mount(EscalatedLayout, {
        props: { title: 'Tickets' },
        slots: { default: '<p id="content">content</p>' },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    usePage.mockReset();
    visit.mockReset();
    reload.mockReset();
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
});

const inbox = {
    counts: { mine: 24, unassigned: 18, all: 142 },
    views: [
        { id: 'urgent', name: 'Urgent', count: 6, filters: { priority: 'urgent' } },
        { id: 12, name: 'Billing escalations', count: 3, filters: { department_id: 4, status: 'escalated' } },
    ],
};

describe('AgentShell in EscalatedLayout', () => {
    it('renders the rail shell for agent pages', () => {
        mountLayout('/support/agent/tickets');
        expect(wrapper.findComponent(AgentShell).exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-agent-rail"]').exists()).toBe(true);
        expect(wrapper.find('#content').exists()).toBe(true);
        // The old top-nav is gone.
        expect(wrapper.find('nav[aria-label="Agent navigation"] .hidden.lg\\:flex').exists()).toBe(false);
    });

    it('keeps the admin layout for admin pages', () => {
        mountLayout('/support/admin/tickets');
        expect(wrapper.findComponent(AgentShell).exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(true);
    });

    it('keeps the logo tile and the host logo override', () => {
        pageAt('/support/agent');
        wrapper = mount(EscalatedLayout, {
            global: { provide: { 'escalated-panel': { appName: 'Acme Help', logo: '/acme.svg', mode: 'dark' } } },
        });
        const tile = wrapper.get('[data-testid="esc-logo-tile"]');
        expect(tile.classes()).toContain('bg-[var(--esc-panel-logo-tile-bg,var(--esc-panel-border-input))]');
        expect(tile.get('img').attributes('src')).toBe('/acme.svg');
        expect(wrapper.text()).toContain('Acme Help');
    });

    it('passes fullBleed through so split pages fill the area', () => {
        pageAt('/support/agent/tickets');
        wrapper = mount(EscalatedLayout, { props: { fullBleed: true } });
        expect(wrapper.get('main').classes()).toContain('overflow-hidden');
        expect(wrapper.get('main').classes()).not.toContain('p-4');
    });
});

describe('AgentShell rail', () => {
    it('lists the workspace queues, with counts when the backend sends them', () => {
        mountLayout('/support/agent/tickets', { inbox });
        const links = wrapper.findAll('[data-testid="esc-rail-queues"] a');
        expect(links.map((a) => a.findAll('span').map((s) => s.text()))).toEqual([
            ['Inbox', '24'],
            ['Unassigned', '18'],
            ['All tickets', '142'],
        ]);
        expect(links[0].attributes('href')).toBe('/support/agent/tickets?assigned_to=7');
        expect(links[1].attributes('href')).toBe('/support/agent/tickets?unassigned=1');
        expect(links[2].attributes('href')).toBe('/support/agent/tickets');
    });

    it('shows the queues without numbers when there is no inbox prop', () => {
        mountLayout('/support/agent/tickets');
        const links = wrapper.findAll('[data-testid="esc-rail-queues"] a');
        expect(links.map((a) => a.text().trim())).toEqual(['Inbox', 'Unassigned', 'All tickets']);
        expect(wrapper.find('[data-testid="esc-rail-views"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-rail-new-view"]').exists()).toBe(false);
    });

    it('marks the queue the URL shows as current', () => {
        mountLayout('/support/agent/tickets?unassigned=1', { inbox });
        expect(wrapper.get('[data-testid="esc-rail-queues"] a[aria-current="page"]').text()).toContain('Unassigned');
    });

    it('prefers the queue prop over the URL', () => {
        mountLayout('/support/agent/tickets/ESC-1', { inbox, queue: { key: 'mine', title: 'My inbox' } });
        expect(wrapper.get('a[aria-current="page"][href*="assigned_to"]').text()).toContain('Inbox');
    });

    it('lists saved views with counts and links them to their filters', () => {
        mountLayout('/support/agent/tickets?priority=urgent', { inbox });
        const views = wrapper.findAll('[data-testid="esc-rail-views"] a');
        expect(views.map((a) => a.findAll('span').map((s) => s.text()))).toEqual([
            ['Urgent', '6'],
            ['Billing escalations', '3'],
        ]);
        expect(views[1].attributes('href')).toBe('/support/agent/tickets?department_id=4&status=escalated');
        expect(views[0].attributes('aria-current')).toBe('page');
    });

    it('opens the save-view dialog from the plus button', async () => {
        mountLayout('/support/agent/tickets', { inbox, filters: { priority: 'high' } });
        await wrapper.get('[data-testid="esc-rail-new-view"]').trigger('click');
        // SaveViewDialog teleports to <body>.
        expect(document.body.textContent).toContain('Save Current View');
    });

    it('shows live chats only while there are some', () => {
        mountLayout('/support/agent/tickets', {}, { active_chats: [] });
        expect(wrapper.find('[data-testid="esc-rail-live-chats"]').exists()).toBe(false);
        wrapper.unmount();
        mountLayout('/support/agent/tickets', {}, { active_chats: [{ id: 1 }, { id: 2 }] });
        expect(wrapper.get('[data-testid="esc-rail-live-chats"]').text()).toContain('2');
    });

    it('links to admin only for admins', () => {
        mountLayout('/support/agent/tickets');
        expect(wrapper.findAll('a').some((a) => a.text() === 'Admin')).toBe(false);
        wrapper.unmount();
        mountLayout('/support/agent/tickets', {}, { is_admin: true });
        expect(
            wrapper
                .findAll('a')
                .find((a) => a.text() === 'Admin')
                .attributes('href'),
        ).toBe('/support/admin/reports');
    });

    it('shows the agent and offers an online status menu when chat is on', async () => {
        mountLayout('/support/agent/tickets', {}, { chat_enabled: true });
        const user = wrapper.get('[data-testid="esc-rail-user"]');
        expect(user.text()).toContain('Mike Agent');
        expect(user.text()).toContain('Online');
        await user.trigger('click');
        expect(wrapper.findAll('[role="menuitemradio"]').map((b) => b.text())).toEqual(['Online', 'Away', 'Offline']);
    });
});

describe('AgentShell top bar', () => {
    it('shows only the sections that have agent pages', () => {
        mountLayout('/support/agent/tickets');
        const sections = wrapper.findAll('nav[aria-label="Sections"] a');
        expect(sections.map((a) => a.text())).toEqual(['Tickets', 'Dashboard', 'Knowledge base']);
        expect(sections[0].attributes('aria-current')).toBe('page');
    });

    it('drops the knowledge base when it is off', () => {
        mountLayout('/support/agent', {}, { knowledge_base_enabled: false });
        const sections = wrapper.findAll('nav[aria-label="Sections"] a');
        expect(sections.map((a) => a.text())).toEqual(['Tickets', 'Dashboard']);
        expect(sections[1].attributes('aria-current')).toBe('page');
    });

    it('opens the command palette from the search button and with Ctrl K', async () => {
        mountLayout('/support/agent/tickets');
        expect(wrapper.find('[data-testid="esc-palette"]').exists()).toBe(false);
        await wrapper.get('[data-testid="esc-palette-trigger"]').trigger('click');
        expect(wrapper.find('[data-testid="esc-palette"]').exists()).toBe(true);

        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        await nextTick();
        expect(wrapper.find('[data-testid="esc-palette"]').exists()).toBe(false);

        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        await nextTick();
        expect(wrapper.find('[data-testid="esc-palette"]').exists()).toBe(true);
    });

    it('goes to the queues with g i, g u and g a', () => {
        mountLayout('/support/agent');
        const press = (key) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key, cancelable: true }));
        press('g');
        press('u');
        expect(visit).toHaveBeenLastCalledWith('/support/agent/tickets?unassigned=1');
        press('g');
        press('i');
        expect(visit).toHaveBeenLastCalledWith('/support/agent/tickets?assigned_to=7');
        press('g');
        press('a');
        expect(visit).toHaveBeenLastCalledWith('/support/agent/tickets');
    });

    it('puts commands registered by the page into the palette', async () => {
        const run = vi.fn();
        const unregister = registerAgentCommands([{ id: 'resolve', label: 'Resolve ticket', run }]);
        mountLayout('/support/agent/tickets/ESC-1');
        await wrapper.get('[data-testid="esc-palette-trigger"]').trigger('click');
        const option = wrapper.findAll('[role="option"]').find((o) => o.text().includes('Resolve ticket'));
        await option.trigger('click');
        expect(run).toHaveBeenCalled();
        unregister();
    });
});

describe('AgentShell below lg', () => {
    it('folds the rail into a drawer behind the menu button', async () => {
        mountLayout('/support/agent/tickets');
        const toggle = wrapper.get('[data-testid="esc-nav-toggle"]');
        expect(toggle.attributes('aria-controls')).toBe('esc-agent-rail');
        expect(toggle.classes()).toContain('lg:hidden');
        const rail = wrapper.get('[data-testid="esc-agent-rail"]');
        expect(rail.classes()).toEqual(
            expect.arrayContaining(['max-lg:-translate-x-full', 'max-lg:invisible', 'max-lg:fixed']),
        );

        await toggle.trigger('click');
        expect(wrapper.get('[data-testid="esc-agent-rail"]').classes()).toContain('max-lg:translate-x-0');
        await wrapper.get('[data-testid="esc-nav-backdrop"]').trigger('click');
        expect(wrapper.get('[data-testid="esc-agent-rail"]').classes()).toContain('max-lg:-translate-x-full');
    });
});
