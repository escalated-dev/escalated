<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import KpiCard from '../../../components/KpiCard.vue';
import SlaComplianceChart from '../../../components/SlaComplianceChart.vue';
import { router, Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    period_days: Number,
    compliance_rate: Number,
    compliance_by_policy: Array,
    breaches: Array,
});

function changePeriod(days) {
    router.get(route('escalated.admin.reports.sla'), { days }, { preserveState: true });
}

const totalTickets = computed(() => {
    return props.compliance_by_policy?.reduce((sum, p) => sum + p.total, 0) || 0;
});

const firstResponseBreaches = computed(() => {
    return props.breaches?.filter((b) => b.sla_first_response_breached).length || 0;
});

const resolutionBreaches = computed(() => {
    return props.breaches?.filter((b) => b.sla_resolution_breached).length || 0;
});
</script>

<template>
    <EscalatedLayout title="SLA Achievement Report">
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

        <!-- Summary KPIs -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
                label="Total SLA Tickets"
                :value="totalTickets"
                :icon="'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z'"
            />
            <KpiCard
                label="Compliance Rate"
                :value="`${compliance_rate}%`"
                :icon="'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'"
            />
            <KpiCard
                label="First Response Breaches"
                :value="firstResponseBreaches"
                :icon="'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'"
            />
            <KpiCard
                label="Resolution Breaches"
                :value="resolutionBreaches"
                :icon="'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'"
            />
        </div>

        <!-- Compliance by Policy -->
        <div class="mb-8">
            <SlaComplianceChart :data="compliance_by_policy" />
        </div>

        <!-- Breach Details Table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <div class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-4 py-3">
                <h3 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">Breach Details</h3>
            </div>
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Ticket
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Subject
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            SLA Policy
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Breach Type
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Created
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-for="ticket in breaches" :key="ticket.id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3 text-sm font-mono text-[var(--esc-panel-accent)]">
                            {{ ticket.reference }}
                        </td>
                        <td class="max-w-xs truncate px-4 py-3 text-sm text-[var(--esc-panel-text-secondary)]">
                            {{ ticket.subject }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ ticket.sla_policy?.name || '—' }}
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex gap-1.5">
                                <span
                                    v-if="ticket.sla_first_response_breached"
                                    class="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"
                                >
                                    Response
                                </span>
                                <span
                                    v-if="ticket.sla_resolution_breached"
                                    class="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400"
                                >
                                    Resolution
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-muted)]">
                            {{ ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—' }}
                        </td>
                    </tr>
                    <tr v-if="!breaches?.length">
                        <td colspan="5" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No SLA breaches in this period.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
