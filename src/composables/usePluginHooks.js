import { getCurrentInstance } from 'vue';

/**
 * Composable for dispatching and consuming plugin hooks.
 *
 * Hooks allow plugins to react to events (e.g., ticket.created, ticket.replied)
 * and to filter/modify data before it's processed (e.g., reply.beforeSubmit).
 *
 * Action hooks: fire-and-forget, all handlers run
 * Filter hooks: chain handlers, each can modify the value
 *
 * @returns {Object} Hook dispatch functions
 */
export function usePluginHooks() {
    const instance = getCurrentInstance();
    const hookRegistry = instance?.appContext?.config?.globalProperties?.$escalatedHooks || {};

    /**
     * Dispatch an action hook. All registered handlers are called.
     * @param {string} event - Hook name (e.g., 'ticket.created')
     * @param  {...any} args - Arguments passed to handlers
     */
    async function dispatch(event, ...args) {
        const handlers = hookRegistry[event] || [];
        for (const { handler } of handlers) {
            try {
                await handler(...args);
            } catch (err) {
                console.warn(`[Escalated] Plugin hook "${event}" error:`, err);
            }
        }
    }

    /**
     * Dispatch a filter hook. Each handler receives the value and can return a modified version.
     * @param {string} event - Hook name (e.g., 'reply.beforeSubmit')
     * @param {*} value - The value to filter
     * @param  {...any} args - Additional arguments passed to handlers
     * @returns {*} The filtered value
     */
    async function filter(event, value, ...args) {
        const handlers = hookRegistry[event] || [];
        let result = value;
        for (const { handler } of handlers) {
            try {
                const modified = await handler(result, ...args);
                if (modified !== undefined) result = modified;
            } catch (err) {
                console.warn(`[Escalated] Plugin filter "${event}" error:`, err);
            }
        }
        return result;
    }

    /**
     * Check if any handlers are registered for a given hook.
     * @param {string} event - Hook name
     * @returns {boolean}
     */
    function hasHook(event) {
        return (hookRegistry[event] || []).length > 0;
    }

    return { dispatch, filter, hasHook };
}
