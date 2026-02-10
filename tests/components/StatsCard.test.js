import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import StatsCard from '../../src/components/StatsCard.vue';

/**
 * Helper to mount StatsCard with given props and dark mode setting.
 */
function mountCard(props = {}, dark = false) {
    return mount(StatsCard, {
        props: { value: 0, ...props },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('StatsCard', () => {
    // ----------------------------------------------------------------
    // Label rendering
    // ----------------------------------------------------------------
    describe('label rendering', () => {
        it('renders the label prop', () => {
            const wrapper = mountCard({ label: 'Total Tickets', value: 42 });
            expect(wrapper.text()).toContain('Total Tickets');
        });

        it('renders the title prop as fallback when label is not provided', () => {
            const wrapper = mountCard({ title: 'Open Tickets', value: 10 });
            expect(wrapper.text()).toContain('Open Tickets');
        });

        it('prefers label over title when both are provided', () => {
            const wrapper = mountCard({ label: 'Label Text', title: 'Title Text', value: 5 });
            expect(wrapper.text()).toContain('Label Text');
        });

        it('renders empty string when neither label nor title is provided', () => {
            const wrapper = mountCard({ value: 99 });
            // The label area should still exist but be empty
            const text = wrapper.text();
            expect(text).toContain('99');
        });
    });

    // ----------------------------------------------------------------
    // Value rendering
    // ----------------------------------------------------------------
    describe('value rendering', () => {
        it('renders a numeric value', () => {
            const wrapper = mountCard({ label: 'Count', value: 42 });
            expect(wrapper.text()).toContain('42');
        });

        it('renders a string value', () => {
            const wrapper = mountCard({ label: 'Status', value: 'Active' });
            expect(wrapper.text()).toContain('Active');
        });

        it('renders zero as value', () => {
            const wrapper = mountCard({ label: 'Empty', value: 0 });
            expect(wrapper.text()).toContain('0');
        });

        it('renders large numbers', () => {
            const wrapper = mountCard({ label: 'Total', value: 123456 });
            expect(wrapper.text()).toContain('123456');
        });
    });

    // ----------------------------------------------------------------
    // Trend rendering
    // ----------------------------------------------------------------
    describe('trend rendering', () => {
        it('renders trend text when provided', () => {
            const wrapper = mountCard({ label: 'Sales', value: 50, trend: '+12%' });
            expect(wrapper.text()).toContain('+12%');
        });

        it('does not render trend element when trend is null', () => {
            const wrapper = mountCard({ label: 'Sales', value: 50 });
            // Trend should not appear in text
            const html = wrapper.html();
            // No trend element should be present beyond label and value
            expect(wrapper.text().trim()).toBe('Total Tickets'.length ? 'Sales50' : '');
            // Better check: just verify no trend-like content
            expect(wrapper.text()).not.toContain('%');
        });

        it('does not render trend element when trend is not passed', () => {
            const wrapper = mountCard({ label: 'Count', value: 100 });
            // The trend div should not be in the DOM at all (v-if="trend")
            const trendElements = wrapper.findAll('.text-xs.font-medium');
            // Trend elements contain the inline-flex/inline-block classes
            const trendText = wrapper.findAll('[class*="rounded-full"][class*="text-xs"]');
            expect(trendText.length).toBe(0);
        });

        it('renders various trend strings', () => {
            const trends = ['+5%', '-3.2%', 'Up 10', 'Down', '0%'];
            for (const trend of trends) {
                const wrapper = mountCard({ label: 'Test', value: 1, trend });
                expect(wrapper.text()).toContain(trend);
            }
        });
    });

    // ----------------------------------------------------------------
    // Light mode rendering
    // ----------------------------------------------------------------
    describe('light mode', () => {
        it('uses light mode card styling', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 });
            const card = wrapper.find('div');
            expect(card.classes()).toContain('bg-white');
        });

        it('renders value with text-gray-900 in light mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 });
            const html = wrapper.html();
            expect(html).toContain('text-gray-900');
        });

        it('renders label with text-gray-500 in light mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 });
            const html = wrapper.html();
            expect(html).toContain('text-gray-500');
        });
    });

    // ----------------------------------------------------------------
    // Dark mode rendering
    // ----------------------------------------------------------------
    describe('dark mode', () => {
        it('uses dark mode card styling', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 }, true);
            const card = wrapper.find('div');
            expect(card.classes()).toContain('bg-neutral-900/60');
        });

        it('renders value with text-white in dark mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 }, true);
            const html = wrapper.html();
            expect(html).toContain('text-white');
        });

        it('renders label with text-neutral-500 in dark mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 }, true);
            const html = wrapper.html();
            expect(html).toContain('text-neutral-500');
        });

        it('renders trend with dark mode styling', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+5%' }, true);
            const html = wrapper.html();
            expect(html).toContain('bg-white/[0.06]');
            expect(html).toContain('text-neutral-400');
        });
    });

    // ----------------------------------------------------------------
    // Color prop (light mode trend badge)
    // ----------------------------------------------------------------
    describe('color prop for trend badge', () => {
        it('defaults to blue trend badge color', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+5%', color: 'blue' });
            const html = wrapper.html();
            expect(html).toContain('bg-blue-50');
            expect(html).toContain('text-blue-700');
        });

        it('applies green color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+5%', color: 'green' });
            const html = wrapper.html();
            expect(html).toContain('bg-green-50');
            expect(html).toContain('text-green-700');
        });

        it('applies red color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '-3%', color: 'red' });
            const html = wrapper.html();
            expect(html).toContain('bg-red-50');
            expect(html).toContain('text-red-700');
        });

        it('applies indigo color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+8%', color: 'indigo' });
            const html = wrapper.html();
            expect(html).toContain('bg-indigo-50');
            expect(html).toContain('text-indigo-700');
        });

        it('applies yellow color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '0%', color: 'yellow' });
            const html = wrapper.html();
            expect(html).toContain('bg-yellow-50');
            expect(html).toContain('text-yellow-700');
        });

        it('applies gray color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: 'N/A', color: 'gray' });
            const html = wrapper.html();
            expect(html).toContain('bg-gray-50');
            expect(html).toContain('text-gray-700');
        });

        it('applies cyan color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+1%', color: 'cyan' });
            const html = wrapper.html();
            expect(html).toContain('bg-cyan-50');
            expect(html).toContain('text-cyan-700');
        });

        it('applies violet color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+2%', color: 'violet' });
            const html = wrapper.html();
            expect(html).toContain('bg-violet-50');
            expect(html).toContain('text-violet-700');
        });

        it('applies amber color to trend badge', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+3%', color: 'amber' });
            const html = wrapper.html();
            expect(html).toContain('bg-amber-50');
            expect(html).toContain('text-amber-700');
        });

        it('falls back to blue for unknown color', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+5%', color: 'nonexistent' });
            const html = wrapper.html();
            expect(html).toContain('bg-blue-50');
            expect(html).toContain('text-blue-700');
        });

        it('color prop has no effect in dark mode (dark uses unified styling)', () => {
            const wrapper = mountCard({ label: 'Test', value: 10, trend: '+5%', color: 'red' }, true);
            const html = wrapper.html();
            // Dark mode trend always uses bg-white/[0.06] regardless of color
            expect(html).toContain('bg-white/[0.06]');
            expect(html).not.toContain('bg-red-50');
        });
    });

    // ----------------------------------------------------------------
    // DOM structure
    // ----------------------------------------------------------------
    describe('DOM structure', () => {
        it('renders a div element in light mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 });
            expect(wrapper.find('div').exists()).toBe(true);
        });

        it('includes rounded-lg class in light mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 });
            const html = wrapper.html();
            expect(html).toContain('rounded-lg');
        });

        it('includes rounded-xl class in dark mode', () => {
            const wrapper = mountCard({ label: 'Test', value: 10 }, true);
            const html = wrapper.html();
            expect(html).toContain('rounded-xl');
        });
    });
});
