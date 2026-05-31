<template>
    <div class="summary-tiles">
        <div v-for="tile in tiles" :key="tile.key" class="summary-tiles__tile">
            <div class="summary-tiles__label">{{ tile.label }}</div>
            <div class="summary-tiles__value">{{ tile.value }}</div>
            <div v-if="tile.rate !== null" class="summary-tiles__rate">{{ tile.rate }}</div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    summary: { type: Object, required: true },
});

function rate(num, denom) {
    if (!denom) return '—';
    return `${((num / denom) * 100).toFixed(1)}%`;
}

const tiles = computed(() => {
    const s = props.summary;
    return [
        { key: 'sent', label: 'Sent', value: s.sent, rate: null },
        { key: 'opened', label: 'Opened', value: s.opened, rate: rate(s.opened, s.sent) },
        { key: 'clicked', label: 'Clicked', value: s.clicked, rate: rate(s.clicked, s.sent) },
        { key: 'bounced', label: 'Bounced', value: s.bounced, rate: rate(s.bounced, s.sent) },
        { key: 'complained', label: 'Complained', value: s.complained, rate: rate(s.complained, s.sent) },
    ];
});
</script>

<style scoped>
.summary-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
}
.summary-tiles__tile {
    background: white;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 8px;
    padding: 16px;
}
.summary-tiles__label {
    font-size: 12px;
    text-transform: uppercase;
    color: var(--escalated-text-muted, #64748b);
    letter-spacing: 0.04em;
}
.summary-tiles__value {
    font-size: 28px;
    font-weight: 600;
    margin-top: 4px;
}
.summary-tiles__rate {
    font-size: 13px;
    color: var(--escalated-text-muted, #64748b);
    margin-top: 2px;
}
</style>
