<template>
    <div class="deliveries-table">
        <div class="deliveries-table__toolbar">
            <select
                class="deliveries-table__filter"
                :value="statusFilter"
                @change="$emit('filter', $event.target.value)"
            >
                <option value="">All statuses</option>
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
            </select>
            <button type="button" class="deliveries-table__export" @click="$emit('export')">Export CSV</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Opened</th>
                    <th>Last clicked</th>
                    <th>Bounce reason</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="row.id">
                    <td>
                        <div>{{ row.contact.name ?? '—' }}</div>
                        <div class="deliveries-table__email">{{ row.contact.email }}</div>
                    </td>
                    <td>
                        <span :class="`status status--${row.status}`">{{ row.status }}</span>
                    </td>
                    <td>{{ row.sent_at ? new Date(row.sent_at).toLocaleString() : '—' }}</td>
                    <td>{{ row.opened_at ? new Date(row.opened_at).toLocaleString() : '—' }}</td>
                    <td>{{ row.last_clicked_at ? new Date(row.last_clicked_at).toLocaleString() : '—' }}</td>
                    <td>{{ row.bounce_reason ?? '—' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    rows: { type: Array, required: true },
    statusFilter: { type: String, default: '' },
});
defineEmits(['filter', 'export']);
const statuses = ['pending', 'queued', 'sent', 'bounced', 'complained', 'suppressed', 'failed'];
</script>

<style scoped>
.deliveries-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.deliveries-table__toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
}
.deliveries-table table {
    width: 100%;
    border-collapse: collapse;
}
.deliveries-table th,
.deliveries-table td {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid var(--escalated-border, #e2e8f0);
    font-size: 14px;
}
.deliveries-table__email {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
}
.status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}
.status--sent {
    background: #e0f2fe;
}
.status--bounced {
    background: #fee2e2;
}
.status--complained {
    background: #fef3c7;
}
.status--pending,
.status--queued {
    background: #f1f5f9;
}
.status--failed {
    background: #fecaca;
}
.status--suppressed {
    background: #ede9fe;
}
</style>
