<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import KpiCard from '../../../components/KpiCard.vue';
import ReportChart from '../../../components/ReportChart.vue';
import PeriodSelector from '../../../components/PeriodSelector.vue';
import ReportExportButton from '../../../components/ReportExportButton.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    period_days: { type: Number, default: 30 },
    avg_resolution: { type: Number, default: 0 },
    median_resolution: { type: Number, default: 0 },
    p90_resolution: { type: Number, default: 0 },
    pct_under_target: { type: Number, default: 0 },
    distribution: { type: Array, default: () => [] },
    trend: { type: Array, default: () => [] },
    by_agent: { type: Array, default: () => [] },
    by_department: { type: Array, default: () => [] },
    by_channel: { type: Array, default: () => [] },
    target_hours: { type: Number, default: 24 },
});

const periodDays = ref(props.period_days);
const sortColumn = ref('avg');
const sortDir = ref('asc');

function changePeriod(days) {
    periodDays.value = days;
    router.get(route('escalated.admin.reports.resolution-times'), { days }, { preserveState: true });
}

function resColor(value) {
    if (value <= props.target_hours * 0.5) return 'text-emerald-400';
    if (value <= props.target_hours) return 'text-amber-400';
    return 'text-red-400';
}

const sortedAgents = computed(() => {
    const agents = [...(props.by_agent || [])];
    agents.sort((a, b) => {
        const aVal = a[sortColumn.value] ?? 0;
        const bVal = b[sortColumn.value] ?? 0;
        return sortDir.value === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return agents;
});

function toggleSort(col) {
    if (sortColumn.value === col) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDir.value = 'asc';
    }
}
</script>

<template>
    <EscalatedLayout title="Resolution Time Analysis">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton report-name="resolution-times" :period-days="periodDays" />
                <Link
                    :href="route('escalated.admin.reports')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back
                </Link>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
                label="Avg Resolution"
                :value="`${avg_resolution}h`"
                :icon="'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
            <KpiCard
                label="Median Resolution"
                :value="`${median_resolution}h`"
                :icon="'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5'"
            />
            <KpiCard
                label="P90 Resolution"
                :value="`${p90_resolution}h`"
                :icon="'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z'"
            />
            <KpiCard
                label="Under Target"
                :value="`${pct_under_target}%`"
                :icon="'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
        </div>

        <!-- Charts -->
        <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ReportChart
                type="histogram"
                title="Resolution Time Distribution"
                :data="distribution"
                :colors="['#8b5cf6']"
                x-label="Resolution Time Buckets"
            />
            <ReportChart type="line" title="Avg Resolution Time Trend" :data="trend" :colors="['#06b6d4']" />
            <ReportChart type="bar" title="Resolution by Department" :data="by_department" :colors="['#f59e0b']" />
            <ReportChart type="bar" title="Resolution by Channel" :data="by_channel" :colors="['#10b981']" />
        </div>

        <!-- Agent Table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <div class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-4 py-3">
                <h3 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">Resolution Time by Agent</h3>
            </div>
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Agent
                        </th>
                        <th
                            v-for="col in [
                                { key: 'avg', label: 'Avg' },
                                { key: 'median', label: 'Median' },
                                { key: 'p90', label: 'P90' },
                            ]"
                            :key="col.key"
                            class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                            @click="toggleSort(col.key)"
                        >
                            {{ col.label }}
                            <span v-if="sortColumn === col.key">{{ sortDir === 'asc' ? ' &#9650;' : ' &#9660;' }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-for="agent in sortedAgents" :key="agent.agent_id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            {{ agent.agent_name }}
                        </td>
                        <td class="px-4 py-3 text-sm font-medium" :class="resColor(agent.avg)">
                            {{ agent.avg ?? '—' }}h
                        </td>
                        <td class="px-4 py-3 text-sm font-medium" :class="resColor(agent.median)">
                            {{ agent.median ?? '—' }}h
                        </td>
                        <td class="px-4 py-3 text-sm font-medium" :class="resColor(agent.p90)">
                            {{ agent.p90 ?? '—' }}h
                        </td>
                    </tr>
                    <tr v-if="!sortedAgents.length">
                        <td colspan="4" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No agent data for this period.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
