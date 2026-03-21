<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    current: { type: Number, required: true },
    max: { type: Number, required: true },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const percentage = computed(() => {
    if (props.max <= 0) return 100;
    return Math.round((props.current / props.max) * 100);
});

const colorClass = computed(() => {
    if (percentage.value >= 90) return 'bg-rose-500';
    if (percentage.value >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
});

const textColorClass = computed(() => {
    if (percentage.value >= 90) return escDark.value ? 'text-rose-400' : 'text-rose-600';
    if (percentage.value >= 70) return escDark.value ? 'text-amber-400' : 'text-amber-600';
    return escDark.value ? 'text-emerald-400' : 'text-emerald-600';
});
</script>

<template>
    <div
        class="flex items-center gap-2"
        role="meter"
        :aria-valuenow="percentage"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Agent workload"
    >
        <div :class="['h-2 w-20 overflow-hidden rounded-full', escDark ? 'bg-white/[0.06]' : 'bg-gray-200']">
            <div
                :class="['h-full rounded-full transition-all', colorClass]"
                :style="{ width: Math.min(percentage, 100) + '%' }"
            ></div>
        </div>
        <span :class="['text-xs font-medium', textColorClass]">{{ current }}/{{ max }}</span>
    </div>
</template>
