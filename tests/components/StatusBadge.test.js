import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import StatusBadge from '../../src/components/StatusBadge.vue';

/**
 * Helper to mount StatusBadge with a given status and dark mode setting.
 */
function mountBadge(status, dark = false) {
    return mount(StatusBadge, {
        props: { status },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('StatusBadge', () => {
    // ----------------------------------------------------------------
    // Light mode — labels
    // ----------------------------------------------------------------
    describe('light mode labels', () => {
        const statuses = [
            ['open', 'Open'],
            ['in_progress', 'In Progress'],
            ['waiting_on_customer', 'Waiting on Customer'],
            ['waiting_on_agent', 'Waiting on Agent'],
            ['escalated', 'Escalated'],
            ['resolved', 'Resolved'],
            ['closed', 'Closed'],
            ['reopened', 'Reopened'],
        ];

        it.each(statuses)('renders label "%s" as "%s"', (status, expectedLabel) => {
            const wrapper = mountBadge(status);
            expect(wrapper.text()).toBe(expectedLabel);
        });
    });

    // ----------------------------------------------------------------
    // Light mode — CSS classes
    // ----------------------------------------------------------------
    describe('light mode colors', () => {
        it('renders "open" with bg-blue-100 class', () => {
            const wrapper = mountBadge('open');
            expect(wrapper.classes()).toContain('bg-blue-100');
            expect(wrapper.classes()).toContain('text-blue-800');
        });

        it('renders "in_progress" with bg-purple-100 class', () => {
            const wrapper = mountBadge('in_progress');
            expect(wrapper.classes()).toContain('bg-purple-100');
            expect(wrapper.classes()).toContain('text-purple-800');
        });

        it('renders "waiting_on_customer" with bg-yellow-100 class', () => {
            const wrapper = mountBadge('waiting_on_customer');
            expect(wrapper.classes()).toContain('bg-yellow-100');
            expect(wrapper.classes()).toContain('text-yellow-800');
        });

        it('renders "waiting_on_agent" with bg-orange-100 class', () => {
            const wrapper = mountBadge('waiting_on_agent');
            expect(wrapper.classes()).toContain('bg-orange-100');
            expect(wrapper.classes()).toContain('text-orange-800');
        });

        it('renders "escalated" with bg-red-100 class', () => {
            const wrapper = mountBadge('escalated');
            expect(wrapper.classes()).toContain('bg-red-100');
            expect(wrapper.classes()).toContain('text-red-800');
        });

        it('renders "resolved" with bg-green-100 class', () => {
            const wrapper = mountBadge('resolved');
            expect(wrapper.classes()).toContain('bg-green-100');
            expect(wrapper.classes()).toContain('text-green-800');
        });

        it('renders "closed" with bg-gray-100 class', () => {
            const wrapper = mountBadge('closed');
            expect(wrapper.classes()).toContain('bg-gray-100');
            expect(wrapper.classes()).toContain('text-gray-800');
        });

        it('renders "reopened" with bg-blue-100 class', () => {
            const wrapper = mountBadge('reopened');
            expect(wrapper.classes()).toContain('bg-blue-100');
            expect(wrapper.classes()).toContain('text-blue-800');
        });
    });

    // ----------------------------------------------------------------
    // Dark mode — labels
    // ----------------------------------------------------------------
    describe('dark mode labels', () => {
        const statuses = [
            ['open', 'Open'],
            ['in_progress', 'In Progress'],
            ['waiting_on_customer', 'Waiting on Customer'],
            ['waiting_on_agent', 'Waiting on Agent'],
            ['escalated', 'Escalated'],
            ['resolved', 'Resolved'],
            ['closed', 'Closed'],
            ['reopened', 'Reopened'],
        ];

        it.each(statuses)('renders label "%s" as "%s" in dark mode', (status, expectedLabel) => {
            const wrapper = mountBadge(status, true);
            expect(wrapper.text()).toBe(expectedLabel);
        });
    });

    // ----------------------------------------------------------------
    // Dark mode — CSS classes
    // ----------------------------------------------------------------
    describe('dark mode colors', () => {
        it('renders "open" with dark mode classes', () => {
            const wrapper = mountBadge('open', true);
            expect(wrapper.classes()).toContain('bg-cyan-500/10');
            expect(wrapper.classes()).toContain('text-white');
        });

        it('renders "escalated" with dark mode rose classes', () => {
            const wrapper = mountBadge('escalated', true);
            expect(wrapper.classes()).toContain('bg-rose-500/10');
            expect(wrapper.classes()).toContain('text-rose-400');
        });

        it('renders "resolved" with dark mode emerald classes', () => {
            const wrapper = mountBadge('resolved', true);
            expect(wrapper.classes()).toContain('bg-emerald-500/10');
            expect(wrapper.classes()).toContain('text-emerald-400');
        });

        it('renders "closed" with dark mode gray classes', () => {
            const wrapper = mountBadge('closed', true);
            expect(wrapper.classes()).toContain('bg-gray-500/10');
            expect(wrapper.classes()).toContain('text-gray-400');
        });
    });

    // ----------------------------------------------------------------
    // Unknown status fallback
    // ----------------------------------------------------------------
    describe('unknown status fallback', () => {
        it('renders the raw status string as label for unknown status (light)', () => {
            const wrapper = mountBadge('unknown_status');
            expect(wrapper.text()).toBe('unknown_status');
        });

        it('uses gray fallback classes for unknown status (light)', () => {
            const wrapper = mountBadge('unknown_status');
            expect(wrapper.classes()).toContain('bg-gray-100');
            expect(wrapper.classes()).toContain('text-gray-800');
        });

        it('renders the raw status string as label for unknown status (dark)', () => {
            const wrapper = mountBadge('unknown_status', true);
            expect(wrapper.text()).toBe('unknown_status');
        });

        it('uses dark gray fallback classes for unknown status (dark)', () => {
            const wrapper = mountBadge('unknown_status', true);
            expect(wrapper.classes()).toContain('bg-gray-500/10');
            expect(wrapper.classes()).toContain('text-gray-400');
        });
    });

    // ----------------------------------------------------------------
    // Rendering structure
    // ----------------------------------------------------------------
    describe('DOM structure', () => {
        it('renders as a <span> element', () => {
            const wrapper = mountBadge('open');
            expect(wrapper.element.tagName).toBe('SPAN');
        });

        it('always includes base badge classes', () => {
            const wrapper = mountBadge('open');
            expect(wrapper.classes()).toContain('inline-flex');
            expect(wrapper.classes()).toContain('items-center');
            expect(wrapper.classes()).toContain('rounded-full');
            expect(wrapper.classes()).toContain('text-xs');
            expect(wrapper.classes()).toContain('font-medium');
        });
    });
});
