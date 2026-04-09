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
    breach_trend: { type: Array, default: () => [] },
    breach_by_type_trend: { type: Array, default: () => [] },
    breach_by_department: { type: Array, default: () => [] },
    breach_by_priority: { type: Array, default: () => [] },
    at_risk_tickets: { type: Array, default: () => [] },
    total_breaches: { type: Number, default: 0 },
    breach_rate: { type: Number, default: 0 },
    first_response_breaches: { type: Number, default: 0 },
    resolution_breaches: { type: Number, default: 0 },
});

const periodDays = ref(props.period_days);

function changePeriod(days) {
    periodDays.value = days;
    router.get(route('escalated.admin.reports.sla-trends'), { days }, { preserveState: true });
}

const riskCategories = computed(() => {
    const tickets = props.at_risk_tickets || [];
    return {
        critical: tickets.filter((t) => t.hours_remaining <= 1),
        warning: tickets.filter((t) => t.hours_remaining > 1 && t.hours_remaining <= 4),
        watch: tickets.filter((t) => t.hours_remaining > 4 && t.hours_remaining <= 8),
    };
});
</script>

<template>
    <EscalatedLayout title="SLA Breach Trends">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton report-name="sla-trends" :period-days="periodDays" />
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
                label="Total Breaches"
                :value="total_breaches"
                :icon="'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'"
            />
            <KpiCard
                label="Breach Rate"
                :value="`${breach_rate}%`"
                :icon="'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z'"
            />
            <KpiCard
                label="FRT Breaches"
                :value="first_response_breaches"
                :icon="'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
            <KpiCard
                label="Resolution Breaches"
                :value="resolution_breaches"
                :icon="'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
        </div>

        <!-- Charts -->
        <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ReportChart type="line" title="Breach Count Over Time" :data="breach_trend" :colors="['#ef4444']" />
            <ReportChart
                type="stacked-bar"
                title="First Response vs Resolution Breaches"
                :data="breach_by_type_trend"
                :colors="['#f59e0b', '#ef4444']"
            />
            <ReportChart
                type="bar"
                title="Breach Rate by Department"
                :data="breach_by_department"
                :colors="['#8b5cf6']"
            />
            <ReportChart type="bar" title="Breach Rate by Priority" :data="breach_by_priority" :colors="['#06b6d4']" />
        </div>

        <!-- At Risk Panel -->
        <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
            <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text-secondary)]">
                At Risk - Approaching SLA Breach
            </h3>
            <div v-if="at_risk_tickets?.length" class="space-y-4">
                <!-- Critical: < 1h -->
                <div v-if="riskCategories.critical.length">
                    <div class="mb-2 flex items-center gap-2">
                        <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                        <span class="text-xs font-semibold uppercase tracking-wider text-red-400"
                            >Critical (&lt;1h)</span
                        >
                    </div>
                    <div class="space-y-1">
                        <div
                            v-for="ticket in riskCategories.critical"
                            :key="ticket.id"
                            class="flex items-center justify-between rounded-lg bg-red-500/5 px-3 py-2 border border-red-500/10"
                        >
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-xs text-red-400">{{ ticket.reference }}</span>
                                <span class="truncate text-sm text-[var(--esc-panel-text-secondary)]">{{
                                    ticket.subject
                                }}</span>
                            </div>
                            <span class="text-xs font-bold text-red-400">{{ ticket.hours_remaining }}h remaining</span>
                        </div>
                    </div>
                </div>

                <!-- Warning: 1-4h -->
                <div v-if="riskCategories.warning.length">
                    <div class="mb-2 flex items-center gap-2">
                        <span class="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                        <span class="text-xs font-semibold uppercase tracking-wider text-amber-400"
                            >Warning (1-4h)</span
                        >
                    </div>
                    <div class="space-y-1">
                        <div
                            v-for="ticket in riskCategories.warning"
                            :key="ticket.id"
                            class="flex items-center justify-between rounded-lg bg-amber-500/5 px-3 py-2 border border-amber-500/10"
                        >
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-xs text-amber-400">{{ ticket.reference }}</span>
                                <span class="truncate text-sm text-[var(--esc-panel-text-secondary)]">{{
                                    ticket.subject
                                }}</span>
                            </div>
                            <span class="text-xs font-bold text-amber-400"
                                >{{ ticket.hours_remaining }}h remaining</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Watch: 4-8h -->
                <div v-if="riskCategories.watch.length">
                    <div class="mb-2 flex items-center gap-2">
                        <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                        <span class="text-xs font-semibold uppercase tracking-wider text-blue-400">Watch (4-8h)</span>
                    </div>
                    <div class="space-y-1">
                        <div
                            v-for="ticket in riskCategories.watch"
                            :key="ticket.id"
                            class="flex items-center justify-between rounded-lg bg-blue-500/5 px-3 py-2 border border-blue-500/10"
                        >
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-xs text-blue-400">{{ ticket.reference }}</span>
                                <span class="truncate text-sm text-[var(--esc-panel-text-secondary)]">{{
                                    ticket.subject
                                }}</span>
                            </div>
                            <span class="text-xs font-bold text-blue-400">{{ ticket.hours_remaining }}h remaining</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="py-6 text-center text-sm text-[var(--esc-panel-text-muted)]">
                No tickets currently at risk of breaching SLA.
            </div>
        </div>
    </EscalatedLayout>
</template>
