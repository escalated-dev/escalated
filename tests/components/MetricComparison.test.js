import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricComparison from '../../src/components/MetricComparison.vue';

function mountMetric(props = {}) {
    return mount(MetricComparison, {
        props: {
            label: 'Test Metric',
            value: 100,
            ...props,
        },
    });
}

describe('MetricComparison', () => {
    describe('basic rendering', () => {
        it('renders label', () => {
            const wrapper = mountMetric({ label: 'Total Tickets' });
            expect(wrapper.text()).toContain('Total Tickets');
        });

        it('renders value', () => {
            const wrapper = mountMetric({ value: 42 });
            expect(wrapper.text()).toContain('42');
        });

        it('renders value with format suffix', () => {
            const wrapper = mountMetric({ value: 3.5, format: 'h' });
            expect(wrapper.text()).toContain('3.5h');
        });
    });

    describe('comparison arrows', () => {
        it('shows up arrow when value increased', () => {
            const wrapper = mountMetric({ value: 100, previousValue: 80 });
            const html = wrapper.html();
            // Up arrow SVG path
            expect(html).toContain('4.5 19.5l15-15');
        });

        it('shows down arrow when value decreased', () => {
            const wrapper = mountMetric({ value: 60, previousValue: 80 });
            const html = wrapper.html();
            // Down arrow SVG path
            expect(html).toContain('4.5 4.5l15 15');
        });

        it('shows neutral indicator when no change', () => {
            const wrapper = mountMetric({ value: 80, previousValue: 80 });
            expect(wrapper.text()).toContain('--');
        });

        it('does not show comparison when previousValue is null', () => {
            const wrapper = mountMetric({ value: 100, previousValue: null });
            const html = wrapper.html();
            expect(html).not.toContain('4.5 19.5l15-15');
            expect(html).not.toContain('4.5 4.5l15 15');
        });
    });

    describe('percentage calculation', () => {
        it('shows correct percentage increase', () => {
            const wrapper = mountMetric({ value: 120, previousValue: 100 });
            expect(wrapper.text()).toContain('20%');
        });

        it('shows correct percentage decrease', () => {
            const wrapper = mountMetric({ value: 75, previousValue: 100 });
            expect(wrapper.text()).toContain('25%');
        });

        it('shows previous value text', () => {
            const wrapper = mountMetric({ value: 100, previousValue: 80 });
            expect(wrapper.text()).toContain('80');
            expect(wrapper.text()).toContain('prev');
        });
    });

    describe('color inversion', () => {
        it('uses green for increase by default', () => {
            const wrapper = mountMetric({ value: 120, previousValue: 100 });
            const html = wrapper.html();
            expect(html).toContain('text-emerald-400');
        });

        it('uses red for increase when invertColor is true', () => {
            const wrapper = mountMetric({ value: 120, previousValue: 100, invertColor: true });
            const html = wrapper.html();
            expect(html).toContain('text-red-400');
        });

        it('uses green for decrease when invertColor is true', () => {
            const wrapper = mountMetric({ value: 80, previousValue: 100, invertColor: true });
            const html = wrapper.html();
            expect(html).toContain('text-emerald-400');
        });
    });

    describe('icon', () => {
        it('renders icon when provided', () => {
            const wrapper = mountMetric({ icon: 'M12 6v6h4.5' });
            expect(wrapper.find('svg').exists()).toBe(true);
        });

        it('does not render icon when not provided', () => {
            const wrapper = mountMetric();
            // Only comparison arrows may exist, not the icon container
            const iconContainer = wrapper.find('.h-10.w-10');
            expect(iconContainer.exists()).toBe(false);
        });
    });
});
