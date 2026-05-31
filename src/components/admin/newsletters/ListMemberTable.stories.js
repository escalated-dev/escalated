import ListMemberTable from './ListMemberTable.vue';

export default { title: 'Admin/Newsletters/ListMemberTable', component: ListMemberTable };

export const Default = {
    args: {
        members: [
            { id: 1, contact: { id: 10, name: 'Maria', email: 'maria@example.com' }, added_at: '2026-05-10T00:00:00Z' },
            { id: 2, contact: { id: 11, name: null, email: 'noname@example.com' }, added_at: '2026-05-12T00:00:00Z' },
        ],
    },
};
