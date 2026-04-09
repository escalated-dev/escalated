<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import PeriodSelector from '../../../components/PeriodSelector.vue';
import ReportExportButton from '../../../components/ReportExportButton.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    period_days: { type: Number, default: 30 },
    agents: { type: Array, default: () => [] },
});

const periodDays = ref(props.period_days);
const sortColumn = ref('composite_score');
const sortDir = ref('desc');

function changePeriod(days) {
    periodDays.value = days;
    router.get(route('escalated.admin.reports.agent-ranking'), { days }, { preserveState: true });
}

const sortedAgents = computed(() => {
    const list = [...(props.agents || [])];
    list.sort((a, b) => {
        const aVal = a[sortColumn.value] ?? 0;
        const bVal = b[sortColumn.value] ?? 0;
        return sortDir.value === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
});

const topPerformers = computed(() => sortedAgents.value.slice(0, 3));
const needsAttention = computed(() => {
    return [...(props.agents || [])].sort((a, b) => (a.composite_score ?? 0) - (b.composite_score ?? 0)).slice(0, 3);
});

function toggleSort(col) {
    if (sortColumn.value === col) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDir.value = 'desc';
    }
}

function scoreColor(score) {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
}

function renderSparkline(points) {
    if (!points?.length) return '';
    const max = Math.max(...points, 1);
    const w = 80;
    const h = 24;
    const step = w / Math.max(points.length - 1, 1);
    return points
        .map((v, i) => {
            const x = i * step;
            const y = h - (v / max) * h;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
}
</script>

<template>
    <EscalatedLayout title="Agent Performance Rankings">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton report-name="agent-ranking" :period-days="periodDays" />
                <Link
                    :href="route('escalated.admin.reports')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back
                </Link>
            </div>
        </div>

        <!-- Top / Needs Attention -->
        <div v-if="agents?.length" class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.178-1.768.654-2.127 1.38a8.69 8.69 0 00-.808 3.06c0 2.625 1.418 4.9 3.524 6.13M18.75 4.236c.996.178 1.768.654 2.127 1.38a8.69 8.69 0 01.808 3.06c0 2.625-1.418 4.9-3.524 6.13"
                        />
                    </svg>
                    Top Performers
                </h3>
                <div class="space-y-2">
                    <div
                        v-for="(agent, idx) in topPerformers"
                        :key="agent.agent_id"
                        class="flex items-center justify-between rounded-lg bg-emerald-500/5 px-3 py-2"
                    >
                        <div class="flex items-center gap-3">
                            <span
                                class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400"
                            >
                                {{ idx + 1 }}
                            </span>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">{{
                                agent.agent_name
                            }}</span>
                        </div>
                        <span class="text-sm font-bold text-emerald-400">{{ agent.composite_score }}</span>
                    </div>
                </div>
            </div>

            <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                    Needs Attention
                </h3>
                <div class="space-y-2">
                    <div
                        v-for="agent in needsAttention"
                        :key="agent.agent_id"
                        class="flex items-center justify-between rounded-lg bg-red-500/5 px-3 py-2"
                    >
                        <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">{{
                            agent.agent_name
                        }}</span>
                        <span class="text-sm font-bold text-red-400">{{ agent.composite_score }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ranked Table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            #
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Agent
                        </th>
                        <th
                            v-for="col in [
                                { key: 'composite_score', label: 'Score' },
                                { key: 'resolution_rate', label: 'Resolution %' },
                                { key: 'avg_frt', label: 'Avg FRT' },
                                { key: 'avg_resolution', label: 'Avg Res' },
                                { key: 'csat', label: 'CSAT' },
                                { key: 'volume', label: 'Volume' },
                            ]"
                            :key="col.key"
                            class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                            @click="toggleSort(col.key)"
                        >
                            {{ col.label }}
                            <span v-if="sortColumn === col.key">{{ sortDir === 'asc' ? ' &#9650;' : ' &#9660;' }}</span>
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Trend
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr
                        v-for="(agent, idx) in sortedAgents"
                        :key="agent.agent_id"
                        class="cursor-pointer hover:bg-[var(--esc-panel-hover)]"
                        @click="
                            router.visit(
                                route('escalated.admin.reports.agent-detail', { id: agent.agent_id, days: periodDays }),
                            )
                        "
                    >
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-muted)]">{{ idx + 1 }}</td>
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
                        <td class="px-4 py-3 text-sm font-bold" :class="scoreColor(agent.composite_score)">
                            {{ agent.composite_score ?? '—' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.resolution_rate ?? '—' }}%
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.avg_frt ?? '—' }}h
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.avg_resolution ?? '—' }}h
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.csat ?? '—' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ agent.volume ?? 0 }}
                        </td>
                        <td class="px-4 py-3">
                            <svg v-if="agent.sparkline?.length" width="80" height="24" class="overflow-visible">
                                <path
                                    :d="renderSparkline(agent.sparkline)"
                                    fill="none"
                                    stroke="#06b6d4"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <span v-else class="text-xs text-[var(--esc-panel-text-muted)]">--</span>
                        </td>
                    </tr>
                    <tr v-if="!sortedAgents.length">
                        <td colspan="9" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No agent data for this period.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
