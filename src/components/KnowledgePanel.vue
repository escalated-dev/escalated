<script setup>
import { computed, ref } from 'vue';
import { useKbSearch, KB_MIN_QUERY } from '../composables/useKbSearch';
import { routeOr } from '../utils/agentApi';

/**
 * Knowledge-base search beside a ticket. It searches the host's real
 * knowledge base (`escalated.agent.kb.search`, or `searchUrl`) and renders
 * nothing when there is none to search: it never shows made-up articles.
 */
const props = defineProps({
    ticketReference: { type: String, required: true },
    /** The KB search URL. Defaults to the host's `escalated.agent.kb.search` route. */
    searchUrl: { type: String, default: null },
});

const emit = defineEmits(['insert-link', 'quote']);
const expanded = ref(true);

const url = computed(() => props.searchUrl ?? routeOr('escalated.agent.kb.search'));
const { query: searchTerm, results, loading, failed, searched, search } = useKbSearch(() => url.value);

function onSearch(event) {
    search(event.target.value);
}

function insertLink(article) {
    emit('insert-link', article);
}

function quoteArticle(article) {
    emit('quote', article);
}
</script>

<template>
    <div
        v-if="url"
        class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4"
        data-testid="esc-knowledge-panel"
    >
        <button
            class="flex w-full items-center justify-between text-sm font-semibold text-neutral-200"
            @click="expanded = !expanded"
        >
            <span>Knowledge Base</span>
            <svg
                :class="['h-4 w-4 text-neutral-500 transition-transform', expanded && 'rotate-180']"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <div v-if="expanded" class="mt-3 space-y-3">
            <input
                :value="searchTerm"
                type="search"
                aria-label="Search knowledge base"
                placeholder="Search knowledge base..."
                class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="onSearch"
            />

            <div v-if="loading" class="text-xs text-neutral-500">Searching...</div>

            <div v-else-if="results.length" class="space-y-2">
                <div
                    v-for="article in results"
                    :key="article.id"
                    class="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                    <h4 class="text-sm font-medium text-neutral-200">{{ article.title }}</h4>
                    <p v-if="article.excerpt" class="mt-1 text-xs text-neutral-400 line-clamp-2">
                        {{ article.excerpt }}
                    </p>
                    <!-- Internal (agent-only) articles are never offered for the reply. -->
                    <div v-if="!article.internal" class="mt-2 flex gap-2">
                        <button
                            v-if="article.url"
                            class="rounded px-2 py-0.5 text-[10px] font-medium text-cyan-400 ring-1 ring-cyan-500/20 transition-colors hover:bg-cyan-500/10"
                            @click="insertLink(article)"
                        >
                            Insert Link
                        </button>
                        <button
                            class="rounded px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/20 transition-colors hover:bg-violet-500/10"
                            @click="quoteArticle(article)"
                        >
                            Quote
                        </button>
                    </div>
                </div>
            </div>

            <div v-else-if="failed" class="text-xs text-neutral-500">Search failed. Try again.</div>

            <div v-else-if="searched && searchTerm.trim().length >= KB_MIN_QUERY" class="text-xs text-neutral-500">
                No articles found.
            </div>

            <div v-else class="text-xs text-neutral-500">Search for articles to help resolve this ticket.</div>
        </div>
    </div>
</template>
