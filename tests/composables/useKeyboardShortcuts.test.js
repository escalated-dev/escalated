import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useKeyboardShortcuts } from '../../src/composables/useKeyboardShortcuts.js';

/**
 * Helper: mount a tiny wrapper component that calls useKeyboardShortcuts
 * with the given shortcuts map and options, then return the wrapper.
 */
function mountWithShortcuts(shortcuts, options = {}) {
    return mount({
        template: '<div>test</div>',
        setup() {
            useKeyboardShortcuts(shortcuts, options);
            return {};
        },
    });
}

/**
 * Helper: dispatch a keydown event on the document.
 */
function pressKey(key, extras = {}) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...extras,
    });
    document.dispatchEvent(event);
    return event;
}

describe('useKeyboardShortcuts', () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
            wrapper = null;
        }
    });

    // ----------------------------------------------------------------
    // Basic registration
    // ----------------------------------------------------------------
    describe('event listener lifecycle', () => {
        it('registers a keydown event listener on mount', () => {
            const addSpy = vi.spyOn(document, 'addEventListener');

            wrapper = mountWithShortcuts({ r: vi.fn() });

            expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            addSpy.mockRestore();
        });

        it('removes the keydown event listener on unmount', () => {
            const removeSpy = vi.spyOn(document, 'removeEventListener');

            wrapper = mountWithShortcuts({ r: vi.fn() });
            wrapper.unmount();
            wrapper = null;

            expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            removeSpy.mockRestore();
        });
    });

    // ----------------------------------------------------------------
    // Handler invocation
    // ----------------------------------------------------------------
    describe('shortcut handler calls', () => {
        it('calls the correct handler for a registered shortcut key', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r');

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('passes the KeyboardEvent to the handler', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r');

            expect(handler).toHaveBeenCalledWith(expect.any(KeyboardEvent));
        });

        it('calls different handlers for different keys', () => {
            const handlerR = vi.fn();
            const handlerN = vi.fn();
            wrapper = mountWithShortcuts({ r: handlerR, n: handlerN });

            pressKey('r');
            pressKey('n');

            expect(handlerR).toHaveBeenCalledTimes(1);
            expect(handlerN).toHaveBeenCalledTimes(1);
        });

        it('does not call handler for unregistered keys', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('x');

            expect(handler).not.toHaveBeenCalled();
        });

        it('calls handler multiple times on repeated key presses', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ j: handler });

            pressKey('j');
            pressKey('j');
            pressKey('j');

            expect(handler).toHaveBeenCalledTimes(3);
        });

        it('prevents default on matched key', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            const event = new KeyboardEvent('keydown', {
                key: 'r',
                bubbles: true,
                cancelable: true,
            });
            const preventSpy = vi.spyOn(event, 'preventDefault');
            document.dispatchEvent(event);

            expect(preventSpy).toHaveBeenCalled();
        });
    });

    // ----------------------------------------------------------------
    // Form element filtering
    // ----------------------------------------------------------------
    describe('ignoring events from form elements', () => {
        it('ignores events when target is an INPUT element', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            const event = new KeyboardEvent('keydown', {
                key: 'r',
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, 'target', { value: input });
            document.dispatchEvent(event);

            expect(handler).not.toHaveBeenCalled();
            document.body.removeChild(input);
        });

        it('ignores events when target is a TEXTAREA element', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            const event = new KeyboardEvent('keydown', {
                key: 'r',
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, 'target', { value: textarea });
            document.dispatchEvent(event);

            expect(handler).not.toHaveBeenCalled();
            document.body.removeChild(textarea);
        });

        it('ignores events when target is a SELECT element', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            const select = document.createElement('select');
            document.body.appendChild(select);

            const event = new KeyboardEvent('keydown', {
                key: 'r',
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(event, 'target', { value: select });
            document.dispatchEvent(event);

            expect(handler).not.toHaveBeenCalled();
            document.body.removeChild(select);
        });

        it('ignores events when target is contentEditable', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            const div = document.createElement('div');
            div.contentEditable = 'true';
            document.body.appendChild(div);

            const event = new KeyboardEvent('keydown', {
                key: 'r',
                bubbles: true,
                cancelable: true,
            });
            // Override target to return our contentEditable div.
            // Also ensure isContentEditable is true on the fake target.
            const fakeTarget = Object.create(div, {
                isContentEditable: { value: true },
                tagName: { value: 'DIV' },
            });
            Object.defineProperty(event, 'target', { value: fakeTarget });
            document.dispatchEvent(event);

            expect(handler).not.toHaveBeenCalled();
            document.body.removeChild(div);
        });
    });

    // ----------------------------------------------------------------
    // Modifier key filtering
    // ----------------------------------------------------------------
    describe('ignoring events with modifier keys', () => {
        it('ignores events when ctrlKey is held', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r', { ctrlKey: true });

            expect(handler).not.toHaveBeenCalled();
        });

        it('ignores events when metaKey is held', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r', { metaKey: true });

            expect(handler).not.toHaveBeenCalled();
        });

        it('ignores events when altKey is held', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r', { altKey: true });

            expect(handler).not.toHaveBeenCalled();
        });

        it('does NOT ignore events when only shiftKey is held', () => {
            // The composable only blocks ctrl/meta/alt, not shift (for ? key etc.)
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ '?': handler });

            pressKey('?', { shiftKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    // ----------------------------------------------------------------
    // Enabled/disabled state
    // ----------------------------------------------------------------
    describe('enabled/disabled state', () => {
        it('calls handler when enabled ref is true', () => {
            const enabled = ref(true);
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler }, { enabled });

            pressKey('r');

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('does not call handler when enabled ref is false', () => {
            const enabled = ref(false);
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler }, { enabled });

            pressKey('r');

            expect(handler).not.toHaveBeenCalled();
        });

        it('responds to reactive changes in enabled state', async () => {
            const enabled = ref(true);
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler }, { enabled });

            pressKey('r');
            expect(handler).toHaveBeenCalledTimes(1);

            // Disable
            enabled.value = false;
            await nextTick();

            pressKey('r');
            expect(handler).toHaveBeenCalledTimes(1); // Still 1 — not called again

            // Re-enable
            enabled.value = true;
            await nextTick();

            pressKey('r');
            expect(handler).toHaveBeenCalledTimes(2);
        });

        it('works when enabled option is not provided (defaults to enabled)', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            pressKey('r');

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('supports raw boolean value for enabled (not just ref)', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler }, { enabled: false });

            pressKey('r');

            expect(handler).not.toHaveBeenCalled();
        });
    });

    // ----------------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------------
    describe('cleanup on unmount', () => {
        it('does not fire handlers after component is unmounted', () => {
            const handler = vi.fn();
            wrapper = mountWithShortcuts({ r: handler });

            // Works while mounted
            pressKey('r');
            expect(handler).toHaveBeenCalledTimes(1);

            // Unmount
            wrapper.unmount();
            wrapper = null;

            // Should not fire
            pressKey('r');
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
