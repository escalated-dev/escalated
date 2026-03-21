/**
 * Shared formatting utilities for ticket display.
 */

/**
 * Returns a human-readable relative time string (e.g. "5m ago", "3h ago", "2d ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

/**
 * Returns a Tailwind CSS class for the SLA indicator dot based on ticket SLA state.
 * @param {Object} ticket
 * @returns {string}
 */
export function slaClass(ticket) {
    if (ticket.sla_first_response_breached || ticket.sla_resolution_breached) return 'bg-rose-500';
    if (ticket.first_response_due_at || ticket.resolution_due_at) {
        const due = ticket.resolution_due_at || ticket.first_response_due_at;
        const mins = (new Date(due) - Date.now()) / 60000;
        if (mins < 30) return 'bg-amber-500';
        return 'bg-emerald-500';
    }
    return '';
}
