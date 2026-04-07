<script setup>
defineProps({
    data: { type: Array, default: () => [] },
});
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
        <h3 class="mb-4 text-sm font-semibold text-neutral-200">SLA Compliance by Policy</h3>
        <div v-if="data.length" class="space-y-4">
            <div v-for="item in data" :key="item.policy_name">
                <div class="mb-1.5 flex items-center justify-between">
                    <span class="text-sm font-medium text-neutral-300">{{ item.policy_name }}</span>
                    <span class="text-xs text-neutral-500">{{ item.total }} tickets</span>
                </div>
                <div class="flex h-6 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                        class="h-full rounded-l-full bg-emerald-500/80 transition-all"
                        :style="{ width: item.total > 0 ? `${(item.met / item.total) * 100}%` : '0%' }"
                        :title="`Met: ${item.met}`"
                    ></div>
                    <div
                        class="h-full bg-red-500/80 transition-all"
                        :class="{ 'rounded-r-full': item.met === 0, 'rounded-r-full': true }"
                        :style="{ width: item.total > 0 ? `${(item.breached / item.total) * 100}%` : '0%' }"
                        :title="`Breached: ${item.breached}`"
                    ></div>
                </div>
                <div class="mt-1 flex items-center gap-4 text-xs">
                    <span class="flex items-center gap-1 text-emerald-400">
                        <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                        Met: {{ item.met }}
                    </span>
                    <span class="flex items-center gap-1 text-red-400">
                        <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                        Breached: {{ item.breached }}
                    </span>
                    <span v-if="item.total > 0" class="text-neutral-500">
                        {{ Math.round((item.met / item.total) * 100) }}% compliance
                    </span>
                </div>
            </div>
        </div>
        <div v-else class="py-6 text-center text-sm text-neutral-500">No SLA data available</div>
    </div>
</template>
