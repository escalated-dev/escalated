import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Index from '../../src/pages/Admin/Workflows/Index.vue';

/**
 * The workflows list, against workflow-admin-contract.md: workflows arrive with
 * `trigger_event` and `is_active`, toggling is a POST to the toggle route, and
 * reordering posts `workflow_ids`.
 *
 * It used to read `workflow.active`, which no backend sends, so every workflow
 * showed as disabled; toggle with a PUT to a POST route; and reorder with `ids`.
 */
const router = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), delete: vi.fn() }));

vi.mock('@inertiajs/vue3', () => ({
    router,
    Link: { name: 'Link', props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

const route = vi.fn((name, id) => (id === undefined ? `/${name}` : `/${name}/${id}`));
vi.stubGlobal('route', route);

const workflows = [
    { id: 1, name: 'Route refunds', trigger_event: 'ticket.created', is_active: true },
    { id: 2, name: 'Tag replies', trigger: 'reply.created', is_active: false },
];

function mountIndex() {
    return mount(Index, {
        props: { workflows },
        global: {
            mocks: { route },
            stubs: { EscalatedLayout: { template: '<div><slot /></div>', props: ['title'] } },
        },
    });
}

function toggleIn(row) {
    return row.findAll('button')[0];
}

describe('Admin/Workflows/Index', () => {
    beforeEach(() => {
        router.post.mockClear();
        router.put.mockClear();
    });

    it('shows each workflow enabled or disabled from is_active', () => {
        const rows = mountIndex().findAll('tbody tr');

        expect(toggleIn(rows[0]).classes()).toContain('bg-emerald-500');
        expect(toggleIn(rows[1]).classes()).not.toContain('bg-emerald-500');
    });

    it('labels the trigger from trigger_event, or the trigger alias', () => {
        const rows = mountIndex().findAll('tbody tr');

        expect(rows[0].text()).toContain('Ticket Created');
        expect(rows[1].text()).toContain('Reply Created');
    });

    it('toggles with a POST to the toggle route', async () => {
        const rows = mountIndex().findAll('tbody tr');

        await toggleIn(rows[0]).trigger('click');

        expect(router.post).toHaveBeenCalledWith('/escalated.admin.workflows.toggle/1');
        expect(router.put).not.toHaveBeenCalled();
    });

    it('reorders by posting workflow_ids in the new order', async () => {
        const rows = mountIndex().findAll('tbody tr');

        await rows[0].trigger('dragstart');
        await rows[1].trigger('drop');

        expect(router.post).toHaveBeenCalledWith('/escalated.admin.workflows.reorder', { workflow_ids: [2, 1] });
    });
});
