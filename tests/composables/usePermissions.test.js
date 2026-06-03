import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { usePermissions } from '../../src/composables/usePermissions.js';

const usePage = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
}));

function mountWithPermissions(escalated = {}) {
    usePage.mockReturnValue({
        props: {
            escalated: {
                is_admin: false,
                ...escalated,
            },
        },
    });

    let api;
    mount({
        template: '<div />',
        setup() {
            api = usePermissions();
            return { api };
        },
    });
    return api;
}

describe('usePermissions', () => {
    beforeEach(() => {
        usePage.mockReset();
    });

    it('returns true when the slug is in escalated.permissions', () => {
        const { hasPermission } = mountWithPermissions({
            permissions: ['newsletters.manage', 'tickets.view'],
        });
        expect(hasPermission('newsletters.manage')).toBe(true);
        expect(hasPermission('newsletters.send')).toBe(false);
    });

    it('returns true for any slug when permissions include *', () => {
        const { hasPermission } = mountWithPermissions({ permissions: ['*'] });
        expect(hasPermission('newsletters.manage')).toBe(true);
    });

    it('falls back to is_admin when permissions are not shared yet', () => {
        const denied = mountWithPermissions({ is_admin: false });
        expect(denied.hasPermission('newsletters.manage')).toBe(false);

        const admin = mountWithPermissions({ is_admin: true });
        expect(admin.hasPermission('newsletters.manage')).toBe(true);
    });

    it('returns false for an empty permissions array', () => {
        const { hasPermission } = mountWithPermissions({ permissions: [] });
        expect(hasPermission('newsletters.manage')).toBe(false);
    });
});
