import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Show from '../../../../src/pages/Admin/Newsletters/Show.vue';

vi.mock('@inertiajs/vue3', () => ({
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    router: { get: vi.fn() },
    usePage: () => ({ props: { escalated: { is_admin: true, prefix: 'support', features: { newsletters: true } } } }),
}));

vi.mock('../../../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const newsletter = {
    id: 1,
    subject: 'Welcome',
    status: 'sent',
    from_email: 'a@example.com',
    from_name: 'Acme',
    target_list: { name: 'All' },
    sent_at: '2026-05-19T12:00:00Z',
    summary_total: 100,
    summary_sent: 99,
    summary_opened: 50,
    summary_clicked: 20,
    summary_bounced: 1,
    summary_complained: 0,
};
const deliveries = { data: [], links: [], meta: {} };
const topClicks = [];

const globalConfig = {
    mocks: { $t: (key) => key },
    stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
};

describe('Show page', () => {
    it('renders overview by default', () => {
        const wrapper = mount(Show, {
            props: { newsletter, deliveries, topClicks, tab: 'overview' },
            global: globalConfig,
        });
        expect(wrapper.text()).toContain('Welcome');
        expect(wrapper.text()).toContain('99');
    });

    it('shows deliveries table on deliveries tab', () => {
        const wrapper = mount(Show, {
            props: { newsletter, deliveries, topClicks, tab: 'deliveries' },
            global: globalConfig,
        });
        expect(wrapper.find('.deliveries-table').exists()).toBe(true);
    });

    it('shows analytics tiles on analytics tab', () => {
        const wrapper = mount(Show, {
            props: { newsletter, deliveries, topClicks, tab: 'analytics' },
            global: globalConfig,
        });
        expect(wrapper.find('.analytics-tiles').exists()).toBe(true);
    });
});
