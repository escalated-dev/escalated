import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowConditionBuilder from '../../src/components/WorkflowConditionBuilder.vue';

function mountBuilder(modelValue = { match: 'all', conditions: [] }, props = {}) {
    return mount(WorkflowConditionBuilder, {
        props: { modelValue, ...props },
    });
}

function operatorValues(wrapper) {
    // The second select in a condition row is the operator.
    return wrapper
        .findAll('select')[1]
        .findAll('option')
        .map((o) => o.element.value);
}

describe('WorkflowConditionBuilder', () => {
    describe('AND/OR toggle', () => {
        it('defaults to "all" (AND) match type', () => {
            const andButton = mountBuilder()
                .findAll('button')
                .find((b) => b.text().includes('All conditions'));
            expect(andButton.classes()).toContain('text-amber-400');
        });

        it('toggles between AND and OR on click', async () => {
            const wrapper = mountBuilder();
            const orButton = wrapper.findAll('button').find((b) => b.text().includes('Any condition'));
            await orButton.trigger('click');
            expect(wrapper.emitted('update:modelValue')[0][0].match).toBe('any');
        });

        it('toggles back to AND when clicking the AND button while on OR', async () => {
            const wrapper = mountBuilder({ match: 'any', conditions: [] });
            const andButton = wrapper.findAll('button').find((b) => b.text().includes('All conditions'));
            await andButton.trigger('click');
            expect(wrapper.emitted('update:modelValue')[0][0].match).toBe('all');
        });
    });

    describe('add/remove conditions', () => {
        it('shows Add Condition button', () => {
            expect(mountBuilder().text()).toContain('Add Condition');
        });

        it('adds a condition when Add Condition is clicked', async () => {
            const wrapper = mountBuilder();
            const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Condition'));
            await addBtn.trigger('click');
            const emitted = wrapper.emitted('update:modelValue')[0][0];
            expect(emitted.conditions).toEqual([{ field: 'status', operator: 'equals', value: '' }]);
        });

        it('removes a condition when remove button is clicked', async () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [
                    { field: 'status', operator: 'equals', value: 'open' },
                    { field: 'priority', operator: 'equals', value: 'high' },
                ],
            });
            const removeButtons = wrapper.findAll('button').filter((b) => {
                const svg = b.find('svg');
                return svg.exists() && b.classes().some((c) => c.includes('rose'));
            });
            await removeButtons[0].trigger('click');
            const emitted = wrapper.emitted('update:modelValue')[0][0];
            expect(emitted.conditions).toHaveLength(1);
            expect(emitted.conditions[0].field).toBe('priority');
        });
    });

    describe('fields', () => {
        it('offers the canonical field names', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'status', operator: 'equals', value: '' }],
            });
            const fieldValues = wrapper
                .findAll('select')[0]
                .findAll('option')
                .map((o) => o.element.value);

            expect(fieldValues).toEqual(
                expect.arrayContaining(['ticket_type', 'department_id', 'assigned_to', 'description', 'tags']),
            );
            expect(fieldValues).not.toContain('type');
            expect(fieldValues).not.toContain('assigned_agent');
        });
    });

    describe('field-specific operators', () => {
        it('shows equality operators for status, and nothing no backend reads', () => {
            const values = operatorValues(
                mountBuilder({ match: 'all', conditions: [{ field: 'status', operator: 'equals', value: '' }] }),
            );
            expect(values).toContain('equals');
            expect(values).toContain('not_equals');
            expect(values).not.toContain('in');
        });

        it('shows number operators for hours_since_created field', () => {
            const values = operatorValues(
                mountBuilder({
                    match: 'all',
                    conditions: [{ field: 'hours_since_created', operator: 'equals', value: '' }],
                }),
            );
            expect(values).toContain('greater_than');
            expect(values).toContain('greater_or_equal');
            expect(values).not.toContain('contains');
        });

        it('shows text operators for subject field', () => {
            const values = operatorValues(
                mountBuilder({ match: 'all', conditions: [{ field: 'subject', operator: 'equals', value: '' }] }),
            );
            expect(values).toContain('contains');
            expect(values).toContain('starts_with');
            expect(values).toContain('is_empty');
            expect(values).not.toContain('matches');
        });

        it('offers only the operators the backend lists', () => {
            const values = operatorValues(
                mountBuilder(
                    { match: 'all', conditions: [{ field: 'subject', operator: 'equals', value: '' }] },
                    { operators: ['equals', 'contains'] },
                ),
            );
            expect(values).toEqual(['equals', 'contains']);
        });

        it('hides the value input for is_not_empty', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'subject', operator: 'is_not_empty', value: '' }],
            });
            expect(wrapper.find('input[type="text"]').exists()).toBe(false);
        });
    });

    describe('preview', () => {
        it('shows a preview when conditions exist', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'status', operator: 'equals', value: 'open' }],
            });
            expect(wrapper.text()).toContain('Preview');
            expect(wrapper.text()).toContain('Status equals open');
        });

        it('does not show preview when no conditions', () => {
            expect(mountBuilder().text()).not.toContain('Preview');
        });
    });
});
