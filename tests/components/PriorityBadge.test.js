import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import PriorityBadge from '../../src/components/PriorityBadge.vue';

/**
 * Helper to mount PriorityBadge with a given priority and dark mode setting.
 */
function mountBadge(priority, dark = false) {
    return mount(PriorityBadge, {
        props: { priority },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('PriorityBadge', () => {
    // ----------------------------------------------------------------
    // Light mode — labels
    // ----------------------------------------------------------------
    describe('light mode labels', () => {
        const priorities = [
            ['low', 'Low'],
            ['medium', 'Medium'],
            ['high', 'High'],
            ['urgent', 'Urgent'],
            ['critical', 'Critical'],
        ];

        it.each(priorities)('renders priority "%s" as label "%s"', (priority, expectedLabel) => {
            const wrapper = mountBadge(priority);
            expect(wrapper.text()).toBe(expectedLabel);
        });
    });

    // ----------------------------------------------------------------
    // Light mode — CSS classes
    // ----------------------------------------------------------------
    describe('light mode colors', () => {
        it('renders "low" with bg-gray-100 class', () => {
            const wrapper = mountBadge('low');
            expect(wrapper.classes()).toContain('bg-gray-100');
            expect(wrapper.classes()).toContain('text-gray-800');
        });

        it('renders "medium" with bg-blue-100 class', () => {
            const wrapper = mountBadge('medium');
            expect(wrapper.classes()).toContain('bg-blue-100');
            expect(wrapper.classes()).toContain('text-blue-800');
        });

        it('renders "high" with bg-yellow-100 class', () => {
            const wrapper = mountBadge('high');
            expect(wrapper.classes()).toContain('bg-yellow-100');
            expect(wrapper.classes()).toContain('text-yellow-800');
        });

        it('renders "urgent" with bg-orange-100 class', () => {
            const wrapper = mountBadge('urgent');
            expect(wrapper.classes()).toContain('bg-orange-100');
            expect(wrapper.classes()).toContain('text-orange-800');
        });

        it('renders "critical" with bg-red-100 class', () => {
            const wrapper = mountBadge('critical');
            expect(wrapper.classes()).toContain('bg-red-100');
            expect(wrapper.classes()).toContain('text-red-800');
        });
    });

    // ----------------------------------------------------------------
    // Dark mode — labels
    // ----------------------------------------------------------------
    describe('dark mode labels', () => {
        const priorities = [
            ['low', 'Low'],
            ['medium', 'Medium'],
            ['high', 'High'],
            ['urgent', 'Urgent'],
            ['critical', 'Critical'],
        ];

        it.each(priorities)('renders priority "%s" as label "%s" in dark mode', (priority, expectedLabel) => {
            const wrapper = mountBadge(priority, true);
            expect(wrapper.text()).toBe(expectedLabel);
        });
    });

    // ----------------------------------------------------------------
    // Dark mode — CSS classes
    // ----------------------------------------------------------------
    describe('dark mode colors', () => {
        it('renders "low" with dark gray classes', () => {
            const wrapper = mountBadge('low', true);
            expect(wrapper.classes()).toContain('bg-gray-500/10');
            expect(wrapper.classes()).toContain('text-gray-400');
        });

        it('renders "medium" with dark cyan classes', () => {
            const wrapper = mountBadge('medium', true);
            expect(wrapper.classes()).toContain('bg-cyan-500/10');
            expect(wrapper.classes()).toContain('text-white');
        });

        it('renders "high" with dark amber classes', () => {
            const wrapper = mountBadge('high', true);
            expect(wrapper.classes()).toContain('bg-amber-500/10');
            expect(wrapper.classes()).toContain('text-amber-400');
        });

        it('renders "urgent" with dark orange classes', () => {
            const wrapper = mountBadge('urgent', true);
            expect(wrapper.classes()).toContain('bg-orange-500/10');
            expect(wrapper.classes()).toContain('text-orange-400');
        });

        it('renders "critical" with dark rose classes', () => {
            const wrapper = mountBadge('critical', true);
            expect(wrapper.classes()).toContain('bg-rose-500/10');
            expect(wrapper.classes()).toContain('text-rose-300');
        });
    });

    // ----------------------------------------------------------------
    // Unknown priority fallback
    // ----------------------------------------------------------------
    describe('unknown priority fallback', () => {
        it('renders the raw priority string as label for unknown priority (light)', () => {
            const wrapper = mountBadge('unknown_priority');
            expect(wrapper.text()).toBe('unknown_priority');
        });

        it('uses gray fallback classes for unknown priority (light)', () => {
            const wrapper = mountBadge('unknown_priority');
            expect(wrapper.classes()).toContain('bg-gray-100');
            expect(wrapper.classes()).toContain('text-gray-800');
        });

        it('renders the raw priority string as label for unknown priority (dark)', () => {
            const wrapper = mountBadge('unknown_priority', true);
            expect(wrapper.text()).toBe('unknown_priority');
        });

        it('uses dark gray fallback classes for unknown priority (dark)', () => {
            const wrapper = mountBadge('unknown_priority', true);
            expect(wrapper.classes()).toContain('bg-gray-500/10');
            expect(wrapper.classes()).toContain('text-gray-400');
        });
    });

    // ----------------------------------------------------------------
    // Rendering structure
    // ----------------------------------------------------------------
    describe('DOM structure', () => {
        it('renders as a <span> element', () => {
            const wrapper = mountBadge('low');
            expect(wrapper.element.tagName).toBe('SPAN');
        });

        it('always includes base badge classes', () => {
            const wrapper = mountBadge('high');
            expect(wrapper.classes()).toContain('inline-flex');
            expect(wrapper.classes()).toContain('items-center');
            expect(wrapper.classes()).toContain('rounded-full');
            expect(wrapper.classes()).toContain('text-xs');
            expect(wrapper.classes()).toContain('font-medium');
        });
    });
});
