/* global URLSearchParams */
/**
 * Queues, URLs and the remembered inbox list for the agent panel.
 */

/** Build a query string, skipping empty values. Arrays become key[]=v pairs. */
export function toQuery(params = {}) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params || {})) {
        if (value === '' || value === null || value === undefined || value === false) continue;
        if (Array.isArray(value)) {
            for (const item of value) search.append(`${key}[]`, String(item));
        } else {
            search.append(key, value === true ? '1' : String(value));
        }
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export function normalisePrefix(prefix) {
    const p = prefix || 'support';
    return p.startsWith('/') ? p : `/${p}`;
}

export function ticketsUrl(prefix, params = {}) {
    return `${normalisePrefix(prefix)}/agent/tickets${toQuery(params)}`;
}

/** The URL of one ticket, through the host's route() helper when it knows the name. */
export function ticketUrl(prefix, reference) {
    if (typeof window !== 'undefined' && typeof window.route === 'function') {
        try {
            const url = window.route('escalated.agent.tickets.show', reference);
            if (typeof url === 'string' && url !== '#') return url;
        } catch {
            // fall through to the conventional path
        }
    }
    return `${normalisePrefix(prefix)}/agent/tickets/${encodeURIComponent(reference)}`;
}

/** The three workspace queues and the filters each one applies. */
export function workspaceQueues(userId) {
    return [
        { key: 'mine', icon: 'inbox', filters: userId != null ? { assigned_to: userId } : null },
        { key: 'unassigned', icon: 'user', filters: { unassigned: 1 } },
        { key: 'all', icon: 'ticket', filters: {} },
    ].filter((queue) => queue.filters !== null);
}

const VIEW_ICONS = {
    urgent: 'fire',
    sla_at_risk: 'clock',
    waiting_on_me: 'user',
    waiting_on_agent: 'user',
    waiting_on_customer: 'users',
    recently_updated: 'refresh',
};

export function viewIcon(view) {
    return VIEW_ICONS[view?.id] || VIEW_ICONS[view?.key] || 'funnel';
}

function queryOf(url) {
    const index = (url || '').indexOf('?');
    if (index < 0) return {};
    const params = {};
    for (const [key, value] of new URLSearchParams(url.slice(index + 1).split('#')[0])) {
        const name = key.endsWith('[]') ? key.slice(0, -2) : key;
        if (key.endsWith('[]')) params[name] = [...(params[name] || []), value];
        else params[name] = value;
    }
    return params;
}

function sameFilters(a = {}, b = {}) {
    const clean = (o) =>
        Object.fromEntries(
            Object.entries(o || {})
                .filter(([key, v]) => v !== '' && v !== null && v !== undefined && key !== 'page')
                .map(([k, v]) => [k, Array.isArray(v) ? v.map(String).sort().join(',') : String(v === true ? 1 : v)]),
        );
    const x = clean(a);
    const y = clean(b);
    const keys = Object.keys(x);
    return keys.length === Object.keys(y).length && keys.every((k) => x[k] === y[k]);
}

/**
 * Which queue a ticket-list URL shows: 'mine', 'unassigned', 'all', a view as
 * 'view:<id>', or null when the filters match none of them.
 * A `queue` prop from the backend wins over the guess.
 */
export function activeQueueKey({ url, userId, views = [], queue = null }) {
    if (queue?.key) return String(queue.key);
    const params = queryOf(url);
    if (params.live_chat && Object.keys(params).length === 1) return 'live';
    for (const view of views || []) {
        if (view?.filters && Object.keys(view.filters).length && sameFilters(view.filters, params)) {
            return `view:${view.id}`;
        }
    }
    for (const candidate of workspaceQueues(userId)) {
        if (sameFilters(candidate.filters, params)) return candidate.key;
    }
    return null;
}

// --- The remembered inbox list -------------------------------------------
//
// On a wide screen the ticket page shows the list it was opened from beside
// it. Inertia swaps the page component on that visit, so the list is kept
// here: in memory for in-app navigation and in sessionStorage for a reload.

const STORAGE_KEY = 'escalated-agent-inbox';
let remembered = null;

function storage() {
    try {
        return typeof window !== 'undefined' ? window.sessionStorage : null;
    } catch {
        return null;
    }
}

export function rememberInbox(entry) {
    remembered = entry;
    try {
        storage()?.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch {
        // full or blocked: the in-memory copy still serves this session
    }
}

export function recallInbox() {
    if (remembered) return remembered;
    try {
        const raw = storage()?.getItem(STORAGE_KEY);
        if (raw) remembered = JSON.parse(raw);
    } catch {
        remembered = null;
    }
    return remembered;
}

export function forgetInbox() {
    remembered = null;
    try {
        storage()?.removeItem(STORAGE_KEY);
    } catch {
        // nothing to clear
    }
}
