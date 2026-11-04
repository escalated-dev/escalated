<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import TicketQueueList from '../../components/TicketQueueList.vue';
import BulkActionBar from '../../components/BulkActionBar.vue';
import KeyboardShortcutHelp from '../../components/KeyboardShortcutHelp.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../composables/usePluginExtensions';
import { useRealtime } from '../../composables/useRealtime';
import { useI18n } from '../../composables/useI18n';
import {
    activeQueueKey,
    normalisePrefix,
    queueHeading,
    rememberInbox,
    ticketsUrl,
    workspaceQueues,
} from '../../utils/agentQueues';

const props = defineProps({
    tickets: Object,
    filters: Object,
    departments: Array,
    tags: Array,
    /**
     * Optional. `{ counts: { mine, unassigned, all }, views: [{ id, name, count, filters }],
     * stats: { open, urgent, sla_at_risk, resolved_today } }`. Without it the
     * inbox shows no counts, views or stat strip.
     */
    inbox: { type: Object, default: null },
    /** Optional. `{ key, title }`: the queue this list is. Otherwise read off the URL. */
    queue: { type: Object, default: null },
});

const page = usePage();
const { t } = useI18n();
const selectedIds = ref([]);
const listRef = ref(null);
const showShortcutHelp = ref(false);

const prefix = computed(() => normalisePrefix(page.props.escalated?.prefix));
const ticketPage = computed(() => props.tickets || { data: [] });
const indexUrl = computed(() => {
    try {
        const url = route('escalated.agent.tickets.index');
        if (typeof url === 'string' && url !== '#') return url;
    } catch {
        // fall back to the conventional path
    }
    return ticketsUrl(prefix.value);
});

const newTicketUrl = computed(() => {
    try {
        const url = route('escalated.agent.tickets.create');
        return typeof url === 'string' && url !== '#' ? url : '';
    } catch {
        return '';
    }
});

const queueKey = computed(() =>
    activeQueueKey({
        url: page.url,
        userId: page.props.auth?.user?.id,
        views: props.inbox?.views || [],
        queue: props.queue,
    }),
);

// The queue's own filters: "Clear filters" goes back to these.
const baseFilters = computed(() => {
    const key = queueKey.value;
    if (key === 'live') return { live_chat: 1 };
    if (String(key || '').startsWith('view:')) {
        const view = (props.inbox?.views || []).find((v) => `view:${v.id}` === key);
        return { ...(view?.filters || {}) };
    }
    const queue = workspaceQueues(page.props.auth?.user?.id).find((q) => q.key === key);
    return { ...(queue?.filters || {}) };
});

const heading = computed(() =>
    queueHeading({
        key: queueKey.value,
        queue: props.queue,
        views: props.inbox?.views || [],
        total: typeof ticketPage.value.total === 'number' ? ticketPage.value.total : ticketPage.value.data?.length,
        t,
    }),
);

// On a wide screen the ticket page shows this list beside the ticket.
watch(
    () => [props.tickets, props.queue, props.inbox, page.url],
    () => {
        rememberInbox({
            url: page.url,
            tickets: ticketPage.value,
            filters: props.filters || {},
            queue: props.queue,
            queueKey: queueKey.value,
            title: heading.value.title,
            subtitle: heading.value.subtitle,
            stats: props.inbox?.stats || null,
        });
    },
    { immediate: true },
);

useKeyboardShortcuts({
    j: () => listRef.value?.moveDown(),
    k: () => listRef.value?.moveUp(),
    x: () => listRef.value?.toggleSelectFocused(),
    Enter: () => listRef.value?.openFocused(),
    '/': () => listRef.value?.focusSearch(),
    '?': () => {
        showShortcutHelp.value = true;
    },
});

const { getPageComponents } = usePluginExtensions();

// Real-time updates - refresh the ticket list when new tickets arrive or statuses change
const { echoAvailable, subscribeToTickets, subscribeToAgent } = useRealtime({
    channelPrefix: () => page.props.escalated?.broadcasting?.channel_prefix,
});

onMounted(() => {
    if (!echoAvailable.value) return;

    subscribeToTickets({
        onTicketCreated() {
            router.reload({ only: ['tickets', 'inbox'], preserveScroll: true });
        },
    });

    const userId = page.props.auth?.user?.id;
    if (userId) {
        subscribeToAgent(userId, {
            onTicketAssigned() {
                router.reload({ only: ['tickets', 'inbox'], preserveScroll: true });
            },
        });
    }
});
</script>

<template>
    <EscalatedLayout :title="heading.title" full-bleed>
        <div class="flex h-full min-h-0">
            <!-- List column -->
            <section
                class="flex min-h-0 w-full flex-col border-r border-[var(--esc-panel-border)] lg:w-[340px] lg:shrink-0 xl:w-[420px]"
                :aria-label="heading.title"
            >
                <PluginSlot
                    slot="ticket.list.before_filters"
                    :components="getPageComponents('ticket.list', 'before_filters')"
                />
                <div class="min-h-0 flex-1">
                    <TicketQueueList
                        ref="listRef"
                        v-model:selected-ids="selectedIds"
                        :tickets="ticketPage"
                        :title="heading.title"
                        :subtitle="heading.subtitle"
                        :stats="inbox?.stats || null"
                        :filters="filters || {}"
                        :departments="departments || []"
                        :tags="tags || []"
                        :index-url="indexUrl"
                        :prefix="prefix"
                        :new-ticket-url="newTicketUrl"
                        :base-filters="baseFilters"
                    />
                </div>
                <PluginSlot slot="ticket.list.footer" :components="getPageComponents('ticket.list', 'footer')" />
            </section>

            <!-- Detail pane (wide screens): nothing open yet -->
            <section
                class="flex min-w-0 flex-1 items-center justify-center max-lg:hidden"
                data-testid="esc-detail-empty"
            >
                <div class="max-w-xs text-center">
                    <p class="text-[14px] font-medium text-[var(--esc-panel-text-secondary)]">
                        {{ t('agent_panel.inbox.select_a_ticket') }}
                    </p>
                    <p class="mt-1 text-[13px] text-[var(--esc-panel-text-tertiary)]">
                        {{ t('agent_panel.inbox.select_hint') }}
                    </p>
                    <button
                        type="button"
                        class="mt-3 rounded text-[12px] text-[var(--esc-panel-text-tertiary)] underline-offset-2 hover:text-[var(--esc-panel-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        @click="showShortcutHelp = true"
                    >
                        {{ t('agent_panel.inbox.shortcut_help') }}
                        <kbd class="ml-1 rounded border border-[var(--esc-panel-border-input)] px-1 font-sans">?</kbd>
                    </button>
                </div>
            </section>
        </div>
        <BulkActionBar
            :selected-ids="selectedIds"
            :bulk-route="route('escalated.agent.tickets.bulk')"
            :departments="departments"
            @clear="selectedIds = []"
        />
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="list" agent />
    </EscalatedLayout>
</template>
