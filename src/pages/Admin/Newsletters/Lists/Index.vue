<template>
    <EscalatedLayout title="Lists">
        <div class="lists-index">
            <header>
                <h1>{{ $t('newsletters.lists.title') }}</h1>
                <Link href="/admin/newsletters/lists/new" class="button button--primary">
                    {{ $t('newsletters.lists.new') }}
                </Link>
            </header>
            <table>
                <thead>
                    <tr>
                        <th>{{ $t('newsletters.lists.columns.name') }}</th>
                        <th>{{ $t('newsletters.lists.columns.kind') }}</th>
                        <th>{{ $t('newsletters.lists.columns.members') }}</th>
                        <th>{{ $t('newsletters.lists.columns.opted_out') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="l in lists" :key="l.id">
                        <td>
                            <Link :href="`/admin/newsletters/lists/${l.id}`">{{ l.name }}</Link>
                        </td>
                        <td>{{ l.kind }}</td>
                        <td>{{ l.member_count }}</td>
                        <td>{{ l.opted_out_count }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import { Link } from '@inertiajs/vue3';

defineProps({ lists: { type: Array, required: true } });
</script>

<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
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
</style>
