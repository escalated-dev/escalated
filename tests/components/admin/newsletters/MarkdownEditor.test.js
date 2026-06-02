import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MarkdownEditor from '../../../../src/components/admin/newsletters/MarkdownEditor.vue';

describe('MarkdownEditor', () => {
    it('renders the v-model value', () => {
        const wrapper = mount(MarkdownEditor, { props: { modelValue: '# Hello' } });
        expect(wrapper.find('textarea').element.value).toBe('# Hello');
    });

    it('emits update:modelValue on input', async () => {
        const wrapper = mount(MarkdownEditor, { props: { modelValue: '' } });
        await wrapper.find('textarea').setValue('hi');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['hi']);
    });

    it('inserts merge field at cursor on insertMergeField()', async () => {
        const wrapper = mount(MarkdownEditor, { props: { modelValue: 'Hello ' } });
        const ta = wrapper.find('textarea').element;
        ta.setSelectionRange(6, 6);
        wrapper.vm.insertMergeField('contact.first_name');
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe('Hello {{ contact.first_name }}');
    });

    it('falls back to appending when there is no textarea ref', () => {
        const wrapper = mount(MarkdownEditor, { props: { modelValue: 'existing' } });
        wrapper.vm.insertMergeField('contact.email');
        const last = wrapper.emitted('update:modelValue').at(-1)[0];
        expect(last).toContain('{{ contact.email }}');
    });
});
