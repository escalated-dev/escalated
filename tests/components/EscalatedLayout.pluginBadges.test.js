import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';

/**
 * Plugin menu items may carry a `badge` (Laravel native menu items do). The
 * admin nav shows it; null, an empty string and 0 show nothing.
 */
vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        url: '/support/admin/reports',
        props: {
            auth: { user: { id: 1, name: 'Admin User' } },
            escalated: { prefix: 'support', is_admin: true, is_agent: true, show_powered_by: false },
        },
    }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({
        menuItems: {
            value: [
                { label: 'Billing', route: '/support/admin/billing', position: 101, badge: 4 },
                { label: 'Quiet', route: '/support/admin/quiet', position: 102, badge: 0 },
                { label: 'Empty', route: '/support/admin/empty', position: 103, badge: null },
            ],
        },
    }),
}));

function link(wrapper, href) {
    return wrapper.findAll('nav a').find((a) => a.attributes('href') === href);
}

describe('EscalatedLayout: plugin menu badges', () => {
    it('shows a plugin menu badge and hides 0 and null', () => {
        const wrapper = mount(EscalatedLayout, {
            props: { title: 'Reports' },
            global: { mocks: { $t: (key) => key } },
        });
        expect(link(wrapper, '/support/admin/billing').find('[data-plugin-badge]').text()).toBe('4');
        expect(link(wrapper, '/support/admin/quiet').find('[data-plugin-badge]').exists()).toBe(false);
        expect(link(wrapper, '/support/admin/empty').find('[data-plugin-badge]').exists()).toBe(false);
    });
});
