<script setup>
import { computed } from 'vue';

const props = defineProps({
    availableFields: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const rules = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

function addRule() {
    const updated = [
        ...rules.value,
        {
            field: '',
            operator: 'equals',
            value: '',
            target_field: '',
        },
    ];
    emit('update:modelValue', updated);
}

function removeRule(index) {
    const updated = rules.value.filter((_, i) => i !== index);
    emit('update:modelValue', updated);
}

function updateRule(index, key, value) {
    const updated = rules.value.map((rule, i) => (i === index ? { ...rule, [key]: value } : rule));
    emit('update:modelValue', updated);
}

function getFieldOptions(fieldName) {
    const field = props.availableFields.find((f) => f.name === fieldName || f.slug === fieldName);
    return field?.options || [];
}

const operatorOptions = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
];
</script>

<template>
    <div class="space-y-3">
        <div
            v-for="(rule, index) in rules"
            :key="index"
            class="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.06] bg-neutral-950 p-3"
        >
            <span class="text-xs font-medium text-neutral-500">When</span>
            <select
                :value="rule.field"
                class="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @change="updateRule(index, 'field', $event.target.value)"
            >
                <option value="">Select field...</option>
                <option v-for="f in availableFields" :key="f.name || f.slug" :value="f.name || f.slug">
                    {{ f.label || f.name }}
                </option>
            </select>

            <select
                :value="rule.operator"
                class="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @change="updateRule(index, 'operator', $event.target.value)"
            >
                <option v-for="op in operatorOptions" :key="op.value" :value="op.value">
                    {{ op.label }}
                </option>
            </select>

            <template v-if="rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty'">
                <select
                    v-if="getFieldOptions(rule.field).length"
                    :value="rule.value"
                    class="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    @change="updateRule(index, 'value', $event.target.value)"
                >
                    <option value="">Select value...</option>
                    <option v-for="opt in getFieldOptions(rule.field)" :key="opt" :value="opt">
                        {{ opt }}
                    </option>
                </select>
                <input
                    v-else
                    :value="rule.value"
                    type="text"
                    placeholder="Value"
                    class="w-32 rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    @input="updateRule(index, 'value', $event.target.value)"
                />
            </template>

            <span class="text-xs font-medium text-neutral-500">show</span>
            <select
                :value="rule.target_field"
                class="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @change="updateRule(index, 'target_field', $event.target.value)"
            >
                <option value="">Select target field...</option>
                <option v-for="f in availableFields" :key="f.name || f.slug" :value="f.name || f.slug">
                    {{ f.label || f.name }}
                </option>
            </select>

            <button
                type="button"
                class="ml-auto rounded p-1 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                @click="removeRule(index)"
            >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <button
            type="button"
            class="rounded-lg border border-dashed border-white/10 px-4 py-2 text-sm text-neutral-500 hover:border-white/20 hover:text-neutral-300"
            @click="addRule"
        >
            + Add Condition
        </button>
    </div>
</template>
