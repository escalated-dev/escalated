import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MergeFieldDropdown from '../../../../src/components/admin/newsletters/MergeFieldDropdown.vue';

const globalConfig = {
    mocks: { $t: (key) => key },
};

describe('MergeFieldDropdown', () => {
    it('emits insert with selected path on selection', async () => {
        const wrapper = mount(MergeFieldDropdown, { global: globalConfig });
        await wrapper.find('button.merge-field-dropdown__toggle').trigger('click');
        await wrapper.find('[data-path="contact.first_name"]').trigger('click');
        expect(wrapper.emitted('insert')[0]).toEqual(['contact.first_name']);
    });

    it('shows configured metadata keys when provided', async () => {
        const wrapper = mount(MergeFieldDropdown, {
            props: { metadataKeys: ['tier', 'plan'] },
            global: globalConfig,
        });
        await wrapper.find('button.merge-field-dropdown__toggle').trigger('click');
        expect(wrapper.text()).toContain('contact.metadata.tier');
        expect(wrapper.text()).toContain('contact.metadata.plan');
    });

    it('closes the menu after selection', async () => {
        const wrapper = mount(MergeFieldDropdown, { global: globalConfig });
        await wrapper.find('button.merge-field-dropdown__toggle').trigger('click');
        expect(wrapper.find('ul.merge-field-dropdown__menu').exists()).toBe(true);
        await wrapper.find('[data-path="contact.email"]').trigger('click');
        expect(wrapper.find('ul.merge-field-dropdown__menu').exists()).toBe(false);
    });
});
