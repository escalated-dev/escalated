<script setup>
const props = defineProps({
    priority: { type: String, required: true },
});

const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-yellow-100 text-yellow-800' },
    urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
};

const config = priorityConfig[props.priority] || { label: props.priority, color: 'bg-gray-100 text-gray-800' };
</script>

<template>
    <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.color]">
        {{ config.label }}
    </span>
</template>
