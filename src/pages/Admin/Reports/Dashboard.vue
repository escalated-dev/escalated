<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import KpiCard from '../../../components/KpiCard.vue';
import ChartWidget from '../../../components/ChartWidget.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    period_days: Number,
    volume: Array,
    by_status: Array,
    by_priority: Array,
    avg_response_hours: Number,
    avg_resolution_hours: Number,
    sla_compliance: Number,
    csat_average: Number,
    agent_performance: Array,
});

const activeTab = ref('overview');

const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'agents', label: 'Agents' },
    { key: 'sla', label: 'SLA' },
    { key: 'csat', label: 'CSAT' },
];

function changePeriod(days) {
    router.get(route('escalated.admin.reports.dashboard'), { days }, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="Reports Dashboard">
        <!-- Period selector -->
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
                Classic View
            </Link>
        </div>

        <!-- Tabs -->
        <div class="mb-6 flex gap-1 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] p-1">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                :class="[
                    'rounded-md px-4 py-2 text-sm font-medium transition-all',
                    activeTab === tab.key
                        ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]'
                        : 'text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]',
                ]"
                @click="activeTab = tab.key"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'">
            <!-- KPI Cards -->
            <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <KpiCard
                    label="Avg Response Time"
                    :value="`${avg_response_hours}h`"
                    :icon="'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'"
                />
                <KpiCard
                    label="Avg Resolution Time"
                    :value="`${avg_resolution_hours}h`"
                    :icon="'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'"
                />
                <KpiCard
                    label="SLA Compliance"
                    :value="`${sla_compliance}%`"
                    :icon="'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'"
                />
                <KpiCard
                    label="CSAT Average"
                    :value="csat_average || '—'"
                    :icon="'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'"
                />
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ChartWidget title="Ticket Volume" :data="volume" color="cyan" />
                <ChartWidget title="By Status" :data="by_status" color="violet" />
                <ChartWidget title="By Priority" :data="by_priority" color="amber" />
            </div>
        </div>

        <!-- Agents Tab -->
        <div v-if="activeTab === 'agents'">
            <div class="mb-4 text-right">
                <Link
                    :href="route('escalated.admin.reports.agents', { days: period_days })"
                    class="text-sm text-[var(--esc-panel-accent)] hover:text-[var(--esc-panel-accent)]"
                >
                    Full Agent Report &rarr;
                </Link>
            </div>
            <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
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
                                Tickets
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
                        <tr
                            v-for="agent in agent_performance"
                            :key="agent.agent_id"
                            class="hover:bg-[var(--esc-panel-hover)]"
                        >
                            <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                {{ agent.agent_name }}
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
                        <tr v-if="!agent_performance?.length">
                            <td colspan="5" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                                No agent data for this period.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SLA Tab -->
        <div v-if="activeTab === 'sla'">
            <div class="mb-4 flex items-center justify-between">
                <KpiCard label="Overall SLA Compliance" :value="`${sla_compliance}%`" />
                <Link
                    :href="route('escalated.admin.reports.sla', { days: period_days })"
                    class="text-sm text-[var(--esc-panel-accent)] hover:text-[var(--esc-panel-accent)]"
                >
                    Full SLA Report &rarr;
                </Link>
            </div>
        </div>

        <!-- CSAT Tab -->
        <div v-if="activeTab === 'csat'">
            <div class="mb-4 flex items-center justify-between">
                <KpiCard label="Average CSAT" :value="csat_average || '—'" />
                <Link
                    :href="route('escalated.admin.reports.csat', { days: period_days })"
                    class="text-sm text-[var(--esc-panel-accent)] hover:text-[var(--esc-panel-accent)]"
                >
                    Full CSAT Report &rarr;
                </Link>
            </div>
        </div>
    </EscalatedLayout>
</template>
