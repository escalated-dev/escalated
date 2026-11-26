import { ref, toValue, watch } from 'vue';
import { requestHeaders } from '../utils/http';

/**
 * Live chat routes for the agent panel, by name through the host's route()
 * helper. The agent route (`escalated.agent.chat.<action>`) comes first; an
 * admin falls back to `escalated.admin.chat.<action>`, which older backends
 * have alone. A host whose helper knows neither name gets '' and the action is
 * left out, never a visitor (widget) route: those take the visitor's token.
 *
 * @param {string} action  active | queue | accept | end | transfer | message | typing
 * @param {string|number} [sessionId]  The chat session id, for the per-chat actions.
 * @param {{ isAdmin?: boolean }} [options]
 */
export function chatRoute(action, sessionId, { isAdmin = false } = {}) {
    const names = [`escalated.agent.chat.${action}`];
    if (isAdmin) names.push(`escalated.admin.chat.${action}`);
    for (const name of names) {
        const url = namedRoute(name, sessionId);
        if (url) return url;
    }
    return '';
}

function namedRoute(name, params) {
    const helper = typeof route === 'function' ? route : typeof window !== 'undefined' ? window.route : null;
    if (typeof helper !== 'function') return '';
    try {
        const url = params === undefined || params === null ? helper(name) : helper(name, params);
        return typeof url === 'string' && url !== '' && url !== '#' ? url : '';
    } catch {
        return '';
    }
}

/**
 * One chat for the panel, from the backend's summary (escalated-laravel's
 * `escalated.active_chats` / `chat_queue` and its agent chat routes) or from a
 * plain chat session with its `ticket` (the admin routes, other backends).
 */
export function normaliseChat(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const ticket = raw.ticket && typeof raw.ticket === 'object' ? raw.ticket : {};
    return {
        ...raw,
        id: raw.id ?? raw.session_id,
        ticket_id: raw.ticket_id ?? ticket.id ?? null,
        ticket_reference: raw.ticket_reference ?? ticket.reference ?? null,
        subject: raw.subject ?? ticket.subject ?? null,
        customer_name: raw.customer_name ?? ticket.guest_name ?? ticket.requester?.name ?? null,
        customer_email: raw.customer_email ?? ticket.guest_email ?? ticket.requester?.email ?? null,
        department: raw.department ?? ticket.department ?? null,
        first_message: raw.first_message ?? ticket.description ?? null,
        last_message: raw.last_message ?? null,
        last_message_at: raw.last_message_at ?? null,
        created_at: raw.created_at ?? raw.started_at ?? null,
    };
}

export function normaliseChats(list) {
    return Array.isArray(list) ? list.map(normaliseChat).filter((chat) => chat && chat.id != null) : [];
}

/**
 * The agent's active chats and the waiting queue, seeded from the shared
 * props and refreshed from the chat list routes when the host has them.
 *
 * @param {Object} options
 * @param {Function} options.shared  Getter for the shared `escalated` props.
 * @param {Function} [options.isAdmin]  Getter: whether the admin routes may be used.
 */
export function useAgentChats({ shared, isAdmin = () => false } = {}) {
    const activeChats = ref(normaliseChats(toValue(shared)?.active_chats));
    const queue = ref(normaliseChats(toValue(shared)?.chat_queue));

    // Every Inertia visit brings the shared lists again.
    watch(
        () => [toValue(shared)?.active_chats, toValue(shared)?.chat_queue],
        ([active, waiting]) => {
            activeChats.value = normaliseChats(active);
            queue.value = normaliseChats(waiting);
        },
    );

    async function getJson(url) {
        const res = await fetch(url, { credentials: 'same-origin', headers: requestHeaders({ url }) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    /** Fetch both lists again; a host without the routes keeps what it shared. */
    async function refresh() {
        const admin = toValue(isAdmin);
        const activeUrl = chatRoute('active', undefined, { isAdmin: admin });
        const queueUrl = chatRoute('queue', undefined, { isAdmin: admin });
        await Promise.all([
            activeUrl &&
                getJson(activeUrl)
                    .then((data) => {
                        activeChats.value = normaliseChats(data?.sessions ?? data?.data ?? data);
                    })
                    .catch(() => {}),
            queueUrl &&
                getJson(queueUrl)
                    .then((data) => {
                        queue.value = normaliseChats(data?.sessions ?? data?.data ?? data);
                    })
                    .catch(() => {}),
        ]);
    }

    /** Accept a waiting chat. Resolves true when the backend took it. */
    async function accept(chat) {
        const url = chatRoute('accept', chat?.id, { isAdmin: toValue(isAdmin) });
        if (!url) return false;
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: requestHeaders({ json: true, url }),
                body: JSON.stringify({}),
            });
            if (!res.ok) return false;
            queue.value = queue.value.filter((waiting) => waiting.id !== chat.id);
            return true;
        } catch {
            return false;
        }
    }

    return { activeChats, queue, refresh, accept };
}
