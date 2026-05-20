<template>
    <div class="analytics-tiles">
        <SummaryTiles :summary="summary" />
        <section v-if="topClicks?.length" class="analytics-tiles__top-clicks">
            <h3>Top clicked URLs</h3>
            <ol>
                <li v-for="row in topClicks" :key="row.url">
                    <span class="analytics-tiles__url">{{ row.url }}</span>
                    <span class="analytics-tiles__count">{{ row.clicks }}</span>
                </li>
            </ol>
        </section>
    </div>
</template>

<script setup>
import SummaryTiles from './SummaryTiles.vue';

defineProps({
    summary: { type: Object, required: true },
    topClicks: { type: Array, default: () => [] },
});
</script>

<style scoped>
.analytics-tiles {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.analytics-tiles__top-clicks h3 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--escalated-text-muted, #64748b);
    margin: 0 0 8px;
}
.analytics-tiles__top-clicks ol {
    margin: 0;
    padding-left: 20px;
}
.analytics-tiles__top-clicks li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
}
.analytics-tiles__url {
    word-break: break-all;
}
.analytics-tiles__count {
    font-variant-numeric: tabular-nums;
    color: var(--escalated-text-muted, #64748b);
}
</style>
