<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import AgentPerformanceCard from '../../../components/AgentPerformanceCard.vue';
import { router, Link } from '@inertiajs/vue3';

const props = defineProps({
    period_days: Number,
    agents: Array,
});

function changePeriod(days) {
    router.get(route('escalated.admin.reports.agents'), { days }, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="Agent Performance Metrics">
        <div class="mb-6 flex items-center justify-between">
            <div class="flex gap-2">
                <button
                    v-for="d in [7, 30, 90]"
                    :key="d"
                    :class="[
                        'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                        period_days === d
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-black/20'
                            : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200',
                    ]"
                    @click="changePeriod(d)"
                >
                    Last {{ d }} days
                </button>
            </div>
            <Link :href="route('escalated.admin.reports')" class="text-sm text-neutral-500 hover:text-neutral-300">
                &larr; Back to Reports
            </Link>
        </div>

        <!-- Agent Table -->
        <div class="mb-8 overflow-hidden rounded-xl border border-white/[0.06]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Agent
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Total Tickets
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Resolved
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Avg Response
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Avg Resolution
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="agent in agents" :key="agent.agent_id" class="hover:bg-white/[0.02]">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-xs font-semibold text-neutral-400"
                                >
                                    {{ agent.agent_name?.charAt(0)?.toUpperCase() || '?' }}
                                </div>
                                <span class="text-sm font-medium text-neutral-200">{{ agent.agent_name }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ agent.total_tickets }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ agent.resolved_tickets }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ agent.avg_response_hours ?? '—' }}h</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ agent.avg_resolution_hours ?? '—' }}h</td>
                    </tr>
                    <tr v-if="!agents?.length">
                        <td colspan="5" class="px-4 py-8 text-center text-sm text-neutral-500">
                            No agent data for this period.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Agent Cards (visual) -->
        <div v-if="agents?.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AgentPerformanceCard v-for="agent in agents" :key="agent.agent_id" :agent="agent" />
        </div>
    </EscalatedLayout>
</template>
