<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ policy: { type: Object, default: null }, priorities: Array });

const form = useForm({
    name: props.policy?.name || '',
    description: props.policy?.description || '',
    is_default: props.policy?.is_default ?? false,
    first_response_hours: props.policy?.first_response_hours || {},
    resolution_hours: props.policy?.resolution_hours || {},
    business_hours_only: props.policy?.business_hours_only ?? false,
    is_active: props.policy?.is_active ?? true,
});

function submit() {
    if (props.policy) {
        form.put(route('escalated.admin.sla-policies.update', props.policy.id));
    } else {
        form.post(route('escalated.admin.sla-policies.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="policy ? 'Edit SLA Policy' : 'New SLA Policy'">
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
                <h3 class="mb-2 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                    First Response Hours (by priority)
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="p in priorities" :key="p">
                        <label class="text-xs capitalize text-[var(--esc-panel-text-tertiary)]">{{ p }}</label>
                        <input
                            v-model.number="form.first_response_hours[p]"
                            type="number"
                            step="0.5"
                            min="0"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                </div>
            </div>
            <div>
                <h3 class="mb-2 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                    Resolution Hours (by priority)
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="p in priorities" :key="p">
                        <label class="text-xs capitalize text-[var(--esc-panel-text-tertiary)]">{{ p }}</label>
                        <input
                            v-model.number="form.resolution_hours[p]"
                            type="number"
                            step="0.5"
                            min="0"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                </div>
            </div>
            <label class="flex items-center gap-2">
                <input
                    v-model="form.business_hours_only"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-white focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Business hours only</span>
            </label>
            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_default"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-white focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Default policy</span>
            </label>
            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-white focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Active</span>
            </label>
            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ policy ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
