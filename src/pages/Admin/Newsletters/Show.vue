<template>
    <EscalatedLayout title="Newsletter">
        <div class="show">
            <header>
                <div>
                    <h1>{{ newsletter.subject }}</h1>
                    <div class="show__meta">
                        From
                        {{
                            newsletter.from_name
                                ? `${newsletter.from_name} <${newsletter.from_email}>`
                                : newsletter.from_email
                        }}
                        → {{ newsletter.target_list.name }}
                    </div>
                </div>
                <div class="show__status">
                    <span :class="`status status--${newsletter.status}`">{{ newsletter.status }}</span>
                </div>
            </header>

            <nav class="show__tabs">
                <Link
                    :href="`/admin/newsletters/${newsletter.id}?tab=overview`"
                    :class="{ active: tab === 'overview' }"
                >
                    Overview
                </Link>
                <Link
                    :href="`/admin/newsletters/${newsletter.id}?tab=deliveries`"
                    :class="{ active: tab === 'deliveries' }"
                >
                    Deliveries
                </Link>
                <Link
                    :href="`/admin/newsletters/${newsletter.id}?tab=analytics`"
                    :class="{ active: tab === 'analytics' }"
                >
                    Analytics
                </Link>
            </nav>

            <section v-if="tab === 'overview'">
                <SummaryTiles :summary="summary" />
            </section>

            <section v-else-if="tab === 'deliveries'">
                <DeliveriesTable :rows="deliveries.data" @filter="onFilter" @export="onExport" />
            </section>

            <section v-else-if="tab === 'analytics'">
                <AnalyticsTiles :summary="summary" :top-clicks="topClicks" />
            </section>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import SummaryTiles from '../../../components/admin/newsletters/SummaryTiles.vue';
import DeliveriesTable from '../../../components/admin/newsletters/DeliveriesTable.vue';
import AnalyticsTiles from '../../../components/admin/newsletters/AnalyticsTiles.vue';
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    newsletter: { type: Object, required: true },
    deliveries: { type: Object, required: true },
    topClicks: { type: Array, default: () => [] },
    tab: { type: String, default: 'overview' },
});

const summary = computed(() => ({
    total: props.newsletter.summary_total ?? 0,
    sent: props.newsletter.summary_sent ?? 0,
    opened: props.newsletter.summary_opened ?? 0,
    clicked: props.newsletter.summary_clicked ?? 0,
    bounced: props.newsletter.summary_bounced ?? 0,
    complained: props.newsletter.summary_complained ?? 0,
}));

function onFilter(status) {
    router.get(`/admin/newsletters/${props.newsletter.id}?tab=deliveries&status=${status}`);
}
function onExport() {
    window.location.href = `/admin/newsletters/${props.newsletter.id}/deliveries.csv`;
}
</script>

<style scoped>
.show header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}
.show__meta {
    color: var(--escalated-text-muted, #64748b);
    font-size: 14px;
    margin-top: 4px;
}
.show__tabs {
    display: flex;
    gap: 16px;
    border-bottom: 1px solid var(--escalated-border, #e2e8f0);
    margin-bottom: 16px;
}
.show__tabs a {
    padding: 8px 4px;
    color: var(--escalated-text-muted, #64748b);
    border-bottom: 2px solid transparent;
    text-decoration: none;
}
.show__tabs a.active {
    color: var(--escalated-text, #0f172a);
    border-bottom-color: var(--escalated-accent, #2563eb);
}
.status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}
.status--draft {
    background: #f1f5f9;
}
.status--scheduled,
.status--sending {
    background: #e0f2fe;
}
.status--sent {
    background: #dcfce7;
}
.status--paused {
    background: #fef3c7;
}
.status--failed {
    background: #fee2e2;
}
</style>
