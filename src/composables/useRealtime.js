import { ref, onUnmounted, readonly } from 'vue';

/**
 * Composable for real-time WebSocket event listening via Laravel Echo.
 *
 * If `window.Echo` is available (provided by the host app), this composable
 * subscribes to private channels and listens for broadcast events. When Echo
 * is not present, it silently falls back - the caller can check `echoAvailable`
 * and implement polling as needed.
 *
 * Usage:
 *   const { echoAvailable, subscribeToTicket, subscribeToTickets, subscribeToAgent } = useRealtime();
 *
 * All subscriptions are automatically cleaned up on component unmount.
 */
export function useRealtime() {
    const echoAvailable = ref(typeof window !== 'undefined' && !!window.Echo);
    const subscriptions = [];

    /**
     * Subscribe to a private channel and listen for an event.
     * Returns an unsubscribe function.
     */
    function listen(channelName, eventName, callback) {
        if (!echoAvailable.value) return () => {};

        const channel = window.Echo.private(channelName);
        channel.listen(eventName, callback);

        const unsub = () => {
            channel.stopListening(eventName, callback);
            window.Echo.leave(channelName);
        };
        subscriptions.push(unsub);
        return unsub;
    }

    /**
     * Subscribe to a specific ticket's channel for real-time updates.
     *
     * @param {number|string} ticketId - The ticket ID
     * @param {Object} handlers - Event handler callbacks
     * @param {Function} [handlers.onReplyCreated] - Called when a new reply is added
     * @param {Function} [handlers.onTicketUpdated] - Called when ticket fields are updated
     * @param {Function} [handlers.onStatusChanged] - Called when ticket status changes
     * @param {Function} [handlers.onTicketAssigned] - Called when ticket is assigned
     * @param {Function} [handlers.onTicketEscalated] - Called when ticket is escalated
     * @returns {Function} Unsubscribe function
     */
    function subscribeToTicket(ticketId, handlers = {}) {
        if (!echoAvailable.value) return () => {};

        const channelName = `escalated.tickets.${ticketId}`;
        const channel = window.Echo.private(channelName);
        const listeners = [];

        if (handlers.onReplyCreated) {
            channel.listen('.reply.created', handlers.onReplyCreated);
            listeners.push(['.reply.created', handlers.onReplyCreated]);
        }
        if (handlers.onTicketUpdated) {
            channel.listen('.ticket.updated', handlers.onTicketUpdated);
            listeners.push(['.ticket.updated', handlers.onTicketUpdated]);
        }
        if (handlers.onStatusChanged) {
            channel.listen('.ticket.status_changed', handlers.onStatusChanged);
            listeners.push(['.ticket.status_changed', handlers.onStatusChanged]);
        }
        if (handlers.onTicketAssigned) {
            channel.listen('.ticket.assigned', handlers.onTicketAssigned);
            listeners.push(['.ticket.assigned', handlers.onTicketAssigned]);
        }
        if (handlers.onTicketEscalated) {
            channel.listen('.ticket.escalated', handlers.onTicketEscalated);
            listeners.push(['.ticket.escalated', handlers.onTicketEscalated]);
        }

        const unsub = () => {
            listeners.forEach(([event, cb]) => channel.stopListening(event, cb));
            window.Echo.leave(channelName);
        };
        subscriptions.push(unsub);
        return unsub;
    }

    /**
     * Subscribe to the global tickets channel for new ticket notifications.
     *
     * @param {Object} handlers - Event handler callbacks
     * @param {Function} [handlers.onTicketCreated] - Called when a new ticket is created
     * @returns {Function} Unsubscribe function
     */
    function subscribeToTickets(handlers = {}) {
        if (!echoAvailable.value) return () => {};

        const channelName = 'escalated.tickets';
        const channel = window.Echo.private(channelName);
        const listeners = [];

        if (handlers.onTicketCreated) {
            channel.listen('.ticket.created', handlers.onTicketCreated);
            listeners.push(['.ticket.created', handlers.onTicketCreated]);
        }

        const unsub = () => {
            listeners.forEach(([event, cb]) => channel.stopListening(event, cb));
            window.Echo.leave(channelName);
        };
        subscriptions.push(unsub);
        return unsub;
    }

    /**
     * Subscribe to an agent's personal channel for assignment notifications.
     *
     * @param {number|string} agentId - The agent's user ID
     * @param {Object} handlers - Event handler callbacks
     * @param {Function} [handlers.onTicketAssigned] - Called when a ticket is assigned to this agent
     * @returns {Function} Unsubscribe function
     */
    function subscribeToAgent(agentId, handlers = {}) {
        if (!echoAvailable.value) return () => {};

        const channelName = `escalated.agents.${agentId}`;
        const channel = window.Echo.private(channelName);
        const listeners = [];

        if (handlers.onTicketAssigned) {
            channel.listen('.ticket.assigned', handlers.onTicketAssigned);
            listeners.push(['.ticket.assigned', handlers.onTicketAssigned]);
        }

        const unsub = () => {
            listeners.forEach(([event, cb]) => channel.stopListening(event, cb));
            window.Echo.leave(channelName);
        };
        subscriptions.push(unsub);
        return unsub;
    }

    /**
     * Get a presence channel for a ticket (if Echo supports it).
     * Returns the channel instance or null.
     */
    function joinTicketPresence(ticketId, callbacks = {}) {
        if (!echoAvailable.value) return null;

        const channelName = `escalated.tickets.${ticketId}`;
        const channel = window.Echo.join(channelName);

        if (callbacks.here) channel.here(callbacks.here);
        if (callbacks.joining) channel.joining(callbacks.joining);
        if (callbacks.leaving) channel.leaving(callbacks.leaving);

        const unsub = () => {
            window.Echo.leave(`presence-${channelName}`);
        };
        subscriptions.push(unsub);
        return { channel, unsubscribe: unsub };
    }

    // Cleanup all subscriptions on component unmount
    onUnmounted(() => {
        subscriptions.forEach((unsub) => {
            try {
                unsub();
            } catch {
                /* ignore */
            }
        });
        subscriptions.length = 0;
    });

    return {
        echoAvailable: readonly(echoAvailable),
        listen,
        subscribeToTicket,
        subscribeToTickets,
        subscribeToAgent,
        joinTicketPresence,
    };
}
