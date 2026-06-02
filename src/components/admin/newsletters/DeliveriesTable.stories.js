import DeliveriesTable from './DeliveriesTable.vue';

export default { title: 'Admin/Newsletters/DeliveriesTable', component: DeliveriesTable };

export const Default = {
    args: {
        rows: [
            {
                id: 1,
                contact: { name: 'Maria', email: 'maria@example.com' },
                status: 'sent',
                sent_at: '2026-05-19T12:00:00Z',
                opened_at: '2026-05-19T13:00:00Z',
                last_clicked_at: '2026-05-19T13:05:00Z',
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
        ],
    },
};
