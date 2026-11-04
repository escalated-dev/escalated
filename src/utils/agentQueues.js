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

/**
 * The filters a rail link opens. Backends that send `inbox` counts count
 * unresolved, unsnoozed tickets (escalated-laravel's `open=1`), so the link
 * opens that same list; the agent can clear the open filter from the list.
 */
export function queueLinkFilters(filters = {}, open = false) {
    return open ? { ...(filters || {}), open: 1 } : { ...(filters || {}) };
}

/**
 * A view opens by id (`view=<id>`, which the backend expands to the view's
 * filters), over open tickets unless the view names a status or open itself,
 * matching how its count is taken.
 */
export function viewLinkFilters(view) {
    const filters = view?.filters || {};
    const own = filters.status !== undefined && filters.status !== '' ? true : !!filters.open;
    return own ? { view: view.id } : { view: view.id, open: 1 };
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
    if (params.view !== undefined && params.view !== '') return `view:${params.view}`;
    if (params.live_chat && Object.keys(params).length === 1) return 'live';
    for (const view of views || []) {
        if (view?.filters && Object.keys(view.filters).length && sameFilters(view.filters, params)) {
            return `view:${view.id}`;
        }
    }
    const queues = workspaceQueues(userId);
    for (const candidate of queues) {
        if (sameFilters(candidate.filters, params)) return candidate.key;
    }
    // Searching, filtering or paging inside a queue keeps the agent in it:
    // the URL then holds the queue's filters plus a few more. Mine and
    // unassigned come first, then views, then all tickets.
    for (const candidate of queues) {
        if (candidate.key !== 'all' && containsFilters(params, candidate.filters)) return candidate.key;
    }
    const narrowest = [...(views || [])]
        .filter((view) => view?.filters && Object.keys(view.filters).length)
        .sort((a, b) => Object.keys(b.filters).length - Object.keys(a.filters).length)
        .find((view) => containsFilters(params, view.filters));
    if (narrowest) return `view:${narrowest.id}`;
    return params.live_chat ? 'live' : 'all';
}

function containsFilters(params, filters = {}) {
    const entries = Object.entries(filters || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined);
    return entries.length > 0 && entries.every(([key]) => sameFilters({ [key]: filters[key] }, { [key]: params[key] }));
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

/**
 * Title and subline for the list column: "My inbox" / "24 tickets assigned
 * to you". The backend's `queue.title` wins; otherwise the queue key names it.
 */
export function queueHeading({ key, queue = null, views = [], total = null, open = false, t }) {
    const view = String(key || '').startsWith('view:') ? (views || []).find((v) => `view:${v.id}` === key) : null;
    const named = {
        mine: 'agent_panel.inbox.title_mine',
        unassigned: 'agent_panel.inbox.title_unassigned',
        all: 'agent_panel.inbox.title_all',
        live: 'agent_panel.inbox.title_live',
    };
    const title = queue?.title || view?.name || (named[key] ? t(named[key]) : t('agent_panel.inbox.title_tickets'));
    if (typeof total !== 'number') return { title, subtitle: '' };
    const form = total === 1 ? 'one' : 'other';
    const kind = open ? 'open_' : '';
    const sub = {
        mine: `agent_panel.inbox.subtitle_${kind}mine_${form}`,
        unassigned: `agent_panel.inbox.subtitle_${kind}unassigned_${form}`,
    }[key];
    return { title, subtitle: t(sub || `agent_panel.inbox.subtitle_${kind}${form}`, { count: total }) };
}
