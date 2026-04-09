import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReportChart from '../../src/components/ReportChart.vue';

function mountChart(props = {}) {
    return mount(ReportChart, {
        props,
        global: {
            provide: {
                'esc-dark': { value: false },
            },
        },
    });
}

describe('ReportChart', () => {
    describe('empty state', () => {
        it('renders no-data message when data is empty', () => {
            const wrapper = mountChart({ type: 'bar', data: [] });
            expect(wrapper.text()).toContain('No data available');
        });

        it('does not render svg when data is empty', () => {
            const wrapper = mountChart({ type: 'bar', data: [] });
            expect(wrapper.find('svg').exists()).toBe(false);
        });
    });

    describe('bar chart', () => {
        it('renders bar rects for data', () => {
            const wrapper = mountChart({
                type: 'bar',
                data: [
                    { label: 'A', value: 10 },
                    { label: 'B', value: 20 },
                ],
            });
            const rects = wrapper.findAll('rect');
            expect(rects.length).toBeGreaterThanOrEqual(2);
        });

        it('renders x-axis labels', () => {
            const wrapper = mountChart({
                type: 'bar',
                data: [
                    { label: 'Alpha', value: 10 },
                    { label: 'Beta', value: 20 },
                ],
            });
            expect(wrapper.text()).toContain('Alpha');
            expect(wrapper.text()).toContain('Beta');
        });
    });

    describe('line chart', () => {
        it('renders a path element for line', () => {
            const wrapper = mountChart({
                type: 'line',
                data: [
                    { label: 'Jan', value: 5 },
                    { label: 'Feb', value: 10 },
                    { label: 'Mar', value: 8 },
                ],
            });
            const paths = wrapper.findAll('path');
            const linePath = paths.find((p) => p.attributes('d')?.startsWith('M'));
            expect(linePath).toBeTruthy();
        });

        it('renders circle data points', () => {
            const wrapper = mountChart({
                type: 'line',
                data: [
                    { label: 'Jan', value: 5 },
                    { label: 'Feb', value: 10 },
                ],
            });
            const circles = wrapper.findAll('circle');
            expect(circles.length).toBe(2);
        });
    });

    describe('area chart', () => {
        it('renders area fill path', () => {
            const wrapper = mountChart({
                type: 'area',
                data: [
                    { label: 'Jan', value: 5 },
                    { label: 'Feb', value: 10 },
                ],
            });
            const paths = wrapper.findAll('path');
            const areaPath = paths.find((p) => p.attributes('fill')?.includes('url'));
            expect(areaPath).toBeTruthy();
        });
    });

    describe('histogram', () => {
        it('renders bars similar to bar chart', () => {
            const wrapper = mountChart({
                type: 'histogram',
                data: [
                    { label: '<1h', value: 15 },
                    { label: '1-4h', value: 25 },
                    { label: '4-8h', value: 10 },
                ],
            });
            const rects = wrapper.findAll('rect');
            expect(rects.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('pie chart', () => {
        it('renders pie slices as paths', () => {
            const wrapper = mountChart({
                type: 'pie',
                data: [
                    { label: 'Open', value: 30 },
                    { label: 'Closed', value: 70 },
                ],
            });
            const paths = wrapper.findAll('path');
            expect(paths.length).toBeGreaterThanOrEqual(2);
        });

        it('displays percentage labels', () => {
            const wrapper = mountChart({
                type: 'pie',
                data: [
                    { label: 'Open', value: 30 },
                    { label: 'Closed', value: 70 },
                ],
            });
            expect(wrapper.text()).toContain('30%');
            expect(wrapper.text()).toContain('70%');
        });
    });

    describe('title', () => {
        it('renders title when provided', () => {
            const wrapper = mountChart({
                type: 'bar',
                title: 'Test Chart',
                data: [{ label: 'A', value: 10 }],
            });
            expect(wrapper.text()).toContain('Test Chart');
        });

        it('does not render title when empty', () => {
            const wrapper = mountChart({
                type: 'bar',
                data: [{ label: 'A', value: 10 }],
            });
            const h3 = wrapper.find('h3');
            expect(h3.exists()).toBe(false);
        });
    });

    describe('tooltip', () => {
        it('shows tooltip on mouseenter', async () => {
            const wrapper = mountChart({
                type: 'bar',
                data: [{ label: 'Item', value: 42 }],
            });
            const rect = wrapper.find('rect');
            await rect.trigger('mouseenter');
            // Tooltip should become visible
            const tooltipDiv = wrapper.find('.pointer-events-none');
            expect(tooltipDiv.exists()).toBe(true);
        });
    });
});
