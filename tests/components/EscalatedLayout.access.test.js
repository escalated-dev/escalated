import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';

/**
 * Roles & permissions is an install-level switch (ADR 2026-10-29). Backends
 * share it as `escalated.features.roles_permissions`; while it is off the
 * Roles screens answer 404, so the nav must not link to them. Backends that
 * do not send the flag yet keep the link.
 */
const usePage = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

function navLabels(escalated = {}) {
    usePage.mockReturnValue({
        url: '/support/admin/reports',
        props: {
            auth: { user: { id: 1, name: 'Admin User' } },
            escalated: {
                prefix: 'support',
                is_admin: true,
                is_agent: true,
                show_powered_by: false,
                ...escalated,
            },
        },
    });

    const wrapper = mount(EscalatedLayout, {
        props: { title: 'Reports' },
        global: { mocks: { $t: (key) => key } },
    });

    return wrapper.findAll('nav a').map((link) => link.text().trim());
}

describe('EscalatedLayout: roles & permissions switch', () => {
    beforeEach(() => usePage.mockReset());

    it('hides Roles when the switch is off', () => {
        const labels = navLabels({ features: { roles_permissions: false }, permissions: ['*'] });
        expect(labels).not.toContain('Roles');
        expect(labels).toContain('Users');
    });

    it('shows Roles when the switch is on and the user may view roles', () => {
        expect(navLabels({ features: { roles_permissions: true }, permissions: ['role.view'] })).toContain('Roles');
    });

    it('hides Roles when the switch is on but the user lacks role.view', () => {
        expect(navLabels({ features: { roles_permissions: true }, permissions: ['ticket.view'] })).not.toContain(
            'Roles',
        );
    });

    it('keeps Roles for backends that do not send the flag', () => {
        expect(navLabels({})).toContain('Roles');
        expect(navLabels({ features: { newsletters: false } })).toContain('Roles');
    });
});
