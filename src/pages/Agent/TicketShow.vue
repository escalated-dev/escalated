<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import TicketDetailPane from '../../components/TicketDetailPane.vue';
import TicketQueueList from '../../components/TicketQueueList.vue';
import KeyboardShortcutHelp from '../../components/KeyboardShortcutHelp.vue';
import PanelIcon from '../../components/PanelIcon.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../composables/usePluginExtensions';
import { useRealtime } from '../../composables/useRealtime';
import { useChat } from '../../composables/useChat';
import { useI18n } from '../../composables/useI18n';
import { useAgentCommands } from '../../composables/useAgentCommands';
import { markRoute, markSeen, useUnread } from '../../composables/useUnread';
import { toast } from '../../composables/useAgentToasts';
import { normalisePrefix, recallInbox, ticketsUrl } from '../../utils/agentQueues';
import { Link, router, usePage } from '@inertiajs/vue3';
import { ref, computed, onUnmounted, watch } from 'vue';

const props = defineProps({
    ticket: Object,
    departments: Array,
    tags: Array,
    cannedResponses: Array,
    macros: { type: Array, default: () => [] },
    customActions: { type: Array, default: () => [] },
    is_following: { type: Boolean, default: false },
    followers_count: { type: Number, default: 0 },
    /** Optional. Same shape as on Agent/TicketIndex; feeds the rail counts and views. */
    inbox: { type: Object, default: null },
    /** Optional. `{ key, title }`: the queue the agent opened this ticket from. */
    queue: { type: Object, default: null },
    /** Optional. `[{ id, name }]`: who the ticket can be assigned to. Without it only "Assign to me" is offered. */
    agents: { type: Array, default: null },
});

const page = usePage();
const { t } = useI18n();
const isLightAgent = computed(() => page.props.escalated?.agent_type === 'light');
// Route prefix the host framework mounts Escalated under. Defaults to
// `support`, matching every host-adapter plugin. NestJS uses `escalated`.
const routePrefix = computed(() => page.props.escalated?.prefix || 'support');
const prefix = computed(() => normalisePrefix(routePrefix.value));
const widgetPath = computed(() => `/${routePrefix.value}/widget`);
const showShortcutHelp = ref(false);
const paneRef = ref(null);
const listRef = ref(null);
const currentUserId = computed(() => page.props.auth?.user?.id ?? null);

// A named route the host may not define resolves to '' rather than throwing;
// the pane then leaves that action out.
function routeOr(name, params) {
    try {
        const url = route(name, params);
        return typeof url === 'string' && url !== '#' ? url : '';
    } catch {
        return '';
    }
}

function adminFallback(action, reference) {
    return (
        routeOr(`escalated.agent.tickets.${action}`, reference) ||
        (page.props.escalated?.is_admin ? routeOr(`escalated.admin.tickets.${action}`, reference) : '')
    );
}

const routes = computed(() => {
    const reference = props.ticket.reference;
    return {
        reply: routeOr('escalated.agent.tickets.reply', reference),
        note: routeOr('escalated.agent.tickets.note', reference),
        status: routeOr('escalated.agent.tickets.status', reference),
        priority: routeOr('escalated.agent.tickets.priority', reference),
        tags: routeOr('escalated.agent.tickets.tags', reference),
        assign: routeOr('escalated.agent.tickets.assign', reference),
        department: routeOr('escalated.agent.tickets.department', reference),
        follow: routeOr('escalated.agent.tickets.follow', reference),
        macro: routeOr('escalated.agent.tickets.macro', reference),
        // Agents snooze through the agent route; a host with only the admin
        // routes still lets its admins snooze from here.
        snooze: adminFallback('snooze', reference),
        unsnooze: adminFallback('unsnooze', reference),
        merge: page.props.escalated?.is_admin ? routeOr('escalated.admin.tickets.merge', reference) : '',
        unread: markRoute(props.ticket, true),
        pin: routeOr('escalated.agent.tickets.pin', [reference, 0])
            ? (replyId) => routeOr('escalated.agent.tickets.pin', [reference, replyId])
            : null,
    };
});

// Live chat mode detection
const isChatMode = computed(() => props.ticket.channel === 'chat' && props.ticket.status === 'live');
const chatMessages = ref(props.ticket.chat_messages || []);
const chatTypingUser = ref(null);

// Subscribe to chat channel for real-time messages. Pass widgetPath so
// useChat's API calls resolve against whatever prefix the host framework
// serves Escalated under (config on NestJS, default /support elsewhere).
const { subscribeToChat } = useChat({
    channelPrefix: () => page.props.escalated?.broadcasting?.channel_prefix,
    widgetPath: widgetPath.value,
});
let chatTypingTimer = null;
let chatUnsubscribe = null;

// Re-seed the chat thread whenever we navigate to a different ticket. Inertia
// reuses this page component across ticket navigation (setup() does not re-run),
// so without this the previous ticket's chat would persist.
watch(
    () => [props.ticket.id, page.props.escalated?.broadcasting?.channel_prefix],
    () => {
        chatMessages.value = props.ticket.chat_messages || [];
        chatTypingUser.value = null;
        clearTimeout(chatTypingTimer);
    },
);

// (Re)subscribe to the chat channel whenever the live chat session changes,
// including navigating from a non-chat ticket to a chat ticket. The old
// subscription is torn down first so we never leak a channel or receive
// messages for the ticket we just left.
function setupChatSubscription() {
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
    if (!isChatMode.value || !props.ticket.chat_session_id) return;
    chatUnsubscribe = subscribeToChat(props.ticket.chat_session_id, {
        onMessage(data) {
            chatMessages.value.push(data.message);
        },
        onTyping(data) {
            chatTypingUser.value = data.name;
            clearTimeout(chatTypingTimer);
            chatTypingTimer = setTimeout(() => {
                chatTypingUser.value = null;
            }, 4000);
        },
        onEnded() {
            router.reload({ preserveScroll: true });
        },
        onAssigned() {
            router.reload({ preserveScroll: true });
        },
    });
}

watch(() => [props.ticket.chat_session_id, isChatMode.value], setupChatSubscription, {
    immediate: true,
});

onUnmounted(() => {
    if (chatUnsubscribe) chatUnsubscribe();
    clearTimeout(chatTypingTimer);
});

function onChatSend(payload) {
    // Optimistically add message to thread
    chatMessages.value.push({
        id: Date.now(),
        body: payload.body,
        is_internal_note: payload.is_internal_note,
        is_agent: true,
        author: { id: page.props.auth?.user?.id, name: page.props.auth?.user?.name },
        created_at: new Date().toISOString(),
    });
}

// The chat action bar posts to the backend's `escalated.admin.chat.transfer`
// and `escalated.admin.chat.end` routes (escalated-laravel's names). A host
// whose route() helper has no such name either throws or (the non-Laravel
// shims) returns '#'; either way the bar gets no endpoint for that action and
// only emits, rather than breaking the page.
function chatSessionRoute(name) {
    if (!props.ticket.chat_session_id) return '';
    return routeOr(name, props.ticket.chat_session_id);
}

const chat = computed(() => ({
    active: isChatMode.value,
    messages: chatMessages.value,
    typingUser: chatTypingUser.value,
    sendEndpoint: props.ticket.chat_session_id
        ? `${widgetPath.value}/chat/${props.ticket.chat_session_id}/messages`
        : '',
    typingEndpoint: props.ticket.chat_session_id
        ? `${widgetPath.value}/chat/${props.ticket.chat_session_id}/typing`
        : '',
    endEndpoint: chatSessionRoute('escalated.admin.chat.end'),
    transferEndpoint: chatSessionRoute('escalated.admin.chat.transfer'),
}));

function onEndChat() {
    router.reload({ preserveScroll: true });
}

const { getPageComponents } = usePluginExtensions();

// --- The list beside the ticket ---------------------------------------------
// On a wide screen the list the agent came from stays in view. It is the list
// remembered from the last inbox visit; without one the ticket fills the pane.
const remembered = ref(recallInbox());
watch(
    () => props.ticket.id,
    () => {
        remembered.value = recallInbox();
    },
);
const listTickets = computed(() => remembered.value?.tickets || null);
const backHref = computed(() => remembered.value?.url || ticketsUrl(prefix.value));
// The tickets either side of this one in that list, for previous / next.
const adjacent = computed(() => {
    const rows = listTickets.value?.data || [];
    const index = rows.findIndex((row) => row.reference === props.ticket.reference);
    if (index < 0) return {};
    return { previous: rows[index - 1] || null, next: rows[index + 1] || null };
});
const backLabel = computed(() => props.queue?.title || remembered.value?.title || t('agent_panel.nav.tickets'));

// --- Read state -------------------------------------------------------------------
// Opening the ticket marked it read on the backend; the list beside it shows
// that too. "Mark as unread" goes back to the list, as reopening the ticket
// would mark it read again.
watch(
    () => props.ticket.id,
    () => markSeen(props.ticket),
    { immediate: true },
);
const { setUnread } = useUnread();
async function markUnread() {
    if (await setUnread(props.ticket, true)) {
        toast(t('agent_panel.toast.marked_unread'));
        router.visit(backHref.value);
    }
}

// --- Switching tickets ----------------------------------------------------------
// Opening another ticket keeps this page and swaps its props, which can take
// a moment; the pane shows a skeleton meanwhile rather than the old ticket.
const switching = ref(false);
const currentTicketPath = computed(() => {
    const url = routeOr('escalated.agent.tickets.show', props.ticket.reference) || '';
    return url.split('?')[0];
});
const ticketPathPrefix = computed(() => currentTicketPath.value.replace(/[^/]*$/, ''));
const stopRouterListeners = [];
if (typeof router.on === 'function') {
    stopRouterListeners.push(
        router.on('start', (event) => {
            const visit = event?.detail?.visit;
            const url = visit?.url;
            const path = typeof url === 'string' ? url.split('?')[0] : url?.pathname || '';
            const isGet = String(visit?.method || 'get').toLowerCase() === 'get';
            const otherTicket =
                ticketPathPrefix.value && path.startsWith(ticketPathPrefix.value) && path !== currentTicketPath.value;
            if (isGet && otherTicket && !path.slice(ticketPathPrefix.value.length).includes('/')) {
                switching.value = true;
            }
        }),
        router.on('finish', () => {
            switching.value = false;
        }),
    );
}
onUnmounted(() => stopRouterListeners.forEach((stop) => typeof stop === 'function' && stop()));

// Keyboard shortcuts
useKeyboardShortcuts({
    r: () => paneRef.value?.focusReply(),
    n: () => paneRef.value?.focusNote(),
    s: () => paneRef.value?.openStatus(),
    p: () => paneRef.value?.openPriority(),
    f: () => paneRef.value?.toggleFollow(),
    a: () => paneRef.value?.assignToMe(),
    e: () => paneRef.value?.resolve(),
    z: () => paneRef.value?.openSnooze(),
    i: () => paneRef.value?.toggleContext(),
    J: () => paneRef.value?.nextTicket(),
    K: () => paneRef.value?.previousTicket(),
    j: () => listRef.value?.moveDown(),
    k: () => listRef.value?.moveUp(),
    Enter: () => listRef.value?.openFocused(),
    '/': () => listRef.value?.focusSearch(),
    '?': () => {
        showShortcutHelp.value = true;
    },
});

useAgentCommands(() => {
    const group = t('agent_panel.palette.group_ticket');
    const commands = [
        {
            id: 'ticket-note',
            label: t('agent_panel.composer.internal_note'),
            icon: 'lock',
            group,
            hint: 'n',
            run: () => paneRef.value?.focusNote(),
        },
        {
            id: 'ticket-copy',
            label: t('agent_panel.ticket.copy_link'),
            icon: 'link',
            group,
            run: () => paneRef.value?.copyLink(),
        },
    ];
    if (!isLightAgent.value) {
        commands.unshift(
            {
                id: 'ticket-reply',
                label: t('agent_panel.composer.reply'),
                icon: 'send',
                group,
                hint: 'r',
                run: () => paneRef.value?.focusReply(),
            },
            {
                id: 'ticket-assign',
                label: t('agent_panel.ticket.assign_to_me'),
                icon: 'user',
                group,
                hint: 'a',
                run: () => paneRef.value?.assignToMe(),
            },
            {
                id: 'ticket-resolve',
                label: t('agent_panel.ticket.resolve'),
                icon: 'check',
                group,
                hint: 'e',
                run: () => paneRef.value?.resolve(),
            },
            {
                id: 'ticket-status',
                label: t('agent_panel.ticket.change_status'),
                icon: 'flag',
                group,
                hint: 's',
                run: () => paneRef.value?.openStatus(),
            },
            {
                id: 'ticket-priority',
                label: t('agent_panel.ticket.change_priority'),
                icon: 'flag',
                group,
                hint: 'p',
                run: () => paneRef.value?.openPriority(),
            },
        );
    }
    commands.push({
        id: 'ticket-context',
        label: t('agent_panel.ticket.context'),
        icon: 'sidebarRight',
        group,
        hint: 'i',
        run: () => paneRef.value?.toggleContext(),
    });
    commands.push({
        id: 'ticket-history',
        label: t('agent_panel.ticket.history'),
        icon: 'clock',
        group,
        run: () => paneRef.value?.openHistory(),
    });
    if (adjacent.value.next) {
        commands.push({
            id: 'ticket-next',
            label: t('agent_panel.ticket.next_ticket'),
            icon: 'chevronDown',
            group,
            hint: 'J',
            run: () => paneRef.value?.nextTicket(),
        });
    }
    commands.push({
        id: 'ticket-follow',
        label: t('agent_panel.ticket.follow_toggle'),
        icon: 'star',
        group,
        hint: 'f',
        run: () => paneRef.value?.toggleFollow(),
    });
    return commands;
});

// Real-time updates via WebSocket (gracefully degrades to no-op when Echo is absent)
const { echoAvailable, subscribeToTicket } = useRealtime({
    channelPrefix: () => page.props.escalated?.broadcasting?.channel_prefix,
});
let ticketUnsubscribe = null;

// (Re)subscribe whenever the ticket id changes. Because Inertia reuses this
// page across ticket navigation, an onMounted-only subscription would stay
// bound to the first ticket: realtime updates for the ticket you navigated to
// would never arrive, and the previous ticket's events would keep triggering
// reloads. Tear down the old subscription before binding the new one.
function setupTicketSubscription() {
    if (ticketUnsubscribe) {
        ticketUnsubscribe();
        ticketUnsubscribe = null;
    }
    if (!echoAvailable.value || !props.ticket?.id) return;

    ticketUnsubscribe = subscribeToTicket(props.ticket.id, {
        onReplyCreated() {
            router.reload({ only: ['ticket'], preserveScroll: true });
        },
        onStatusChanged() {
            router.reload({ only: ['ticket'], preserveScroll: true });
        },
        onTicketUpdated() {
            router.reload({ only: ['ticket'], preserveScroll: true });
        },
        onTicketAssigned() {
            router.reload({ only: ['ticket'], preserveScroll: true });
        },
        onTicketEscalated() {
            router.reload({ only: ['ticket'], preserveScroll: true });
        },
    });
}

watch(() => props.ticket?.id, setupTicketSubscription, { immediate: true });

onUnmounted(() => {
    if (ticketUnsubscribe) ticketUnsubscribe();
});
</script>

<template>
    <EscalatedLayout :title="ticket.subject" full-bleed>
        <div class="flex h-full min-h-0">
            <!-- The list the agent came from (wide screens) -->
            <section
                v-if="listTickets"
                class="flex min-h-0 w-[360px] shrink-0 flex-col 2xl:w-[400px] border-r border-[var(--esc-panel-border)] max-lg:hidden"
                :aria-label="remembered.title"
                data-testid="esc-show-list"
            >
                <TicketQueueList
                    ref="listRef"
                    :tickets="listTickets"
                    :title="queue?.title || remembered.title"
                    :subtitle="remembered.subtitle"
                    :stats="inbox?.stats || remembered.stats || null"
                    :filters="remembered.filters || {}"
                    :departments="departments || []"
                    :tags="tags || []"
                    :index-url="remembered.url || ticketsUrl(prefix)"
                    :prefix="prefix"
                    :selected-reference="ticket.reference"
                    :selectable="false"
                />
            </section>

            <!-- The ticket -->
            <section class="flex min-h-0 min-w-0 flex-1 flex-col" :aria-label="ticket.subject">
                <Link
                    :href="backHref"
                    :class="[
                        'flex shrink-0 items-center gap-1.5 border-b border-[var(--esc-panel-border)] px-4 py-2 text-[13px] text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)] sm:px-6',
                        listTickets ? 'lg:hidden' : '',
                    ]"
                    data-testid="esc-back-to-list"
                >
                    <PanelIcon name="arrowLeft" class="h-4 w-4" />
                    {{ t('agent_panel.ticket.back_to', { queue: backLabel }) }}
                </Link>
                <!-- Plugin: ticket show header slot -->
                <PluginSlot slot="ticket.show.header" :components="getPageComponents('ticket.show', 'header')" />
                <div
                    v-if="switching"
                    class="min-h-0 flex-1 animate-pulse px-4 pt-4 sm:px-6"
                    aria-busy="true"
                    :aria-label="t('agent_panel.ticket.loading')"
                    data-testid="esc-detail-skeleton"
                >
                    <div class="h-3 w-20 rounded bg-[var(--esc-panel-active)]"></div>
                    <div class="mt-3 h-5 w-2/3 rounded bg-[var(--esc-panel-active)]"></div>
                    <div class="mt-4 flex gap-2">
                        <div class="h-7 w-20 rounded-full bg-[var(--esc-panel-active)]"></div>
                        <div class="h-7 w-20 rounded-[var(--esc-radius,6px)] bg-[var(--esc-panel-active)]"></div>
                        <div class="h-7 w-24 rounded-full bg-[var(--esc-panel-active)]"></div>
                    </div>
                    <div class="mt-5 h-px bg-[var(--esc-panel-border)]"></div>
                    <div
                        v-for="n in 3"
                        :key="n"
                        class="mt-4 h-20 rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-border)]"
                    ></div>
                </div>
                <div v-show="!switching" class="min-h-0 flex-1">
                    <TicketDetailPane
                        ref="paneRef"
                        :ticket="ticket"
                        :tags="tags || []"
                        :departments="departments || []"
                        :canned-responses="cannedResponses || []"
                        :macros="macros"
                        :custom-actions="customActions"
                        :agents="agents || []"
                        :adjacent="adjacent"
                        :is-following="is_following"
                        :followers-count="followers_count"
                        :notes-only="isLightAgent"
                        :current-user-id="currentUserId"
                        :prefix="prefix"
                        :channel-prefix="page.props.escalated?.broadcasting?.channel_prefix"
                        :routes="routes"
                        :knowledge-base-url="
                            page.props.escalated?.knowledge_base_enabled === false ? '' : `${prefix}/kb`
                        "
                        :chat="chat"
                        @chat-send="onChatSend"
                        @end-chat="onEndChat"
                        @mark-unread="markUnread"
                    />
                </div>
            </section>
        </div>

        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="detail" agent :with-list="!!listTickets" />
    </EscalatedLayout>
</template>
