<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    previousValue: { type: [Number, String], default: null },
    format: { type: String, default: '' },
    icon: { type: String, default: null },
    invertColor: { type: Boolean, default: false },
});

const percentChange = computed(() => {
    if (props.previousValue === null || props.previousValue === 0) return null;
    const current = Number(props.value) || 0;
    const previous = Number(props.previousValue) || 0;
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
});

const changeDirection = computed(() => {
    if (percentChange.value === null || percentChange.value === 0) return 'neutral';
    return percentChange.value > 0 ? 'up' : 'down';
});

const changeColor = computed(() => {
    if (changeDirection.value === 'neutral') return 'text-[var(--esc-panel-text-muted)]';
    const isPositiveGood = !props.invertColor;
    if (changeDirection.value === 'up') {
        return isPositiveGood ? 'text-emerald-400' : 'text-red-400';
    }
    return isPositiveGood ? 'text-red-400' : 'text-emerald-400';
});
</script>

<template>
    <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
        <div class="flex items-start justify-between">
            <div>
                <div class="text-[13px] font-medium text-[var(--esc-panel-text-muted)]">
                    {{ label }}
                </div>
                <div class="mt-2 text-2xl font-bold tracking-tight text-[var(--esc-panel-text)]">
                    {{ value }}{{ format }}
                </div>
            </div>
            <div v-if="icon" class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--esc-panel-hover)]">
                <svg
                    class="h-5 w-5 text-[var(--esc-panel-text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
                </svg>
            </div>
        </div>
        <div v-if="previousValue !== null" class="mt-3 flex items-center gap-2">
            <div class="flex items-center gap-1" :class="changeColor">
                <svg
                    v-if="changeDirection === 'up'"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
                <svg
                    v-else-if="changeDirection === 'down'"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                </svg>
                <span v-else class="text-sm">--</span>
                <span class="text-xs font-medium">
                    {{ percentChange !== null ? `${Math.abs(percentChange)}%` : '--' }}
                </span>
            </div>
            <span class="text-xs text-[var(--esc-panel-text-muted)]"> vs {{ previousValue }}{{ format }} prev </span>
        </div>
    </div>
</template>
