<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    trend: { type: Number, default: null },
    icon: { type: String, default: null },
});
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
        <div class="flex items-start justify-between">
            <div>
                <div class="text-[13px] font-medium text-neutral-500">{{ label }}</div>
                <div class="mt-2 text-2xl font-bold tracking-tight text-white">{{ value }}</div>
            </div>
            <div v-if="icon" class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                <svg
                    class="h-5 w-5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
                </svg>
            </div>
        </div>
        <div v-if="trend !== null && trend !== 0" class="mt-3 flex items-center gap-1">
            <svg
                v-if="trend > 0"
                class="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            <svg
                v-else
                class="h-4 w-4 text-red-400"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
            </svg>
            <span :class="['text-xs font-medium', trend > 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ Math.abs(trend) }}%
            </span>
        </div>
    </div>
</template>
