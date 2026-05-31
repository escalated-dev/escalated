import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AnalyticsTiles from '../../../../src/components/admin/newsletters/AnalyticsTiles.vue';

describe('AnalyticsTiles', () => {
    it('renders summary tiles and top-clicked URL list', () => {
        const wrapper = mount(AnalyticsTiles, {
            props: {
                summary: { total: 100, sent: 100, opened: 50, clicked: 20, bounced: 1, complained: 0 },
                topClicks: [
                    { url: 'https://example.com/a', clicks: 12 },
                    { url: 'https://example.com/b', clicks: 5 },
                ],
            },
        });
        expect(wrapper.text()).toContain('https://example.com/a');
        expect(wrapper.text()).toContain('12');
    });

    it('omits the top-clicks section when topClicks is empty', () => {
        const wrapper = mount(AnalyticsTiles, {
            props: {
                summary: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 },
                topClicks: [],
            },
        });
        expect(wrapper.find('.analytics-tiles__top-clicks').exists()).toBe(false);
    });
});
