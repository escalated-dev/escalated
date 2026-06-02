import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PreviewIframe from '../../../../src/components/admin/newsletters/PreviewIframe.vue';

describe('PreviewIframe', () => {
    it('writes the provided HTML into the iframe srcdoc', async () => {
        const html = '<p>preview body</p>';
        const wrapper = mount(PreviewIframe, { props: { html } });
        await flushPromises();
        expect(wrapper.find('iframe').attributes('srcdoc')).toContain('preview body');
    });

    it('updates srcdoc when the html prop changes', async () => {
        const wrapper = mount(PreviewIframe, { props: { html: '<p>a</p>' } });
        await wrapper.setProps({ html: '<p>b</p>' });
        await flushPromises();
        expect(wrapper.find('iframe').attributes('srcdoc')).toContain('<p>b</p>');
    });

    it('renders a loading state while loading prop is true', () => {
        const wrapper = mount(PreviewIframe, { props: { html: '', loading: true } });
        expect(wrapper.find('.preview-iframe__loading').exists()).toBe(true);
    });

    it('hides loading state when loading is false', () => {
        const wrapper = mount(PreviewIframe, { props: { html: '<p>x</p>', loading: false } });
        expect(wrapper.find('.preview-iframe__loading').exists()).toBe(false);
    });
});
