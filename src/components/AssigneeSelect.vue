<script setup>
defineProps({
    agents: { type: Array, required: true },
    modelValue: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <div>
        <label class="mb-1 block text-xs font-medium text-gray-600">Assigned To</label>
        <select :value="modelValue" @change="emit('update:modelValue', $event.target.value || null)"
                class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Unassigned</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
        </select>
    </div>
</template>
