import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkflowTriggerSelector from '../../src/components/WorkflowTriggerSelector.vue';

function mountSelector(modelValue = '') {
    return mount(WorkflowTriggerSelector, {
        props: { modelValue },
    });
}

describe('WorkflowTriggerSelector', () => {
    it('renders all trigger options', () => {
        const wrapper = mountSelector();
        expect(wrapper.text()).toContain('Ticket Created');
        expect(wrapper.text()).toContain('Ticket Updated');
        expect(wrapper.text()).toContain('Reply Added');
        expect(wrapper.text()).toContain('Status Changed');
        expect(wrapper.text()).toContain('Ticket Assigned');
        expect(wrapper.text()).toContain('Ticket Escalated');
        expect(wrapper.text()).toContain('SLA Breached');
        expect(wrapper.text()).toContain('SLA Warning');
        expect(wrapper.text()).toContain('Chat Started');
        expect(wrapper.text()).toContain('Chat Ended');
    });

    it('displays descriptions for each trigger', () => {
        const wrapper = mountSelector();
        expect(wrapper.text()).toContain('When a new ticket is submitted');
        expect(wrapper.text()).toContain('When any ticket field is modified');
    });

    it('highlights the selected trigger', () => {
        const wrapper = mountSelector('ticket_created');
        const buttons = wrapper.findAll('button');
        const ticketCreatedBtn = buttons[0];
        expect(ticketCreatedBtn.classes()).toContain('border-blue-500');
    });

    it('emits update:modelValue when a trigger is clicked', async () => {
        const wrapper = mountSelector();
        const buttons = wrapper.findAll('button');
        await buttons[2].trigger('click'); // Reply Added (3rd option)
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['reply_added']);
    });

    it('shows a checkmark on the selected trigger', () => {
        const wrapper = mountSelector('sla_breached');
        // The check SVG should be present within the selected trigger
        const checkmarks = wrapper.findAll('[class*="bg-blue-500"][class*="rounded-full"]');
        expect(checkmarks.length).toBe(1);
    });

    it('does not highlight unselected triggers', () => {
        const wrapper = mountSelector('ticket_created');
        const buttons = wrapper.findAll('button');
        // Second button (Ticket Updated) should not have the selected class
        expect(buttons[1].classes()).not.toContain('border-blue-500');
    });
});
