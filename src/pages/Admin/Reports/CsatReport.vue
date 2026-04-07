<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import KpiCard from '../../../components/KpiCard.vue';
import ChartWidget from '../../../components/ChartWidget.vue';
import { router, Link } from '@inertiajs/vue3';

defineProps({
    period_days: Number,
    csat_average: Number,
    response_rate: Number,
    total_ratings: Number,
    by_agent: Array,
    over_time: Array,
});

function changePeriod(days) {
    router.get(route('escalated.admin.reports.csat'), { days }, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="Customer Satisfaction Report">
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
            <div class="flex items-center gap-3">
                <Link
                    :href="route('escalated.admin.settings.csat')"
                    class="text-sm text-[var(--esc-panel-accent)] hover:text-[var(--esc-panel-accent)]"
                >
                    CSAT Settings
                </Link>
                <Link
                    :href="route('escalated.admin.reports')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back to Reports
                </Link>
            </div>
        </div>

        <!-- KPIs -->
        <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <KpiCard
                label="Average Rating"
                :value="csat_average || '—'"
                :icon="'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'"
            />
            <KpiCard
                label="Response Rate"
                :value="`${response_rate}%`"
                :icon="'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z'"
            />
            <KpiCard
                label="Total Ratings"
                :value="total_ratings"
                :icon="'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'"
            />
        </div>

        <!-- Charts -->
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartWidget title="CSAT Over Time" :data="over_time" color="amber" />

            <!-- By Agent -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
                <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text-secondary)]">Ratings by Agent</h3>
                <div v-if="by_agent?.length" class="space-y-3">
                    <div v-for="agent in by_agent" :key="agent.agent_id" class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--esc-panel-hover)] text-xs font-semibold text-[var(--esc-panel-text-tertiary)]"
                            >
                                {{ agent.agent_name?.charAt(0)?.toUpperCase() || '?' }}
                            </div>
                            <div>
                                <div class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                    {{ agent.agent_name }}
                                </div>
                                <div class="text-xs text-[var(--esc-panel-text-muted)]">
                                    {{ agent.total_ratings }} ratings
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-0.5">
                                <svg
                                    v-for="n in 5"
                                    :key="n"
                                    class="h-3.5 w-3.5"
                                    :class="
                                        n <= Math.round(agent.avg_rating)
                                            ? 'text-amber-400'
                                            : 'text-[var(--esc-panel-text-muted)]'
                                    "
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    />
                                </svg>
                            </div>
                            <span class="text-sm font-bold text-[var(--esc-panel-text)]">{{ agent.avg_rating }}</span>
                        </div>
                    </div>
                </div>
                <div v-else class="py-6 text-center text-sm text-[var(--esc-panel-text-muted)]">
                    No agent ratings for this period.
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
