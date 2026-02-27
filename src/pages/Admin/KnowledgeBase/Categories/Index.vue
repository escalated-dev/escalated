<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import CategoryTree from '../../../../components/CategoryTree.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    categories: Array,
});

const showForm = ref(false);
const editing = ref(null);

const form = useForm({
    name: '',
    slug: '',
    parent_id: '',
    position: 0,
    description: '',
});

const isEditing = computed(() => !!editing.value);

function openCreate() {
    editing.value = null;
    form.reset();
    showForm.value = true;
}

function openEdit(category) {
    editing.value = category;
    form.name = category.name;
    form.slug = category.slug;
    form.parent_id = category.parent_id || '';
    form.position = category.position || 0;
    form.description = category.description || '';
    showForm.value = true;
}

function submit() {
    if (isEditing.value) {
        form.put(route('escalated.admin.kb-categories.update', editing.value.id), {
            onSuccess: () => {
                showForm.value = false;
                form.reset();
                editing.value = null;
            },
        });
    } else {
        form.post(route('escalated.admin.kb-categories.store'), {
            onSuccess: () => {
                showForm.value = false;
                form.reset();
            },
        });
    }
}

function deleteCategory(category) {
    if (confirm(`Delete category "${category.name}"?`)) {
        router.delete(route('escalated.admin.kb-categories.destroy', category.id));
    }
}

const parentOptions = computed(() => {
    if (!editing.value) return props.categories;
    return props.categories.filter((c) => c.id !== editing.value.id);
});
</script>

<template>
    <EscalatedLayout title="Knowledge Base — Categories">
        <div class="mb-6 flex items-center justify-between">
            <p class="text-sm text-neutral-500">Organize your knowledge base articles into categories.</p>
            <button
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90"
                @click="openCreate"
            >
                New Category
            </button>
        </div>

        <!-- Inline form -->
        <div v-if="showForm" class="mb-6 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
            <h3 class="mb-4 text-sm font-semibold text-neutral-200">
                {{ isEditing ? 'Edit Category' : 'New Category' }}
            </h3>
            <form class="space-y-4" @submit.prevent="submit">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="mb-1 block text-xs font-medium text-neutral-400">Name</label>
                        <input
                            v-model="form.name"
                            type="text"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                            placeholder="Category name"
                        />
                        <p v-if="form.errors.name" class="mt-1 text-xs text-red-400">{{ form.errors.name }}</p>
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-medium text-neutral-400">Slug</label>
                        <input
                            v-model="form.slug"
                            type="text"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                            placeholder="auto-generated-if-empty"
                        />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="mb-1 block text-xs font-medium text-neutral-400">Parent Category</label>
                        <select
                            v-model="form.parent_id"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        >
                            <option value="">None (Root)</option>
                            <option v-for="cat in parentOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-medium text-neutral-400">Position</label>
                        <input
                            v-model.number="form.position"
                            type="number"
                            min="0"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        />
                    </div>
                </div>
                <div>
                    <label class="mb-1 block text-xs font-medium text-neutral-400">Description</label>
                    <textarea
                        v-model="form.description"
                        rows="2"
                        class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        placeholder="Optional description..."
                    ></textarea>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {{ isEditing ? 'Update' : 'Create' }}
                    </button>
                    <button
                        type="button"
                        class="text-sm text-neutral-500 hover:text-neutral-300"
                        @click="showForm = false"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>

        <!-- Category Tree -->
        <CategoryTree :categories="categories" @edit="openEdit" @delete="deleteCategory" />

        <div
            v-if="!categories?.length && !showForm"
            class="rounded-xl border border-white/[0.06] bg-neutral-900/60 py-12 text-center"
        >
            <svg
                class="mx-auto mb-3 h-10 w-10 text-neutral-700"
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
            <p class="text-sm text-neutral-500">No categories yet. Create one to get started.</p>
        </div>
    </EscalatedLayout>
</template>
