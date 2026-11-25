import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CustomerIndex from '../../src/pages/Customer/Index.vue';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ url: '/support/tickets', props: { escalated: { prefix: 'support' } } }),
    router: { get: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

function mountIndex() {
    return mount(CustomerIndex, {
        props: { tickets: { data: [], links: [] }, filters: {} },
        global: {
            mocks: { route: (name) => `/${name}` },
            stubs: { EscalatedLayout: { template: '<div><slot /></div>' }, TicketList: true },
        },
    });
}

describe('Customer/Index', () => {
    it("colours the New Ticket button with the host's theme tokens", () => {
        const button = mountIndex().get('[data-testid="esc-new-ticket"]');

        expect(button.classes()).toContain('bg-[var(--esc-primary,#4f46e5)]');
        expect(button.classes()).toContain('hover:bg-[var(--esc-primary-hover,#4338ca)]');
        expect(button.classes()).not.toContain('bg-indigo-600');
    });

    it('labels the status filter', () => {
        const select = mountIndex()
            .findAll('select')
            .find((s) => s.findAll('option').some((o) => o.text() === 'All Statuses'));

        expect(select.attributes('aria-label')).toBe('Filter by status');
    });
});
