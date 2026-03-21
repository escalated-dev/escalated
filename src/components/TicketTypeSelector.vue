<script setup>
import { TICKET_TYPES } from '../utils/constants';

defineProps({
    modelValue: { type: String, default: 'question' },
});

const emit = defineEmits(['update:modelValue']);

const types = TICKET_TYPES;
</script>

<template>
    <select
        :value="modelValue"
        class="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
        @change="emit('update:modelValue', $event.target.value)"
    >
        <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
    </select>
</template>
