<script setup>
import { computed } from 'vue';

const props = defineProps({
    current: { type: Number, required: true },
    max: { type: Number, required: true },
});

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
    if (percentage.value >= 90) return 'text-rose-400';
    if (percentage.value >= 70) return 'text-amber-400';
    return 'text-emerald-400';
});
</script>

<template>
    <div class="flex items-center gap-2">
        <div class="h-2 w-20 overflow-hidden rounded-full bg-white/[0.06]">
            <div
                :class="['h-full rounded-full transition-all', colorClass]"
                :style="{ width: Math.min(percentage, 100) + '%' }"
            ></div>
        </div>
        <span :class="['text-xs font-medium', textColorClass]">{{ current }}/{{ max }}</span>
    </div>
</template>
