import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BulkActionBar from '../../src/components/BulkActionBar.vue';

const post = vi.fn();
vi.mock('@inertiajs/vue3', () => ({ router: { post: (...a) => post(...a) } }));

let wrapper;
const mountBar = (props = {}) =>
    (wrapper = mount(BulkActionBar, { props: { selectedIds: [1, 2], bulkRoute: '/bulk', ...props } }));

beforeEach(() => {
    post.mockReset();
    window.confirm = window.confirm || (() => true);
});
afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
});

const deleteButton = () => wrapper.findAll('button').find((b) => b.text() === 'Delete');

describe('BulkActionBar', () => {
    it('asks before deleting and does nothing when the agent cancels', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        mountBar();
        await deleteButton().trigger('click');
        expect(confirm).toHaveBeenCalledWith('Delete 2 tickets? This cannot be undone.');
        expect(post).not.toHaveBeenCalled();
    });

    it('deletes once confirmed', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        mountBar();
        await deleteButton().trigger('click');
        expect(post).toHaveBeenCalledWith('/bulk', { ticket_ids: [1, 2], action: 'delete', value: null }, expect.any(Object));
    });

    it('stays fixed to the viewport by default and sits inside its container when contained', () => {
        mountBar();
        expect(wrapper.get('[data-testid="esc-bulk-bar"]').classes()).toContain('fixed');
        wrapper.unmount();
        mountBar({ contained: true });
        const bar = wrapper.get('[data-testid="esc-bulk-bar"]');
        expect(bar.classes()).toContain('absolute');
        expect(bar.classes()).not.toContain('fixed');
    });

    it('has no blurred backdrop', () => {
        mountBar();
        expect(wrapper.html()).not.toContain('backdrop-blur');
    });

    it('counts the selection through the translations', () => {
        mountBar({ selectedIds: [1] });
        expect(wrapper.text()).toContain('1 ticket(s) selected');
    });
});
