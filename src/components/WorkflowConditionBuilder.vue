<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ match: 'all', conditions: [] }),
    },
});

const emit = defineEmits(['update:modelValue']);

const fields = [
    {
        value: 'status',
        label: 'Status',
        type: 'enum',
        options: [
            'open',
            'in_progress',
            'waiting_on_customer',
            'waiting_on_agent',
            'escalated',
            'resolved',
            'closed',
            'reopened',
        ],
    },
    { value: 'priority', label: 'Priority', type: 'enum', options: ['low', 'medium', 'high', 'urgent', 'critical'] },
    {
        value: 'type',
        label: 'Type',
        type: 'enum',
        options: ['question', 'problem', 'incident', 'task', 'feature_request'],
    },
    { value: 'channel', label: 'Channel', type: 'enum', options: ['web', 'email', 'chat', 'api', 'phone'] },
    { value: 'tags', label: 'Tags', type: 'text' },
    { value: 'department', label: 'Department', type: 'text' },
    { value: 'assigned_agent', label: 'Assigned Agent', type: 'text' },
    { value: 'subject', label: 'Subject', type: 'text' },
    { value: 'hours_since_created', label: 'Hours Since Created', type: 'number' },
    { value: 'hours_since_updated', label: 'Hours Since Updated', type: 'number' },
    { value: 'reply_count', label: 'Reply Count', type: 'number' },
    { value: 'custom_field', label: 'Custom Field', type: 'text' },
];

const operatorsByType = {
    enum: [
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'in', label: 'in' },
    ],
    text: [
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'contains', label: 'contains' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'matches', label: 'matches' },
    ],
    number: [
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'greater_than', label: 'greater than' },
        { value: 'less_than', label: 'less than' },
    ],
};

const data = computed(() => props.modelValue);

function update(patch) {
    emit('update:modelValue', { ...data.value, ...patch });
}

function toggleMatch() {
    update({ match: data.value.match === 'all' ? 'any' : 'all' });
}

function addCondition() {
    const conditions = [...(data.value.conditions || []), { field: 'status', operator: 'equals', value: '' }];
    update({ conditions });
}

function removeCondition(index) {
    const conditions = data.value.conditions.filter((_, i) => i !== index);
    update({ conditions });
}

function updateCondition(index, patch) {
    const conditions = data.value.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c));
    update({ conditions });
}

function getFieldConfig(fieldValue) {
    return fields.find((f) => f.value === fieldValue) || fields[0];
}

function getOperators(fieldValue) {
    const field = getFieldConfig(fieldValue);
    return operatorsByType[field.type] || operatorsByType.text;
}

function onFieldChange(index, newField) {
    const operators = getOperators(newField);
    updateCondition(index, { field: newField, operator: operators[0].value, value: '' });
}

const previewText = computed(() => {
    if (!data.value.conditions?.length) return '';
    const joiner = data.value.match === 'all' ? ' AND ' : ' OR ';
    return data.value.conditions
        .map((c) => {
            const field = getFieldConfig(c.field);
            const opLabel =
                (operatorsByType[field.type] || []).find((o) => o.value === c.operator)?.label || c.operator;
            if (c.operator === 'is_empty') return `${field.label} is empty`;
            const val = Array.isArray(c.value) ? `[${c.value.join(', ')}]` : c.value;
            return `${field.label} ${opLabel} ${val}`;
        })
        .join(joiner);
});
</script>

<template>
    <div class="space-y-4">
        <!-- Match type toggle -->
        <div class="flex items-center gap-3">
            <span class="text-sm text-[var(--esc-panel-text-muted)]">Match:</span>
            <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="
                    data.match === 'all'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]'
                "
                @click="toggleMatch"
            >
                All conditions (AND)
            </button>
            <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="
                    data.match === 'any'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]'
                "
                @click="toggleMatch"
            >
                Any condition (OR)
            </button>
        </div>

        <!-- Condition rows -->
        <div class="space-y-2">
            <div
                v-for="(condition, i) in data.conditions"
                :key="i"
                class="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-3"
            >
                <!-- Field -->
                <select
                    :value="condition.field"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                    @change="onFieldChange(i, $event.target.value)"
                >
                    <option v-for="f in fields" :key="f.value" :value="f.value">{{ f.label }}</option>
                </select>

                <!-- Operator -->
                <select
                    :value="condition.operator"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                    @change="updateCondition(i, { operator: $event.target.value })"
                >
                    <option v-for="op in getOperators(condition.field)" :key="op.value" :value="op.value">
                        {{ op.label }}
                    </option>
                </select>

                <!-- Value (contextual) -->
                <template v-if="condition.operator !== 'is_empty'">
                    <!-- Enum select for enum fields -->
                    <select
                        v-if="getFieldConfig(condition.field).type === 'enum' && condition.operator !== 'in'"
                        :value="condition.value"
                        class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                        @change="updateCondition(i, { value: $event.target.value })"
                    >
                        <option value="">Select...</option>
                        <option v-for="opt in getFieldConfig(condition.field).options" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>

                    <!-- Multi-select for "in" operator on enum fields -->
                    <select
                        v-else-if="getFieldConfig(condition.field).type === 'enum' && condition.operator === 'in'"
                        :value="condition.value"
                        multiple
                        class="min-h-[60px] rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                        @change="
                            updateCondition(i, { value: Array.from($event.target.selectedOptions, (o) => o.value) })
                        "
                    >
                        <option v-for="opt in getFieldConfig(condition.field).options" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>

                    <!-- Number input -->
                    <input
                        v-else-if="getFieldConfig(condition.field).type === 'number'"
                        type="number"
                        :value="condition.value"
                        placeholder="0"
                        class="w-24 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        @input="updateCondition(i, { value: $event.target.value })"
                    />

                    <!-- Text input (default) -->
                    <input
                        v-else
                        type="text"
                        :value="condition.value"
                        placeholder="Value"
                        class="flex-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        @input="updateCondition(i, { value: $event.target.value })"
                    />
                </template>

                <!-- Remove button -->
                <button
                    type="button"
                    class="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                    @click="removeCondition(i)"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Add condition button -->
        <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--esc-panel-border)] px-3 py-2 text-xs text-[var(--esc-panel-text-muted)] transition-colors hover:border-amber-500/50 hover:text-amber-400"
            @click="addCondition"
        >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Condition
        </button>

        <!-- Preview -->
        <div
            v-if="previewText"
            class="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300"
        >
            <span class="font-medium">Preview:</span> When {{ previewText }}
        </div>
    </div>
</template>
