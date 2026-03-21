import { ref, watch, onUnmounted } from 'vue';

/**
 * Composable that debounces a reactive search term and invokes a callback.
 *
 * @param {Function} callback - Called with the search term value after the debounce delay.
 * @param {number} [delay=300] - Debounce delay in milliseconds.
 * @returns {{ searchTerm: import('vue').Ref<string>, clearSearch: () => void }}
 */
export function useDebouncedSearch(callback, delay = 300) {
    const searchTerm = ref('');
    let timer = null;

    function clearTimer() {
        if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
        }
    }

    watch(searchTerm, (val) => {
        clearTimer();
        if (!val || val.length < 2) {
            callback(null);
            return;
        }
        timer = window.setTimeout(() => callback(val), delay);
    });

    function clearSearch() {
        clearTimer();
        searchTerm.value = '';
    }

    onUnmounted(clearTimer);

    return { searchTerm, clearSearch };
}
