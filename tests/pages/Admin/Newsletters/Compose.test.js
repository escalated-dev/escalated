import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Compose from '../../../../src/pages/Admin/Newsletters/Compose.vue';

vi.mock('@inertiajs/vue3', () => ({
    router: { post: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    usePage: () => ({ props: { escalated: { is_admin: true, prefix: 'support', features: { newsletters: true } } } }),
}));

vi.mock('../../../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const lists = [{ id: 1, name: 'All customers', member_count: 1200 }];
const templates = [];
const themes = ['default', 'branded'];

beforeEach(() => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: true, json: async () => ({ html: '<p>preview</p>' }) })),
    );
});

const globalConfig = {
    mocks: { $t: (key) => key },
    stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
};

describe('Compose page', () => {
    it('renders the three-pane layout', () => {
        const wrapper = mount(Compose, {
            props: { lists, templates, themes, mailConfigured: true, canSend: true },
            global: globalConfig,
        });
        expect(wrapper.find('.compose__metadata').exists()).toBe(true);
        expect(wrapper.find('.compose__editor').exists()).toBe(true);
        expect(wrapper.find('.compose__preview').exists()).toBe(true);
    });

    it('shows mail-not-configured banner when mail is unconfigured', () => {
        const wrapper = mount(Compose, {
            props: { lists, templates, themes, mailConfigured: false, canSend: true },
            global: globalConfig,
        });
        expect(wrapper.text()).toContain('newsletters.compose.mail_not_configured');
    });

    it('hides Send Now and Schedule when canSend is false', () => {
        const wrapper = mount(Compose, {
            props: { lists, templates, themes, mailConfigured: true, canSend: false },
            global: globalConfig,
        });
        const text = wrapper.text();
        expect(text).not.toContain('newsletters.compose.actions.send_now');
        expect(text).not.toContain('newsletters.compose.actions.schedule');
        expect(text).toContain('newsletters.compose.actions.save_draft');
        expect(text).toContain('newsletters.compose.actions.test_send');
    });
});
