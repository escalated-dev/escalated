<script setup>
import { ref } from 'vue';

defineProps({
    ticketReference: { type: String, required: true },
});

const emit = defineEmits(['insert-link', 'quote']);
const searchTerm = ref('');
const expanded = ref(true);

// Placeholder results for knowledge base integration
const results = ref([]);
const loading = ref(false);
let debounceTimer = null;

function onSearch(val) {
    window.clearTimeout(debounceTimer);
    if (!val || val.length < 2) {
        results.value = [];
        return;
    }
    debounceTimer = window.setTimeout(() => search(val), 300);
}

function search(term) {
    loading.value = true;
    // Placeholder: in production, this would call a knowledge base API
    results.value = [
        {
            id: 1,
            title: `How to resolve "${term}" issues`,
            excerpt: `This article explains common solutions for ${term}-related problems that customers frequently encounter.`,
            url: '#',
        },
        {
            id: 2,
            title: `${term} - FAQ`,
            excerpt: `Frequently asked questions about ${term} and related features.`,
            url: '#',
        },
        {
            id: 3,
            title: `Troubleshooting ${term}`,
            excerpt: `Step-by-step troubleshooting guide for ${term} problems.`,
            url: '#',
        },
    ];
    loading.value = false;
}

function insertLink(article) {
    emit('insert-link', article);
}

function quoteArticle(article) {
    emit('quote', article);
}
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4">
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
                v-model="searchTerm"
                type="text"
                placeholder="Search knowledge base..."
                class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="onSearch(searchTerm)"
            />

            <div v-if="loading" class="text-xs text-neutral-500">Searching...</div>

            <div v-else-if="results.length" class="space-y-2">
                <div
                    v-for="article in results"
                    :key="article.id"
                    class="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                    <h4 class="text-sm font-medium text-neutral-200">{{ article.title }}</h4>
                    <p class="mt-1 text-xs text-neutral-400 line-clamp-2">{{ article.excerpt }}</p>
                    <div class="mt-2 flex gap-2">
                        <button
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

            <div v-else-if="searchTerm.length >= 2 && !loading" class="text-xs text-neutral-500">
                No articles found.
            </div>

            <div v-else class="text-xs text-neutral-500">Search for articles to help resolve this ticket.</div>
        </div>
    </div>
</template>
