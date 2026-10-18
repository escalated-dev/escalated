import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TotpInput from '../../src/components/TotpInput.vue';

let wrapper;
afterEach(() => wrapper?.unmount());

describe('authenticator code entry', () => {
    it('emits completion after all six digits are typed', async () => {
        wrapper = mount(TotpInput);
        for (const [index, input] of wrapper.findAll('input').entries()) await input.setValue(String(index + 1));
        expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['123456']);
        expect(wrapper.emitted('complete')).toEqual([['123456']]);
    });

    it('does not complete a partial code and strips non-digits', async () => {
        wrapper = mount(TotpInput);
        await wrapper.findAll('input')[0].setValue('x1');
        await wrapper.findAll('input')[1].setValue('x');
        expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['1']);
        expect(wrapper.emitted('complete')).toBeUndefined();
    });

    it('accepts a pasted code and clears its fields when the parent clears the value', async () => {
        wrapper = mount(TotpInput, { props: { modelValue: 'old-value' } });
        await wrapper.find('input').trigger('paste', { clipboardData: { getData: () => '123 456' } });
        expect(wrapper.emitted('complete')).toEqual([['123456']]);
        await wrapper.setProps({ modelValue: '' });
        expect(wrapper.findAll('input').every((input) => input.element.value === '')).toBe(true);
    });
});
