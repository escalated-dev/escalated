<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import TicketList from '../../../components/TicketList.vue';
import TicketFilters from '../../../components/TicketFilters.vue';

defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
    agents: Array,
});
</script>

<template>
    <EscalatedLayout title="All Tickets">
        <div class="mb-6">
            <TicketFilters :filters="filters" :route="route('escalated.admin.tickets.index')" :departments="departments" :tags="tags" show-assignee />
        </div>
        <TicketList :tickets="tickets" route-prefix="escalated.admin.tickets" show-assignee />
    </EscalatedLayout>
</template>
