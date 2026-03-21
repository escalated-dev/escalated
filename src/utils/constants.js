/**
 * Shared ticket constants used across multiple components.
 * Single source of truth for statuses, priorities, and types.
 */

export const TICKET_STATUSES = [
    'open',
    'in_progress',
    'waiting_on_customer',
    'waiting_on_agent',
    'escalated',
    'resolved',
    'closed',
];

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent', 'critical'];

export const TICKET_TYPES = [
    { value: 'question', label: 'Question', color: 'text-cyan-400' },
    { value: 'problem', label: 'Problem', color: 'text-rose-400' },
    { value: 'incident', label: 'Incident', color: 'text-amber-400' },
    { value: 'task', label: 'Task', color: 'text-violet-400' },
];

export const TICKET_TYPE_COLORS = {
    question: { dark: 'bg-cyan-500/20 text-cyan-400', light: 'bg-cyan-100 text-cyan-700' },
    problem: { dark: 'bg-rose-500/20 text-rose-400', light: 'bg-rose-100 text-rose-700' },
    incident: { dark: 'bg-amber-500/20 text-amber-400', light: 'bg-amber-100 text-amber-700' },
    task: { dark: 'bg-violet-500/20 text-violet-400', light: 'bg-violet-100 text-violet-700' },
};
