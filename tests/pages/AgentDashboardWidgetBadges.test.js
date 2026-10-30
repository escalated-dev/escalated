import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from '../../src/pages/Agent/Dashboard.vue';

/**
 * Plugin contract (escalated-developer-context domain-model/plugin-contract.md,
 * "Badges"): a widget with a badge function carries `badge` (a number, a string
 * or null) in `escalated.plugins.dashboardWidgets[]`. The dashboard shows it
 * next to the widget's title; null, an empty string and 0 show nothing.
 */
const widgets = [
    { id: 'crm.Inbox', title: 'Inbox', component: 'Inbox', plugin: 'crm', position: 1, badge: 7 },
    { id: 'crm.Status', title: 'Status', component: 'Status', plugin: 'crm', position: 2, badge: 'new' },
    { id: 'crm.Broken', title: 'Broken', component: 'Broken', plugin: 'crm', position: 3, badge: null },
    { id: 'crm.Zero', title: 'Zero', component: 'Zero', plugin: 'crm', position: 4, badge: 0 },
    { id: 'crm.Plain', title: 'Plain', component: 'Plain', plugin: 'crm', position: 5 },
    { id: 'crm.Untitled', component: 'Untitled', plugin: 'crm', position: 6, badge: 3 },
];

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ props: { escalated: { prefix: 'support' } } }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', async () => {
    const { ref } = await import('vue');
    return {
        usePluginExtensions: () => ({
            dashboardWidgets: ref(widgets),
            getPageComponents: () => [],
        }),
    };
});

function mountDashboard() {
    return mount(Dashboard, {
        props: { stats: {}, recentTickets: [] },
        global: {
            stubs: {
                EscalatedLayout: { template: '<div><slot /></div>' },
                PluginSlot: true,
                StatsCard: true,
            },
            mocks: { $t: (key) => key, route: () => '#' },
        },
    });
}

function badgeFor(wrapper, id) {
    const card = wrapper.find(`[data-plugin-widget="${id}"]`);
    expect(card.exists()).toBe(true);
    const badge = card.find('[data-plugin-badge]');
    return badge.exists() ? badge : null;
}

describe('Agent dashboard: plugin widget badges', () => {
    it('shows a number or string badge next to the widget title', () => {
        const wrapper = mountDashboard();
        expect(badgeFor(wrapper, 'crm.Inbox').text()).toBe('7');
        expect(badgeFor(wrapper, 'crm.Status').text()).toBe('new');
    });

    it('shows no badge for null, 0 or a widget without a badge', () => {
        const wrapper = mountDashboard();
        expect(badgeFor(wrapper, 'crm.Broken')).toBeNull();
        expect(badgeFor(wrapper, 'crm.Zero')).toBeNull();
        expect(badgeFor(wrapper, 'crm.Plain')).toBeNull();
    });

    it('labels a badge on an untitled widget for screen readers', () => {
        const badge = badgeFor(mountDashboard(), 'crm.Untitled');
        expect(badge.text()).toContain('3');
        expect(badge.find('.sr-only').text()).toContain('Untitled');
    });
});
