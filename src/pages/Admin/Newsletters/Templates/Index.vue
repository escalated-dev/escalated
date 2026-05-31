<template>
    <EscalatedLayout title="Templates">
        <div class="templates-index">
            <header>
                <h1>{{ $t('newsletters.templates.title') }}</h1>
                <Link href="/admin/newsletters/templates/new" class="button button--primary">
                    {{ $t('newsletters.templates.new') }}
                </Link>
            </header>
            <div class="templates-index__grid">
                <Link v-for="t in templates" :key="t.id" :href="`/admin/newsletters/templates/${t.id}`" class="card">
                    <h3>{{ t.name }}</h3>
                    <div class="card__meta">Theme: {{ t.theme }}</div>
                    <div class="card__meta">Updated: {{ new Date(t.updated_at).toLocaleDateString() }}</div>
                </Link>
            </div>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import { Link } from '@inertiajs/vue3';

defineProps({ templates: { type: Array, required: true } });
</script>

<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.templates-index__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
}
.card {
    display: block;
    padding: 16px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 8px;
    background: white;
    text-decoration: none;
    color: inherit;
}
.card__meta {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
    margin-top: 4px;
}
</style>
