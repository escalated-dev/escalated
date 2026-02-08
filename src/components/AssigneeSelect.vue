<script setup>
import { computed, inject } from 'vue';

defineProps({
    agents: { type: Array, required: true },
    modelValue: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue']);
const dark = inject('esc-dark', computed(() => false));
</script>

<template>
    <div>
        <label :class="['mb-1 block text-xs font-medium', dark ? 'text-neutral-500' : 'text-gray-600']">Assigned To</label>
        <select :value="modelValue" @change="emit('update:modelValue', $event.target.value || null)"
                :class="['w-full rounded-md border px-2 py-1.5 text-sm focus:outline-none',
                         dark ? 'border-white/10 bg-neutral-950 text-neutral-200 focus:border-white/20 focus:ring-1 focus:ring-white/10' : 'border-gray-300 focus:border-blue-500']">
            <option value="">Unassigned</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
        </select>
    </div>
</template>
