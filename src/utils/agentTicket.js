/**
 * Small display helpers shared by the agent inbox and ticket views.
 */

export function initials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
}

export function requesterName(ticket) {
    return (
        ticket?.requester?.name || ticket?.requester_name || ticket?.requester?.email || ticket?.requester_email || ''
    );
}

/** The CSS colour token for a priority. Critical shares urgent's colour. */
export function priorityColor(priority) {
    const key = priority === 'critical' ? 'urgent' : priority;
    return ['low', 'medium', 'high', 'urgent'].includes(key) ? `var(--esc-priority-${key})` : 'var(--esc-priority-low)';
}

export function isUrgent(priority) {
    return priority === 'urgent' || priority === 'critical';
}

/** Whether the requester is reachable right now: online, or in a live chat. */
export function isLive(ticket) {
    return (
        ticket?.requester_online === true ||
        ticket?.requester?.is_online === true ||
        ticket?.is_live_chat === true ||
        (ticket?.channel === 'chat' && ticket?.status === 'live')
    );
}

/** Whether the agent has not seen the latest activity. Only what the backend says. */
export function isUnread(ticket) {
    return ticket?.is_unread === true || ticket?.unread === true;
}

const AT_RISK_MINUTES = 60;

/**
 * SLA state for a ticket: `{ state: 'breach' | 'warn', minutes? }`, or null
 * when the ticket is neither breached nor due within the hour.
 */
export function slaState(ticket, now = Date.now()) {
    if (!ticket) return null;
    if (ticket.sla_first_response_breached || ticket.sla_resolution_breached) return { state: 'breach' };
    const dues = [ticket.first_response_due_at, ticket.resolution_due_at].filter(Boolean).map((d) => new Date(d));
    if (!dues.length) return null;
    const minutes = Math.round((Math.min(...dues.map((d) => d.getTime())) - now) / 60000);
    if (minutes < 0) return { state: 'breach' };
    if (minutes <= AT_RISK_MINUTES) return { state: 'warn', minutes };
    return null;
}

/** One line of plain text from a message body (which may be HTML). */
export function preview(text) {
    return (
        String(text || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;|&apos;/g, "'")
            .replace(/&quot;/g, '"')
            // Last, so "&amp;lt;" stays "&lt;" rather than becoming "<".
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,!?;:])/g, '$1')
            .trim()
    );
}

export function latestPreview(ticket) {
    return preview(ticket?.latest_reply?.body || ticket?.last_reply?.body || ticket?.preview || ticket?.description);
}

/** "Just now", "12m ago", "3h ago", "2d ago", through the given t(). */
export function relativeTime(date, t, now = Date.now()) {
    if (!date) return '';
    const minutes = Math.floor((now - new Date(date).getTime()) / 60000);
    if (Number.isNaN(minutes)) return '';
    if (minutes < 1) return t('agent_panel.time.just_now');
    if (minutes < 60) return t('agent_panel.time.minutes_ago', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('agent_panel.time.hours_ago', { count: hours });
    return t('agent_panel.time.days_ago', { count: Math.floor(hours / 24) });
}

/** The full local date and time, for a tooltip beside a relative time. */
export function absoluteTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export function lastActivity(ticket) {
    return ticket?.last_reply_at || ticket?.updated_at || ticket?.created_at;
}

/**
 * Who wrote a message in the thread: `customer` or `agent`. The ticket's
 * description is the customer's. A reply says so with `is_agent` /
 * `is_customer` when the backend sends them; otherwise it is the customer's
 * when its author is the requester (same type and id), or a guest (no author).
 */
export function messageKind(message, ticket) {
    if (message?.is_internal_note) return 'note';
    if (message?.is_description) return 'customer';
    if (message?.is_customer === true || message?.is_agent === false) return 'customer';
    if (message?.is_agent === true) return 'agent';
    const type = message?.author_type ?? null;
    const id = message?.author_id ?? message?.user_id ?? null;
    if (type === null && id === null && !message?.author?.id) return 'customer';
    if (
        ticket?.requester_type != null &&
        type === ticket.requester_type &&
        String(id ?? message?.author?.id) === String(ticket.requester_id)
    ) {
        return 'customer';
    }
    return 'agent';
}

const EVENT_TYPES = new Set([
    'status_changed',
    'assigned',
    'unassigned',
    'priority_changed',
    'tag_added',
    'tag_removed',
    'department_changed',
    'escalated',
    'sla_breached',
    'reopened',
    'resolved',
    'closed',
    'snoozed',
    'unsnoozed',
    'ticket_split',
]);

/**
 * A ticket activity as one translated sentence for the thread and the
 * history, or null for activities the thread already shows as messages
 * (replies and notes). Reads Escalated's property names (`new_status`,
 * `new_priority`, `agent_id`, `new_department_id`) and the older `to`,
 * `agent_name`, `tag` and `department`; ids resolve against `agents` and
 * `departments` when given.
 */
export function describeActivity(activity, t, { agents = [], departments = [], statusLabel, priorityLabel } = {}) {
    const type = activity?.type;
    if (!type || type === 'replied' || type === 'note_added') return null;
    const p = activity.properties || {};
    const name = activity.causer?.name || t('agent_panel.events.system');
    const label = (fn, value) => (fn ? fn(value) : String(value || '').replace(/_/g, ' '));
    if (type === 'status_changed') {
        const status = p.new_status ?? p.to;
        return status ? t('agent_panel.events.status_changed', { name, status: label(statusLabel, status) }) : null;
    }
    if (type === 'priority_changed') {
        const priority = p.new_priority ?? p.to;
        return priority
            ? t('agent_panel.events.priority_changed', { name, priority: label(priorityLabel, priority) })
            : null;
    }
    if (type === 'assigned') {
        const agent =
            p.agent_name || agents.find((a) => p.agent_id != null && String(a.id) === String(p.agent_id))?.name;
        return agent
            ? t('agent_panel.events.assigned', { name, agent })
            : t('agent_panel.events.assigned_plain', { name });
    }
    if (type === 'tag_added' || type === 'tag_removed') {
        const tag = p.tag || p.tag_name;
        return tag ? t(`agent_panel.events.${type}`, { name, tag }) : null;
    }
    if (type === 'department_changed') {
        const department =
            p.department ||
            departments.find((d) => p.new_department_id != null && String(d.id) === String(p.new_department_id))?.name;
        return department ? t('agent_panel.events.department_changed', { name, department }) : null;
    }
    if (EVENT_TYPES.has(type)) return t(`agent_panel.events.${type}`, { name });
    return t('agent_panel.events.other', { name, type: String(type).replace(/_/g, ' ') });
}

/** Snooze presets from `now` (local time): an hour, four hours, tomorrow 9:00, next Monday 9:00. */
export function snoozePresets(now = new Date()) {
    const at = (date, hours) => {
        const d = new Date(date);
        d.setHours(hours, 0, 0, 0);
        return d;
    };
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monday = new Date(now);
    monday.setDate(monday.getDate() + ((8 - monday.getDay()) % 7 || 7));
    return [
        { key: 'in_hour', until: new Date(now.getTime() + 3600000) },
        { key: 'in_hours', until: new Date(now.getTime() + 4 * 3600000) },
        { key: 'tomorrow', until: at(tomorrow, 9) },
        { key: 'next_week', until: at(monday, 9) },
    ];
}
