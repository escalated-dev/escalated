<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    trend: { type: String, default: null },
    color: { type: String, default: 'blue' },
});

const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-50 text-gray-700',
};
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="text-sm text-gray-500">{{ label }}</div>
        <div class="mt-1 text-2xl font-bold text-gray-900">{{ value }}</div>
        <div v-if="trend" :class="['mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium', colorMap[color] || colorMap.blue]">
            {{ trend }}
        </div>
    </div>
</template>
