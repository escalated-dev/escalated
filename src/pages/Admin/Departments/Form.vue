<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ department: { type: Object, default: null } });

const form = useForm({
    name: props.department?.name || '',
    slug: props.department?.slug || '',
    description: props.department?.description || '',
    is_active: props.department?.is_active ?? true,
});

function submit() {
    if (props.department) {
        form.put(route('escalated.admin.departments.update', props.department.id));
    } else {
        form.post(route('escalated.admin.departments.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="department ? 'Edit Department' : 'New Department'">
        <form
            class="mx-auto max-w-lg space-y-5 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
            </div>
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Slug</label>
                <input
                    v-model="form.slug"
                    type="text"
                    placeholder="Auto-generated if empty"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-gray-500 focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Description</label>
                <textarea
                    v-model="form.description"
                    rows="3"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                ></textarea>
            </div>
            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-[var(--esc-panel-text)] focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Active</span>
            </label>
            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ department ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
