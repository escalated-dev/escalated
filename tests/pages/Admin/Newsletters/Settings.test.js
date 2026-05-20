import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Settings from '../../../../src/pages/Admin/Newsletters/Settings.vue';

vi.mock('@inertiajs/vue3', () => ({
    router: { put: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    usePage: () => ({ props: { escalated: { is_admin: true, prefix: 'support' } } }),
}));

vi.mock('../../../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const globalConfig = {
    mocks: { $t: (key) => key },
    stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
};

describe('Settings page', () => {
    it('renders all setting fields with current values', () => {
        const wrapper = mount(Settings, {
            props: {
                settings: {
                    default_from: 'hi@example.com',
                    default_reply_to: 'replies@example.com',
                    default_theme: 'branded',
                    rate_limit_per_minute: 60,
                    batch_size: 50,
                    tracking_enabled: true,
                },
                themes: ['default', 'branded'],
            },
            global: globalConfig,
        });
        expect(wrapper.find('input[name="default_from"]').element.value).toBe('hi@example.com');
        expect(wrapper.find('select[name="default_theme"]').element.value).toBe('branded');
        expect(wrapper.find('input[name="tracking_enabled"]').element.checked).toBe(true);
    });
});
