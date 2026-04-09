import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PeriodSelector from '../../src/components/PeriodSelector.vue';

function mountSelector(props = {}) {
    return mount(PeriodSelector, {
        props: {
            modelValue: 30,
            ...props,
        },
    });
}

describe('PeriodSelector', () => {
    it('renders default period buttons', () => {
        const wrapper = mountSelector();
        expect(wrapper.text()).toContain('7d');
        expect(wrapper.text()).toContain('30d');
        expect(wrapper.text()).toContain('90d');
        expect(wrapper.text()).toContain('1y');
        expect(wrapper.text()).toContain('Custom');
    });

    it('highlights the active period', () => {
        const wrapper = mountSelector({ modelValue: 7 });
        const buttons = wrapper.findAll('button');
        const btn7d = buttons.find((b) => b.text() === '7d');
        expect(btn7d.classes().join(' ')).toContain('from-[var(--esc-panel-accent)]');
    });

    it('emits update:modelValue when a period is clicked', async () => {
        const wrapper = mountSelector({ modelValue: 30 });
        const buttons = wrapper.findAll('button');
        const btn7d = buttons.find((b) => b.text() === '7d');
        await btn7d.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([7]);
    });

    it('emits 90 when 90d is clicked', async () => {
        const wrapper = mountSelector({ modelValue: 30 });
        const buttons = wrapper.findAll('button');
        const btn90d = buttons.find((b) => b.text() === '90d');
        await btn90d.trigger('click');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([90]);
    });

    it('emits 365 when 1y is clicked', async () => {
        const wrapper = mountSelector({ modelValue: 30 });
        const buttons = wrapper.findAll('button');
        const btn1y = buttons.find((b) => b.text() === '1y');
        await btn1y.trigger('click');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([365]);
    });

    it('shows custom date picker when Custom is clicked', async () => {
        const wrapper = mountSelector();
        const buttons = wrapper.findAll('button');
        const customBtn = buttons.find((b) => b.text() === 'Custom');
        await customBtn.trigger('click');
        expect(wrapper.find('input[type="date"]').exists()).toBe(true);
    });

    it('hides custom picker initially', () => {
        const wrapper = mountSelector();
        expect(wrapper.find('input[type="date"]').exists()).toBe(false);
    });

    it('renders custom options when provided', () => {
        const wrapper = mountSelector({ options: [14, 60] });
        expect(wrapper.text()).toContain('14d');
        expect(wrapper.text()).toContain('60d');
        expect(wrapper.text()).not.toContain('7d');
    });
});
