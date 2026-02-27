<script setup>
import { computed } from 'vue';

const props = defineProps({
    fields: { type: Array, required: true },
    modelValue: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
    conditions: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

function updateField(name, value) {
    emit('update:modelValue', { ...props.modelValue, [name]: value });
}

function toggleMultiSelect(name, option) {
    const current = props.modelValue[name] || [];
    const idx = current.indexOf(option);
    const updated = idx >= 0 ? current.filter((_, i) => i !== idx) : [...current, option];
    updateField(name, updated);
}

const sortedFields = computed(() => [...props.fields].sort((a, b) => (a.position || 0) - (b.position || 0)));

/**
 * Evaluate whether a field should be visible based on conditions.
 * Conditions can come from the `conditions` prop or from the field's own `conditions` property.
 */
function isFieldVisible(field) {
    // Merge global conditions and field-level conditions
    const allConditions = [
        ...props.conditions.filter((c) => c.target_field === field.name || c.target_field === field.slug),
        ...(field.conditions || []).filter((c) => c.target_field === field.name || c.target_field === field.slug),
    ];

    // If no conditions target this field, it's always visible
    if (allConditions.length === 0) {
        return true;
    }

    // All conditions must be met (AND logic)
    return allConditions.every((condition) => {
        const currentValue = props.modelValue[condition.field];

        switch (condition.operator) {
            case 'equals':
                return String(currentValue || '') === String(condition.value || '');
            case 'not_equals':
                return String(currentValue || '') !== String(condition.value || '');
            case 'contains':
                return String(currentValue || '').includes(String(condition.value || ''));
            case 'is_empty':
                return (
                    !currentValue || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0)
                );
            case 'is_not_empty':
                return (
                    currentValue && currentValue !== '' && !(Array.isArray(currentValue) && currentValue.length === 0)
                );
            default:
                return true;
        }
    });
}
</script>

<template>
    <div class="space-y-4">
        <div v-for="field in sortedFields" v-show="isFieldVisible(field)" :key="field.id">
            <label class="block text-sm font-medium text-neutral-300">
                {{ field.label || field.name }}
                <span v-if="field.required" class="text-rose-400">*</span>
            </label>
            <p v-if="field.description" class="mt-0.5 text-xs text-neutral-500">{{ field.description }}</p>

            <!-- Text -->
            <input
                v-if="field.type === 'text'"
                type="text"
                :value="modelValue[field.name] || ''"
                :placeholder="field.placeholder"
                :required="field.required"
                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="updateField(field.name, $event.target.value)"
            />

            <!-- Textarea -->
            <textarea
                v-else-if="field.type === 'textarea'"
                :value="modelValue[field.name] || ''"
                :placeholder="field.placeholder"
                :required="field.required"
                rows="3"
                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="updateField(field.name, $event.target.value)"
            ></textarea>

            <!-- Number -->
            <input
                v-else-if="field.type === 'number'"
                type="number"
                :value="modelValue[field.name] || ''"
                :placeholder="field.placeholder"
                :required="field.required"
                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="updateField(field.name, $event.target.value)"
            />

            <!-- Date -->
            <input
                v-else-if="field.type === 'date'"
                type="date"
                :value="modelValue[field.name] || ''"
                :required="field.required"
                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @input="updateField(field.name, $event.target.value)"
            />

            <!-- Checkbox -->
            <label v-else-if="field.type === 'checkbox'" class="mt-1 flex items-center gap-2">
                <input
                    type="checkbox"
                    :checked="!!modelValue[field.name]"
                    class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                    @change="updateField(field.name, $event.target.checked)"
                />
                <span class="text-sm text-neutral-300">{{ field.placeholder || 'Yes' }}</span>
            </label>

            <!-- Select -->
            <select
                v-else-if="field.type === 'select'"
                :value="modelValue[field.name] || ''"
                :required="field.required"
                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                @change="updateField(field.name, $event.target.value)"
            >
                <option value="" disabled class="text-neutral-500">{{ field.placeholder || 'Select...' }}</option>
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- Multi-select (checkboxes) -->
            <div v-else-if="field.type === 'multi_select'" class="mt-1 space-y-1">
                <label v-for="opt in field.options" :key="opt" class="flex items-center gap-2">
                    <input
                        type="checkbox"
                        :checked="(modelValue[field.name] || []).includes(opt)"
                        class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                        @change="toggleMultiSelect(field.name, opt)"
                    />
                    <span class="text-sm text-neutral-300">{{ opt }}</span>
                </label>
            </div>

            <div v-if="errors[field.name]" class="mt-1 text-sm text-rose-400">{{ errors[field.name] }}</div>
        </div>
    </div>
</template>
