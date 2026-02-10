<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatsCard from '../../components/StatsCard.vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    period_days: Number,
    total_tickets: Number,
    resolved_tickets: Number,
    avg_first_response_hours: Number,
    sla_breach_count: Number,
    by_status: Object,
    by_priority: Object,
    csat: { type: Object, default: () => ({}) },
});

function changePeriod(days) {
    router.get(route('escalated.admin.reports'), { days }, { preserveState: true });
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 'filled' : 'empty');
}
</script>

<template>
    <EscalatedLayout title="Reports">
        <div class="mb-6 flex gap-2">
            <button v-for="d in [7, 30, 90]" :key="d" @click="changePeriod(d)"
                    :class="['rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all', period_days === d
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-black/20'
                        : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200']">
                Last {{ d }} days
            </button>
        </div>
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatsCard label="Total Tickets" :value="total_tickets" color="indigo" />
            <StatsCard label="Resolved" :value="resolved_tickets" color="green" />
            <StatsCard label="Avg First Response" :value="`${avg_first_response_hours}h`" color="yellow" />
            <StatsCard label="SLA Breaches" :value="sla_breach_count" color="red" />
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
                <h3 class="mb-4 text-sm font-semibold text-neutral-200">By Status</h3>
                <template v-if="by_status && Object.keys(by_status).length">
                    <div v-for="(count, status) in by_status" :key="status" class="mb-2.5 flex items-center justify-between">
                        <span class="text-sm capitalize text-neutral-400">{{ status.replace('_', ' ') }}</span>
                        <span class="text-sm font-semibold text-white">{{ count }}</span>
                    </div>
                </template>
                <div v-else class="flex flex-col items-center py-6 text-center">
                    <svg class="mb-2 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    <p class="text-sm text-neutral-500">No ticket data for this period</p>
                </div>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
                <h3 class="mb-4 text-sm font-semibold text-neutral-200">By Priority</h3>
                <template v-if="by_priority && Object.keys(by_priority).length">
                    <div v-for="(count, priority) in by_priority" :key="priority" class="mb-2.5 flex items-center justify-between">
                        <span class="text-sm capitalize text-neutral-400">{{ priority }}</span>
                        <span class="text-sm font-semibold text-white">{{ count }}</span>
                    </div>
                </template>
                <div v-else class="flex flex-col items-center py-6 text-center">
                    <svg class="mb-2 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>
                    <p class="text-sm text-neutral-500">No ticket data for this period</p>
                </div>
            </div>
            <!-- CSAT -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
                <h3 class="mb-4 text-sm font-semibold text-neutral-200">Customer Satisfaction</h3>
                <template v-if="csat?.total > 0">
                    <div class="mb-3 flex items-center gap-2">
                        <div class="flex items-center gap-0.5">
                            <svg v-for="(star, i) in renderStars(csat.average)" :key="i"
                                 class="h-5 w-5" :class="star === 'filled' ? 'text-amber-400' : 'text-neutral-700'"
                                 fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <span class="text-lg font-bold text-white">{{ csat.average }}</span>
                        <span class="text-sm text-neutral-500">({{ csat.total }} ratings)</span>
                    </div>
                    <div v-if="csat.breakdown && Object.keys(csat.breakdown).length" class="space-y-1.5">
                        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2">
                            <span class="w-3 text-xs text-neutral-500">{{ rating }}</span>
                            <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                <div class="h-full rounded-full bg-amber-400" :style="{ width: `${csat.total ? ((csat.breakdown[rating] || 0) / csat.total) * 100 : 0}%` }"></div>
                            </div>
                            <span class="w-6 text-right text-xs text-neutral-500">{{ csat.breakdown[rating] || 0 }}</span>
                        </div>
                    </div>
                </template>
                <div v-else class="flex flex-col items-center py-6 text-center">
                    <svg class="mb-2 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    <p class="text-sm text-neutral-500">No ratings for this period</p>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
