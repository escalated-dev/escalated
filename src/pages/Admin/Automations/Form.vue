<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, useForm } from '@inertiajs/vue3';

/**
 * Create and edit a time-based automation.
 *
 * The vocabulary here is the runner's: every field, operator and action type
 * below is one the backend actually evaluates. Offering anything else would
 * produce a rule that saves cleanly and then silently never matches.
 */
const props = defineProps({
    automation: { type: Object, default: null },
});

/** Fields that count hours take an operator and a number; the rest take a value. */
const TIME_FIELDS = ['hours_since_created', 'hours_since_updated', 'hours_since_assigned'];

const FIELDS = [
    { value: 'hours_since_created', label: 'Hours since created' },
    { value: 'hours_since_updated', label: 'Hours since last update' },
    { value: 'hours_since_assigned', label: 'Hours since assigned' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assigned', label: 'Assignment' },
    { value: 'ticket_type', label: 'Ticket type' },
    { value: 'subject_contains', label: 'Subject contains' },
];

const OPERATORS = [
    { value: '>', label: 'more than' },
    { value: '>=', label: 'at least' },
    { value: '<', label: 'fewer than' },
    { value: '<=', label: 'at most' },
    { value: '=', label: 'exactly' },
];

const ACTIONS = [
    { value: 'change_status', label: 'Change status' },
    { value: 'change_priority', label: 'Change priority' },
    { value: 'assign', label: 'Assign to agent' },
    { value: 'add_tag', label: 'Add tag' },
    { value: 'set_ticket_type', label: 'Set ticket type' },
    { value: 'add_note', label: 'Add internal note' },
];

const ASSIGNMENT_VALUES = [
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' },
];

const form = useForm({
    name: props.automation?.name ?? '',
    conditions: (props.automation?.conditions ?? []).map((c) => ({
        field: c.field ?? 'hours_since_updated',
        operator: c.operator ?? '>',
        value: c.value ?? '',
    })),
    actions: (props.automation?.actions ?? []).map((a) => ({
        type: a.type ?? 'change_status',
        value: a.value ?? '',
    })),
    active: props.automation?.active ?? true,
});

// A new automation starts with one of each, because an empty one cannot be
// saved: the backend requires at least one condition and one action.
if (!form.conditions.length) {
    form.conditions.push({ field: 'hours_since_updated', operator: '>', value: 24 });
}

if (!form.actions.length) {
    form.actions.push({ type: 'change_status', value: '' });
}

function isTimeField(field) {
    return TIME_FIELDS.includes(field);
}

function addCondition() {
    form.conditions.push({ field: 'hours_since_updated', operator: '>', value: 24 });
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
    if (props.automation?.id) {
        form.put(route('escalated.admin.automations.update', props.automation.id));
    } else {
        form.post(route('escalated.admin.automations.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="automation ? 'Edit Automation' : 'Create Automation'">
        <div class="mb-4">
            <Link
                :href="route('escalated.admin.automations.index')"
                class="text-xs text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-accent)]"
            >
                &larr; Back to automations
            </Link>
            <h2 class="mt-2 text-lg font-semibold text-[var(--esc-panel-text-secondary)]">
                {{ automation ? 'Edit Automation' : 'Create Automation' }}
            </h2>
            <p class="text-xs text-[var(--esc-panel-text-muted)]">
                Runs on a schedule against open tickets. Every condition must match for the actions to apply.
            </p>
        </div>

        <form class="space-y-6" @submit.prevent="submit">
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4">
                <label class="block text-xs font-medium text-[var(--esc-panel-text-muted)]" for="automation-name">
                    Name
                </label>
                <input
                    id="automation-name"
                    v-model="form.name"
                    type="text"
                    required
                    maxlength="255"
                    placeholder="Escalate tickets untouched for a day"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                />
                <p v-if="form.errors.name" class="mt-1 text-xs text-red-400">{{ form.errors.name }}</p>

                <label class="mt-4 flex items-center gap-2 text-sm text-[var(--esc-panel-text-secondary)]">
                    <input v-model="form.active" type="checkbox" class="rounded border-[var(--esc-panel-border)]" />
                    Active
                </label>
            </div>

            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4">
                <div class="mb-3 flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">When</h3>
                        <p class="text-xs text-[var(--esc-panel-text-muted)]">All conditions must match</p>
                    </div>
                    <button
                        type="button"
                        class="rounded-lg border border-[var(--esc-panel-border)] px-3 py-1.5 text-xs font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                        @click="addCondition"
                    >
                        Add condition
                    </button>
                </div>

                <div v-for="(condition, i) in form.conditions" :key="`condition-${i}`" class="mb-2 flex gap-2">
                    <select
                        v-model="condition.field"
                        :aria-label="`Condition ${i + 1} field`"
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    >
                        <option v-for="field in FIELDS" :key="field.value" :value="field.value">
                            {{ field.label }}
                        </option>
                    </select>

                    <select
                        v-if="isTimeField(condition.field)"
                        v-model="condition.operator"
                        :aria-label="`Condition ${i + 1} operator`"
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    >
                        <option v-for="operator in OPERATORS" :key="operator.value" :value="operator.value">
                            {{ operator.label }}
                        </option>
                    </select>

                    <select
                        v-if="condition.field === 'assigned'"
                        v-model="condition.value"
                        :aria-label="`Condition ${i + 1} value`"
                        class="flex-1 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    >
                        <option v-for="option in ASSIGNMENT_VALUES" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <input
                        v-else
                        v-model="condition.value"
                        :type="isTimeField(condition.field) ? 'number' : 'text'"
                        :min="isTimeField(condition.field) ? 0 : undefined"
                        :aria-label="`Condition ${i + 1} value`"
                        :placeholder="isTimeField(condition.field) ? 'hours' : 'value'"
                        class="flex-1 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    />

                    <button
                        type="button"
                        :aria-label="`Remove condition ${i + 1}`"
                        class="rounded-lg px-2 text-xs text-[var(--esc-panel-text-muted)] transition-colors hover:text-red-400"
                        :disabled="form.conditions.length === 1"
                        @click="removeCondition(i)"
                    >
                        Remove
                    </button>
                </div>

                <p v-if="form.errors.conditions" class="mt-1 text-xs text-red-400">{{ form.errors.conditions }}</p>
            </div>

            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4">
                <div class="mb-3 flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">Then</h3>
                        <p class="text-xs text-[var(--esc-panel-text-muted)]">Applied to every matching ticket</p>
                    </div>
                    <button
                        type="button"
                        class="rounded-lg border border-[var(--esc-panel-border)] px-3 py-1.5 text-xs font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                        @click="addAction"
                    >
                        Add action
                    </button>
                </div>

                <div v-for="(action, i) in form.actions" :key="`action-${i}`" class="mb-2 flex gap-2">
                    <select
                        v-model="action.type"
                        :aria-label="`Action ${i + 1} type`"
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    >
                        <option v-for="option in ACTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>

                    <input
                        v-model="action.value"
                        type="text"
                        :aria-label="`Action ${i + 1} value`"
                        placeholder="value"
                        class="flex-1 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    />

                    <button
                        type="button"
                        :aria-label="`Remove action ${i + 1}`"
                        class="rounded-lg px-2 text-xs text-[var(--esc-panel-text-muted)] transition-colors hover:text-red-400"
                        :disabled="form.actions.length === 1"
                        @click="removeAction(i)"
                    >
                        Remove
                    </button>
                </div>

                <p v-if="form.errors.actions" class="mt-1 text-xs text-red-400">{{ form.errors.actions }}</p>
            </div>

            <div class="flex items-center gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ automation ? 'Save changes' : 'Create automation' }}
                </button>
                <Link
                    :href="route('escalated.admin.automations.index')"
                    class="text-sm text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-text-secondary)]"
                >
                    Cancel
                </Link>
            </div>
        </form>
    </EscalatedLayout>
</template>
