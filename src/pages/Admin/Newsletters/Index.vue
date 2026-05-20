<template>
    <EscalatedLayout title="Newsletters">
        <div class="newsletters-index">
            <header>
                <h1>{{ $t('newsletters.index.title') }}</h1>
                <Link href="/admin/newsletters/new" class="button button--primary">
                    {{ $t('newsletters.index.new') }}
                </Link>
            </header>
            <nav class="newsletters-index__tabs">
                <Link
                    v-for="t in tabs"
                    :key="t.key"
                    :href="`/admin/newsletters?tab=${t.key}`"
                    :class="{ active: tab === t.key }"
                >
                    {{ t.label }}
                </Link>
            </nav>
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>List</th>
                        <th>Status</th>
                        <th>Scheduled</th>
                        <th>Sent</th>
                        <th>Recipients</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!filtered.length">
                        <td colspan="6" class="empty">{{ emptyMessage }}</td>
                    </tr>
                    <tr v-for="n in filtered" :key="n.id">
                        <td>
                            <Link :href="`/admin/newsletters/${n.id}`">{{ n.subject }}</Link>
                        </td>
                        <td>{{ n.target_list.name }}</td>
                        <td>
                            <span :class="`status status--${n.status}`">{{ n.status }}</span>
                        </td>
                        <td>{{ n.scheduled_at ? new Date(n.scheduled_at).toLocaleString() : '—' }}</td>
                        <td>{{ n.sent_at ? new Date(n.sent_at).toLocaleString() : '—' }}</td>
                        <td>{{ n.summary_total ?? '—' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    newsletters: { type: Array, required: true },
    tab: { type: String, default: 'drafts' },
});

const tabs = [
    { key: 'drafts', label: 'Drafts', statuses: ['draft'] },
    { key: 'scheduled', label: 'Scheduled', statuses: ['scheduled', 'sending', 'paused'] },
    { key: 'sent', label: 'Sent', statuses: ['sent', 'failed'] },
];

const filtered = computed(() => {
    const active = tabs.find((t) => t.key === props.tab) ?? tabs[0];
    return props.newsletters.filter((n) => active.statuses.includes(n.status));
});

const emptyMessage = computed(() => {
    if (props.tab === 'scheduled') return 'No scheduled sends.';
    if (props.tab === 'sent') return 'No newsletters sent yet.';
    return 'No drafts yet.';
});
</script>

<style scoped>
.newsletters-index header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.newsletters-index__tabs {
    display: flex;
    gap: 16px;
    border-bottom: 1px solid var(--escalated-border, #e2e8f0);
    margin-bottom: 12px;
}
.newsletters-index__tabs a {
    padding: 8px 4px;
    color: var(--escalated-text-muted, #64748b);
    border-bottom: 2px solid transparent;
    text-decoration: none;
}
.newsletters-index__tabs a.active {
    color: var(--escalated-text, #0f172a);
    border-bottom-color: var(--escalated-accent, #2563eb);
}
table {
    width: 100%;
    border-collapse: collapse;
}
th,
td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid var(--escalated-border, #e2e8f0);
    font-size: 14px;
}
.empty {
    color: var(--escalated-text-muted, #64748b);
    text-align: center;
    padding: 32px;
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
