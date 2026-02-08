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
                    :class="['rounded-lg px-3 py-1.5 text-sm', period_days === d ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50']">
                Last {{ d }} days
            </button>
        </div>
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatsCard title="Total Tickets" :value="total_tickets" color="indigo" />
            <StatsCard title="Resolved" :value="resolved_tickets" color="green" />
            <StatsCard title="Avg First Response" :value="`${avg_first_response_hours}h`" color="yellow" />
            <StatsCard title="SLA Breaches" :value="sla_breach_count" color="red" />
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="rounded-lg border border-gray-200 bg-white p-4">
                <h3 class="mb-3 text-sm font-medium text-gray-700">By Status</h3>
                <div v-for="(count, status) in by_status" :key="status" class="mb-2 flex items-center justify-between">
                    <span class="text-sm capitalize text-gray-600">{{ status.replace('_', ' ') }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-4">
                <h3 class="mb-3 text-sm font-medium text-gray-700">By Priority</h3>
                <div v-for="(count, priority) in by_priority" :key="priority" class="mb-2 flex items-center justify-between">
                    <span class="text-sm capitalize text-gray-600">{{ priority }}</span>
                    <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>