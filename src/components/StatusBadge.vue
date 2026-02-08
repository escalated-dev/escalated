<script setup>
const props = defineProps({
    status: { type: String, required: true },
});

const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    waiting_on_customer: { label: 'Waiting on Customer', color: 'bg-yellow-100 text-yellow-800' },
    waiting_on_agent: { label: 'Waiting on Agent', color: 'bg-orange-100 text-orange-800' },
    escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
    reopened: { label: 'Reopened', color: 'bg-blue-100 text-blue-800' },
};

const config = statusConfig[props.status] || { label: props.status, color: 'bg-gray-100 text-gray-800' };
</script>

<template>
    <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.color]">
        {{ config.label }}
    </span>
</template>
