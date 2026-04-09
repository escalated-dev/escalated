<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import ReportChart from '../../../components/ReportChart.vue';
import PeriodSelector from '../../../components/PeriodSelector.vue';
import ReportExportButton from '../../../components/ReportExportButton.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    period_days: { type: Number, default: 30 },
    by_tag: { type: Array, default: () => [] },
    by_department: { type: Array, default: () => [] },
    by_channel: { type: Array, default: () => [] },
    by_type: { type: Array, default: () => [] },
    by_priority: { type: Array, default: () => [] },
});

const periodDays = ref(props.period_days);
const activeTab = ref('department');
const sortColumn = ref('volume');
const sortDir = ref('desc');

const tabs = [
    { key: 'department', label: 'By Department' },
    { key: 'tag', label: 'By Tag' },
    { key: 'channel', label: 'By Channel' },
    { key: 'type', label: 'By Type' },
    { key: 'priority', label: 'By Priority' },
];

function changePeriod(days) {
    periodDays.value = days;
    router.get(route('escalated.admin.reports.cohorts'), { days }, { preserveState: true });
}

const activeCohortData = computed(() => {
    const map = {
        tag: props.by_tag,
        department: props.by_department,
        channel: props.by_channel,
        type: props.by_type,
        priority: props.by_priority,
    };
    return map[activeTab.value] || [];
});

const sortedCohorts = computed(() => {
    const data = [...activeCohortData.value];
    data.sort((a, b) => {
        const aVal = a[sortColumn.value] ?? 0;
        const bVal = b[sortColumn.value] ?? 0;
        return sortDir.value === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return data;
});

const chartData = computed(() => {
    return activeCohortData.value.map((c) => ({
        label: c.name || c.label,
        value: c.volume || 0,
    }));
});

function toggleSort(col) {
    if (sortColumn.value === col) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDir.value = 'desc';
    }
}
</script>

<template>
    <EscalatedLayout title="Cohort Analysis">
        <div class="mb-6 flex items-center justify-between">
            <PeriodSelector :model-value="periodDays" @update:model-value="changePeriod" />
            <div class="flex items-center gap-3">
                <ReportExportButton report-name="cohorts" :period-days="periodDays" />
                <Link
                    :href="route('escalated.admin.reports')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back
                </Link>
            </div>
        </div>

        <!-- Tab Selector -->
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

        <!-- Chart -->
        <div class="mb-6">
            <ReportChart
                type="bar"
                :title="`Volume ${tabs.find((t) => t.key === activeTab)?.label || ''}`"
                :data="chartData"
                :colors="['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']"
            />
        </div>

        <!-- Cohort Table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Name
                        </th>
                        <th
                            v-for="col in [
                                { key: 'volume', label: 'Volume' },
                                { key: 'avg_resolution', label: 'Avg Resolution' },
                                { key: 'breach_rate', label: 'Breach Rate' },
                                { key: 'csat', label: 'CSAT' },
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
                    <tr
                        v-for="cohort in sortedCohorts"
                        :key="cohort.name || cohort.label"
                        class="hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            {{ cohort.name || cohort.label }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ cohort.volume ?? 0 }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ cohort.avg_resolution ?? '—' }}h
                        </td>
                        <td
                            class="px-4 py-3 text-sm"
                            :class="
                                (cohort.breach_rate ?? 0) > 20
                                    ? 'text-red-400'
                                    : 'text-[var(--esc-panel-text-tertiary)]'
                            "
                        >
                            {{ cohort.breach_rate ?? '—' }}%
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ cohort.csat ?? '—' }}
                        </td>
                    </tr>
                    <tr v-if="!sortedCohorts.length">
                        <td colspan="5" class="px-4 py-8 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No data for this cohort type.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
