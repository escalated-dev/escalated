import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * Escalated's admin menu, for a host that renders it in its own sidebar
 * (ADR 2026-11-05-embeddable-admin).
 *
 * Backends with embedding switched on share `escalated.navigation`, already
 * filtered for the signed-in user (admin gate, feature switches, route
 * permissions, plugin items) and sorted. Without it, `items` is empty.
 *
 *     const { items, activeItem, isEmbedded } = useEscalatedNavigation();
 *
 * @returns {{ items: import('vue').ComputedRef<Array>, activeItem: import('vue').ComputedRef<Object|null>,
 *             embed: import('vue').ComputedRef<Object|null>, isEmbedded: import('vue').ComputedRef<boolean> }}
 */
export function useEscalatedNavigation() {
    const page = usePage();

    const escalated = computed(() => page.props?.escalated || {});

    const items = computed(() => {
        const list = escalated.value.navigation;
        if (!Array.isArray(list)) return [];
        return list
            .filter((item) => item && typeof item.url === 'string' && typeof item.label === 'string')
            .map((item) => ({
                key: item.key ?? item.url,
                label: item.label,
                route: item.route ?? null,
                url: item.url,
                icon: item.icon ?? null,
                position: item.position ?? 100,
                active: item.active === true,
                badge: item.badge ?? null,
                plugin: item.plugin ?? null,
                children: Array.isArray(item.children) ? item.children : [],
            }));
    });

    const activeItem = computed(() => items.value.find((item) => item.active) || null);
    const embed = computed(() => escalated.value.embed || null);
    const isEmbedded = computed(() => embed.value?.enabled === true);

    return { items, activeItem, embed, isEmbedded };
}
