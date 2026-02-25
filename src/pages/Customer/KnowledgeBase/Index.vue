<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const props = defineProps({
    categories: Array,
    articles: Object,
    filters: Object,
});

const search = ref(props.filters?.search || '');
const selectedCategory = ref(props.filters?.category || '');

let debounceTimer;
function applyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        router.get(
            route('escalated.customer.kb.index'),
            {
                search: search.value || undefined,
                category: selectedCategory.value || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);
}

watch([search, selectedCategory], applyFilters);
</script>

<template>
    <EscalatedLayout title="Knowledge Base">
        <!-- Search -->
        <div class="mb-8 text-center">
            <h1 class="mb-3 text-2xl font-bold text-gray-900">How can we help you?</h1>
            <div class="mx-auto max-w-lg">
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search articles..."
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>
        </div>

        <!-- Categories -->
        <div v-if="categories?.length && !search" class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
                v-for="cat in categories"
                :key="cat.id"
                :class="[
                    'rounded-lg border p-5 text-left transition-all',
                    selectedCategory == cat.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                ]"
                @click="selectedCategory = selectedCategory == cat.id ? '' : cat.id"
            >
                <div class="flex items-center gap-3">
                    <div
                        :class="[
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            selectedCategory == cat.id ? 'bg-indigo-100' : 'bg-gray-100',
                        ]"
                    >
                        <svg
                            :class="['h-5 w-5', selectedCategory == cat.id ? 'text-indigo-600' : 'text-gray-500']"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3
                            :class="[
                                'text-sm font-semibold',
                                selectedCategory == cat.id ? 'text-indigo-900' : 'text-gray-900',
                            ]"
                        >
                            {{ cat.name }}
                        </h3>
                        <p class="text-xs text-gray-500">{{ cat.articles_count }} articles</p>
                    </div>
                </div>
                <p v-if="cat.description" class="mt-2 text-xs text-gray-500">{{ cat.description }}</p>
            </button>
        </div>

        <!-- Articles -->
        <div class="space-y-3">
            <Link
                v-for="article in articles.data"
                :key="article.id"
                :href="route('escalated.customer.kb.show', article.slug)"
                class="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
            >
                <h3 class="text-sm font-semibold text-gray-900">{{ article.title }}</h3>
                <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span v-if="article.category">{{ article.category.name }}</span>
                    <span>{{ article.view_count }} views</span>
                </div>
            </Link>
        </div>

        <div v-if="!articles.data?.length" class="py-12 text-center">
            <svg
                class="mx-auto mb-3 h-10 w-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
            </svg>
            <p class="text-sm text-gray-500">No articles found.</p>
        </div>

        <!-- Pagination -->
        <div v-if="articles.links && articles.last_page > 1" class="mt-6 flex items-center justify-center gap-1">
            <Link
                v-for="link in articles.links"
                :key="link.label"
                :href="link.url || '#'"
                :class="[
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    link.active
                        ? 'bg-indigo-600 text-white'
                        : link.url
                          ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          : 'cursor-default text-gray-300',
                ]"
                preserve-scroll
            >
                <!-- eslint-disable-next-line vue/no-v-html --><span v-html="link.label" />
            </Link>
        </div>
    </EscalatedLayout>
</template>
