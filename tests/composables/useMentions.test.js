import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';
import { useMentions } from '../../src/composables/useMentions';

// Helper component to test the composable
const TestComponent = defineComponent({
    setup() {
        const mentions = useMentions({ debounce: 0 });
        return { ...mentions };
    },
    template: '<div></div>',
});

describe('useMentions', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns expected properties', () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        expect(vm.suggestions).toBeDefined();
        expect(vm.isActive).toBe(false);
        expect(vm.query).toBe('');
        expect(vm.loading).toBe(false);
        expect(typeof vm.onTextChange).toBe('function');
        expect(typeof vm.insertMention).toBe('function');
        expect(typeof vm.close).toBe('function');
    });

    it('activates when @ is detected at word boundary', async () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        // Mock textarea
        const textarea = { selectionStart: 5 };
        vm.onTextChange(textarea, 'Hey @Ali');

        // isActive should be true immediately (query detection is sync)
        expect(vm.isActive).toBe(true);
    });

    it('does not activate for @ in middle of word', async () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        const textarea = { selectionStart: 10 };
        vm.onTextChange(textarea, 'test@email');

        expect(vm.isActive).toBe(false);
    });

    it('closes when no @ pattern found', () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        // First activate
        const textarea = { selectionStart: 5 };
        vm.onTextChange(textarea, 'Hey @A');
        expect(vm.isActive).toBe(true);

        // Then type something without @
        textarea.selectionStart = 8;
        vm.onTextChange(textarea, 'Hey text');
        expect(vm.isActive).toBe(false);
    });

    it('insertMention replaces the mention token with @{Name}', () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        // Simulate typing @Ali
        const textarea = { selectionStart: 8 };
        vm.onTextChange(textarea, 'Hey @Ali');

        const result = vm.insertMention('Hey @Ali', { id: 1, name: 'Alice Agent' });
        expect(result).toBe('Hey @{Alice Agent} ');
    });

    it('insertMention preserves text after the mention', () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        const textarea = { selectionStart: 8 };
        vm.onTextChange(textarea, 'Hey @Ali please review');

        const result = vm.insertMention('Hey @Ali please review', { id: 1, name: 'Alice Agent' });
        expect(result).toBe('Hey @{Alice Agent}  please review');
    });

    it('close resets all state', () => {
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;

        // Activate
        const textarea = { selectionStart: 5 };
        vm.onTextChange(textarea, 'Hey @A');
        expect(vm.isActive).toBe(true);

        // Close
        vm.close();
        expect(vm.isActive).toBe(false);
        expect(vm.suggestions).toEqual([]);
        expect(vm.query).toBe('');
    });
});
