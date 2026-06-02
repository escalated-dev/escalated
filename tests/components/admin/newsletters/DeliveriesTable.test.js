import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DeliveriesTable from '../../../../src/components/admin/newsletters/DeliveriesTable.vue';

const rows = [
    {
        id: 1,
        contact: { name: 'Maria', email: 'maria@example.com' },
        status: 'sent',
        sent_at: '2026-05-19T12:00:00Z',
        opened_at: '2026-05-19T13:00:00Z',
        last_clicked_at: null,
        bounce_reason: null,
    },
    {
        id: 2,
        contact: { name: null, email: 'x@example.com' },
        status: 'bounced',
        sent_at: '2026-05-19T12:00:00Z',
        opened_at: null,
        last_clicked_at: null,
        bounce_reason: '550 mailbox not found',
    },
];

describe('DeliveriesTable', () => {
    it('renders all delivery rows', () => {
        const wrapper = mount(DeliveriesTable, { props: { rows } });
        expect(wrapper.text()).toContain('maria@example.com');
        expect(wrapper.text()).toContain('x@example.com');
        expect(wrapper.text()).toContain('550 mailbox not found');
    });

    it('emits filter on status filter change', async () => {
        const wrapper = mount(DeliveriesTable, { props: { rows } });
        await wrapper.find('select.deliveries-table__filter').setValue('bounced');
        expect(wrapper.emitted('filter')[0]).toEqual(['bounced']);
    });

    it('emits export on export button click', async () => {
        const wrapper = mount(DeliveriesTable, { props: { rows } });
        await wrapper.find('button.deliveries-table__export').trigger('click');
        expect(wrapper.emitted('export')).toHaveLength(1);
    });
});
