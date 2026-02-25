<script setup>
import { ref } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import TicketList from '../../../components/TicketList.vue';
import TicketFilters from '../../../components/TicketFilters.vue';
import QuickFilters from '../../../components/QuickFilters.vue';
import BulkActionBar from '../../../components/BulkActionBar.vue';
import KeyboardShortcutHelp from '../../../components/KeyboardShortcutHelp.vue';
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts';

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

function applyQuickFilter(filter) {
    router.get(route('escalated.admin.tickets.index'), filter, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="All Tickets">
        <div class="mb-4">
            <QuickFilters :current-user-id="page.props.auth?.user?.id" @filter="applyQuickFilter" />
        </div>
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
            show-assignee
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
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="list" />
    </EscalatedLayout>
</template>
