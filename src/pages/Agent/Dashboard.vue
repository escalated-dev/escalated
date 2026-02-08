<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatsCard from '../../components/StatsCard.vue';

defineProps({
    stats: Object,
    recentTickets: Array,
});
</script>

<template>
    <EscalatedLayout title="Agent Dashboard">
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatsCard label="Open Tickets" :value="stats.open" color="cyan" />
            <StatsCard label="My Assigned" :value="stats.my_assigned" color="violet" />
            <StatsCard label="Unassigned" :value="stats.unassigned" color="amber" />
            <StatsCard label="SLA Breached" :value="stats.sla_breached" color="red" />
            <StatsCard label="Resolved Today" :value="stats.resolved_today" color="green" />
        </div>
        <h2 class="mb-4 text-lg font-semibold text-neutral-200">Recent Tickets</h2>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Reference</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Subject</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Requester</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Priority</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Assignee</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="ticket in recentTickets" :key="ticket.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm">
                            <a :href="route('escalated.agent.tickets.show', ticket.reference)" class="font-medium text-neutral-300 hover:text-white">{{ ticket.reference }}</a>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-200">{{ ticket.subject }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ ticket.requester?.name }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="[
                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                                {
                                    'bg-cyan-500/10 text-white ring-cyan-500/20': ticket.status === 'open',
                                    'bg-blue-500/10 text-blue-400 ring-blue-500/20': ticket.status === 'in_progress',
                                    'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20': ticket.status === 'resolved',
                                    'bg-rose-500/10 text-rose-400 ring-rose-500/20': ticket.status === 'escalated',
                                    'bg-amber-500/10 text-amber-400 ring-amber-500/20': ticket.status === 'waiting_on_customer',
                                    'bg-gray-500/10 text-neutral-400 ring-gray-500/20': ticket.status === 'closed',
                                }
                            ]">{{ ticket.status }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm capitalize text-neutral-400">{{ ticket.priority }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ ticket.assignee?.name || 'Unassigned' }}</td>
                    </tr>
                    <tr v-if="!recentTickets?.length">
                        <td colspan="6" class="px-4 py-8 text-center text-sm text-neutral-500">No recent tickets</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
