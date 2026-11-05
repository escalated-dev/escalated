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
 * browser and posts `{ status }` to the host's `escalated.agent.status` route
 * (any agent may set their own), falling back to the admin live-chat route
 * `escalated.admin.chat.status` on hosts that only have that one. When the
 * backend answers with `{ agent_status }` that value is kept; when it refuses
 * the change the previous status comes back. A host with neither route keeps
 * the status client-side only.
 *
 * `allowed` is the backend's `escalated.agent_statuses`; the menu offers only
 * those of the known values.
 */
export const AGENT_STATUSES = ['online', 'away', 'offline'];
export const STATUS_STORAGE_KEY = 'escalated-agent-status';
const STATUS_ROUTES = ['escalated.agent.status', 'escalated.admin.chat.status'];

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

function routeUrl(name) {
    try {
        const url = window.route(name);
        return typeof url === 'string' && url !== '#' ? url : '';
    } catch {
        return '';
    }
}

function statusEndpoint() {
    if (typeof window === 'undefined' || typeof window.route !== 'function') return '';
    for (const name of STATUS_ROUTES) {
        const url = routeUrl(name);
        if (url) return url;
    }
    return '';
}

function post(value, previous) {
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
    })
        .then(async (response) => {
            // A later choice has replaced this one: leave it alone.
            if (!response || current.value !== value) return;
            if (response.ok === false) {
                if (previous) {
                    current.value = previous;
                    remember(previous);
                }
                return;
            }
            const data = typeof response.json === 'function' ? await response.json().catch(() => null) : null;
            const confirmed = valid(data?.agent_status);
            if (confirmed && current.value === value) {
                current.value = confirmed;
                remember(confirmed);
            }
        })
        .catch(() => {});
}

export function useAgentStatus({ initial = null, allowed = null } = {}) {
    if (current.value === null) {
        current.value = valid(initial) || remembered() || 'online';
    }

    const statuses = computed(() => {
        const offered = Array.isArray(allowed) ? allowed.filter((value) => valid(value)) : [];
        return offered.length ? offered : AGENT_STATUSES;
    });

    function setStatus(value) {
        if (!valid(value)) return;
        const previous = current.value;
        current.value = value;
        remember(value);
        post(value, previous);
    }

    return { status: computed(() => current.value), statuses, setStatus };
}

/** Forget the shared status (tests, and a sign-out in a long-lived tab). */
export function resetAgentStatus() {
    current.value = null;
}
