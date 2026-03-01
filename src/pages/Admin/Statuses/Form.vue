<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    status: { type: Object, default: null },
    categories: { type: Array, default: () => ['new', 'open', 'pending', 'on_hold', 'solved'] },
});

const categoryLabels = {
    new: 'New',
    open: 'Open',
    pending: 'Pending',
    on_hold: 'On-Hold',
    solved: 'Solved',
};

const form = useForm({
    label: props.status?.label || '',
    category: props.status?.category || 'open',
    color: props.status?.color || '#6b7280',
    description: props.status?.description || '',
    position: props.status?.position ?? 0,
    is_default: props.status?.is_default ?? false,
});

function submit() {
    if (props.status) {
        form.put(route('escalated.admin.statuses.update', props.status.id));
    } else {
        form.post(route('escalated.admin.statuses.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="status ? 'Edit Status' : 'New Status'">
        <form
            class="mx-auto max-w-lg space-y-5 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Label</label>
                <input
                    v-model="form.label"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <div v-if="form.errors.label" class="mt-1 text-sm text-rose-400">{{ form.errors.label }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Category</label>
                <select
                    v-model="form.category"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryLabels[cat] || cat }}</option>
                </select>
                <div v-if="form.errors.category" class="mt-1 text-sm text-rose-400">{{ form.errors.category }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Color</label>
                <input
                    v-model="form.color"
                    type="color"
                    class="mt-1 h-10 w-16 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)]"
                />
                <div v-if="form.errors.color" class="mt-1 text-sm text-rose-400">{{ form.errors.color }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Description</label>
                <textarea
                    v-model="form.description"
                    rows="2"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                ></textarea>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Position</label>
                <input
                    v-model.number="form.position"
                    type="number"
                    min="0"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
            </div>

            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_default"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-cyan-500 focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Default status for this category</span>
            </label>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ status ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
