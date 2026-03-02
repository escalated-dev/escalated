<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import PermissionMatrix from '../../../components/PermissionMatrix.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    role: { type: Object, default: null },
    permissions: { type: Object, default: () => ({}) },
});

const form = useForm({
    name: props.role?.name || '',
    description: props.role?.description || '',
    permissions: props.role?.permissions?.map((p) => p.id) || [],
});

function submit() {
    if (props.role) {
        form.put(route('escalated.admin.roles.update', props.role.id));
    } else {
        form.post(route('escalated.admin.roles.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="role ? 'Edit Role' : 'New Role'">
        <form
            class="mx-auto max-w-3xl space-y-5 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
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
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Description</label>
                <textarea
                    v-model="form.description"
                    rows="2"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                ></textarea>
            </div>

            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Permissions</label>
                <PermissionMatrix v-model="form.permissions" :permissions="permissions" />
                <div v-if="form.errors.permissions" class="mt-1 text-sm text-rose-400">
                    {{ form.errors.permissions }}
                </div>
            </div>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ role ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
