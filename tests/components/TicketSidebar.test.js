import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TicketSidebar from '../../src/components/TicketSidebar.vue';

const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();

function ticket(overrides = {}) {
    return {
        reference: 'ESC-1',
        status: 'open',
        priority: 'medium',
        created_at: hoursFromNow(-48),
        assigned_to: null,
        assignee: null,
        ...overrides,
    };
}

const mountSidebar = (props) => mount(TicketSidebar, { props, global: { stubs: { TicketTypeSelector: true } } });

describe('TicketSidebar assignee', () => {
    it('shows the assignee read-only to someone who cannot edit', () => {
        const wrapper = mountSidebar({ ticket: ticket({ assigned_to: 4, assignee: { id: 4, name: 'Dana Agent' } }) });
        expect(wrapper.get('[data-testid="esc-sidebar-assignee"]').text()).toContain('Dana Agent');
        expect(wrapper.find('select[aria-label="Assign to agent"]').exists()).toBe(false);
    });

    it('says Unassigned when nobody has the ticket', () => {
        const wrapper = mountSidebar({ ticket: ticket() });
        expect(wrapper.get('[data-testid="esc-sidebar-assignee"]').text()).toContain('Unassigned');
    });

    it('reads the name from an object-shaped assigned_to', () => {
        // Django sends `assigned_to: { id, name, email }` and no `assignee`.
        const wrapper = mountSidebar({
            ticket: ticket({ assigned_to: { id: 4, name: 'Dana Agent', email: 'd@x.test' } }),
        });
        expect(wrapper.get('[data-testid="esc-sidebar-assignee"]').text()).toContain('Dana Agent');
    });

    it('hides the row rather than say Unassigned when the assignee cannot be named', () => {
        // Adonis' admin page sends only the id and no agents to look it up in.
        const wrapper = mountSidebar({ ticket: ticket({ assigned_to: 4 }) });
        expect(wrapper.find('[data-testid="esc-sidebar-assignee"]').exists()).toBe(false);
        expect(wrapper.text()).not.toContain('Unassigned');
    });

    it('finds the name in the agent list when only the id is sent', () => {
        const wrapper = mountSidebar({ ticket: ticket({ assigned_to: 4 }), agents: [{ id: 4, name: 'Dana Agent' }] });
        expect(wrapper.get('[data-testid="esc-sidebar-assignee"]').text()).toContain('Dana Agent');
    });

    it('shows the select instead to someone who can edit', () => {
        const wrapper = mountSidebar({
            ticket: ticket({ assigned_to: 4 }),
            agents: [{ id: 4, name: 'Dana Agent' }],
            editable: true,
        });
        expect(wrapper.find('select[aria-label="Assign to agent"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-sidebar-assignee"]').exists()).toBe(false);
    });
});

describe('TicketSidebar SLA cards', () => {
    it('stops the first-response clock at the first response', () => {
        const wrapper = mountSidebar({
            ticket: ticket({ first_response_due_at: hoursFromNow(2), first_response_at: hoursFromNow(-1) }),
        });
        expect(wrapper.get('[role="timer"]').text()).toContain('Met');
    });

    it('runs the resolution clock again on a reopened ticket with old timestamps', () => {
        const wrapper = mountSidebar({
            ticket: ticket({
                status: 'open',
                resolution_due_at: hoursFromNow(5),
                resolved_at: hoursFromNow(-3),
                closed_at: hoursFromNow(-2),
            }),
        });
        const timer = wrapper.get('[role="timer"]');
        expect(timer.text()).toMatch(/\dh \d+m/);
        expect(timer.attributes('data-sla-outcome')).toBeUndefined();
    });

    it('stops the resolution clock at closed_at', () => {
        const wrapper = mountSidebar({
            ticket: ticket({ status: 'closed', resolution_due_at: hoursFromNow(-5), closed_at: hoursFromNow(-2) }),
        });
        expect(wrapper.get('[role="timer"]').text()).toContain('Missed');
    });

    it('keeps counting down while the ticket is open', () => {
        const wrapper = mountSidebar({ ticket: ticket({ resolution_due_at: hoursFromNow(5) }) });
        expect(wrapper.get('[role="timer"]').text()).toMatch(/\dh \d+m/);
    });
});
