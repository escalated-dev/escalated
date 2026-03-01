<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    automation: { type: Object, default: null },
});

const conditionFields = [
    { value: 'hours_since_created', label: 'Hours since created' },
    { value: 'hours_since_updated', label: 'Hours since updated' },
    { value: 'hours_since_assigned', label: 'Hours since assigned' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assigned', label: 'Assignment' },
];

const actionTypes = [
    { value: 'change_status', label: 'Change status' },
    { value: 'assign', label: 'Assign to agent (ID)' },
    { value: 'add_tag', label: 'Add tag (name)' },
    { value: 'change_priority', label: 'Change priority' },
    { value: 'add_note', label: 'Add internal note' },
];

const form = useForm({
    name: props.automation?.name || '',
    conditions: props.automation?.conditions || [{ field: 'hours_since_updated', operator: '>', value: '' }],
    actions: props.automation?.actions || [{ type: 'change_status', value: '' }],
    active: props.automation?.active ?? true,
});

function addCondition() {
    form.conditions.push({ field: 'hours_since_updated', operator: '>', value: '' });
}

function removeCondition(index) {
    form.conditions.splice(index, 1);
}

function addAction() {
    form.actions.push({ type: 'change_status', value: '' });
}

function removeAction(index) {
    form.actions.splice(index, 1);
}

function submit() {
    if (props.automation) {
        form.put(route('escalated.admin.automations.update', props.automation.id));
    } else {
        form.post(route('escalated.admin.automations.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="automation ? 'Edit Automation' : 'Create Automation'">
        <form class="max-w-2xl space-y-6" @submit.prevent="submit">
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <p v-if="form.errors.name" class="mt-1 text-xs text-rose-400">{{ form.errors.name }}</p>
            </div>

            <!-- Conditions -->
            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                    >Conditions (ALL must match)</label
                >
                <div class="space-y-2">
                    <div v-for="(condition, i) in form.conditions" :key="i" class="flex items-center gap-2">
                        <select
                            v-model="condition.field"
                            class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                        >
                            <option v-for="f in conditionFields" :key="f.value" :value="f.value">{{ f.label }}</option>
                        </select>
                        <select
                            v-model="condition.operator"
                            class="w-16 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                        >
                            <option value=">">&gt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<">&lt;</option>
                            <option value="<=">&lt;=</option>
                            <option value="=">=</option>
                        </select>
                        <input
                            v-model="condition.value"
                            type="text"
                            placeholder="Value"
                            class="flex-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <button
                            v-if="form.conditions.length > 1"
                            type="button"
                            class="text-rose-400 hover:text-rose-300"
                            @click="removeCondition(i)"
                        >
                            &times;
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-2 text-xs text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                    @click="addCondition"
                >
                    + Add condition
                </button>
            </div>

            <!-- Actions -->
            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Actions</label>
                <div class="space-y-2">
                    <div v-for="(action, i) in form.actions" :key="i" class="flex items-center gap-2">
                        <select
                            v-model="action.type"
                            class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                        >
                            <option v-for="a in actionTypes" :key="a.value" :value="a.value">{{ a.label }}</option>
                        </select>
                        <input
                            v-model="action.value"
                            type="text"
                            placeholder="Value"
                            class="flex-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <button
                            v-if="form.actions.length > 1"
                            type="button"
                            class="text-rose-400 hover:text-rose-300"
                            @click="removeAction(i)"
                        >
                            &times;
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-2 text-xs text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                    @click="addAction"
                >
                    + Add action
                </button>
            </div>

            <div>
                <label class="flex items-center gap-2 text-sm text-[var(--esc-panel-text-secondary)]">
                    <input
                        v-model="form.active"
                        type="checkbox"
                        class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-cyan-500 focus:ring-cyan-500/20"
                    />
                    Active
                </label>
            </div>

            <div class="flex gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ automation ? 'Update' : 'Create' }}
                </button>
                <a
                    :href="route('escalated.admin.automations.index')"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                >
                    Cancel
                </a>
            </div>
        </form>
    </EscalatedLayout>
</template>
