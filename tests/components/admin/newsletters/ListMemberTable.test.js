import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ListMemberTable from '../../../../src/components/admin/newsletters/ListMemberTable.vue';

const members = [
    { id: 1, contact: { id: 10, name: 'A', email: 'a@example.com' }, added_at: '2026-05-19T00:00:00Z' },
    { id: 2, contact: { id: 11, name: 'B', email: 'b@example.com' }, added_at: '2026-05-19T00:00:00Z' },
];

describe('ListMemberTable', () => {
    it('renders all members', () => {
        const wrapper = mount(ListMemberTable, { props: { members } });
        expect(wrapper.text()).toContain('a@example.com');
        expect(wrapper.text()).toContain('b@example.com');
    });

    it('emits remove with contact id on Remove click', async () => {
        const wrapper = mount(ListMemberTable, { props: { members } });
        await wrapper.find('[data-action="remove"][data-contact-id="10"]').trigger('click');
        expect(wrapper.emitted('remove')[0]).toEqual([10]);
    });
});
