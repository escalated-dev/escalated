<script setup>
import { computed } from 'vue';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import TicketList from '../../components/TicketList.vue';
import TicketFilters from '../../components/TicketFilters.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { Link, usePage } from '@inertiajs/vue3';
import { usePluginExtensions } from '../../composables/usePluginExtensions';

defineProps({
    tickets: Object,
    filters: Object,
});

const { getPageComponents } = usePluginExtensions();
const page = usePage();
const isAdmin = computed(() => !!page.props.escalated?.is_admin);
const isAgent = computed(() => !!page.props.escalated?.is_agent);
const staffPanelHref = computed(() => {
    const prefix = page.props.escalated?.prefix || 'support';
    const base = prefix.startsWith('/') ? prefix : `/${prefix}`;
    return isAdmin.value ? `${base}/admin/tickets` : `${base}/agent/tickets`;
});
const staffPanelLabel = computed(() => (isAdmin.value ? 'Open admin panel' : 'Open agent panel'));
</script>

<template>
    <EscalatedLayout title="My Tickets">
        <PluginSlot slot="customer.index.header" :components="getPageComponents('customer.index', 'header')" />
        <div
            v-if="isAdmin || isAgent"
            class="mb-4 flex items-center justify-between gap-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
        >
            <div>
                <span class="font-medium">You're viewing your personal tickets.</span>
                <span class="text-indigo-800/80"> Customer-submitted tickets live in the staff panel. </span>
            </div>
            <a
                :href="staffPanelHref"
                class="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
                {{ staffPanelLabel }}
            </a>
        </div>
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
