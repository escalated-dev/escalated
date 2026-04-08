<script setup>
import { ref, onMounted } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import TicketList from '../../components/TicketList.vue';
import TicketFilters from '../../components/TicketFilters.vue';
import QuickFilters from '../../components/QuickFilters.vue';
import BulkActionBar from '../../components/BulkActionBar.vue';
import KeyboardShortcutHelp from '../../components/KeyboardShortcutHelp.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../composables/usePluginExtensions';
import { useRealtime } from '../../composables/useRealtime';

defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
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
    router.get(route('escalated.agent.tickets.index'), filter, { preserveState: true });
}

// Real-time updates - refresh the ticket list when new tickets arrive or statuses change
const { echoAvailable, subscribeToTickets, subscribeToAgent } = useRealtime();

onMounted(() => {
    if (!echoAvailable.value) return;

    subscribeToTickets({
        onTicketCreated() {
            router.reload({ only: ['tickets'], preserveScroll: true });
        },
    });

    const userId = page.props.auth?.user?.id;
    if (userId) {
        subscribeToAgent(userId, {
            onTicketAssigned() {
                router.reload({ only: ['tickets'], preserveScroll: true });
            },
        });
    }
});
</script>

<template>
    <EscalatedLayout title="Ticket Queue">
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
                :route="route('escalated.agent.tickets.index')"
                :departments="departments"
                :tags="tags"
                show-assignee
                show-following
            />
        </div>
        <TicketList
            ref="ticketListRef"
            v-model:selected-ids="selectedIds"
            :tickets="tickets"
            route-prefix="escalated.agent.tickets"
            :columns="['reference', 'subject', 'requester', 'status', 'priority', 'assignee', 'updated']"
            selectable
            navigable
            show-live-badge
        />
        <BulkActionBar
            :selected-ids="selectedIds"
            :bulk-route="route('escalated.agent.tickets.bulk')"
            :departments="departments"
            @clear="selectedIds = []"
        />
        <PluginSlot slot="ticket.list.footer" :components="getPageComponents('ticket.list', 'footer')" />
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="list" />
    </EscalatedLayout>
</template>
