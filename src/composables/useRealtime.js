import { ref, onUnmounted, readonly, toValue, watch } from 'vue';

// Multiple components can listen to the same channel. A component leaving must
// not disconnect the ticket updates or presence owned by another component.
const leases = new WeakMap();
function retainChannel(echo, name, presence) {
    const key = `${presence ? 'presence' : 'private'}-${name}`;
    let counts = leases.get(echo);
    if (!counts) leases.set(echo, (counts = new Map()));
    counts.set(key, (counts.get(key) || 0) + 1);
    return () => {
        const count = counts.get(key) - 1;
        if (count > 0) counts.set(key, count);
        else {
            counts.delete(key);
            if (echo.leaveChannel) echo.leaveChannel(key);
            else echo.leave(presence ? `presence-${name}` : name);
        }
    };
}

/** Optional channelPrefix accepts a value, ref or getter. Older backends use escalated. */
export function useRealtime(options = {}) {
    const echoAvailable = ref(typeof window !== 'undefined' && !!window.Echo);
    const subscriptions = new Set();

    function track(cleanup) {
        let active = true;
        const stop = () => {
            if (!active) return;
            active = false;
            subscriptions.delete(stop);
            cleanup();
        };
        subscriptions.add(stop);
        return stop;
    }

    // Raw channel names remain literal for existing integrations.
    function listen(channelName, eventName, callback) {
        if (!echoAvailable.value) return () => {};
        const echo = window.Echo;
        const channel = echo.private(channelName);
        const release = retainChannel(echo, channelName, false);
        channel.listen(eventName, callback);
        return track(() => {
            channel.stopListening(eventName, callback);
            release();
        });
    }

    function scopedSubscription(suffix, handlers, presence = false) {
        let currentChannel = null;
        const stopWatch = watch(
            () => {
                const tail = toValue(suffix);
                return tail == null ? null : `${toValue(options.channelPrefix) ?? 'escalated'}.${tail}`;
            },
            (name, previous, onCleanup) => {
                if (!name || !echoAvailable.value) return;
                const echo = window.Echo;
                const channel = presence ? echo.join(name) : echo.private(name);
                currentChannel = channel;
                const release = retainChannel(echo, name, presence);
                let active = true;
                const listeners = Object.entries(handlers)
                    .filter(([, callback]) => typeof callback === 'function')
                    .map(([event, callback]) => {
                        // Ignore an old socket callback already queued during account navigation.
                        const guarded = (...args) => {
                            if (active) callback(...args);
                        };
                        if (presence) channel[event](guarded);
                        else channel.listen(event, guarded);
                        return [event, guarded];
                    });
                onCleanup(() => {
                    active = false;
                    currentChannel = null;
                    if (!presence) listeners.forEach(([event, callback]) => channel.stopListening(event, callback));
                    release();
                });
            },
            { immediate: true, flush: 'sync' },
        );
        return {
            get channel() {
                return currentChannel;
            },
            unsubscribe: track(stopWatch),
        };
    }

    function listenScoped(suffix, handlers) {
        return scopedSubscription(suffix, handlers).unsubscribe;
    }

    function identitySuffix(kind, id) {
        return () => (toValue(id) == null ? null : `${kind}.${toValue(id)}`);
    }

    function subscribeToTicket(ticketId, handlers = {}) {
        return listenScoped(identitySuffix('tickets', ticketId), {
            '.reply.created': handlers.onReplyCreated,
            '.ticket.updated': handlers.onTicketUpdated,
            '.ticket.status_changed': handlers.onStatusChanged,
            '.ticket.assigned': handlers.onTicketAssigned,
            '.ticket.escalated': handlers.onTicketEscalated,
        });
    }

    function subscribeToTickets(handlers = {}) {
        return listenScoped('tickets', { '.ticket.created': handlers.onTicketCreated });
    }

    function subscribeToAgent(agentId, handlers = {}) {
        return listenScoped(identitySuffix('agents', agentId), { '.ticket.assigned': handlers.onTicketAssigned });
    }

    function joinTicketPresence(ticketId, callbacks = {}) {
        if (!echoAvailable.value) return null;
        return scopedSubscription(identitySuffix('tickets', ticketId), callbacks, true);
    }

    onUnmounted(() => {
        [...subscriptions].forEach((unsubscribe) => unsubscribe());
    });

    return {
        echoAvailable: readonly(echoAvailable),
        listen,
        listenScoped,
        subscribeToTicket,
        subscribeToTickets,
        subscribeToAgent,
        joinTicketPresence,
    };
}
