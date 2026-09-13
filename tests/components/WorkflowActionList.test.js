import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowActionList from '../../src/components/WorkflowActionList.vue';

function mountList(modelValue = [], props = {}) {
    return mount(WorkflowActionList, {
        props: { modelValue, ...props },
        global: {
            stubs: {
                WorkflowActionConfig: true,
            },
        },
    });
}

async function openTypeSelector(wrapper) {
    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Add Action'));
    await addBtn.trigger('click');
}

describe('WorkflowActionList', () => {
    describe('add actions', () => {
        it('shows Add Action button', () => {
            expect(mountList().text()).toContain('Add Action');
        });

        it('offers the core action catalog when the backend sends no list', async () => {
            const wrapper = mountList();
            await openTypeSelector(wrapper);

            const text = wrapper.text();
            expect(text).toContain('Assign Agent');
            expect(text).toContain('Change Status');
            expect(text).toContain('Set Department');
            expect(text).toContain('Add Internal Note');
            expect(text).toContain('Insert Canned Reply');
            expect(text).not.toContain('Delay');
            expect(text).not.toContain('Send Webhook');
        });

        it('offers exactly the actions the backend lists', async () => {
            const wrapper = mountList([], { actionTypes: ['add_follower', 'delay'] });
            await openTypeSelector(wrapper);

            expect(wrapper.text()).toContain('Add Follower');
            expect(wrapper.text()).toContain('Delay');
            expect(wrapper.text()).not.toContain('Change Status');
        });

        it('adds the chosen action as {type, value}', async () => {
            const wrapper = mountList();
            await openTypeSelector(wrapper);

            const statusBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Change Status');
            await statusBtn.trigger('click');

            expect(wrapper.emitted('update:modelValue')[0][0]).toEqual([{ type: 'change_status', value: '' }]);
        });
    });

    describe('remove actions', () => {
        it('removes an action when remove button is clicked', async () => {
            const wrapper = mountList([
                { type: 'change_status', value: 'open' },
                { type: 'add_tag', value: 'vip' },
            ]);
            const removeButtons = wrapper.findAll('button').filter((b) => {
                return b.classes().some((c) => c.includes('rose') || c.includes('hover:text-rose'));
            });

            await removeButtons[0].trigger('click');

            expect(wrapper.emitted('update:modelValue')[0][0]).toEqual([{ type: 'add_tag', value: 'vip' }]);
        });
    });

    describe('reorder actions', () => {
        it('renders actions in correct order', () => {
            const text = mountList([
                { type: 'change_status', value: '' },
                { type: 'add_tag', value: '' },
                { type: 'assign_agent', value: '' },
            ]).text();

            expect(text.indexOf('Change Status')).toBeLessThan(text.indexOf('Add Tag'));
            expect(text.indexOf('Add Tag')).toBeLessThan(text.indexOf('Assign Agent'));
        });
    });

    describe('delay rendering', () => {
        it('renders delay as a wait divider, in minutes', () => {
            const wrapper = mountList([
                { type: 'change_status', value: 'open' },
                { type: 'delay', value: 30 },
                { type: 'add_tag', value: 'later' },
            ]);

            expect(wrapper.text()).toContain('Wait 30 minutes');
        });
    });

    describe('action display', () => {
        it('shows the value as the summary', () => {
            expect(mountList([{ type: 'change_status', value: 'resolved' }]).text()).toContain('resolved');
        });

        it('shows Not configured when there is no value', () => {
            expect(mountList([{ type: 'change_status', value: '' }]).text()).toContain('Not configured');
        });

        it('labels an action type it has no metadata for', () => {
            expect(mountList([{ type: 'snooze_ticket', value: '4' }]).text()).toContain('Snooze Ticket');
        });
    });
});
