import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';
import { isUnread } from '../utils/agentTicket';
import { requestJson, routeOr } from '../utils/agentApi';
import { toast } from './useAgentToasts';
import { useI18n } from './useI18n';

/**
 * Per-agent read state for tickets (ADR 2026-11-05-agent-panel-data).
 *
 * The backend says whether a ticket is unread (`is_unread`); marking one read
 * or unread posts to `escalated.agent.tickets.read` / `.unread` and shows the
 * change at once, in every list, until fresh rows arrive from the backend.
 * Without those routes nothing can be marked and the menus leave it out.
 */
const marked = reactive(new Map());

function key(ticket) {
    return ticket?.id ?? ticket?.reference ?? null;
}

/** Whether the ticket is unread for this agent, counting marks made here. */
export function ticketUnread(ticket) {
    const id = key(ticket);
    if (id !== null && marked.has(id)) return marked.get(id);
    return isUnread(ticket);
}

/** The route that marks this ticket read (or unread), or ''. */
export function markRoute(ticket, unread) {
    if (!ticket?.reference) return '';
    return routeOr(unread ? 'escalated.agent.tickets.unread' : 'escalated.agent.tickets.read', ticket.reference);
}

/** Whether the host can mark tickets read and unread (for bulk actions). */
export function canMarkTickets() {
    return !!routeOr('escalated.agent.tickets.read', '0') && !!routeOr('escalated.agent.tickets.unread', '0');
}

/** Opening a ticket marks it read on the backend; show it here too. */
export function markSeen(ticket) {
    const id = key(ticket);
    if (id !== null) marked.set(id, false);
}

/** Fresh rows from the backend replace what was marked here. */
export function forgetMarks(tickets = null) {
    if (!tickets) {
        marked.clear();
        return;
    }
    for (const ticket of tickets) {
        const id = key(ticket);
        if (id !== null) marked.delete(id);
    }
}

export function useUnread() {
    const { t } = useI18n();

    /**
     * Mark a ticket read or unread. Resolves true once the backend agrees;
     * on failure the previous state comes back and a toast says so.
     */
    async function setUnread(ticket, unread, { reloadInbox = true } = {}) {
        const url = markRoute(ticket, unread);
        const id = key(ticket);
        if (!url || id === null) return false;
        const had = marked.has(id);
        const previous = marked.get(id);
        marked.set(id, unread);
        try {
            const data = await requestJson(url, { method: 'POST', body: {} });
            if (typeof data?.is_unread === 'boolean') marked.set(id, data.is_unread);
            if (reloadInbox && typeof router.reload === 'function') {
                router.reload({ only: ['inbox'], preserveScroll: true, preserveState: true });
            }
            return true;
        } catch {
            if (had) marked.set(id, previous);
            else marked.delete(id);
            toast(t('agent_panel.toast.failed'), 'error');
            return false;
        }
    }

    return { setUnread, ticketUnread };
}
