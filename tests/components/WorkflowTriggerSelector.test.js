import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowTriggerSelector from '../../src/components/WorkflowTriggerSelector.vue';

function mountSelector(props = {}) {
    return mount(WorkflowTriggerSelector, {
        props: { modelValue: '', ...props },
    });
}

describe('WorkflowTriggerSelector', () => {
    it('offers the five canonical triggers when the backend sends none', () => {
        const text = mountSelector().text();

        expect(text).toContain('Ticket Created');
        expect(text).toContain('Ticket Updated');
        expect(text).toContain('Ticket Assigned');
        expect(text).toContain('Status Changed');
        expect(text).toContain('Reply Added');
        expect(mountSelector().findAll('button')).toHaveLength(5);
    });

    it('emits the dotted event name the backends match on', async () => {
        const wrapper = mountSelector();

        await wrapper.findAll('button')[0].trigger('click');

        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['ticket.created']);
    });

    it('offers exactly the triggers the backend lists', () => {
        const wrapper = mountSelector({ options: ['ticket.replied', 'sla.breached'] });

        expect(wrapper.findAll('button')).toHaveLength(2);
        expect(wrapper.text()).toContain('Ticket Replied');
        expect(wrapper.text()).toContain('SLA Breached');
    });

    it('uses the labels a backend sends as a value -> label map', () => {
        const wrapper = mountSelector({ options: { 'chat.started': 'When chat opens' } });

        expect(wrapper.text()).toContain('When chat opens');
    });

    it('displays descriptions for known triggers', () => {
        const text = mountSelector().text();

        expect(text).toContain('When a new ticket is submitted');
        expect(text).toContain('When any ticket field is modified');
    });

    it('highlights the selected trigger and no other', () => {
        const buttons = mountSelector({ modelValue: 'ticket.created' }).findAll('button');

        expect(buttons[0].classes()).toContain('border-blue-500');
        expect(buttons[1].classes()).not.toContain('border-blue-500');
    });

    it('shows a checkmark on the selected trigger', () => {
        const wrapper = mountSelector({ modelValue: 'reply.created' });

        expect(wrapper.findAll('[class*="bg-blue-500"][class*="rounded-full"]')).toHaveLength(1);
    });
});
