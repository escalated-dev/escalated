/**
 * The Workflows admin wire format, as fixed in escalated-developer-context
 * `domain-model/workflow-admin-contract.md`.
 *
 * Every backend engine reads `trigger_event` with dotted names, conditions as
 * `{all: [...]}` or `{any: [...]}`, and actions as `{type, value}`. The builder
 * used to send `trigger: 'ticket_created'`, `{match, conditions}` and
 * `{type, config}`, none of which any backend reads. The older shapes are still
 * read here, so a workflow saved that way, or stored by Laravel as
 * `{match, rules}`, opens in the builder and is saved back in the contract shape.
 */

export const DEFAULT_TRIGGER_EVENTS = [
    { value: 'ticket.created', label: 'Ticket Created' },
    { value: 'ticket.updated', label: 'Ticket Updated' },
    { value: 'ticket.assigned', label: 'Ticket Assigned' },
    { value: 'ticket.status_changed', label: 'Status Changed' },
    { value: 'reply.created', label: 'Reply Added' },
];

export const CORE_ACTION_TYPES = [
    { value: 'change_status', label: 'Change Status' },
    { value: 'change_priority', label: 'Change Priority' },
    { value: 'add_tag', label: 'Add Tag' },
    { value: 'remove_tag', label: 'Remove Tag' },
    { value: 'set_department', label: 'Set Department' },
    { value: 'assign_agent', label: 'Assign Agent' },
    { value: 'add_note', label: 'Add Internal Note' },
    { value: 'insert_canned_reply', label: 'Insert Canned Reply' },
];

export const DEFAULT_OPERATORS = [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'greater_than',
    'less_than',
    'greater_or_equal',
    'less_or_equal',
    'is_empty',
    'is_not_empty',
];

const ACRONYMS = { sla: 'SLA' };

/** `ticket.status_changed` -> `Ticket Status Changed`. */
export function humanize(value) {
    return String(value ?? '')
        .split(/[._\s]+/)
        .filter(Boolean)
        .map((word) => ACRONYMS[word.toLowerCase()] ?? word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * A backend option list in any of the shapes the contract allows, as
 * `[{value, label}]`: a list of `{value, label}`, a list of plain values, or a
 * value -> label map. An absent or empty list means `fallback`.
 */
export function normalizeOptions(input, fallback = []) {
    const known = new Map(fallback.map((option) => [option.value, option.label]));
    const labelFor = (value) => known.get(value) ?? humanize(value);

    let options = [];

    if (Array.isArray(input)) {
        options = input.map((item) =>
            item !== null && typeof item === 'object'
                ? { value: item.value, label: item.label ?? labelFor(item.value) }
                : { value: item, label: labelFor(item) },
        );
    } else if (input !== null && typeof input === 'object') {
        options = Object.entries(input).map(([value, label]) => ({ value, label: label || labelFor(value) }));
    }

    return options.length ? options : fallback;
}

/** Stored conditions, in any shape, as the editor's `{match, conditions}`. */
export function toConditionState(conditions) {
    if (Array.isArray(conditions)) {
        return { match: 'all', conditions };
    }

    if (conditions === null || typeof conditions !== 'object') {
        return { match: 'all', conditions: [] };
    }

    if (Array.isArray(conditions.all)) {
        return { match: 'all', conditions: conditions.all };
    }

    if (Array.isArray(conditions.any)) {
        return { match: 'any', conditions: conditions.any };
    }

    const match = conditions.match === 'any' ? 'any' : 'all';
    const list = conditions.rules ?? conditions.conditions;

    return { match, conditions: Array.isArray(list) ? list : [] };
}

/** The editor's `{match, conditions}` as the contract's `{all}` or `{any}`. */
export function toWireConditions(state) {
    return { [state?.match === 'any' ? 'any' : 'all']: state?.conditions ?? [] };
}

// The builder's old `{type, config}` kept the one value an action needs under
// one of these keys.
const LEGACY_CONFIG_KEYS = ['status', 'priority', 'tag', 'department', 'agent', 'body', 'url', 'duration', 'macro'];

/** Stored actions as `{type, value}`. */
export function toActionState(actions) {
    if (!Array.isArray(actions)) {
        return [];
    }

    return actions.map((action) => {
        if (Object.prototype.hasOwnProperty.call(action, 'value')) {
            return { type: action.type, value: action.value };
        }

        const config = action.config ?? {};
        const key = LEGACY_CONFIG_KEYS.find((candidate) => config[candidate] !== undefined && config[candidate] !== '');

        return { type: action.type, value: key ? config[key] : '' };
    });
}

/** The create/update request body. */
export function toWirePayload(form) {
    return {
        name: form.name,
        description: form.description ? form.description : null,
        trigger_event: form.trigger_event,
        conditions: toWireConditions(form.conditions),
        actions: (form.actions ?? []).map(({ type, value }) => ({ type, value: value ?? '' })),
        is_active: Boolean(form.is_active),
    };
}
