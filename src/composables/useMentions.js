import { ref, onUnmounted } from 'vue';

/**
 * Composable that detects `@` typed in a text input/textarea,
 * fetches agent suggestions from the API (debounced), and provides
 * an insert function to replace the mention token.
 *
 * @param {Object} options
 * @param {string} [options.searchEndpoint] - API endpoint for agent search (default: route-based)
 * @param {number} [options.debounce=250] - Debounce delay in ms
 * @returns {Object}
 */
export function useMentions(options = {}) {
    const { debounce = 250 } = options;

    const suggestions = ref([]);
    const isActive = ref(false);
    const query = ref('');
    const mentionStart = ref(null); // cursor position where `@` was typed
    const loading = ref(false);

    let timer = null;

    function clearTimer() {
        if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
        }
    }

    /**
     * Call this on every input/keyup event with the textarea element
     * and the current text value.
     */
    function onTextChange(textareaEl, text) {
        if (!textareaEl) return;

        const cursorPos = textareaEl.selectionStart;
        const textBeforeCursor = text.slice(0, cursorPos);

        // Find the last `@` that starts a mention (preceded by whitespace or start of string)
        const mentionMatch = textBeforeCursor.match(/(?:^|[\s(])@([a-zA-Z0-9_ ]*)$/);

        if (mentionMatch) {
            const searchQuery = mentionMatch[1];
            // The @ is at cursorPos minus the matched group minus 1 for the @
            mentionStart.value = cursorPos - searchQuery.length - 1;
            query.value = searchQuery;
            isActive.value = true;
            debouncedFetch(searchQuery);
        } else {
            close();
        }
    }

    function debouncedFetch(searchQuery) {
        clearTimer();

        if (searchQuery.length < 1) {
            fetchSuggestions('');
            return;
        }

        timer = window.setTimeout(() => {
            fetchSuggestions(searchQuery);
        }, debounce);
    }

    async function fetchSuggestions(searchQuery) {
        loading.value = true;
        try {
            const endpoint = options.searchEndpoint || '/support/admin/agents/search';
            const url = `${endpoint}?q=${encodeURIComponent(searchQuery)}`;
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });
            if (response.ok) {
                suggestions.value = await response.json();
            } else {
                suggestions.value = [];
            }
        } catch {
            suggestions.value = [];
        } finally {
            loading.value = false;
        }
    }

    /**
     * Insert the selected agent mention into the text.
     * Returns the new text value with the mention inserted.
     *
     * @param {string} currentText - Current textarea value
     * @param {Object} agent - Agent object with `name` property
     * @returns {string} Updated text
     */
    function insertMention(currentText, agent) {
        if (mentionStart.value === null) return currentText;

        const before = currentText.slice(0, mentionStart.value);
        const cursorPos = mentionStart.value + 1 + query.value.length;
        const after = currentText.slice(cursorPos);

        const mentionText = `@{${agent.name}} `;
        const newText = before + mentionText + after;

        close();
        return newText;
    }

    function close() {
        isActive.value = false;
        suggestions.value = [];
        query.value = '';
        mentionStart.value = null;
        clearTimer();
    }

    onUnmounted(clearTimer);

    return {
        suggestions,
        isActive,
        query,
        loading,
        onTextChange,
        insertMention,
        close,
    };
}
