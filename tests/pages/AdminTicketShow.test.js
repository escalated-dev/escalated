import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TicketShow from '../../src/pages/Admin/Tickets/Show.vue';
import { ticketPageTitle } from '../../src/utils/ticketTitle';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ url: '/support/admin/tickets/ESC-7', props: { escalated: { prefix: 'support' } } }),
    router: { post: vi.fn() },
    useForm: (data) => ({ ...data, post: vi.fn(), processing: false, errors: {} }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    Head: { name: 'InertiaHead', props: ['title'], render: () => null },
}));

const ticket = {
    id: 7,
    reference: 'ESC-7',
    subject: 'Refund not received',
    status: 'open',
    priority: 'high',
    requester: { name: 'Sam' },
    replies: [],
    activities: [],
    tags: [],
};

describe('Admin/Tickets/Show', () => {
    it('titles the page with the reference and subject', () => {
        const wrapper = shallowMount(TicketShow, {
            props: { ticket, departments: [], tags: [], cannedResponses: [], agents: [] },
            global: { mocks: { route: () => '/x' }, stubs: { EscalatedLayout: { template: '<div><slot /></div>' } } },
        });

        expect(wrapper.findComponent({ name: 'InertiaHead' }).props('title')).toBe('#ESC-7 Refund not received');
    });
});

describe('Admin/Tickets/Show sidebar', () => {
    it('passes its agents to the sidebar so an assignee id can be named', async () => {
        const { default: TicketSidebar } = await import('../../src/components/TicketSidebar.vue');
        const agents = [{ id: 4, name: 'Dana Agent' }];
        const wrapper = shallowMount(TicketShow, {
            props: { ticket: { ...ticket, assigned_to: 4 }, departments: [], tags: [], cannedResponses: [], agents },
            global: { mocks: { route: () => '/x' }, stubs: { EscalatedLayout: { template: '<div><slot /></div>' } } },
        });

        expect(wrapper.findComponent(TicketSidebar).props('agents')).toEqual(agents);
    });
});

describe('ticketPageTitle', () => {
    it('joins the reference and subject without doubling a leading #', () => {
        expect(ticketPageTitle({ reference: 'ESC-1', subject: 'Hi' })).toBe('#ESC-1 Hi');
        expect(ticketPageTitle({ reference: '#42', subject: 'Hi' })).toBe('#42 Hi');
        expect(ticketPageTitle({ subject: 'Hi' })).toBe('Hi');
        expect(ticketPageTitle(null)).toBe('');
    });
});
