<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ rule: { type: Object, default: null } });

const form = useForm({
    name: props.rule?.name || '',
    description: props.rule?.description || '',
    trigger_type: props.rule?.trigger_type || 'time_based',
    conditions: props.rule?.conditions || [{ field: '', value: '' }],
    actions: props.rule?.actions || [{ type: '', value: '' }],
    order: props.rule?.order ?? 0,
    is_active: props.rule?.is_active ?? true,
});

function addCondition() {
    form.conditions.push({ field: '', value: '' });
}
function removeCondition(idx) {
    form.conditions.splice(idx, 1);
}
function addAction() {
    form.actions.push({ type: '', value: '' });
}
function removeAction(idx) {
    form.actions.splice(idx, 1);
}

function submit() {
    if (props.rule) {
        form.put(route('escalated.admin.escalation-rules.update', props.rule.id));
    } else {
        form.post(route('escalated.admin.escalation-rules.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="rule ? 'Edit Escalation Rule' : 'New Escalation Rule'">
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
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Trigger Type</label>
                <select
                    v-model="form.trigger_type"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option value="time_based">Time Based</option>
                    <option value="sla_breach">SLA Breach</option>
                    <option value="priority_based">Priority Based</option>
                </select>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">Conditions</label>
                    <button
                        type="button"
                        class="text-sm text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                        @click="addCondition"
                    >
                        + Add
                    </button>
                </div>
                <div v-for="(cond, idx) in form.conditions" :key="idx" class="mb-2 flex gap-2">
                    <select
                        v-model="cond.field"
                        class="w-1/2 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                    >
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                        <option value="assigned">Assignment</option>
                        <option value="age_hours">Age (hours)</option>
                        <option value="no_response_hours">No Response (hours)</option>
                        <option value="sla_breached">SLA Breached</option>
                    </select>
                    <input
                        v-model="cond.value"
                        class="w-1/2 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-gray-500 focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        placeholder="Value"
                    />
                    <button type="button" class="text-rose-400 hover:text-rose-300" @click="removeCondition(idx)">
                        &times;
                    </button>
                </div>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">Actions</label>
                    <button
                        type="button"
                        class="text-sm text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                        @click="addAction"
                    >
                        + Add
                    </button>
                </div>
                <div v-for="(action, idx) in form.actions" :key="idx" class="mb-2 flex gap-2">
                    <select
                        v-model="action.type"
                        class="w-1/2 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                    >
                        <option value="escalate">Escalate</option>
                        <option value="change_priority">Change Priority</option>
                        <option value="assign_to">Assign To</option>
                        <option value="change_department">Change Department</option>
                    </select>
                    <input
                        v-model="action.value"
                        class="w-1/2 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-gray-500 focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        placeholder="Value"
                    />
                    <button type="button" class="text-rose-400 hover:text-rose-300" @click="removeAction(idx)">
                        &times;
                    </button>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Order</label>
                <input
                    v-model.number="form.order"
                    type="number"
                    min="0"
                    class="mt-1 w-24 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
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
                    {{ rule ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
