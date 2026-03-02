<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import ArticleEditor from '../../../../components/ArticleEditor.vue';
import { useForm, Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    article: { type: Object, default: null },
    categories: Array,
});

const isEditing = computed(() => !!props.article);

const form = useForm({
    title: props.article?.title || '',
    slug: props.article?.slug || '',
    body: props.article?.body || '',
    status: props.article?.status || 'draft',
    category_id: props.article?.category_id || '',
});

function submit() {
    if (isEditing.value) {
        form.put(route('escalated.admin.kb-articles.update', props.article.id));
    } else {
        form.post(route('escalated.admin.kb-articles.store'));
    }
}

function generateSlug() {
    if (!form.slug && form.title) {
        form.slug = form.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
</script>

<template>
    <EscalatedLayout :title="isEditing ? 'Edit Article' : 'New Article'">
        <div class="mx-auto max-w-4xl">
            <div class="mb-6">
                <Link
                    :href="route('escalated.admin.kb-articles.index')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back to Articles
                </Link>
            </div>

            <form class="space-y-6" @submit.prevent="submit">
                <!-- Title -->
                <div>
                    <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Title</label>
                    <input
                        v-model="form.title"
                        type="text"
                        class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        placeholder="Article title"
                        @blur="generateSlug"
                    />
                    <p v-if="form.errors.title" class="mt-1 text-xs text-red-400">{{ form.errors.title }}</p>
                </div>

                <!-- Slug -->
                <div>
                    <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                        >Slug (SEO URL)</label
                    >
                    <input
                        v-model="form.slug"
                        type="text"
                        class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        placeholder="article-slug"
                    />
                    <p v-if="form.errors.slug" class="mt-1 text-xs text-red-400">{{ form.errors.slug }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Category -->
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Category</label
                        >
                        <select
                            v-model="form.category_id"
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        >
                            <option value="">No Category</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                        <p v-if="form.errors.category_id" class="mt-1 text-xs text-red-400">
                            {{ form.errors.category_id }}
                        </p>
                    </div>

                    <!-- Status -->
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Status</label
                        >
                        <select
                            v-model="form.status"
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                        <p v-if="form.errors.status" class="mt-1 text-xs text-red-400">{{ form.errors.status }}</p>
                    </div>
                </div>

                <!-- Body -->
                <div>
                    <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                        >Content</label
                    >
                    <ArticleEditor v-model="form.body" />
                    <p v-if="form.errors.body" class="mt-1 text-xs text-red-400">{{ form.errors.body }}</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {{ isEditing ? 'Update Article' : 'Create Article' }}
                    </button>
                    <Link
                        :href="route('escalated.admin.kb-articles.index')"
                        class="rounded-lg border border-[var(--esc-panel-border)] px-5 py-2.5 text-sm font-medium text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </EscalatedLayout>
</template>
