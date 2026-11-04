import { onMounted, onUnmounted, unref } from 'vue';

// How long the first key of a sequence ("g" in "g i") waits for the second.
const SEQUENCE_TIMEOUT_MS = 1000;

/**
 * Composable for registering keyboard shortcuts.
 *
 * Keys are matched against `event.key`. A key containing a space is a
 * two-key sequence: `'g i'` runs when `g` is pressed and then `i` within a
 * second. While a sequence is pending, its second key does not also run a
 * single-key shortcut of the same name.
 *
 * @param {Object} shortcuts - Map of key to handler function, e.g. { r: () => {}, 'g i': () => {} }
 * @param {Object} options - Optional configuration
 * @param {import('vue').Ref<boolean>} options.enabled - Ref controlling whether shortcuts are active (default: true)
 */
export function useKeyboardShortcuts(shortcuts, options = {}) {
    const ignoredTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

    let pending = null;
    let pendingTimer = null;

    function clearPending() {
        pending = null;
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
        }
    }

    function startsSequence(key) {
        const prefix = `${key} `;
        return Object.keys(shortcuts).some((name) => name.startsWith(prefix));
    }

    function run(handler, event) {
        if (typeof handler !== 'function') return false;
        event.preventDefault();
        handler(event);
        return true;
    }

    function handleKeydown(event) {
        if (event.defaultPrevented || event.isComposing || event.keyCode === 229) return;

        // Check if shortcuts are enabled
        if (options.enabled !== undefined && !unref(options.enabled)) {
            clearPending();
            return;
        }

        // Skip when focus is inside form elements or contenteditable
        const target = event.target;
        if (target && (ignoredTags.has(target.tagName) || target.isContentEditable)) {
            clearPending();
            return;
        }

        // Skip if modifier keys are held (allow shift for ? and similar)
        if (event.ctrlKey || event.metaKey || event.altKey) {
            clearPending();
            return;
        }

        const key = event.key;

        if (pending !== null) {
            const sequence = shortcuts[`${pending} ${key}`];
            clearPending();
            if (run(sequence, event)) return;
        }

        if (startsSequence(key)) {
            event.preventDefault();
            pending = key;
            pendingTimer = setTimeout(clearPending, SEQUENCE_TIMEOUT_MS);
            return;
        }

        run(shortcuts[key], event);
    }

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        clearPending();
        document.removeEventListener('keydown', handleKeydown);
    });
}
