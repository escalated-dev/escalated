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

const darkColorMap = {
    blue: { accent: 'from-cyan-500 to-blue-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
    indigo: { accent: 'from-violet-500 to-indigo-500', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
    green: { accent: 'from-emerald-500 to-green-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    red: { accent: 'from-rose-500 to-red-500', text: 'text-rose-400', glow: 'shadow-rose-500/10' },
    yellow: { accent: 'from-amber-500 to-yellow-500', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
    gray: { accent: 'from-gray-500 to-gray-400', text: 'text-gray-400', glow: 'shadow-gray-500/10' },
};

const lightColorMap = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-50 text-gray-700',
};

const darkColor = computed(() => darkColorMap[props.color] || darkColorMap.blue);
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark.value" class="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gray-900/80 p-5 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-gray-900">
        <div :class="['absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-60', darkColor.accent]"></div>
        <div class="text-[13px] font-medium text-gray-400">{{ displayLabel }}</div>
        <div class="mt-2 text-2xl font-bold tracking-tight text-white">{{ value }}</div>
        <div v-if="trend" :class="['mt-2 inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium', darkColor.text]">
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
