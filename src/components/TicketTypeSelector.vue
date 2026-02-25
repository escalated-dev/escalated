<script setup>
defineProps({
    modelValue: { type: String, default: 'question' },
});

const emit = defineEmits(['update:modelValue']);

const types = [
    { value: 'question', label: 'Question', color: 'text-cyan-400' },
    { value: 'problem', label: 'Problem', color: 'text-rose-400' },
    { value: 'incident', label: 'Incident', color: 'text-amber-400' },
    { value: 'task', label: 'Task', color: 'text-violet-400' },
];
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
