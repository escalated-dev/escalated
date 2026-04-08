import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import SavedViewSidebar from '../../src/components/SavedViewSidebar.vue';

vi.mock('@inertiajs/vue3', () => ({
    router: { get: vi.fn(), reload: vi.fn() },
}));

vi.stubGlobal(
    'route',
    vi.fn((...args) => `/mocked/${args.join('/')}`),
);

const sampleViews = [
    { id: 1, name: 'Open Bugs', color: '#f00', is_shared: false, filters: { status: 'open' } },
    { id: 2, name: 'My Tickets', color: null, is_shared: true, filters: { assignee: 'me' } },
    { id: 3, name: 'Urgent', color: '#ff0', is_shared: false, filters: { priority: 'urgent' } },
];

function mountSidebar(props = {}, dark = false) {
    return mount(SavedViewSidebar, {
        props: {
            savedViews: sampleViews,
            currentFilters: {},
            route: '/tickets',
            ...props,
        },
        global: {
            provide: { 'esc-dark': computed(() => dark) },
        },
    });
}

describe('SavedViewSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ----------------------------------------------------------------
    // Renders list of saved views
    // ----------------------------------------------------------------
    describe('rendering', () => {
        it('renders "All Tickets" default entry', () => {
            const wrapper = mountSidebar();
            expect(wrapper.text()).toContain('All Tickets');
        });

        it('renders all saved view names', () => {
            const wrapper = mountSidebar();
            expect(wrapper.text()).toContain('Open Bugs');
            expect(wrapper.text()).toContain('My Tickets');
            expect(wrapper.text()).toContain('Urgent');
        });

        it('shows "shared" badge for shared views', () => {
            const wrapper = mountSidebar();
            expect(wrapper.text()).toContain('shared');
        });

        it('renders color dots for views with a color', () => {
            const wrapper = mountSidebar();
            const dots = wrapper.findAll('span[style]');
            const redDot = dots.find((s) => s.attributes('style')?.includes('#f00'));
            expect(redDot).toBeDefined();
        });

        it('renders empty state when no views', () => {
            const wrapper = mountSidebar({ savedViews: [] });
            // Should still render "All Tickets"
            expect(wrapper.text()).toContain('All Tickets');
            // But no view names
            expect(wrapper.text()).not.toContain('Open Bugs');
        });
    });

    // ----------------------------------------------------------------
    // Active view highlighting
    // ----------------------------------------------------------------
    describe('active view highlighting', () => {
        it('"All Tickets" is active by default', () => {
            const wrapper = mountSidebar();
            // The active item gets bg-blue-50 class (light mode) on the clickable div
            const clickableDivs = wrapper.findAll('[class*="cursor-pointer"]');
            const allTicketsDiv = clickableDivs.find((d) => d.text().includes('All Tickets'));
            expect(allTicketsDiv.classes()).toContain('bg-blue-50');
        });

        it('clicking a view highlights it', async () => {
            const wrapper = mountSidebar();
            // Find the clickable div for "Open Bugs"
            const viewDivs = wrapper.findAll('[class*="cursor-pointer"]');
            const openBugsDiv = viewDivs.find((d) => d.text().includes('Open Bugs'));
            await openBugsDiv.trigger('click');

            // After clicking, "Open Bugs" should be active
            expect(openBugsDiv.classes()).toContain('bg-blue-50');
        });

        it('emits apply-view with filters when clicking a view', async () => {
            const wrapper = mountSidebar();
            const viewDivs = wrapper.findAll('[class*="cursor-pointer"]');
            const openBugsDiv = viewDivs.find((d) => d.text().includes('Open Bugs'));
            await openBugsDiv.trigger('click');

            expect(wrapper.emitted('apply-view')).toHaveLength(1);
            expect(wrapper.emitted('apply-view')[0][0]).toEqual({ status: 'open' });
        });

        it('emits apply-view with empty filters when clicking "All Tickets"', async () => {
            const wrapper = mountSidebar();
            // First click a view to move off "All Tickets"
            const viewDivs = wrapper.findAll('[class*="cursor-pointer"]');
            const openBugsDiv = viewDivs.find((d) => d.text().includes('Open Bugs'));
            await openBugsDiv.trigger('click');

            // Now click "All Tickets"
            const allTicketsDiv = viewDivs.find((d) => d.text().includes('All Tickets'));
            await allTicketsDiv.trigger('click');

            const emitted = wrapper.emitted('apply-view');
            expect(emitted[emitted.length - 1][0]).toEqual({});
        });
    });

    // ----------------------------------------------------------------
    // Delete confirmation
    // ----------------------------------------------------------------
    describe('delete confirmation', () => {
        it('shows delete button in kebab menu', async () => {
            const wrapper = mountSidebar();
            // Click the options button for a view
            const optionsBtns = wrapper.findAll('button[aria-label="View options"]');
            await optionsBtns[0].trigger('click');

            expect(wrapper.text()).toContain('Delete');
            expect(wrapper.text()).toContain('Rename');
            expect(wrapper.text()).toContain('Save current filters');
        });

        it('calls confirm dialog on delete', async () => {
            const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
            vi.stubGlobal('fetch', vi.fn());

            const wrapper = mountSidebar();
            const optionsBtns = wrapper.findAll('button[aria-label="View options"]');
            await optionsBtns[0].trigger('click');

            const deleteBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Delete');
            await deleteBtn.trigger('click');

            expect(confirmSpy).toHaveBeenCalledWith('Delete view "Open Bugs"?');
            confirmSpy.mockRestore();
        });

        it('does not call fetch when confirm is cancelled', async () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            const fetchSpy = vi.fn();
            vi.stubGlobal('fetch', fetchSpy);

            const wrapper = mountSidebar();
            const optionsBtns = wrapper.findAll('button[aria-label="View options"]');
            await optionsBtns[0].trigger('click');

            const deleteBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Delete');
            await deleteBtn.trigger('click');

            expect(fetchSpy).not.toHaveBeenCalled();
            vi.restoreAllMocks();
        });
    });
});
