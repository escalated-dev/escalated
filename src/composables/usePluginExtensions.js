import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * Composable for reading plugin extensions from Inertia shared props.
 *
 * The Laravel backend (escalated-laravel) shares plugin UI extensions via
 * `$page.props.escalated.plugins`, which contains:
 * - menuItems: Array of navigation items injected by plugins
 * - dashboardWidgets: Array of widget definitions for the agent dashboard
 * - pageComponents: Object mapping slot names to arrays of component definitions
 *
 * @returns {Object} Plugin extension data and helper functions
 */
export function usePluginExtensions() {
    const page = usePage();

    const pluginData = computed(() => page.props?.escalated?.plugins || {});

    /**
     * Menu items injected by plugins, sorted by position.
     * Each item: { label, route, icon, position, permission, badge, submenu }
     */
    const menuItems = computed(() => {
        const items = pluginData.value.menuItems || [];
        return [...items].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Dashboard widgets injected by plugins, sorted by position.
     * Each widget: { id, title, component, plugin, data, position, width }
     */
    const dashboardWidgets = computed(() => {
        const widgets = pluginData.value.dashboardWidgets || [];
        return [...widgets].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Get plugin components for a specific page slot, sorted by position.
     *
     * @param {string} pageName - The page name (e.g. 'dashboard', 'ticket.show')
     * @param {string} slotName - The slot name (e.g. 'header', 'sidebar', 'footer')
     * @returns {Array} Sorted array of component definitions for the given slot
     */
    function getPageComponents(pageName, slotName) {
        const key = `${pageName}.${slotName}`;
        const components = pluginData.value.pageComponents || {};
        return [...(components[key] || [])].sort((a, b) => (a.position || 100) - (b.position || 100));
    }

    /**
     * Check whether any plugins have registered extensions.
     */
    const hasPlugins = computed(() => {
        return menuItems.value.length > 0
            || dashboardWidgets.value.length > 0
            || Object.keys(pluginData.value.pageComponents || {}).length > 0;
    });

    return {
        pluginData,
        menuItems,
        dashboardWidgets,
        getPageComponents,
        hasPlugins,
    };
}
