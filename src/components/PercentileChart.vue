<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: { type: String, default: 'Percentile Distribution' },
    percentiles: {
        type: Object,
        default: () => ({ p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 }),
    },
    unit: { type: String, default: 'h' },
    target: { type: Number, default: null },
});

const maxVal = computed(() => {
    const vals = Object.values(props.percentiles);
    return Math.max(...vals, 1);
});

const bars = computed(() => {
    const entries = [
        { key: 'p50', label: 'P50 (Median)', color: '#10b981' },
        { key: 'p75', label: 'P75', color: '#f59e0b' },
        { key: 'p90', label: 'P90', color: '#f97316' },
        { key: 'p95', label: 'P95', color: '#ef4444' },
        { key: 'p99', label: 'P99', color: '#dc2626' },
    ];
    return entries.map((e) => ({
        ...e,
        value: props.percentiles[e.key] || 0,
        width: ((props.percentiles[e.key] || 0) / maxVal.value) * 100,
    }));
});
</script>

<template>
    <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
        <h3 v-if="title" class="mb-4 text-sm font-semibold text-[var(--esc-panel-text-secondary)]">{{ title }}</h3>
        <div class="space-y-3">
            <div v-for="bar in bars" :key="bar.key" class="flex items-center gap-3">
                <span class="w-24 shrink-0 text-xs font-medium text-[var(--esc-panel-text-muted)]">
                    {{ bar.label }}
                </span>
                <div class="relative flex-1">
                    <div class="h-6 overflow-hidden rounded-full bg-[var(--esc-panel-hover)]">
                        <div
                            class="h-full rounded-full transition-all duration-700 ease-out"
                            :style="{ width: `${bar.width}%`, backgroundColor: bar.color }"
                        ></div>
                    </div>
                    <div
                        v-if="target !== null"
                        class="absolute top-0 h-6 w-0.5 bg-white/40"
                        :style="{ left: `${(target / maxVal) * 100}%` }"
                        :title="`Target: ${target}${unit}`"
                    ></div>
                </div>
                <span class="w-16 text-right text-xs font-bold text-[var(--esc-panel-text)]">
                    {{ bar.value }}{{ unit }}
                </span>
            </div>
        </div>
        <div v-if="target !== null" class="mt-3 flex items-center gap-2 text-xs text-[var(--esc-panel-text-muted)]">
            <span class="inline-block h-3 w-0.5 bg-white/40"></span>
            Target: {{ target }}{{ unit }}
        </div>
    </div>
</template>
