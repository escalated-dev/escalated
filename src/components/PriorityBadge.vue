<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
    priority: { type: String, required: true },
});

const escDark = inject('esc-dark', computed(() => false));

const darkConfig = {
    low: { label: 'Low', color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' },
    medium: { label: 'Medium', color: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20' },
    high: { label: 'High', color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    urgent: { label: 'Urgent', color: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20' },
    critical: { label: 'Critical', color: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20' },
};

const lightConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-yellow-100 text-yellow-800' },
    urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
};

const config = computed(() => {
    const map = escDark.value ? darkConfig : lightConfig;
    const fallback = escDark.value
        ? { label: props.priority, color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' }
        : { label: props.priority, color: 'bg-gray-100 text-gray-800' };
    return map[props.priority] || fallback;
});
</script>

<template>
    <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.color]">
        {{ config.label }}
    </span>
</template>
