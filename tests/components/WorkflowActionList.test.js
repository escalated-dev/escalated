import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowActionList from '../../src/components/WorkflowActionList.vue';

function mountList(modelValue = []) {
    return mount(WorkflowActionList, {
        props: { modelValue },
        global: {
            stubs: {
                WorkflowActionConfig: true,
            },
        },
    });
}

describe('WorkflowActionList', () => {
    describe('add actions', () => {
        it('shows Add Action button', () => {
            const wrapper = mountList();
            expect(wrapper.text()).toContain('Add Action');
        });

        it('opens type selector when Add Action is clicked', async () => {
            const wrapper = mountList();
            const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Action'));
            await addBtn.trigger('click');
            // Should show all action types in the dropdown
            expect(wrapper.text()).toContain('Assign Agent');
            expect(wrapper.text()).toContain('Change Status');
            expect(wrapper.text()).toContain('Send Email Notification');
            expect(wrapper.text()).toContain('Delay');
        });

        it('emits action when an action type is selected', async () => {
            const wrapper = mountList();
            // Open selector
            const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Action'));
            await addBtn.trigger('click');
            // Click "Change Status"
            const statusBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Change Status');
            await statusBtn.trigger('click');
            const emitted = wrapper.emitted('update:modelValue');
            expect(emitted).toBeTruthy();
            expect(emitted[0][0]).toHaveLength(1);
            expect(emitted[0][0][0].type).toBe('change_status');
        });
    });

    describe('remove actions', () => {
        it('removes an action when remove button is clicked', async () => {
            const wrapper = mountList([
                { type: 'change_status', config: {} },
                { type: 'add_tag', config: {} },
            ]);
            // Find remove buttons (X icons in action cards)
            const removeButtons = wrapper.findAll('button').filter((b) => {
                return b.classes().some((c) => c.includes('rose') || c.includes('hover:text-rose'));
            });
            // Click the first remove button
            await removeButtons[0].trigger('click');
            const emitted = wrapper.emitted('update:modelValue');
            expect(emitted).toBeTruthy();
            expect(emitted[0][0]).toHaveLength(1);
            expect(emitted[0][0][0].type).toBe('add_tag');
        });
    });

    describe('reorder actions', () => {
        it('renders actions in correct order', () => {
            const wrapper = mountList([
                { type: 'change_status', config: {} },
                { type: 'add_tag', config: {} },
                { type: 'assign_agent', config: {} },
            ]);
            const text = wrapper.text();
            const statusPos = text.indexOf('Change Status');
            const tagPos = text.indexOf('Add Tag');
            const assignPos = text.indexOf('Assign Agent');
            expect(statusPos).toBeLessThan(tagPos);
            expect(tagPos).toBeLessThan(assignPos);
        });
    });

    describe('delay rendering', () => {
        it('renders delay action as a visual wait divider', () => {
            const wrapper = mountList([
                { type: 'change_status', config: {} },
                { type: 'delay', config: { duration: 2, unit: 'hours' } },
                { type: 'add_tag', config: {} },
            ]);
            expect(wrapper.text()).toContain('Wait 2 hours');
        });

        it('renders default delay values when config is empty', () => {
            const wrapper = mountList([{ type: 'delay', config: {} }]);
            expect(wrapper.text()).toContain('Wait 1 hours');
        });
    });

    describe('action display', () => {
        it('shows action type labels', () => {
            const wrapper = mountList([
                { type: 'assign_agent', config: {} },
                { type: 'send_webhook', config: { url: 'https://example.com' } },
            ]);
            expect(wrapper.text()).toContain('Assign Agent');
            expect(wrapper.text()).toContain('Send Webhook');
        });

        it('shows action summary text', () => {
            const wrapper = mountList([{ type: 'change_status', config: { status: 'resolved' } }]);
            expect(wrapper.text()).toContain('resolved');
        });

        it('shows Not configured when no config', () => {
            const wrapper = mountList([{ type: 'change_status', config: {} }]);
            expect(wrapper.text()).toContain('Not configured');
        });
    });
});
