<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
    status: { type: String, required: true },
});

const escDark = inject('esc-dark', computed(() => false));

const darkConfig = {
    open: { label: 'Open', color: 'bg-cyan-500/10 text-white ring-1 ring-cyan-500/20' },
    in_progress: { label: 'In Progress', color: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20' },
    waiting_on_customer: { label: 'Waiting on Customer', color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    waiting_on_agent: { label: 'Waiting on Agent', color: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20' },
    escalated: { label: 'Escalated', color: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' },
    resolved: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    closed: { label: 'Closed', color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' },
    reopened: { label: 'Reopened', color: 'bg-cyan-500/10 text-white ring-1 ring-cyan-500/20' },
};

const lightConfig = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    waiting_on_customer: { label: 'Waiting on Customer', color: 'bg-yellow-100 text-yellow-800' },
    waiting_on_agent: { label: 'Waiting on Agent', color: 'bg-orange-100 text-orange-800' },
    escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
    reopened: { label: 'Reopened', color: 'bg-blue-100 text-blue-800' },
};

const fallback = { label: props.status, color: 'bg-gray-100 text-gray-800' };
const darkFallback = { label: props.status, color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' };

const config = computed(() => {
    const map = escDark.value ? darkConfig : lightConfig;
    const fb = escDark.value ? darkFallback : fallback;
    return map[props.status] || fb;
});
</script>

<template>
    <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.color]">
        {{ config.label }}
    </span>
</template>
