<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import { router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    articles: Object,
    categories: Array,
    filters: Object,
});

const search = ref(props.filters?.search || '');
const status = ref(props.filters?.status || '');
const categoryId = ref(props.filters?.category_id || '');

let debounceTimer;
function applyFilters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        router.get(
            route('escalated.admin.kb-articles.index'),
            {
                search: search.value || undefined,
                status: status.value || undefined,
                category_id: categoryId.value || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);
}

watch([search, status, categoryId], applyFilters);

function deleteArticle(article) {
    if (confirm('Delete this article?')) {
        router.delete(route('escalated.admin.kb-articles.destroy', article.id));
    }
}

const statusColors = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};
</script>

<template>
    <EscalatedLayout title="Knowledge Base — Articles">
        <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search articles..."
                    class="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <select
                    v-model="status"
                    class="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
                <select
                    v-model="categoryId"
                    class="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                >
                    <option value="">All Categories</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>
            <Link
                :href="route('escalated.admin.kb-articles.create')"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90"
            >
                New Article
            </Link>
        </div>

        <div class="overflow-hidden rounded-xl border border-white/[0.06]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Title
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Category
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Status
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Views
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Helpful
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Date
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="article in articles.data" :key="article.id" class="hover:bg-white/[0.02]">
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.kb-articles.edit', article.id)"
                                class="text-sm font-medium text-neutral-200 hover:text-white"
                            >
                                {{ article.title }}
                            </Link>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ article.category?.name || '—' }}</td>
                        <td class="px-4 py-3">
                            <span
                                :class="[
                                    'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                                    statusColors[article.status] || 'text-neutral-400',
                                ]"
                            >
                                {{ article.status }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ article.view_count }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ article.helpful_count }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-500">
                            {{ article.created_at ? new Date(article.created_at).toLocaleDateString() : '—' }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('escalated.admin.kb-articles.edit', article.id)"
                                class="mr-2 text-sm text-neutral-500 hover:text-neutral-200"
                                >Edit</Link
                            >
                            <button class="text-sm text-red-500/60 hover:text-red-400" @click="deleteArticle(article)">
                                Delete
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!articles.data?.length">
                        <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">No articles found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="articles.links && articles.last_page > 1" class="mt-4 flex items-center justify-center gap-1">
            <Link
                v-for="link in articles.links"
                :key="link.label"
                :href="link.url || '#'"
                :class="[
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    link.active
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                        : link.url
                          ? 'border border-white/[0.06] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200'
                          : 'cursor-default text-neutral-600',
                ]"
                preserve-scroll
            >
                <!-- eslint-disable-next-line vue/no-v-html --><span v-html="link.label" />
            </Link>
        </div>
    </EscalatedLayout>
</template>
