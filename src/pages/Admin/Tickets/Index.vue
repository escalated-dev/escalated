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
import SavedViewSidebar from '../../../components/SavedViewSidebar.vue';
import SaveViewDialog from '../../../components/SaveViewDialog.vue';
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../../composables/usePluginExtensions';

defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
    agents: Array,
    savedViews: { type: Array, default: () => [] },
});

const page = usePage();
const selectedIds = ref([]);
const ticketListRef = ref(null);
const showShortcutHelp = ref(false);
const showSaveDialog = ref(false);
const ticketFiltersRef = ref(null);

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

function onViewSaved() {
    router.reload({ only: ['savedViews'] });
}
</script>

<template>
    <EscalatedLayout title="All Tickets">
        <div class="flex gap-6">
            <!-- Saved Views Sidebar -->
            <aside v-if="savedViews && savedViews.length" class="hidden w-52 shrink-0 lg:block">
                <div class="sticky top-4">
                    <h3 class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Views</h3>
                    <SavedViewSidebar
                        :saved-views="savedViews"
                        :current-filters="filters"
                        :route="route('escalated.admin.tickets.index')"
                    />
                </div>
            </aside>

            <!-- Main content -->
            <div class="min-w-0 flex-1">
                <div class="mb-4">
                    <QuickFilters :current-user-id="page.props.auth?.user?.id" @filter="applyQuickFilter" />
                </div>
                <PluginSlot
                    slot="ticket.list.before_filters"
                    :components="getPageComponents('ticket.list', 'before_filters')"
                />
                <div class="mb-6">
                    <TicketFilters
                        ref="ticketFiltersRef"
                        :filters="filters"
                        :route="route('escalated.admin.tickets.index')"
                        :departments="departments"
                        :tags="tags"
                        :agents="agents"
                        show-assignee
                        show-following
                        @save-view="showSaveDialog = true"
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
            </div>
        </div>

        <SaveViewDialog
            :show="showSaveDialog"
            :filters="ticketFiltersRef?.filterData || filters"
            @close="showSaveDialog = false"
            @saved="onViewSaved"
        />
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="list" />
    </EscalatedLayout>
</template>
