<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import TicketList from '../../components/TicketList.vue';
import TicketFilters from '../../components/TicketFilters.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { Link } from '@inertiajs/vue3';
import { usePluginExtensions } from '../../composables/usePluginExtensions';

defineProps({
    tickets: Object,
    filters: Object,
});

const { getPageComponents } = usePluginExtensions();
</script>

<template>
    <EscalatedLayout title="My Tickets">
        <PluginSlot slot="customer.index.header" :components="getPageComponents('customer.index', 'header')" />
        <div class="mb-6 flex items-center justify-between">
            <TicketFilters :filters="filters" :route="route('escalated.customer.tickets.index')" />
            <Link
                :href="route('escalated.customer.tickets.create')"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
                New Ticket
            </Link>
        </div>
        <TicketList :tickets="tickets" route-prefix="escalated.customer.tickets" />
    </EscalatedLayout>
</template>
