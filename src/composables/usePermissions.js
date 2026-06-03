import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * Read the current user's permission slugs from Inertia shared props.
 * Canonical source: `page.props.escalated.permissions` (string[]).
 */
export function usePermissions() {
    const page = usePage();

    const permissions = computed(() => {
        const raw = page.props.escalated?.permissions;
        if (raw === undefined || raw === null) {
            return null;
        }
        return Array.isArray(raw) ? raw : [];
    });

    function hasPermission(slug) {
        const perms = permissions.value;
        if (perms === null) {
            return page.props.escalated?.is_admin === true;
        }
        if (perms.includes('*')) {
            return true;
        }
        return perms.includes(slug);
    }

    return { permissions, hasPermission };
}
