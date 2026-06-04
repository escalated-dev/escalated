import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';

const usePage = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

function mountAdminLayout(escalated = {}) {
    usePage.mockReturnValue({
        url: '/support/admin/reports',
        props: {
            auth: { user: { id: 1, name: 'Admin User' } },
            escalated: {
                prefix: 'support',
                is_admin: true,
                is_agent: false,
                show_powered_by: false,
                features: { newsletters: true },
                permissions: ['newsletters.manage'],
                ...escalated,
            },
        },
    });

    return mount(EscalatedLayout, {
        props: { title: 'Reports' },
        global: {
            mocks: { $t: (key) => key },
        },
    });
}

function newslettersNavText(wrapper) {
    return wrapper.findAll('nav a').map((link) => link.text());
}

describe('EscalatedLayout — newsletters nav', () => {
    beforeEach(() => {
        usePage.mockReset();
    });

    it('hides Newsletters when the feature flag is off', () => {
        const wrapper = mountAdminLayout({
            features: { newsletters: false },
            permissions: ['newsletters.manage'],
        });
        expect(newslettersNavText(wrapper).join(' ')).not.toContain('Newsletters');
    });

    it('hides Newsletters when the user lacks newsletters.manage', () => {
        const wrapper = mountAdminLayout({ permissions: [] });
        expect(newslettersNavText(wrapper).join(' ')).not.toContain('Newsletters');
    });

    it('shows Newsletters when the feature is on and the user has newsletters.manage', () => {
        const wrapper = mountAdminLayout({ permissions: ['newsletters.manage'] });
        expect(newslettersNavText(wrapper).join(' ')).toContain('Newsletters');
    });

    it('hides Newsletters for non-admins even with permission', () => {
        const wrapper = mountAdminLayout({ is_admin: false, permissions: ['newsletters.manage'] });
        expect(newslettersNavText(wrapper).join(' ')).not.toContain('Newsletters');
    });
});
