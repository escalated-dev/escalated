import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowConditionBuilder from '../../src/components/WorkflowConditionBuilder.vue';

function mountBuilder(modelValue = { match: 'all', conditions: [] }) {
    return mount(WorkflowConditionBuilder, {
        props: { modelValue },
    });
}

describe('WorkflowConditionBuilder', () => {
    describe('AND/OR toggle', () => {
        it('defaults to "all" (AND) match type', () => {
            const wrapper = mountBuilder();
            const buttons = wrapper.findAll('button');
            const andButton = buttons.find((b) => b.text().includes('All conditions'));
            expect(andButton.classes()).toContain('text-amber-400');
        });

        it('toggles between AND and OR on click', async () => {
            const wrapper = mountBuilder();
            // Click the OR button
            const orButton = wrapper.findAll('button').find((b) => b.text().includes('Any condition'));
            await orButton.trigger('click');
            expect(wrapper.emitted('update:modelValue')).toBeTruthy();
            const emitted = wrapper.emitted('update:modelValue')[0][0];
            expect(emitted.match).toBe('any');
        });

        it('toggles back to AND when clicking the AND button while on OR', async () => {
            const wrapper = mountBuilder({ match: 'any', conditions: [] });
            const andButton = wrapper.findAll('button').find((b) => b.text().includes('All conditions'));
            await andButton.trigger('click');
            const emitted = wrapper.emitted('update:modelValue')[0][0];
            expect(emitted.match).toBe('all');
        });
    });

    describe('add/remove conditions', () => {
        it('shows Add Condition button', () => {
            const wrapper = mountBuilder();
            expect(wrapper.text()).toContain('Add Condition');
        });

        it('adds a condition when Add Condition is clicked', async () => {
            const wrapper = mountBuilder();
            const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Condition'));
            await addBtn.trigger('click');
            const emitted = wrapper.emitted('update:modelValue')[0][0];
            expect(emitted.conditions).toHaveLength(1);
            expect(emitted.conditions[0]).toEqual({ field: 'status', operator: 'equals', value: '' });
        });

        it('removes a condition when remove button is clicked', async () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [
                    { field: 'status', operator: 'equals', value: 'open' },
                    { field: 'priority', operator: 'equals', value: 'high' },
                ],
            });
            // Find the first remove button (X icon)
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

    describe('field-specific operators', () => {
        it('shows enum operators for status field', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'status', operator: 'equals', value: '' }],
            });
            const operatorSelect = wrapper.findAll('select')[1]; // second select is operator
            const options = operatorSelect.findAll('option');
            const optionValues = options.map((o) => o.element.value);
            expect(optionValues).toContain('equals');
            expect(optionValues).toContain('not_equals');
            expect(optionValues).toContain('in');
        });

        it('shows number operators for hours_since_created field', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'hours_since_created', operator: 'equals', value: '' }],
            });
            const operatorSelect = wrapper.findAll('select')[1];
            const options = operatorSelect.findAll('option');
            const optionValues = options.map((o) => o.element.value);
            expect(optionValues).toContain('greater_than');
            expect(optionValues).toContain('less_than');
            expect(optionValues).not.toContain('contains');
        });

        it('shows text operators for subject field', () => {
            const wrapper = mountBuilder({
                match: 'all',
                conditions: [{ field: 'subject', operator: 'equals', value: '' }],
            });
            const operatorSelect = wrapper.findAll('select')[1];
            const options = operatorSelect.findAll('option');
            const optionValues = options.map((o) => o.element.value);
            expect(optionValues).toContain('contains');
            expect(optionValues).toContain('is_empty');
            expect(optionValues).toContain('matches');
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
            const wrapper = mountBuilder();
            expect(wrapper.text()).not.toContain('Preview');
        });
    });
});
