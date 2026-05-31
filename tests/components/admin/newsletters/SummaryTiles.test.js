import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SummaryTiles from '../../../../src/components/admin/newsletters/SummaryTiles.vue';

describe('SummaryTiles', () => {
    it('renders absolute counts and rate percentages', () => {
        const wrapper = mount(SummaryTiles, {
            props: {
                summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 },
            },
        });
        expect(wrapper.text()).toContain('990');
        expect(wrapper.text()).toContain('40.4%');
        expect(wrapper.text()).toContain('8.1%');
        expect(wrapper.text()).toContain('1.0%');
    });

    it('shows dashes when summary.sent is zero', () => {
        const wrapper = mount(SummaryTiles, {
            props: { summary: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 } },
        });
        expect(wrapper.text()).toContain('—');
    });
});
