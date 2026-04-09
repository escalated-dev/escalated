<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import MetricComparison from '../../../components/MetricComparison.vue';
import ReportChart from '../../../components/ReportChart.vue';
import PeriodSelector from '../../../components/PeriodSelector.vue';
import ReportExportButton from '../../../components/ReportExportButton.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    period_days: { type: Number, default: 30 },
    current: {
        type: Object,
        default: () => ({
            total_tickets: 0,
            resolved_tickets: 0,
            avg_frt: 0,
            avg_resolution: 0,
            sla_compliance: 0,
            csat: 0,
            breach_count: 0,
            volume_trend: [],
        }),
    },
    previous: {
        type: Object,
        default: () => ({
            total_tickets: 0,
            resolved_tickets: 0,
            avg_frt: 0,
            avg_resolution: 0,
            sla_compliance: 0,
            csat: 0,
            breach_count: 0,
            volume_trend: [],
        }),
    },
});

const periodDays = ref(props.period_days);

function changePeriod(days) {
    periodDays.value = days;
    router.get(route('escalated.admin.reports.comparison'), { days }, { preserveState: true });
}

const overlayCurrentData = computed(() => {
    return (props.current?.volume_trend || []).map((d) => ({
        ...d,
        label: d.label || d.date,
    }));
});

const overlayPreviousData = computed(() => {
    return (props.previous?.volume_trend || []).map((d) => ({
        ...d,
        label: d.label || d.date,
    }));
});
</script>

<template>
    <EscalatedLayout title="Period Comparison">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton report-name="comparison" :period-days="periodDays" />
                <Link
                    :href="route('escalated.admin.reports')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back
                </Link>
            </div>
        </div>

        <!-- Period Labels -->
        <div class="mb-6 flex items-center gap-4">
            <div class="flex items-center gap-2">
                <span class="inline-block h-3 w-3 rounded-full bg-cyan-500"></span>
                <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                    >Current Period ({{ periodDays }}d)</span
                >
            </div>
            <div class="flex items-center gap-2">
                <span class="inline-block h-3 w-3 rounded-full bg-[var(--esc-panel-text-muted)]"></span>
                <span class="text-sm font-medium text-[var(--esc-panel-text-muted)]">Previous Period</span>
            </div>
        </div>

        <!-- Comparison Metrics -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricComparison
                label="Total Tickets"
                :value="current?.total_tickets ?? 0"
                :previous-value="previous?.total_tickets"
            />
            <MetricComparison
                label="Resolved"
                :value="current?.resolved_tickets ?? 0"
                :previous-value="previous?.resolved_tickets"
            />
            <MetricComparison
                label="Avg FRT"
                :value="current?.avg_frt ?? 0"
                :previous-value="previous?.avg_frt"
                format="h"
                :invert-color="true"
            />
            <MetricComparison
                label="Avg Resolution"
                :value="current?.avg_resolution ?? 0"
                :previous-value="previous?.avg_resolution"
                format="h"
                :invert-color="true"
            />
        </div>

        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <MetricComparison
                label="SLA Compliance"
                :value="current?.sla_compliance ?? 0"
                :previous-value="previous?.sla_compliance"
                format="%"
            />
            <MetricComparison label="CSAT" :value="current?.csat ?? 0" :previous-value="previous?.csat" />
            <MetricComparison
                label="SLA Breaches"
                :value="current?.breach_count ?? 0"
                :previous-value="previous?.breach_count"
                :invert-color="true"
            />
        </div>

        <!-- Volume Overlay -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ReportChart type="line" title="Current Period Volume" :data="overlayCurrentData" :colors="['#06b6d4']" />
            <ReportChart type="line" title="Previous Period Volume" :data="overlayPreviousData" :colors="['#6b7280']" />
        </div>
    </EscalatedLayout>
</template>
