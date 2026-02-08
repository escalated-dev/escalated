<script setup>
import EscalatedLayout from '../../../Components/Escalated/EscalatedLayout.vue';
import TicketList from '../../../Components/Escalated/TicketList.vue';
import TicketFilters from '../../../Components/Escalated/TicketFilters.vue';

defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
});
</script>

<template>
    <EscalatedLayout title="Ticket Queue">
        <div class="mb-6">
            <TicketFilters :filters="filters" :route="route('escalated.agent.tickets.index')" :departments="departments" :tags="tags" show-assignee />
        </div>
        <TicketList :tickets="tickets" route-prefix="escalated.agent.tickets" show-assignee />
    </EscalatedLayout>
</template>
