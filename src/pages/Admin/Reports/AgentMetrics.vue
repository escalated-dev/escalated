<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import AgentPerformanceCard from '../../../components/AgentPerformanceCard.vue';
import { router, Link } from '@inertiajs/vue3';

defineProps({
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
                            ? 'bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] text-white shadow-lg shadow-[var(--esc-panel-bg)]/20'
                            : 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
                    ]"
                    @click="changePeriod(d)"
                >
                    Last {{ d }} days
                </button>
            </div>
            <Link
                :href="route('escalated.admin.reports')"
                class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
            >
                &larr; Back to Reports
            </Link>
        </div>

        <!-- Agent Table -->
        <div class="mb-8 overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Agent
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Total Tickets
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Resolved
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Avg Response
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Avg Resolution
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-for="agent in agents" :key="agent.agent_id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--esc-panel-hover)] text-xs font-semibold text-[var(--esc-panel-text-tertiary)]"
                                >
                                    {{ agent.agent_name?.charAt(0)?.toUpperCase() || '?' }}
                                </div>
                                <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">{{
                                    agent.agent_name
                                }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.total_tickets }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.resolved_tickets }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.avg_response_hours ?? '—' }}h
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.avg_resolution_hours ?? '—' }}h
                        </td>
                    </tr>
                    <tr v-if="!agents?.length">
                        <td colspan="5" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
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
