<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ tags: Array });

const showForm = ref(false);
const editingTag = ref(null);

const form = useForm({ name: '', color: '#06b6d4' });

function createTag() {
    form.post(route('escalated.admin.tags.store'), {
        onSuccess: () => {
            form.reset();
            showForm.value = false;
        },
    });
}

function startEdit(tag) {
    editingTag.value = tag.id;
    form.name = tag.name;
    form.color = tag.color;
}

function updateTag(id) {
    form.put(route('escalated.admin.tags.update', id), {
        onSuccess: () => {
            editingTag.value = null;
            form.reset();
        },
    });
}

function destroy(id) {
    if (confirm('Delete this tag?')) {
        router.delete(route('escalated.admin.tags.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Tags">
        <div class="mb-4 flex justify-end">
            <button
                :class="
                    showForm
                        ? 'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]'
                        : 'rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]'
                "
                @click="showForm = !showForm"
            >
                {{ showForm ? 'Cancel' : 'Add Tag' }}
            </button>
        </div>
        <form
            v-if="showForm"
            class="mb-6 flex items-end gap-3 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4"
            @submit.prevent="createTag"
        >
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Color</label>
                <input
                    v-model="form.color"
                    type="color"
                    class="mt-1 h-10 w-16 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)]"
                />
            </div>
            <button
                type="submit"
                :disabled="form.processing"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
            >
                Create
            </button>
        </form>
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Color
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Name
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Tickets
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!tags?.length">
                        <td colspan="4" class="px-4 py-12 text-center">
                            <svg
                                class="mx-auto mb-3 h-8 w-8 text-[var(--esc-panel-text-muted)]"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No tags yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Create tags to categorize and filter tickets
                            </p>
                        </td>
                    </tr>
                    <tr v-for="tag in tags" :key="tag.id" class="transition-colors hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3">
                            <span
                                class="inline-block h-4 w-4 rounded-full ring-1 ring-[var(--esc-panel-border-input)]"
                                :style="{ backgroundColor: tag.color }"
                            ></span>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            <template v-if="editingTag === tag.id">
                                <form class="flex items-center gap-2" @submit.prevent="updateTag(tag.id)">
                                    <input
                                        v-model="form.name"
                                        type="text"
                                        required
                                        class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                    />
                                    <input
                                        v-model="form.color"
                                        type="color"
                                        class="h-8 w-10 rounded border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)]"
                                    />
                                    <button
                                        type="submit"
                                        class="text-sm text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        class="text-sm text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                                        @click="editingTag = null"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </template>
                            <template v-else>{{ tag.name }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">{{ tag.tickets_count }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button
                                class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                @click="startEdit(tag)"
                            >
                                Edit
                            </button>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(tag.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
