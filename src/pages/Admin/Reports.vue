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
});

function changePeriod(days) {
    router.get(route('escalated.admin.reports'), { days }, { preserveState: true });
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
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        </div>
    </EscalatedLayout>
</template>
