import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import ChatComposer from '../../src/components/ChatComposer.vue';

function mountComposer(props = {}, dark = false) {
    return mount(ChatComposer, {
        props: {
            ...props,
        },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('ChatComposer', () => {
    describe('send on enter', () => {
        it('emits send event on Enter key', async () => {
            const wrapper = mountComposer();
            const textarea = wrapper.find('textarea');

            await textarea.setValue('Hello world');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: false });

            expect(wrapper.emitted('send')).toBeTruthy();
            expect(wrapper.emitted('send')[0][0].body).toBe('Hello world');
        });

        it('does not send on Shift+Enter', async () => {
            const wrapper = mountComposer();
            const textarea = wrapper.find('textarea');

            await textarea.setValue('Hello');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: true });

            expect(wrapper.emitted('send')).toBeFalsy();
        });

        it('does not send when input is empty', async () => {
            const wrapper = mountComposer();
            const textarea = wrapper.find('textarea');

            await textarea.setValue('');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: false });

            expect(wrapper.emitted('send')).toBeFalsy();
        });
    });

    describe('disabled state', () => {
        it('disables textarea when disabled prop is true', () => {
            const wrapper = mountComposer({ disabled: true });
            const textarea = wrapper.find('textarea');
            expect(textarea.attributes('disabled')).toBeDefined();
        });

        it('disables send button when disabled', () => {
            const wrapper = mountComposer({ disabled: true });
            const sendBtn = wrapper.find('button[aria-label="Send message"]');
            expect(sendBtn.attributes('disabled')).toBeDefined();
        });
    });

    describe('internal note toggle', () => {
        it('shows note toggle when allowNotes is true', () => {
            const wrapper = mountComposer({ allowNotes: true });
            expect(wrapper.text()).toContain('Note');
        });

        it('hides note toggle when allowNotes is false', () => {
            const wrapper = mountComposer({ allowNotes: false });
            // Should not show the internal note toggle button
            const noteBtn = wrapper.find('button[aria-label="Internal note"]');
            expect(noteBtn.exists()).toBe(false);
        });

        it('toggles note mode on click', async () => {
            const wrapper = mountComposer({ allowNotes: true });
            const noteBtn = wrapper.find('button[aria-label="Internal note"]');
            await noteBtn.trigger('click');

            // Should change styling to note mode (yellow in light mode)
            expect(noteBtn.classes().join(' ')).toContain('yellow');
        });
    });

    describe('typing indicator', () => {
        it('emits typing event on input', async () => {
            const wrapper = mountComposer();
            const textarea = wrapper.find('textarea');

            await textarea.setValue('t');
            await textarea.trigger('input');

            expect(wrapper.emitted('typing')).toBeTruthy();
        });
    });

    describe('attachment button', () => {
        it('shows attachment button by default', () => {
            const wrapper = mountComposer();
            const attachBtn = wrapper.find('button[aria-label="Attach file"]');
            expect(attachBtn.exists()).toBe(true);
        });

        it('hides attachment button when allowAttachments is false', () => {
            const wrapper = mountComposer({ allowAttachments: false });
            const attachBtn = wrapper.find('button[aria-label="Attach file"]');
            expect(attachBtn.exists()).toBe(false);
        });
    });

    describe('clears input after send', () => {
        it('clears textarea after sending', async () => {
            const wrapper = mountComposer();
            const textarea = wrapper.find('textarea');

            await textarea.setValue('Test message');
            await textarea.trigger('keydown', { key: 'Enter', shiftKey: false });

            expect(textarea.element.value).toBe('');
        });
    });
});
