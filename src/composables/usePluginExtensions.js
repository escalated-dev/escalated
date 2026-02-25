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
     * Ticket actions injected by plugins (e.g., "Escalate to Jira", "Send Approval").
     * Each action: { id, label, icon, handler, position, permission, context }
     * context: 'agent' | 'admin' | 'both'
     */
    const ticketActions = computed(() => {
        const actions = pluginData.value.ticketActions || [];
        return [...actions].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Sidebar panels injected by plugins for the ticket detail context panel.
     * Each panel: { id, title, component, plugin, position, collapsed, icon }
     */
    const sidebarPanels = computed(() => {
        const panels = pluginData.value.sidebarPanels || [];
        return [...panels].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Custom ticket fields injected by plugins for ticket creation/edit forms.
     * Each field: { id, label, type, name, options, required, position, plugin }
     * type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number'
     */
    const ticketFields = computed(() => {
        const fields = pluginData.value.ticketFields || [];
        return [...fields].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Reply composer actions injected by plugins (e.g., "AI Suggest", "Insert KB Article").
     * Each action: { id, label, icon, handler, component, plugin, position }
     */
    const composerActions = computed(() => {
        const actions = pluginData.value.composerActions || [];
        return [...actions].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Report widgets injected by plugins for the admin reports page.
     * Each widget: { id, title, component, plugin, data, position, width }
     */
    const reportWidgets = computed(() => {
        const widgets = pluginData.value.reportWidgets || [];
        return [...widgets].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Settings panels injected by plugins for the admin settings page.
     * Each panel: { id, title, component, plugin, position, icon }
     */
    const settingsPanels = computed(() => {
        const panels = pluginData.value.settingsPanels || [];
        return [...panels].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Notification channels registered by plugins (e.g., Slack, SMS, WhatsApp).
     * Each channel: { id, label, icon, plugin, configComponent }
     */
    const notificationChannels = computed(() => {
        const channels = pluginData.value.notificationChannels || [];
        return [...channels].sort((a, b) => (a.position || 100) - (b.position || 100));
    });

    /**
     * Custom ticket list columns injected by plugins.
     * Each column: { id, label, key, component, plugin, position, width }
     */
    const ticketListColumns = computed(() => {
        const columns = pluginData.value.ticketListColumns || [];
        return [...columns].sort((a, b) => (a.position || 100) - (b.position || 100));
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
        return (
            menuItems.value.length > 0 ||
            dashboardWidgets.value.length > 0 ||
            Object.keys(pluginData.value.pageComponents || {}).length > 0 ||
            ticketActions.value.length > 0 ||
            sidebarPanels.value.length > 0 ||
            ticketFields.value.length > 0 ||
            composerActions.value.length > 0 ||
            reportWidgets.value.length > 0 ||
            settingsPanels.value.length > 0 ||
            notificationChannels.value.length > 0 ||
            ticketListColumns.value.length > 0
        );
    });

    return {
        pluginData,
        menuItems,
        dashboardWidgets,
        ticketActions,
        sidebarPanels,
        ticketFields,
        composerActions,
        reportWidgets,
        settingsPanels,
        notificationChannels,
        ticketListColumns,
        getPageComponents,
        hasPlugins,
    };
}
