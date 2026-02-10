import { onMounted, onUnmounted, unref } from 'vue';

/**
 * Composable for registering keyboard shortcuts.
 *
 * @param {Object} shortcuts - Map of key to handler function, e.g. { 'r': () => {}, 'n': () => {} }
 * @param {Object} options - Optional configuration
 * @param {import('vue').Ref<boolean>} options.enabled - Ref controlling whether shortcuts are active (default: true)
 */
export function useKeyboardShortcuts(shortcuts, options = {}) {
    const ignoredTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

    function handleKeydown(event) {
        // Check if shortcuts are enabled
        if (options.enabled !== undefined && !unref(options.enabled)) {
            return;
        }

        // Skip when focus is inside form elements or contenteditable
        const target = event.target;
        if (target && (ignoredTags.has(target.tagName) || target.isContentEditable)) {
            return;
        }

        // Skip if modifier keys are held (allow shift for ? and similar)
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        const key = event.key;
        const handler = shortcuts[key];

        if (handler && typeof handler === 'function') {
            event.preventDefault();
            handler(event);
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown);
    });
}
