import { computed, ref } from 'vue';

/**
 * The signed-in agent's own availability: online, away or offline.
 *
 * Where it comes from, in order:
 *   1. the `initial` value the backend shares (`escalated.agent_status`, or
 *      the live-chat `escalated.chat_status`);
 *   2. the last choice made in this browser (localStorage);
 *   3. online.
 *
 * Changing it updates every caller at once, remembers the choice in this
 * browser and, when the host defines the `escalated.admin.chat.status` route
 * (escalated-laravel does), posts `{ status }` to it so live-chat routing
 * follows. A host without that route keeps the status client-side only.
 */
export const AGENT_STATUSES = ['online', 'away', 'offline'];
export const STATUS_STORAGE_KEY = 'escalated-agent-status';

const current = ref(null);

function valid(value) {
    return AGENT_STATUSES.includes(value) ? value : null;
}

function remembered() {
    try {
        return valid(window.localStorage.getItem(STATUS_STORAGE_KEY));
    } catch {
        return null;
    }
}

function remember(value) {
    try {
        window.localStorage.setItem(STATUS_STORAGE_KEY, value);
    } catch {
        // storage blocked: the status still holds for this page
    }
}

function statusEndpoint() {
    if (typeof window === 'undefined' || typeof window.route !== 'function') return '';
    try {
        const url = window.route('escalated.admin.chat.status');
        return typeof url === 'string' && url !== '#' ? url : '';
    } catch {
        return '';
    }
}

function post(value) {
    const url = statusEndpoint();
    if (!url || typeof fetch !== 'function') return;
    fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify({ status: value }),
    }).catch(() => {});
}

export function useAgentStatus({ initial = null } = {}) {
    if (current.value === null) {
        current.value = valid(initial) || remembered() || 'online';
    }

    function setStatus(value) {
        if (!valid(value)) return;
        current.value = value;
        remember(value);
        post(value);
    }

    return { status: computed(() => current.value), setStatus };
}

/** Forget the shared status (tests, and a sign-out in a long-lived tab). */
export function resetAgentStatus() {
    current.value = null;
}
