<script setup>
import EscalatedLayout from '../../../Components/Escalated/EscalatedLayout.vue';
import StatsCard from '../../../Components/Escalated/StatsCard.vue';
import TicketList from '../../../Components/Escalated/TicketList.vue';

defineProps({
    stats: Object,
    recentTickets: Array,
});
</script>

<template>
    <EscalatedLayout title="Agent Dashboard">
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatsCard title="Open Tickets" :value="stats.open" color="indigo" />
            <StatsCard title="My Assigned" :value="stats.my_assigned" color="indigo" />
            <StatsCard title="Unassigned" :value="stats.unassigned" color="yellow" />
            <StatsCard title="SLA Breached" :value="stats.sla_breached" color="red" />
            <StatsCard title="Resolved Today" :value="stats.resolved_today" color="green" />
        </div>
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Recent Tickets</h2>
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Subject</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Requester</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Assignee</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="ticket in recentTickets" :key="ticket.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">
                            <a :href="route('escalated.agent.tickets.show', ticket.reference)" class="font-medium text-indigo-600 hover:text-indigo-900">{{ ticket.reference }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900">{{ ticket.subject }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ ticket.requester?.name }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', { 'bg-blue-100 text-blue-800': ticket.status === 'open', 'bg-green-100 text-green-800': ticket.status === 'resolved', 'bg-red-100 text-red-800': ticket.status === 'escalated' }]">{{ ticket.status }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ ticket.priority }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ ticket.assignee?.name || 'Unassigned' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
