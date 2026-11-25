import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import SchedulerWarning from '../../src/components/SchedulerWarning.vue';
import Settings from '../../src/pages/Admin/Settings.vue';
import Reports from '../../src/pages/Admin/Reports.vue';
import ReportsDashboard from '../../src/pages/Admin/Reports/Dashboard.vue';
import manifest from '../../pages.json';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ url: '/support/admin/settings', props: { escalated: { prefix: 'support' } } }),
    router: { get: vi.fn(), post: vi.fn() },
    useForm: (data) => ({ ...data, post: vi.fn(), put: vi.fn(), processing: false, errors: {} }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

const unhealthy = {
    healthy: false,
    last_run_at: null,
    message: 'The SLA check has not run in the last 15 minutes.',
    commands: [
        { command: 'php artisan escalated:check-sla', interval: 'every minute' },
        { command: 'php artisan escalated:evaluate-escalations', interval: 'every 5 minutes' },
    ],
};

const mountWarning = (scheduler, dark = false) =>
    mount(SchedulerWarning, {
        props: { scheduler },
        global: { provide: { 'esc-dark': computed(() => dark) } },
    });

describe('SchedulerWarning', () => {
    it('warns with the message and every command to schedule', () => {
        const wrapper = mountWarning(unhealthy);
        const banner = wrapper.get('[data-testid="esc-scheduler-warning"]');

        expect(banner.text()).toContain(unhealthy.message);
        expect(banner.text()).toContain('The SLA check has never run.');
        const items = banner.findAll('[data-testid="esc-scheduler-commands"] li');
        expect(items).toHaveLength(2);
        expect(items[0].get('code').text()).toBe('php artisan escalated:check-sla');
        expect(items[0].text()).toContain('every minute');
        expect(items[1].get('code').text()).toBe('php artisan escalated:evaluate-escalations');
        expect(items[1].text()).toContain('every 5 minutes');
    });

    it('says when the check last ran', () => {
        const wrapper = mountWarning({ ...unhealthy, last_run_at: '2026-11-24T10:00:00Z' });
        expect(wrapper.text()).toContain('Last SLA check:');
    });

    it('renders nothing when the scheduler is healthy or the prop is absent', () => {
        expect(
            mountWarning({ ...unhealthy, healthy: true })
                .find('[role="alert"]')
                .exists(),
        ).toBe(false);
        expect(mountWarning(null).find('[role="alert"]').exists()).toBe(false);
    });

    it('follows light and dark mode', () => {
        expect(mountWarning(unhealthy, false).get('[role="alert"]').classes()).toContain('bg-amber-50');
        expect(mountWarning(unhealthy, true).get('[role="alert"]').classes()).toContain('bg-amber-500/10');
    });
});

describe('the admin pages that take a scheduler prop', () => {
    const global = {
        mocks: { route: (name) => `/${name}` },
        stubs: {
            EscalatedLayout: { template: '<div><slot /></div>' },
            ChartWidget: true,
            KpiCard: true,
            StatsCard: true,
            PeriodSelector: true,
            ReportExportButton: true,
            PluginSlot: true,
        },
    };

    const pages = [
        ['Escalated/Admin/Settings', Settings, { settings: {}, departments: [] }],
        ['Escalated/Admin/Reports', Reports, { by_status: {}, by_priority: {} }],
        ['Escalated/Admin/Reports/Dashboard', ReportsDashboard, {}],
    ];

    it.each(pages)('%s shows the banner when the jobs are not running', (name, page, props) => {
        const wrapper = mount(page, { props: { ...props, scheduler: unhealthy }, global });
        expect(wrapper.find('[data-testid="esc-scheduler-warning"]').exists()).toBe(true);
        expect(manifest.props[name].props).toContain('scheduler');
        expect(manifest.props[name].required).not.toContain('scheduler');
    });

    it.each(pages)('%s shows no banner without the prop', (name, page, props) => {
        const wrapper = mount(page, { props, global });
        expect(wrapper.find('[data-testid="esc-scheduler-warning"]').exists()).toBe(false);
    });
});
