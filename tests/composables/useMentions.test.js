import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useMentions } from '../../src/composables/useMentions';

// Stub fetch — empty queries (cursor positioned right after `@`) bypass the
// debounce timer in useMentions and fire fetchSuggestions synchronously.
// Without a stub, happy-dom would attempt a real request to localhost:3000.
vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
    }),
);

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

    it('keeps the current suggestions visible while the next keystroke is debounced', async () => {
        vi.useFakeTimers();
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: true, json: async () => [{ id: 1, name: 'Alice' }] })),
        );
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;
        vm.onTextChange({ selectionStart: 1 }, '@');
        await vi.runAllTimersAsync();
        expect(vm.suggestions).toEqual([{ id: 1, name: 'Alice' }]);

        vm.onTextChange({ selectionStart: 2 }, '@A');

        expect(vm.suggestions).toEqual([{ id: 1, name: 'Alice' }]);
        expect(vm.loading).toBe(true);
        await vi.runAllTimersAsync();
        expect(vm.loading).toBe(false);
        vi.unstubAllGlobals();
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

describe('mention request lifecycle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('ignores a previous query even while the next query is debouncing', async () => {
        let resolve;
        vi.stubGlobal(
            'fetch',
            vi.fn(
                () =>
                    new Promise((r) => {
                        resolve = r;
                    }),
            ),
        );
        const wrapper = mount(TestComponent);
        wrapper.vm.onTextChange({ selectionStart: 1 }, '@');
        wrapper.vm.onTextChange({ selectionStart: 2 }, '@A');
        resolve({ ok: true, json: async () => [{ name: 'Old agent' }] });
        await vi.advanceTimersByTimeAsync(0);
        expect(wrapper.vm.suggestions).toEqual([]);
        wrapper.unmount();
    });

    it.each(['close', 'unmount'])('ignores responses after %s', async (action) => {
        let resolve;
        vi.stubGlobal(
            'fetch',
            vi.fn(
                () =>
                    new Promise((r) => {
                        resolve = r;
                    }),
            ),
        );
        const wrapper = mount(TestComponent);
        const vm = wrapper.vm;
        vm.onTextChange({ selectionStart: 1 }, '@');
        if (action === 'close') vm.close();
        else wrapper.unmount();
        resolve({ ok: true, json: async () => [{ name: 'Late agent' }] });
        await nextTick();
        await nextTick();
        await nextTick();
        expect(vm.suggestions).toEqual([]);
        expect(vm.loading).toBe(false);
        if (action === 'close') wrapper.unmount();
    });
});
