<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import MetricComparison from '../../../components/MetricComparison.vue';
import ReportChart from '../../../components/ReportChart.vue';
import PercentileChart from '../../../components/PercentileChart.vue';
import PeriodSelector from '../../../components/PeriodSelector.vue';
import ReportExportButton from '../../../components/ReportExportButton.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    period_days: { type: Number, default: 30 },
    agent: { type: Object, default: () => ({}) },
    total_tickets: { type: Number, default: 0 },
    resolved_tickets: { type: Number, default: 0 },
    avg_frt: { type: Number, default: 0 },
    avg_resolution: { type: Number, default: 0 },
    csat_score: { type: [Number, String], default: '—' },
    response_percentiles: { type: Object, default: () => ({ p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 }) },
    productivity: { type: Array, default: () => [] },
    workload: { type: Array, default: () => [] },
    csat_breakdown: { type: Array, default: () => [] },
    prev_total_tickets: { type: Number, default: null },
    prev_resolved_tickets: { type: Number, default: null },
    prev_avg_frt: { type: Number, default: null },
    prev_avg_resolution: { type: Number, default: null },
    prev_csat_score: { type: [Number, String], default: null },
});

const periodDays = ref(props.period_days);

function changePeriod(days) {
    periodDays.value = days;
    router.get(
        route('escalated.admin.reports.agent-detail', { id: props.agent?.id }),
        { days },
        { preserveState: true },
    );
}
</script>

<template>
    <EscalatedLayout :title="`Agent: ${agent?.name || 'Unknown'}`">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton :report-name="`agent-${agent?.id}`" :period-days="periodDays" />
                <Link
                    :href="route('escalated.admin.reports.agent-ranking', { days: periodDays })"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back to Rankings
                </Link>
            </div>
        </div>

        <!-- Agent Header -->
        <div
            class="mb-6 flex items-center gap-4 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5"
        >
            <div
                class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xl font-bold text-white"
            >
                {{ agent?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div>
                <h2 class="text-lg font-bold text-[var(--esc-panel-text)]">{{ agent?.name || 'Unknown Agent' }}</h2>
                <p class="text-sm text-[var(--esc-panel-text-muted)]">{{ agent?.email || '' }}</p>
            </div>
        </div>

        <!-- KPI Cards with comparison -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <MetricComparison
                label="Total Tickets"
                :value="total_tickets"
                :previous-value="prev_total_tickets"
                :icon="'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z'"
            />
            <MetricComparison
                label="Resolved"
                :value="resolved_tickets"
                :previous-value="prev_resolved_tickets"
                :icon="'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
            <MetricComparison
                label="Avg FRT"
                :value="avg_frt"
                :previous-value="prev_avg_frt"
                format="h"
                :invert-color="true"
                :icon="'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
            <MetricComparison
                label="Avg Resolution"
                :value="avg_resolution"
                :previous-value="prev_avg_resolution"
                format="h"
                :invert-color="true"
                :icon="'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5'"
            />
            <MetricComparison
                label="CSAT Score"
                :value="csat_score"
                :previous-value="prev_csat_score"
                :icon="'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'"
            />
        </div>

        <!-- Percentile & Productivity Charts -->
        <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PercentileChart title="Response Time Percentiles" :percentiles="response_percentiles" unit="h" />
            <ReportChart
                type="bar"
                title="Productivity (Replies & Resolutions per Day)"
                :data="productivity"
                :colors="['#06b6d4', '#8b5cf6']"
            />
        </div>

        <!-- Workload & CSAT -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ReportChart type="area" title="Workload Over Time" :data="workload" :colors="['#f59e0b']" />
            <ReportChart
                type="pie"
                title="CSAT Breakdown"
                :data="csat_breakdown"
                :colors="['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4']"
            />
        </div>
    </EscalatedLayout>
</template>
