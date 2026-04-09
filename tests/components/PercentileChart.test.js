import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PercentileChart from '../../src/components/PercentileChart.vue';

function mountChart(props = {}) {
    return mount(PercentileChart, {
        props: {
            percentiles: { p50: 2, p75: 4, p90: 8, p95: 12, p99: 24 },
            ...props,
        },
    });
}

describe('PercentileChart', () => {
    describe('rendering', () => {
        it('renders all five percentile bars', () => {
            const wrapper = mountChart();
            expect(wrapper.text()).toContain('P50 (Median)');
            expect(wrapper.text()).toContain('P75');
            expect(wrapper.text()).toContain('P90');
            expect(wrapper.text()).toContain('P95');
            expect(wrapper.text()).toContain('P99');
        });

        it('renders values with unit', () => {
            const wrapper = mountChart({ unit: 'h' });
            expect(wrapper.text()).toContain('2h');
            expect(wrapper.text()).toContain('4h');
            expect(wrapper.text()).toContain('8h');
            expect(wrapper.text()).toContain('12h');
            expect(wrapper.text()).toContain('24h');
        });

        it('renders title', () => {
            const wrapper = mountChart({ title: 'Response Percentiles' });
            expect(wrapper.text()).toContain('Response Percentiles');
        });
    });

    describe('bar widths', () => {
        it('p99 bar has 100% width (max value)', () => {
            const wrapper = mountChart();
            const bars = wrapper.findAll('.rounded-full.transition-all');
            // The last bar (P99) should have width 100%
            const p99Bar = bars[bars.length - 1];
            expect(p99Bar.attributes('style')).toContain('width: 100%');
        });

        it('p50 bar has proportional width', () => {
            const wrapper = mountChart({ percentiles: { p50: 5, p75: 10, p90: 15, p95: 20, p99: 25 } });
            const bars = wrapper.findAll('.rounded-full.transition-all');
            const p50Bar = bars[0];
            expect(p50Bar.attributes('style')).toContain('width: 20%');
        });
    });

    describe('colors', () => {
        it('p50 bar is green', () => {
            const wrapper = mountChart();
            const bars = wrapper.findAll('.rounded-full.transition-all');
            expect(bars[0].attributes('style')).toContain('#10b981');
        });

        it('p99 bar is dark red', () => {
            const wrapper = mountChart();
            const bars = wrapper.findAll('.rounded-full.transition-all');
            expect(bars[4].attributes('style')).toContain('#dc2626');
        });
    });

    describe('target line', () => {
        it('renders target line when target is provided', () => {
            const wrapper = mountChart({ target: 10 });
            expect(wrapper.text()).toContain('Target: 10h');
        });

        it('does not render target when null', () => {
            const wrapper = mountChart({ target: null });
            expect(wrapper.text()).not.toContain('Target:');
        });
    });

    describe('custom unit', () => {
        it('renders with custom unit', () => {
            const wrapper = mountChart({
                percentiles: { p50: 1, p75: 2, p90: 3, p95: 4, p99: 5 },
                unit: 'min',
            });
            expect(wrapper.text()).toContain('1min');
            expect(wrapper.text()).toContain('5min');
        });
    });
});
