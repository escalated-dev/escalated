<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    value: { type: [Number, String], required: true },
    trend: { type: String, default: null },
    color: { type: String, default: 'blue' },
});

const escDark = inject('esc-dark', computed(() => false));
const displayLabel = computed(() => props.label || props.title || '');

const lightColorMap = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-50 text-gray-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
};
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark.value" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
        <div class="text-[13px] font-medium text-neutral-500">{{ displayLabel }}</div>
        <div class="mt-2 text-2xl font-bold tracking-tight text-white">{{ value }}</div>
        <div v-if="trend" class="mt-2 inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-400">
            {{ trend }}
        </div>
    </div>

    <!-- Light mode -->
    <div v-else class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="text-sm text-gray-500">{{ displayLabel }}</div>
        <div class="mt-1 text-2xl font-bold text-gray-900">{{ value }}</div>
        <div v-if="trend" :class="['mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium', lightColorMap[color] || lightColorMap.blue]">
            {{ trend }}
        </div>
    </div>
</template>
