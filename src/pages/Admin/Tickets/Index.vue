<script setup>
import { ref } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import TicketList from '../../../components/TicketList.vue';
import TicketFilters from '../../../components/TicketFilters.vue';
import QuickFilters from '../../../components/QuickFilters.vue';
import BulkActionBar from '../../../components/BulkActionBar.vue';
import KeyboardShortcutHelp from '../../../components/KeyboardShortcutHelp.vue';
import PluginSlot from '../../../components/PluginSlot.vue';
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../../composables/usePluginExtensions';

defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
    agents: Array,
});

const page = usePage();
const selectedIds = ref([]);
const ticketListRef = ref(null);
const showShortcutHelp = ref(false);

useKeyboardShortcuts({
    j: () => {
        ticketListRef.value?.moveDown();
    },
    k: () => {
        ticketListRef.value?.moveUp();
    },
    x: () => {
        ticketListRef.value?.toggleSelectFocused();
    },
    Enter: () => {
        ticketListRef.value?.openFocused();
    },
    '?': () => {
        showShortcutHelp.value = true;
    },
});

const { getPageComponents } = usePluginExtensions();

function applyQuickFilter(filter) {
    router.get(route('escalated.admin.tickets.index'), filter, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="All Tickets">
        <div class="mb-4">
            <QuickFilters :current-user-id="page.props.auth?.user?.id" @filter="applyQuickFilter" />
        </div>
        <PluginSlot
            slot="ticket.list.before_filters"
            :components="getPageComponents('ticket.list', 'before_filters')"
        />
        <div class="mb-6">
            <TicketFilters
                :filters="filters"
                :route="route('escalated.admin.tickets.index')"
                :departments="departments"
                :tags="tags"
                :agents="agents"
                show-assignee
                show-following
            />
        </div>
        <TicketList
            ref="ticketListRef"
            v-model:selected-ids="selectedIds"
            :tickets="tickets"
            route-prefix="escalated.admin.tickets"
            :columns="['reference', 'subject', 'requester', 'status', 'priority', 'assignee', 'updated']"
            selectable
            navigable
        />
        <BulkActionBar
            :selected-ids="selectedIds"
            :bulk-route="route('escalated.admin.tickets.bulk')"
            :agents="agents"
            :departments="departments"
            @clear="selectedIds = []"
        />
        <PluginSlot slot="ticket.list.footer" :components="getPageComponents('ticket.list', 'footer')" />
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="list" />
    </EscalatedLayout>
</template>
