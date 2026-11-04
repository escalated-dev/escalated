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
