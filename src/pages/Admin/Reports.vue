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
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-gray-200']">
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
            <div class="rounded-xl border border-white/[0.06] bg-gray-900/60 p-5">
                <h3 class="mb-4 text-sm font-semibold text-gray-200">By Status</h3>
                <div v-for="(count, status) in by_status" :key="status" class="mb-2.5 flex items-center justify-between">
                    <span class="text-sm capitalize text-gray-400">{{ status.replace('_', ' ') }}</span>
                    <span class="text-sm font-semibold text-white">{{ count }}</span>
                </div>
            </div>
            <div class="rounded-xl border border-white/[0.06] bg-gray-900/60 p-5">
                <h3 class="mb-4 text-sm font-semibold text-gray-200">By Priority</h3>
                <div v-for="(count, priority) in by_priority" :key="priority" class="mb-2.5 flex items-center justify-between">
                    <span class="text-sm capitalize text-gray-400">{{ priority }}</span>
                    <span class="text-sm font-semibold text-white">{{ count }}</span>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
