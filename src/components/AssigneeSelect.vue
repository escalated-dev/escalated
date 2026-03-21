<script setup>
import { computed, inject } from 'vue';

defineProps({
    agents: { type: Array, required: true },
    modelValue: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue']);
const dark = inject(
    'esc-dark',
    computed(() => false),
);
</script>

<template>
    <div>
        <label
            :class="['mb-1 block text-xs font-medium', dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-600']"
            >Assigned To</label
        >
        <select
            :value="modelValue"
            aria-label="Assign to agent"
            :class="[
                'w-full rounded-md border px-2 py-1.5 text-sm focus:outline-none',
                dark
                    ? 'border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:ring-1 focus:ring-[var(--esc-panel-border-input)]'
                    : 'border-gray-300 focus:border-blue-500',
            ]"
            @change="emit('update:modelValue', $event.target.value || null)"
        >
            <option value="">Unassigned</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
        </select>
    </div>
</template>
