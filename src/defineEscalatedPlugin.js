/**
 * Helper for plugin authors to define an Escalated plugin.
 *
 * Returns a Vue plugin object that registers components globally when installed.
 *
 * Usage in a plugin's main entry file:
 *
 *   import { defineEscalatedPlugin } from '@escalated-dev/escalated'
 *   import SalesWidget from './Components/SalesWidget.vue'
 *   import CustomSidebar from './Components/CustomSidebar.vue'
 *
 *   export default defineEscalatedPlugin({
 *       name: 'my-plugin',
 *       components: {
 *           SalesWidget,
 *           CustomSidebar,
 *       },
 *       setup(app) {
 *           // Optional: run custom setup logic when the plugin is installed
 *       },
 *   })
 *
 * @param {Object} options
 * @param {string} options.name - Plugin identifier
 * @param {Object} [options.components] - Map of component name to component definition
 * @param {Function} [options.setup] - Optional setup callback receiving the Vue app instance
 * @returns {Object} A Vue plugin object with an install() method
 */
export function defineEscalatedPlugin(options = {}) {
    return {
        install(app) {
            // Register all provided components globally
            if (options.components) {
                Object.entries(options.components).forEach(([name, component]) => {
                    app.component(name, component);
                });
            }

            // Run optional setup callback
            if (typeof options.setup === 'function') {
                options.setup(app);
            }

            // Provide the plugin name for debugging
            if (options.name) {
                app.provide(`escalated-plugin:${options.name}`, true);
            }
        },
    };
}
