import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Index from '../../../../src/pages/Admin/Newsletters/Index.vue';

vi.mock('@inertiajs/vue3', () => ({
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    usePage: () => ({
        props: { escalated: { prefix: 'support', is_admin: true, is_agent: true, features: { newsletters: true } } },
    }),
}));

vi.mock('../../../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const newsletters = [
    {
        id: 1,
        subject: 'Welcome',
        status: 'draft',
        target_list: { name: 'All customers' },
        scheduled_at: null,
        sent_at: null,
        summary_total: null,
    },
    {
        id: 2,
        subject: 'Update',
        status: 'scheduled',
        target_list: { name: 'All customers' },
        scheduled_at: '2026-06-01T10:00:00Z',
        sent_at: null,
        summary_total: 1200,
    },
    {
        id: 3,
        subject: 'Announcement',
        status: 'sent',
        target_list: { name: 'All customers' },
        scheduled_at: null,
        sent_at: '2026-05-01T10:00:00Z',
        summary_total: 1100,
    },
];

const globalConfig = {
    mocks: { $t: (key) => key },
    stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
};

describe('Newsletters Index page', () => {
    it('shows drafts tab content by default', () => {
        const wrapper = mount(Index, { props: { newsletters, tab: 'drafts' }, global: globalConfig });
        expect(wrapper.text()).toContain('Welcome');
        expect(wrapper.text()).not.toContain('Update');
    });

    it('renders sent tab with sent items', () => {
        const wrapper = mount(Index, { props: { newsletters, tab: 'sent' }, global: globalConfig });
        expect(wrapper.text()).toContain('Announcement');
        expect(wrapper.text()).not.toContain('Welcome');
    });

    it('shows empty message when no rows match the tab', () => {
        const wrapper = mount(Index, { props: { newsletters: [], tab: 'drafts' }, global: globalConfig });
        expect(wrapper.text()).toContain('No drafts yet.');
    });
});
