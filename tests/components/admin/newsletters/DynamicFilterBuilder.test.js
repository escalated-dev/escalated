import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DynamicFilterBuilder from '../../../../src/components/admin/newsletters/DynamicFilterBuilder.vue';

describe('DynamicFilterBuilder', () => {
    it('renders the matches counter', () => {
        const wrapper = mount(DynamicFilterBuilder, {
            props: { modelValue: { rules: [] }, matchCount: 42 },
        });
        expect(wrapper.text()).toContain('42 contacts match');
    });

    it('emits update:modelValue when JSON is edited', async () => {
        const wrapper = mount(DynamicFilterBuilder, {
            props: { modelValue: { rules: [] }, matchCount: 0 },
        });
        const newValue = JSON.stringify({ rules: [{ field: 'email', op: 'contains', value: '@' }] });
        await wrapper.find('textarea').setValue(newValue);
        expect(wrapper.emitted('update:modelValue')[0][0].rules).toHaveLength(1);
    });

    it('ignores invalid JSON edits without emitting', async () => {
        const wrapper = mount(DynamicFilterBuilder, {
            props: { modelValue: { rules: [] }, matchCount: 0 },
        });
        await wrapper.find('textarea').setValue('{invalid');
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
