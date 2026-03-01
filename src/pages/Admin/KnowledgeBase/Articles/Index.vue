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
                    class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <select
                    v-model="status"
                    class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
                <select
                    v-model="categoryId"
                    class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                >
                    <option value="">All Categories</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>
            <Link
                :href="route('escalated.admin.kb-articles.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-opacity hover:opacity-90"
            >
                New Article
            </Link>
        </div>

        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Title
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Category
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Status
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Views
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Helpful
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Date
                        </th>
                        <th
                            class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-for="article in articles.data" :key="article.id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.kb-articles.edit', article.id)"
                                class="text-sm font-medium text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                {{ article.title }}
                            </Link>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ article.category?.name || '—' }}
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="[
                                    'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                                    statusColors[article.status] || 'text-[var(--esc-panel-text-tertiary)]',
                                ]"
                            >
                                {{ article.status }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ article.view_count }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ article.helpful_count }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-muted)]">
                            {{ article.created_at ? new Date(article.created_at).toLocaleDateString() : '—' }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('escalated.admin.kb-articles.edit', article.id)"
                                class="mr-2 text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                            >
                                Edit
                            </Link>
                            <button class="text-sm text-red-500/60 hover:text-red-400" @click="deleteArticle(article)">
                                Delete
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!articles.data?.length">
                        <td colspan="7" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No articles found.
                        </td>
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
                        ? 'bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] text-white'
                        : link.url
                          ? 'border border-[var(--esc-panel-border)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]'
                          : 'cursor-default text-[var(--esc-panel-text-muted)]',
                ]"
                preserve-scroll
            >
                <!-- eslint-disable-next-line vue/no-v-html --><span v-html="link.label" />
            </Link>
        </div>
    </EscalatedLayout>
</template>
