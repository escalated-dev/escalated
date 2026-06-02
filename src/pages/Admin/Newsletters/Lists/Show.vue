<template>
    <EscalatedLayout title="List">
        <div class="lists-show">
            <header>
                <h1>{{ list.name }}</h1>
                <div class="lists-show__meta">
                    {{ list.kind }} list · {{ list.member_count }} members · {{ list.opted_out_count }} opted out
                </div>
            </header>
            <section v-if="list.kind === 'static'">
                <ListMemberTable :members="members.data" @remove="onRemove" />
            </section>
            <section v-else>
                <DynamicFilterBuilder
                    :model-value="list.filter_json ?? { rules: [] }"
                    :match-count="matchCount"
                    @update:model-value="onFilterChange"
                />
            </section>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import ListMemberTable from '../../../../components/admin/newsletters/ListMemberTable.vue';
import DynamicFilterBuilder from '../../../../components/admin/newsletters/DynamicFilterBuilder.vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    list: { type: Object, required: true },
    members: { type: Object, required: true },
    matchCount: { type: Number, default: 0 },
});

function onRemove(contactId) {
    router.delete(`/admin/newsletters/lists/${props.list.id}/members/${contactId}`);
}
function onFilterChange(filter) {
    router.put(`/admin/newsletters/lists/${props.list.id}`, { filter_json: filter });
}
</script>

<style scoped>
header {
    margin-bottom: 16px;
}
.lists-show__meta {
    color: var(--escalated-text-muted, #64748b);
    font-size: 13px;
    margin-top: 4px;
}
</style>
