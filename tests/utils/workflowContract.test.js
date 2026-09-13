import { describe, it, expect } from 'vitest';
import {
    CORE_ACTION_TYPES,
    DEFAULT_OPERATORS,
    DEFAULT_TRIGGER_EVENTS,
    humanize,
    normalizeOptions,
    toActionState,
    toConditionState,
    toWireConditions,
    toWirePayload,
} from '../../src/utils/workflowContract.js';

/**
 * The wire format for the Workflows admin screen, as fixed in
 * escalated-developer-context/domain-model/workflow-admin-contract.md.
 *
 * The builder used to post `trigger: 'ticket_created'`, conditions as
 * `{match, conditions}` and actions as `{type, config}`. No backend reads any of
 * those, so a workflow built in the UI either failed validation or saved and
 * never matched an event.
 */
describe('workflow contract', () => {
    describe('defaults', () => {
        it('offers the five canonical triggers, dotted', () => {
            expect(DEFAULT_TRIGGER_EVENTS.map((t) => t.value)).toEqual([
                'ticket.created',
                'ticket.updated',
                'ticket.assigned',
                'ticket.status_changed',
                'reply.created',
            ]);
        });

        it('offers the core action catalog', () => {
            expect(CORE_ACTION_TYPES.map((a) => a.value)).toEqual([
                'change_status',
                'change_priority',
                'add_tag',
                'remove_tag',
                'set_department',
                'assign_agent',
                'add_note',
                'insert_canned_reply',
            ]);
        });

        it('offers the twelve canonical operators', () => {
            expect(DEFAULT_OPERATORS).toEqual([
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
            ]);
        });
    });

    describe('normalizeOptions', () => {
        const fallback = [{ value: 'ticket.created', label: 'Ticket Created' }];

        it('falls back when the backend sends nothing', () => {
            expect(normalizeOptions(null, fallback)).toEqual(fallback);
            expect(normalizeOptions(undefined, fallback)).toEqual(fallback);
            expect(normalizeOptions([], fallback)).toEqual(fallback);
            expect(normalizeOptions({}, fallback)).toEqual(fallback);
        });

        it('accepts a list of {value, label}', () => {
            expect(normalizeOptions([{ value: 'sla.breached', label: 'SLA breached' }], fallback)).toEqual([
                { value: 'sla.breached', label: 'SLA breached' },
            ]);
        });

        it('accepts a list of plain values, labelling them', () => {
            expect(normalizeOptions(['ticket.created', 'ticket.replied'], fallback)).toEqual([
                { value: 'ticket.created', label: 'Ticket Created' },
                { value: 'ticket.replied', label: 'Ticket Replied' },
            ]);
        });

        it('accepts a value -> label map', () => {
            expect(normalizeOptions({ 'chat.started': 'Chat Started' }, fallback)).toEqual([
                { value: 'chat.started', label: 'Chat Started' },
            ]);
        });
    });

    it('humanizes dotted and underscored names', () => {
        expect(humanize('ticket.status_changed')).toBe('Ticket Status Changed');
        expect(humanize('snooze_ticket')).toBe('Snooze Ticket');
    });

    describe('conditions', () => {
        const rule = { field: 'priority', operator: 'equals', value: 'high' };

        it('reads every stored shape into the editor state', () => {
            expect(toConditionState(null)).toEqual({ match: 'all', conditions: [] });
            expect(toConditionState({ all: [rule] })).toEqual({ match: 'all', conditions: [rule] });
            expect(toConditionState({ any: [rule] })).toEqual({ match: 'any', conditions: [rule] });
            expect(toConditionState([rule])).toEqual({ match: 'all', conditions: [rule] });
            // Laravel's stored shape, and the builder's own old one.
            expect(toConditionState({ match: 'any', rules: [rule] })).toEqual({ match: 'any', conditions: [rule] });
            expect(toConditionState({ match: 'all', conditions: [rule] })).toEqual({
                match: 'all',
                conditions: [rule],
            });
        });

        it('writes {all} or {any}', () => {
            expect(toWireConditions({ match: 'all', conditions: [rule] })).toEqual({ all: [rule] });
            expect(toWireConditions({ match: 'any', conditions: [rule] })).toEqual({ any: [rule] });
            expect(toWireConditions({ match: 'all', conditions: [] })).toEqual({ all: [] });
        });
    });

    describe('actions', () => {
        it('keeps {type, value}', () => {
            expect(toActionState([{ type: 'add_tag', value: 'vip' }])).toEqual([{ type: 'add_tag', value: 'vip' }]);
        });

        it("reads the builder's old {type, config} into a value", () => {
            expect(
                toActionState([
                    { type: 'change_status', config: { status: 'open' } },
                    { type: 'add_note', config: { body: 'Hi' } },
                    { type: 'close_ticket', config: {} },
                ]),
            ).toEqual([
                { type: 'change_status', value: 'open' },
                { type: 'add_note', value: 'Hi' },
                { type: 'close_ticket', value: '' },
            ]);
        });

        it('keeps a structured value a backend stored', () => {
            const stored = [{ type: 'assign_agent', value: { agent_id: 5, strategy: 'round_robin' } }];

            expect(toActionState(stored)).toEqual(stored);
        });
    });

    it('builds the create/update body the contract specifies', () => {
        const body = toWirePayload({
            name: 'Route refunds',
            description: '',
            trigger_event: 'ticket.created',
            conditions: { match: 'all', conditions: [{ field: 'subject', operator: 'contains', value: 'refund' }] },
            actions: [{ type: 'change_priority', value: 'high' }],
            is_active: true,
        });

        expect(body).toEqual({
            name: 'Route refunds',
            description: null,
            trigger_event: 'ticket.created',
            conditions: { all: [{ field: 'subject', operator: 'contains', value: 'refund' }] },
            actions: [{ type: 'change_priority', value: 'high' }],
            is_active: true,
        });
    });
});
