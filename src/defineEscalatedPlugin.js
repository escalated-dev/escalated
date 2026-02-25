/**
 * Helper for plugin authors to define an Escalated plugin.
 *
 * Returns a Vue plugin object that registers components globally when installed.
 *
 * Usage:
 *
 *   import { defineEscalatedPlugin } from '@escalated-dev/escalated'
 *   import SalesWidget from './Components/SalesWidget.vue'
 *
 *   export default defineEscalatedPlugin({
 *       name: 'my-plugin',
 *       components: {
 *           SalesWidget,
 *       },
 *       hooks: {
 *           'ticket.created': (ticket) => { ... },
 *           'ticket.replied': (ticket, reply) => { ... },
 *           'ticket.statusChanged': (ticket, oldStatus, newStatus) => { ... },
 *           'reply.beforeSubmit': (content) => { return modifiedContent; },
 *       },
 *       setup(app, ctx) {
 *           // ctx contains: { provide }
 *       },
 *   })
 *
 * @param {Object} options
 * @param {string} options.name - Plugin identifier
 * @param {Object} [options.components] - Map of component name to component definition
 * @param {Object} [options.hooks] - Map of hook event name to handler function
 * @param {Function} [options.setup] - Optional setup callback receiving the Vue app instance and context
 * @returns {Object} A Vue plugin object with an install() method
 */
export function defineEscalatedPlugin(options = {}) {
    return {
        // Metadata for plugin introspection
        __escalated: true,
        name: options.name || 'unknown',
        hooks: options.hooks || {},

        install(app) {
            // Register all provided components globally
            if (options.components) {
                Object.entries(options.components).forEach(([name, component]) => {
                    app.component(name, component);
                });
            }

            // Register plugin hooks on a global event bus
            if (options.hooks) {
                const hookRegistry =
                    app.config.globalProperties.$escalatedHooks || (app.config.globalProperties.$escalatedHooks = {});

                Object.entries(options.hooks).forEach(([event, handler]) => {
                    if (!hookRegistry[event]) hookRegistry[event] = [];
                    hookRegistry[event].push({
                        plugin: options.name,
                        handler,
                    });
                });
            }

            // Run optional setup callback with context
            if (typeof options.setup === 'function') {
                options.setup(app, {
                    provide: app.provide.bind(app),
                });
            }

            // Provide the plugin name for debugging
            if (options.name) {
                app.provide(`escalated-plugin:${options.name}`, true);
            }
        },
    };
}
