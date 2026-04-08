import { ref, readonly } from 'vue';
import { useRealtime } from './useRealtime';

/**
 * Composable for live chat functionality.
 *
 * Provides methods to start, send messages, end, and rate chat sessions,
 * plus real-time subscription via useRealtime.
 */
export function useChat() {
    const connectionState = ref('disconnected'); // disconnected | connecting | connected
    const messageBuffer = ref([]);

    const { echoAvailable, listen } = useRealtime();

    function csrfToken() {
        return typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.content || '' : '';
    }

    async function apiRequest(method, path, body = null) {
        const opts = {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken(),
            },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        const data = await res.json();
        if (!res.ok) throw { status: res.status, data };
        return data;
    }

    /**
     * Start a new chat session.
     * @param {Object} data - { name, email, department_id, message }
     * @returns {Promise<Object>} The created chat session
     */
    async function startChat(data) {
        return apiRequest('POST', '/support/widget/chat/start', data);
    }

    /**
     * Send a message in a chat session.
     * @param {string|number} sessionId
     * @param {Object} body - { body, is_internal_note?, attachments? }
     * @returns {Promise<Object>}
     */
    async function sendMessage(sessionId, body) {
        const message = await apiRequest('POST', `/support/widget/chat/${sessionId}/messages`, body);
        return message;
    }

    /**
     * Send typing indicator (debounced by caller).
     * @param {string|number} sessionId
     * @returns {Promise<void>}
     */
    let lastTypingSent = 0;
    async function sendTyping(sessionId) {
        const now = Date.now();
        if (now - lastTypingSent < 3000) return;
        lastTypingSent = now;
        try {
            await apiRequest('POST', `/support/widget/chat/${sessionId}/typing`);
        } catch {
            // silently ignore typing failures
        }
    }

    /**
     * End a chat session.
     * @param {string|number} sessionId
     * @returns {Promise<Object>}
     */
    async function endChat(sessionId) {
        return apiRequest('POST', `/support/widget/chat/${sessionId}/end`);
    }

    /**
     * Rate a completed chat session.
     * @param {string|number} sessionId
     * @param {number} rating - 1-5 star rating
     * @param {string} [comment]
     * @returns {Promise<Object>}
     */
    async function rateChat(sessionId, rating, comment = '') {
        return apiRequest('POST', `/support/widget/chat/${sessionId}/rate`, { rating, comment });
    }

    /**
     * Check chat availability for a department.
     * @param {string|number} [departmentId]
     * @returns {Promise<Object>} { available, message, estimated_wait }
     */
    async function checkAvailability(departmentId = null) {
        const query = departmentId ? `?department_id=${departmentId}` : '';
        return apiRequest('GET', `/support/widget/chat/availability${query}`);
    }

    /**
     * Subscribe to real-time chat events for a session.
     * @param {string|number} sessionId
     * @param {Object} callbacks
     * @param {Function} [callbacks.onMessage]
     * @param {Function} [callbacks.onTyping]
     * @param {Function} [callbacks.onEnded]
     * @param {Function} [callbacks.onAssigned]
     * @returns {Function} Unsubscribe function
     */
    function subscribeToChat(sessionId, callbacks = {}) {
        if (!echoAvailable.value) return () => {};

        const channelName = `escalated.chat.${sessionId}`;
        const unsubs = [];

        if (callbacks.onMessage) {
            unsubs.push(listen(channelName, '.chat.message', callbacks.onMessage));
        }
        if (callbacks.onTyping) {
            unsubs.push(listen(channelName, '.chat.typing', callbacks.onTyping));
        }
        if (callbacks.onEnded) {
            unsubs.push(listen(channelName, '.chat.ended', callbacks.onEnded));
        }
        if (callbacks.onAssigned) {
            unsubs.push(listen(channelName, '.chat.assigned', callbacks.onAssigned));
        }

        connectionState.value = 'connected';

        return () => {
            unsubs.forEach((fn) => fn());
            connectionState.value = 'disconnected';
        };
    }

    /**
     * Subscribe to the chat queue channel for new incoming chats.
     * @param {Object} callbacks
     * @param {Function} [callbacks.onNewChat]
     * @param {Function} [callbacks.onChatAccepted]
     * @returns {Function} Unsubscribe function
     */
    function subscribeToChatQueue(callbacks = {}) {
        if (!echoAvailable.value) return () => {};

        const channelName = 'escalated.chat.queue';
        const unsubs = [];

        if (callbacks.onNewChat) {
            unsubs.push(listen(channelName, '.chat.new', callbacks.onNewChat));
        }
        if (callbacks.onChatAccepted) {
            unsubs.push(listen(channelName, '.chat.accepted', callbacks.onChatAccepted));
        }

        return () => {
            unsubs.forEach((fn) => fn());
        };
    }

    return {
        connectionState: readonly(connectionState),
        messageBuffer: readonly(messageBuffer),
        startChat,
        sendMessage,
        sendTyping,
        endChat,
        rateChat,
        checkAvailability,
        subscribeToChat,
        subscribeToChatQueue,
    };
}
