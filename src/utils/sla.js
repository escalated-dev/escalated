import { isClosedStatus } from './constants';

/**
 * SLA clocks stop: first response at `first_response_at`, resolution at
 * `resolved_at` or `closed_at`, whichever came first.
 */

function time(value) {
    if (!value) return null;
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
}

/** The earliest of the given timestamps, or null when none is set. */
export function earliest(...values) {
    let first = null;
    for (const value of values) {
        const ms = time(value);
        if (ms !== null && (first === null || ms < time(first))) first = value;
    }
    return first;
}

/**
 * When a ticket's resolution clock stopped, or null while it runs. The
 * timestamps count only while the ticket is resolved or closed: a reopened
 * ticket can still carry old ones, and its clock is running again.
 */
export function resolutionStoppedAt(ticket) {
    if (!isClosedStatus(ticket?.status)) return null;
    return earliest(ticket?.resolved_at, ticket?.closed_at);
}

/**
 * 'met' or 'missed' once the clock has stopped, null while it runs. A stop
 * after the due time, or one the backend already marked breached, is missed.
 */
export function slaOutcome(dueAt, stoppedAt, breached = false) {
    const stopped = time(stoppedAt);
    if (stopped === null) return null;
    if (breached) return 'missed';
    const due = time(dueAt);
    if (due === null) return 'met';
    return stopped <= due ? 'met' : 'missed';
}
