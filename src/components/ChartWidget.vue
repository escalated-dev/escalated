<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: { type: String, default: '' },
    data: { type: Array, default: () => [] },
    color: { type: String, default: 'cyan' },
});

const colorMap = {
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
};

const barColor = computed(() => colorMap[props.color] || colorMap.cyan);

const maxValue = computed(() => {
    if (!props.data.length) return 1;
    return Math.max(...props.data.map((d) => d.value), 1);
});
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
        <h3 v-if="title" class="mb-4 text-sm font-semibold text-neutral-200">{{ title }}</h3>
        <div v-if="data.length" class="space-y-2.5">
            <div v-for="item in data" :key="item.label" class="flex items-center gap-3">
                <span class="w-20 shrink-0 truncate text-xs text-neutral-500">{{ item.label }}</span>
                <div class="flex-1">
                    <div class="h-5 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                            :class="['h-full rounded-full transition-all', barColor]"
                            :style="{ width: `${(item.value / maxValue) * 100}%`, opacity: 0.8 }"
                        ></div>
                    </div>
                </div>
                <span class="w-10 text-right text-xs font-medium text-neutral-300">{{ item.value }}</span>
            </div>
        </div>
        <div v-else class="py-6 text-center text-sm text-neutral-500">No data available</div>
    </div>
</template>
