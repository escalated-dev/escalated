<script setup>
import { computed, inject, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { usePluginExtensions } from '../composables/usePluginExtensions';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { highlightMentions } from '../utils/mentionHighlight';
import { initials, isLive, priorityColor, relativeTime, requesterName } from '../utils/agentTicket';
import { ticketUrl } from '../utils/agentQueues';
import ActivityTimeline from './ActivityTimeline.vue';
import ChatActionBar from './ChatActionBar.vue';
import ChatComposer from './ChatComposer.vue';
import ChatThread from './ChatThread.vue';
import Composer from './Composer.vue';
import KnowledgePanel from './KnowledgePanel.vue';
import PanelIcon from './PanelIcon.vue';
import PanelMenu from './PanelMenu.vue';
import PluginSlot from './PluginSlot.vue';
import PresenceIndicator from './PresenceIndicator.vue';
import TagPicker from './TagPicker.vue';
import TicketMergeDialog from './TicketMergeDialog.vue';
import TicketSubjects from './TicketSubjects.vue';

/**
 * The ticket in the agent panel: header with status, priority, tags and
 * assignee; Conversation, Details, Customer and Related tabs; and the
 * composer pinned to the bottom. Live chats swap the conversation and
 * composer for the chat thread and chat composer.
 *
 * `routes` carries the URLs the page resolved for this ticket; an action
 * whose URL is missing is not offered.
 */
const props = defineProps({
    ticket: { type: Object, required: true },
    tags: { type: Array, default: () => [] },
    departments: { type: Array, default: () => [] },
    cannedResponses: { type: Array, default: () => [] },
    macros: { type: Array, default: () => [] },
    customActions: { type: Array, default: () => [] },
    isFollowing: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
    /** Light agents: internal notes only, no status, priority, macros or assignment. */
    notesOnly: { type: Boolean, default: false },
    currentUserId: { type: [Number, String], default: null },
    prefix: { type: String, default: 'support' },
    channelPrefix: { type: String, default: undefined },
    /** `{ reply, note, status, priority, tags, assign, follow, macro, merge, typing }` */
    routes: { type: Object, default: () => ({}) },
    /** `{ active, messages, typingUser, sendEndpoint, typingEndpoint, endEndpoint, transferEndpoint }` */
    chat: { type: Object, default: () => ({ active: false }) },
});

const emit = defineEmits(['chat-send', 'end-chat']);
const { t } = useI18n();
const { getPageComponents } = usePluginExtensions();
const escDark = inject(
    'esc-dark',
    computed(() => true),
);

const now = ref(Date.now());
const clock = typeof window !== 'undefined' ? setInterval(() => (now.value = Date.now()), 60000) : null;
onBeforeUnmount(() => clearInterval(clock));

const STATUS_OPTIONS = [
    'open',
    'in_progress',
    'waiting_on_customer',
    'waiting_on_agent',
    'escalated',
    'resolved',
    'closed',
];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent', 'critical'];

function statusColor(status) {
    return (
        {
            open: 'var(--esc-panel-accent)',
            in_progress: 'var(--esc-priority-medium)',
            escalated: 'var(--esc-priority-urgent)',
            resolved: 'var(--esc-sla-ok)',
            live: 'var(--esc-sla-ok)',
            closed: 'var(--esc-panel-text-muted)',
        }[status] || 'var(--esc-panel-text-tertiary)'
    );
}

function statusLabel(status) {
    const label = t(`status.${status}`);
    return label === `status.${status}` ? String(status || '').replace(/_/g, ' ') : label;
}

function priorityLabel(priority) {
    const label = t(`priority.${priority}`);
    return label === `priority.${priority}` ? String(priority || '') : label;
}

// --- Header actions ----------------------------------------------------------
const statusOpen = ref(false);
const priorityOpen = ref(false);
const moreOpen = ref(false);
const tagsOpen = ref(false);
const mergeOpen = ref(false);

const statusItems = computed(() =>
    STATUS_OPTIONS.map((status) => ({
        key: status,
        label: statusLabel(status),
        dot: statusColor(status),
        checked: props.ticket.status === status,
    })),
);

const priorityItems = computed(() =>
    PRIORITY_OPTIONS.map((priority) => ({
        key: priority,
        label: priorityLabel(priority),
        dot: priorityColor(priority),
        checked: props.ticket.priority === priority,
    })),
);

function post(url, data = {}) {
    if (!url) return;
    router.post(url, data, { preserveScroll: true });
}

function setStatus(item) {
    if (item.key !== props.ticket.status) post(props.routes.status, { status: item.key });
}

function setPriority(item) {
    if (item.key !== props.ticket.priority) post(props.routes.priority, { priority: item.key });
}

const canEditStatus = computed(() => !props.notesOnly && !!props.routes.status);
const canEditPriority = computed(() => !props.notesOnly && !!props.routes.priority);
const canEditTags = computed(() => !props.notesOnly && !!props.routes.tags);

const ticketTags = computed(() => props.ticket.tags || []);
const tagIds = computed(() => ticketTags.value.map((tag) => tag.id));

// The ticket's own tags carry colours the tag list may not.
const pickerTags = computed(() =>
    props.tags.map((tag) => ({
        ...tag,
        color: tag.color || ticketTags.value.find((own) => own.id === tag.id)?.color || null,
    })),
);

function updateTags(ids) {
    post(props.routes.tags, { tag_ids: ids });
}

function removeTag(id) {
    updateTags(tagIds.value.filter((tagId) => tagId !== id));
}

const assignee = computed(() => props.ticket.assignee || null);
const assignedToMe = computed(
    () => props.currentUserId != null && String(props.ticket.assigned_to ?? '') === String(props.currentUserId),
);
const canAssignToMe = computed(
    () => !props.notesOnly && !!props.routes.assign && props.currentUserId != null && !assignedToMe.value,
);

function assignToMe() {
    if (canAssignToMe.value) post(props.routes.assign, { agent_id: props.currentUserId });
}

function resolve() {
    if (canEditStatus.value && props.ticket.status !== 'resolved') post(props.routes.status, { status: 'resolved' });
}

function toggleFollow() {
    post(props.routes.follow);
}

const copied = ref(false);
let copiedTimer = null;
function copyLink() {
    const path = ticketUrl(props.prefix, props.ticket.reference);
    const url = typeof window !== 'undefined' ? new URL(path, window.location.origin).toString() : path;
    window.navigator?.clipboard?.writeText(url)?.catch?.(() => {});
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = false), 2000);
}
onBeforeUnmount(() => clearTimeout(copiedTimer));

const moreItems = computed(() => {
    const items = [];
    if (!props.notesOnly && props.macros.length && props.routes.macro) {
        items.push({ key: 'h-macros', heading: true, label: t('agent_panel.ticket.macros') });
        for (const macro of props.macros) items.push({ key: `macro:${macro.id}`, label: macro.name, macro });
    }
    if (props.customActions.length) {
        items.push({ key: 'h-actions', heading: true, label: t('agent_panel.ticket.actions') });
        for (const action of props.customActions) {
            items.push({
                key: `action:${action.key}`,
                label: action.label,
                disabled: !!action.disabled,
                danger: action.variant === 'danger',
                action,
            });
        }
    }
    items.push({ key: 'h-ticket', heading: true, label: t('agent_panel.ticket.ticket') });
    if (props.routes.merge) items.push({ key: 'merge', label: t('agent_panel.ticket.merge') });
    if (props.routes.snooze) {
        items.push({ key: 'snooze:1', label: t('agent_panel.ticket.snooze_hour') });
        items.push({ key: 'snooze:24', label: t('agent_panel.ticket.snooze_day') });
    }
    items.push({ key: 'copy', label: t('agent_panel.ticket.copy_link') });
    return items;
});

function onMore(item) {
    if (item.macro) post(props.routes.macro, { macro_id: item.macro.id });
    else if (item.action) {
        if (item.action.confirmation && typeof window !== 'undefined' && !window.confirm(item.action.confirmation)) {
            return;
        }
        post(item.action.url);
    } else if (item.key === 'merge') mergeOpen.value = true;
    else if (item.key.startsWith('snooze:')) {
        const hours = Number(item.key.split(':')[1]);
        post(props.routes.snooze, { snoozed_until: new Date(Date.now() + hours * 3600000).toISOString() });
    } else if (item.key === 'copy') copyLink();
}

// --- Tabs ----------------------------------------------------------------------
const TABS = ['conversation', 'details', 'customer', 'related'];
const tab = ref('conversation');
const tabRefs = ref({});

function onTabKeydown(event) {
    const index = TABS.indexOf(tab.value);
    let next = null;
    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    else if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    tab.value = next;
    nextTick(() => tabRefs.value[next]?.focus());
}

watch(
    () => props.ticket.id,
    () => {
        tab.value = 'conversation';
    },
);

// --- Conversation ------------------------------------------------------------
const pinnedNotes = computed(() => props.ticket.pinned_notes || []);

const thread = computed(() => {
    const items = [];
    const ticket = props.ticket;
    if (ticket.description) {
        items.push({
            id: `ticket-${ticket.id}`,
            author: ticket.requester || { name: requesterName(ticket) },
            body: ticket.description,
            created_at: ticket.created_at,
            attachments: ticket.attachments || [],
            is_internal_note: false,
        });
    }
    const replies = [...(ticket.replies || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return [...items, ...replies];
});

function bodyHtml(body) {
    return highlightMentions(sanitizeHtml(body || ''), escDark.value);
}

function isPlainText(body) {
    return !/<[a-z][\s\S]*>/i.test(body || '');
}

function attachmentUrl(attachment) {
    if (attachment.url) return attachment.url;
    if (typeof window !== 'undefined' && typeof window.route === 'function') {
        try {
            const url = window.route('escalated.attachments.download', attachment.id);
            if (typeof url === 'string' && url !== '#') return url;
        } catch {
            // no such route
        }
    }
    return `/escalated/attachments/${attachment.id}/download`;
}

function formatSize(bytes) {
    if (typeof bytes !== 'number') return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fullDate(date) {
    return date ? new Date(date).toLocaleString() : '';
}

function togglePin(reply) {
    if (!props.routes.pin) return;
    post(props.routes.pin(reply.id));
}

const threadEnd = ref(null);
const paneRoot = ref(null);

// Open on the latest message. On a phone the whole pane scrolls (the header
// scrolls away and the composer sticks to the bottom), so scroll the pane to
// its end; scrolling the marker into view would leave it behind the composer.
function scrollToLatest() {
    const root = paneRoot.value;
    if (root && typeof window !== 'undefined' && window.getComputedStyle(root).overflowY === 'auto') {
        root.scrollTop = root.scrollHeight;
        return;
    }
    threadEnd.value?.scrollIntoView?.({ block: 'end' });
}

watch(
    () => [props.ticket.id, thread.value.length],
    () => nextTick(scrollToLatest),
    { immediate: true, flush: 'post' },
);

// --- Details -------------------------------------------------------------------
function slaText(due, breached) {
    if (!due && !breached) return null;
    if (breached) return { tone: 'var(--esc-sla-breach)', text: t('agent_panel.sla.breached') };
    const minutes = Math.round((new Date(due).getTime() - now.value) / 60000);
    if (minutes < 0) return { tone: 'var(--esc-sla-breach)', text: t('agent_panel.sla.overdue') };
    const tone = minutes <= 60 ? 'var(--esc-sla-warn)' : 'var(--esc-sla-ok)';
    if (minutes < 60) return { tone, text: t('agent_panel.sla.due_minutes', { count: minutes }) };
    if (minutes < 1440) return { tone, text: t('agent_panel.sla.due_hours', { count: Math.round(minutes / 60) }) };
    return { tone, text: t('agent_panel.sla.due_days', { count: Math.round(minutes / 1440) }) };
}

const customFields = computed(() => {
    const raw = props.ticket.custom_fields ?? props.ticket.custom_field_values ?? null;
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw
            .map((field) => ({ label: field.label || field.name || field.key, value: field.value }))
            .filter((field) => field.label);
    }
    return Object.entries(raw).map(([label, value]) => ({ label, value }));
});

function displayValue(value) {
    if (value === null || value === undefined || value === '') return t('agent_panel.ticket.none');
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? t('agent_panel.ticket.yes') : t('agent_panel.ticket.no');
    return String(value);
}

function typeLabel(type) {
    if (!type) return t('agent_panel.ticket.none');
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

// --- Customer and related ------------------------------------------------------
const requester = computed(() => props.ticket.requester || {});
const recentTickets = computed(() =>
    (props.ticket.requester_tickets || props.ticket.related_tickets || []).filter(
        (item) => item?.reference && item.reference !== props.ticket.reference,
    ),
);

const links = computed(() => {
    const list = [];
    for (const link of props.ticket.links_as_parent || []) {
        const other = link.child_ticket || link.childTicket;
        if (other) list.push({ relation: link.link_type || link.type || 'child', ticket: other });
    }
    for (const link of props.ticket.links_as_child || []) {
        const other = link.parent_ticket || link.parentTicket;
        if (other) list.push({ relation: link.link_type || link.type || 'parent', ticket: other });
    }
    for (const merged of props.ticket.merged_tickets || []) list.push({ relation: 'merged', ticket: merged });
    if (props.ticket.merged_into) list.push({ relation: 'merged_into', ticket: props.ticket.merged_into });
    return list;
});

function relationLabel(relation) {
    const label = t(`agent_panel.ticket.relation.${relation}`);
    return label.startsWith('agent_panel.') ? String(relation).replace(/_/g, ' ') : label;
}

// --- Composer ------------------------------------------------------------------
const composerRef = ref(null);
const composerMode = ref(props.notesOnly ? 'note' : 'reply');

function focusReply() {
    if (props.notesOnly) return focusNote();
    tab.value = 'conversation';
    composerRef.value?.focus('reply');
}

function focusNote() {
    tab.value = 'conversation';
    composerRef.value?.focus('note');
}

defineExpose({
    focusReply,
    focusNote,
    openStatus: () => canEditStatus.value && (statusOpen.value = true),
    openPriority: () => canEditPriority.value && (priorityOpen.value = true),
    assignToMe,
    resolve,
    toggleFollow,
    copyLink,
});

const controlClass =
    'flex h-7 items-center gap-1.5 border px-2.5 text-[13px] text-[var(--esc-panel-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
const iconButton =
    'flex h-8 w-8 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
const dtClass = 'py-1.5 text-[13px] text-[var(--esc-panel-text-tertiary)]';
const ddClass = 'min-w-0 py-1.5 text-[13px] text-[var(--esc-panel-text)]';
</script>

<template>
    <div ref="paneRoot" class="flex h-full min-h-0 flex-col max-sm:overflow-y-auto" data-testid="esc-detail-pane">
        <!-- Header -->
        <header class="shrink-0 px-4 pt-4 sm:px-6">
            <div class="flex items-center gap-1.5">
                <span class="text-[13px] tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                    ticket.reference
                }}</span>
                <button
                    type="button"
                    class="flex h-6 w-6 items-center justify-center rounded text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                    :aria-label="t('agent_panel.ticket.copy_link')"
                    :title="t('agent_panel.ticket.copy_link')"
                    data-testid="esc-copy-link"
                    @click="copyLink"
                >
                    <PanelIcon name="link" class="h-3.5 w-3.5" />
                </button>
                <span v-if="copied" class="text-[12px] text-[var(--esc-panel-text-tertiary)]" role="status">{{
                    t('agent_panel.ticket.link_copied')
                }}</span>
                <div class="ml-auto flex items-center gap-1">
                    <PresenceIndicator
                        :ticket-reference="ticket.reference"
                        :ticket-id="ticket.id"
                        :channel-prefix="channelPrefix"
                        route-prefix="escalated.agent"
                    />
                    <PluginSlot slot="ticket.show.actions" :components="getPageComponents('ticket.show', 'actions')" />
                    <div class="relative">
                        <button
                            type="button"
                            :class="iconButton"
                            aria-haspopup="menu"
                            :aria-expanded="moreOpen ? 'true' : 'false'"
                            :aria-label="t('agent_panel.ticket.more')"
                            data-testid="esc-ticket-more"
                            @click="moreOpen = !moreOpen"
                        >
                            <PanelIcon name="ellipsis" class="h-5 w-5" />
                        </button>
                        <PanelMenu
                            v-model:open="moreOpen"
                            :items="moreItems"
                            :label="t('agent_panel.ticket.more')"
                            align="right"
                            width="w-60"
                            @select="onMore"
                        />
                    </div>
                    <button
                        v-if="routes.follow"
                        type="button"
                        :class="[iconButton, isFollowing ? 'text-[var(--esc-priority-medium)]' : '']"
                        :aria-pressed="isFollowing ? 'true' : 'false'"
                        :aria-label="isFollowing ? t('agent_panel.ticket.unfollow') : t('agent_panel.ticket.follow')"
                        :title="isFollowing ? t('agent_panel.ticket.unfollow') : t('agent_panel.ticket.follow')"
                        data-testid="esc-follow"
                        @click="toggleFollow"
                    >
                        <svg
                            class="h-[18px] w-[18px]"
                            viewBox="0 0 24 24"
                            :fill="isFollowing ? 'currentColor' : 'none'"
                            stroke="currentColor"
                            stroke-width="1.5"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.004l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-1.004l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <h2 class="mt-1 text-[18px] font-semibold leading-6 text-[var(--esc-panel-text)]" data-testid="esc-subject">
                {{ ticket.subject }}
            </h2>

            <!-- Controls -->
            <div class="mt-3 flex flex-wrap items-center gap-2">
                <div class="relative">
                    <component
                        :is="canEditStatus ? 'button' : 'span'"
                        :type="canEditStatus ? 'button' : undefined"
                        :class="[
                            controlClass,
                            'rounded-full border-transparent font-medium text-[var(--esc-panel-text)]',
                            canEditStatus ? 'hover:brightness-110' : '',
                        ]"
                        :style="{ background: `color-mix(in srgb, ${statusColor(ticket.status)} 16%, transparent)` }"
                        :aria-haspopup="canEditStatus ? 'menu' : undefined"
                        :aria-expanded="canEditStatus ? (statusOpen ? 'true' : 'false') : undefined"
                        :aria-label="canEditStatus ? t('agent_panel.ticket.change_status') : undefined"
                        data-testid="esc-status"
                        @click="canEditStatus && (statusOpen = !statusOpen)"
                    >
                        <span class="h-2 w-2 rounded-full" :style="{ background: statusColor(ticket.status) }"></span>
                        {{ statusLabel(ticket.status) }}
                        <PanelIcon v-if="canEditStatus" name="chevronDown" class="h-3.5 w-3.5 opacity-70" />
                    </component>
                    <PanelMenu
                        v-model:open="statusOpen"
                        :items="statusItems"
                        :label="t('agent_panel.ticket.change_status')"
                        @select="setStatus"
                    />
                </div>

                <div v-if="ticket.priority || canEditPriority" class="relative">
                    <component
                        :is="canEditPriority ? 'button' : 'span'"
                        :type="canEditPriority ? 'button' : undefined"
                        :class="[
                            controlClass,
                            'rounded-[var(--esc-radius,6px)] border-[var(--esc-panel-border-input)]',
                            canEditPriority ? 'hover:bg-[var(--esc-panel-hover)]' : '',
                        ]"
                        :aria-haspopup="canEditPriority ? 'menu' : undefined"
                        :aria-expanded="canEditPriority ? (priorityOpen ? 'true' : 'false') : undefined"
                        :aria-label="canEditPriority ? t('agent_panel.ticket.change_priority') : undefined"
                        data-testid="esc-priority"
                        @click="canEditPriority && (priorityOpen = !priorityOpen)"
                    >
                        <span
                            class="h-2 w-2 rounded-full"
                            :style="{ background: priorityColor(ticket.priority) }"
                        ></span>
                        {{ ticket.priority ? priorityLabel(ticket.priority) : t('agent_panel.ticket.no_priority') }}
                        <PanelIcon v-if="canEditPriority" name="chevronDown" class="h-3.5 w-3.5 opacity-70" />
                    </component>
                    <PanelMenu
                        v-model:open="priorityOpen"
                        :items="priorityItems"
                        :label="t('agent_panel.ticket.change_priority')"
                        @select="setPriority"
                    />
                </div>

                <span
                    v-for="tag in ticketTags"
                    :key="tag.id"
                    :class="[controlClass, 'rounded-full border-[var(--esc-panel-border-input)] pr-1.5']"
                    data-testid="esc-tag"
                >
                    <span
                        class="h-2 w-2 rounded-full"
                        :style="{ background: tag.color || 'var(--esc-panel-text-muted)' }"
                    ></span>
                    {{ tag.name }}
                    <button
                        v-if="canEditTags"
                        type="button"
                        class="ml-0.5 rounded-full p-0.5 text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        :aria-label="t('agent_panel.ticket.remove_tag', { name: tag.name })"
                        @click="removeTag(tag.id)"
                    >
                        <PanelIcon name="x" class="h-3 w-3" />
                    </button>
                </span>
                <div v-if="canEditTags && tags.length" class="relative">
                    <button
                        type="button"
                        class="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--esc-panel-border-input)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        :aria-label="t('agent_panel.ticket.add_tag')"
                        aria-haspopup="menu"
                        :aria-expanded="tagsOpen ? 'true' : 'false'"
                        data-testid="esc-add-tag"
                        @click="tagsOpen = !tagsOpen"
                    >
                        <PanelIcon name="plus" class="h-3.5 w-3.5" />
                    </button>
                    <TagPicker
                        v-model:open="tagsOpen"
                        :tags="pickerTags"
                        :model-value="tagIds"
                        @update:model-value="updateTags"
                    />
                </div>

                <div class="ml-auto flex items-center gap-2">
                    <span
                        class="flex items-center gap-1.5 text-[13px] text-[var(--esc-panel-text-tertiary)]"
                        data-testid="esc-assignee"
                    >
                        <span
                            v-if="assignee"
                            class="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[10px] font-semibold text-[var(--esc-panel-text-secondary)]"
                            aria-hidden="true"
                            >{{ initials(assignee.name) }}</span
                        >
                        {{ assignee ? assignee.name : t('agent_panel.ticket.unassigned') }}
                    </span>
                    <button
                        v-if="canAssignToMe"
                        type="button"
                        class="h-7 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2.5 text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        data-testid="esc-assign-me"
                        @click="assignToMe"
                    >
                        {{ t('agent_panel.ticket.assign_to_me') }}
                    </button>
                </div>
            </div>

            <ChatActionBar
                v-if="chat.active"
                class="mt-3"
                :session-id="ticket.chat_session_id"
                :started-at="ticket.chat_started_at || ticket.created_at"
                :customer="{
                    name: ticket.requester?.name,
                    email: ticket.requester?.email,
                    page_url: ticket.chat_metadata?.page_url,
                }"
                :agents="[]"
                :departments="departments"
                :end-endpoint="chat.endEndpoint || ''"
                :transfer-endpoint="chat.transferEndpoint || ''"
                @end-chat="emit('end-chat')"
            />

            <!-- Tabs -->
            <div
                role="tablist"
                :aria-label="t('agent_panel.ticket.sections')"
                class="mt-3 flex gap-1 border-b border-[var(--esc-panel-border)]"
                @keydown="onTabKeydown"
            >
                <button
                    v-for="name in TABS"
                    :id="`esc-tab-${name}`"
                    :key="name"
                    :ref="(el) => (tabRefs[name] = el)"
                    type="button"
                    role="tab"
                    :aria-selected="tab === name ? 'true' : 'false'"
                    :aria-controls="`esc-tabpanel-${name}`"
                    :tabindex="tab === name ? 0 : -1"
                    :class="[
                        'relative px-2.5 pb-2.5 pt-1 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]',
                        tab === name
                            ? 'text-[var(--esc-panel-text)] after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:bg-[var(--esc-panel-accent)]'
                            : 'text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)]',
                    ]"
                    @click="tab = name"
                >
                    {{ t(`agent_panel.ticket.tabs.${name}`) }}
                </button>
            </div>
        </header>

        <!-- Panels -->
        <div
            :id="`esc-tabpanel-${tab}`"
            role="tabpanel"
            :aria-labelledby="`esc-tab-${tab}`"
            class="min-h-0 flex-1 overflow-y-auto px-4 py-4 max-sm:flex-none max-sm:overflow-visible sm:px-6"
            data-testid="esc-tabpanel"
        >
            <!-- Conversation -->
            <template v-if="tab === 'conversation'">
                <ChatThread
                    v-if="chat.active"
                    :messages="chat.messages || []"
                    :typing-user="chat.typingUser || null"
                    :current-user-id="currentUserId"
                />
                <div v-else class="space-y-3" role="feed" :aria-label="t('agent_panel.ticket.tabs.conversation')">
                    <section v-if="pinnedNotes.length" class="space-y-2" data-testid="esc-pinned-notes">
                        <article
                            v-for="note in pinnedNotes"
                            :key="`pin-${note.id}`"
                            class="rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)] px-4 py-3"
                        >
                            <div class="flex items-center gap-1.5 text-[12px] text-[var(--esc-panel-note-text)]">
                                <PanelIcon name="lock" class="h-3.5 w-3.5" />
                                <span class="font-medium">{{ t('agent_panel.ticket.pinned_note') }}</span>
                                <span>&middot; {{ note.author?.name || t('ticket.unknown') }}</span>
                                <button
                                    v-if="routes.pin"
                                    type="button"
                                    class="ml-auto rounded px-1.5 py-0.5 hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                                    @click="togglePin(note)"
                                >
                                    {{ t('reply.unpin') }}
                                </button>
                            </div>
                            <div
                                :class="[
                                    'mt-1 text-[14px] leading-5 text-[var(--esc-panel-text)]',
                                    isPlainText(note.body) ? 'whitespace-pre-line' : '',
                                ]"
                                v-html="bodyHtml(note.body)"
                            ></div>
                        </article>
                    </section>

                    <article
                        v-for="message in thread"
                        :key="message.id"
                        :class="[
                            'flex gap-3 rounded-[var(--esc-radius-lg,8px)] border px-4 py-3',
                            message.is_internal_note
                                ? 'border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)]'
                                : 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]',
                        ]"
                        :data-note="message.is_internal_note ? 'true' : undefined"
                        data-testid="esc-message"
                    >
                        <span
                            v-if="message.is_internal_note"
                            class="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--esc-panel-note-text)]"
                            aria-hidden="true"
                        >
                            <PanelIcon name="lock" class="h-[18px] w-[18px]" />
                        </span>
                        <span
                            v-else
                            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[12px] font-semibold text-[var(--esc-panel-text-secondary)]"
                            aria-hidden="true"
                            >{{ initials(message.author?.name) }}</span
                        >
                        <div class="min-w-0 flex-1">
                            <div class="flex items-baseline gap-1.5 text-[13px]">
                                <template v-if="message.is_internal_note">
                                    <span class="font-medium text-[var(--esc-panel-note-text)]">{{
                                        t('agent_panel.ticket.internal_note')
                                    }}</span>
                                    <span class="text-[12px] text-[var(--esc-panel-text-tertiary)]"
                                        >&middot; {{ message.author?.name || t('ticket.unknown') }} &middot;
                                        <time :datetime="message.created_at" :title="fullDate(message.created_at)">{{
                                            relativeTime(message.created_at, t, now)
                                        }}</time></span
                                    >
                                    <button
                                        v-if="routes.pin"
                                        type="button"
                                        class="ml-auto rounded px-1.5 text-[12px] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                                        @click="togglePin(message)"
                                    >
                                        {{ message.is_pinned ? t('reply.unpin') : t('reply.pin') }}
                                    </button>
                                </template>
                                <template v-else>
                                    <span class="font-semibold text-[var(--esc-panel-text)]">{{
                                        message.author?.name || t('ticket.unknown')
                                    }}</span>
                                    <time
                                        class="ml-auto shrink-0 text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                        :datetime="message.created_at"
                                        :title="fullDate(message.created_at)"
                                        >{{ relativeTime(message.created_at, t, now) }}</time
                                    >
                                </template>
                            </div>
                            <div
                                :class="[
                                    'esc-message-body mt-1 break-words text-[14px] leading-5 text-[var(--esc-panel-text-secondary)]',
                                    isPlainText(message.body) ? 'whitespace-pre-line' : '',
                                ]"
                                v-html="bodyHtml(message.body)"
                            ></div>
                            <ul v-if="message.attachments?.length" class="mt-2.5 space-y-1.5">
                                <li
                                    v-for="attachment in message.attachments"
                                    :key="attachment.id"
                                    class="flex max-w-md items-center gap-3 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-3 py-2"
                                    data-testid="esc-attachment"
                                >
                                    <PanelIcon
                                        name="document"
                                        class="h-5 w-5 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                                    />
                                    <span class="min-w-0 flex-1">
                                        <span
                                            class="block truncate text-[13px] font-medium text-[var(--esc-panel-text)]"
                                            >{{
                                                attachment.original_filename || attachment.filename || attachment.name
                                            }}</span
                                        >
                                        <span class="text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                                            formatSize(attachment.size)
                                        }}</span>
                                    </span>
                                    <a
                                        :href="attachmentUrl(attachment)"
                                        target="_blank"
                                        rel="noopener"
                                        :class="iconButton"
                                        :aria-label="
                                            t('agent_panel.ticket.download', {
                                                name: attachment.original_filename || attachment.filename || '',
                                            })
                                        "
                                    >
                                        <PanelIcon name="download" class="h-4 w-4" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </article>
                    <p v-if="!thread.length" class="py-8 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]">
                        {{ t('ticket.no_replies') }}
                    </p>
                    <div ref="threadEnd"></div>
                </div>
            </template>

            <!-- Details -->
            <template v-else-if="tab === 'details'">
                <dl class="grid grid-cols-[minmax(7rem,10rem)_1fr] gap-x-4" data-testid="esc-details">
                    <dt :class="dtClass">{{ t('ticket.status') }}</dt>
                    <dd :class="ddClass">
                        <span class="flex items-center gap-1.5">
                            <span
                                class="h-2 w-2 rounded-full"
                                :style="{ background: statusColor(ticket.status) }"
                            ></span>
                            {{ statusLabel(ticket.status) }}
                        </span>
                    </dd>
                    <dt :class="dtClass">{{ t('ticket.priority') }}</dt>
                    <dd :class="ddClass">
                        <span class="flex items-center gap-1.5">
                            <span
                                class="h-2 w-2 rounded-full"
                                :style="{ background: priorityColor(ticket.priority) }"
                            ></span>
                            {{ ticket.priority ? priorityLabel(ticket.priority) : t('agent_panel.ticket.none') }}
                        </span>
                    </dd>
                    <dt :class="dtClass">{{ t('ticket.assignee') }}</dt>
                    <dd :class="ddClass">{{ assignee?.name || t('agent_panel.ticket.unassigned') }}</dd>
                    <dt :class="dtClass">{{ t('ticket.department') }}</dt>
                    <dd :class="ddClass">{{ ticket.department?.name || t('agent_panel.ticket.none') }}</dd>
                    <dt :class="dtClass">{{ t('agent_panel.ticket.type') }}</dt>
                    <dd :class="ddClass">{{ typeLabel(ticket.ticket_type) }}</dd>
                    <template v-if="ticket.channel">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.channel') }}</dt>
                        <dd :class="ddClass">{{ typeLabel(ticket.channel) }}</dd>
                    </template>
                    <dt :class="dtClass">{{ t('ticket.created') }}</dt>
                    <dd :class="ddClass">
                        <time :datetime="ticket.created_at">{{ fullDate(ticket.created_at) }}</time>
                    </dd>
                    <template v-if="ticket.first_response_due_at || ticket.sla_first_response_breached">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.first_response') }}</dt>
                        <dd
                            :class="ddClass"
                            :style="{
                                color: slaText(ticket.first_response_due_at, ticket.sla_first_response_breached).tone,
                            }"
                        >
                            {{ slaText(ticket.first_response_due_at, ticket.sla_first_response_breached).text }}
                        </dd>
                    </template>
                    <template v-if="ticket.resolution_due_at || ticket.sla_resolution_breached">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.resolution') }}</dt>
                        <dd
                            :class="ddClass"
                            :style="{ color: slaText(ticket.resolution_due_at, ticket.sla_resolution_breached).tone }"
                        >
                            {{ slaText(ticket.resolution_due_at, ticket.sla_resolution_breached).text }}
                        </dd>
                    </template>
                    <dt :class="dtClass">{{ t('agent_panel.ticket.followers') }}</dt>
                    <dd :class="[ddClass, 'tabular-nums']">{{ followersCount }}</dd>
                    <dt :class="dtClass">{{ t('agent_panel.ticket.tags') }}</dt>
                    <dd :class="ddClass">
                        {{
                            ticketTags.length
                                ? ticketTags.map((tag) => tag.name).join(', ')
                                : t('agent_panel.ticket.none')
                        }}
                    </dd>
                    <template v-if="ticket.satisfaction_rating">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.satisfaction') }}</dt>
                        <dd :class="[ddClass, 'tabular-nums']">
                            {{ ticket.satisfaction_rating.rating }}/5
                            <span
                                v-if="ticket.satisfaction_rating.comment"
                                class="block text-[var(--esc-panel-text-tertiary)]"
                                >{{ ticket.satisfaction_rating.comment }}</span
                            >
                        </dd>
                    </template>
                    <template v-for="field in customFields" :key="`cf-${field.label}`">
                        <dt :class="dtClass">{{ field.label }}</dt>
                        <dd :class="ddClass">{{ displayValue(field.value) }}</dd>
                    </template>
                </dl>
                <div v-if="ticket.subjects?.length" class="mt-4">
                    <TicketSubjects :subjects="ticket.subjects" />
                </div>
                <div class="mt-4">
                    <PluginSlot slot="ticket.show.sidebar" :components="getPageComponents('ticket.show', 'sidebar')" />
                </div>
            </template>

            <!-- Customer -->
            <template v-else-if="tab === 'customer'">
                <div class="flex items-center gap-3" data-testid="esc-customer">
                    <span
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[14px] font-semibold text-[var(--esc-panel-text-secondary)]"
                        aria-hidden="true"
                        >{{ initials(requesterName(ticket)) }}</span
                    >
                    <div class="min-w-0">
                        <p class="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--esc-panel-text)]">
                            {{ requesterName(ticket) || t('ticket.unknown') }}
                            <span
                                v-if="isLive(ticket)"
                                class="h-1.5 w-1.5 rounded-full bg-[var(--esc-sla-ok)]"
                                :title="t('agent_panel.inbox.requester_online')"
                            ></span>
                        </p>
                        <p class="truncate text-[13px] text-[var(--esc-panel-text-tertiary)]">
                            {{ requester.email || ticket.requester_email }}
                        </p>
                    </div>
                </div>
                <dl class="mt-4 grid grid-cols-[minmax(7rem,10rem)_1fr] gap-x-4">
                    <dt :class="dtClass">{{ t('agent_panel.ticket.email') }}</dt>
                    <dd :class="[ddClass, 'truncate']">
                        {{ requester.email || ticket.requester_email || t('agent_panel.ticket.none') }}
                    </dd>
                    <template v-if="typeof ticket.requester_ticket_count === 'number'">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.tickets') }}</dt>
                        <dd :class="[ddClass, 'tabular-nums']">{{ ticket.requester_ticket_count }}</dd>
                    </template>
                    <template v-if="ticket.chat_metadata?.page_url">
                        <dt :class="dtClass">{{ t('agent_panel.ticket.page') }}</dt>
                        <dd :class="[ddClass, 'truncate']">{{ ticket.chat_metadata.page_url }}</dd>
                    </template>
                </dl>
                <h3 class="mt-5 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.ticket.recent_tickets') }}
                </h3>
                <ul v-if="recentTickets.length" class="mt-1.5 divide-y divide-[var(--esc-panel-border)]">
                    <li v-for="item in recentTickets" :key="item.reference">
                        <Link
                            :href="ticketUrl(prefix, item.reference)"
                            class="-mx-1.5 flex items-center gap-3 rounded-[var(--esc-radius,6px)] px-1.5 py-2 text-[13px] hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        >
                            <span class="shrink-0 tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                                item.reference
                            }}</span>
                            <span class="min-w-0 flex-1 truncate text-[var(--esc-panel-text)]">{{ item.subject }}</span>
                            <span
                                v-if="item.status"
                                class="shrink-0 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                                >{{ statusLabel(item.status) }}</span
                            >
                        </Link>
                    </li>
                </ul>
                <p v-else class="mt-1.5 text-[13px] text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.ticket.no_recent_tickets') }}
                </p>
                <div class="mt-4">
                    <PluginSlot
                        slot="ticket.show.context-panel"
                        :components="getPageComponents('ticket.show', 'context-panel')"
                    />
                </div>
            </template>

            <!-- Related -->
            <template v-else>
                <h3 class="text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.ticket.linked_tickets') }}
                </h3>
                <ul
                    v-if="links.length"
                    class="mt-1.5 divide-y divide-[var(--esc-panel-border)]"
                    data-testid="esc-links"
                >
                    <li v-for="link in links" :key="`${link.relation}-${link.ticket.reference}`">
                        <Link
                            :href="ticketUrl(prefix, link.ticket.reference)"
                            class="-mx-1.5 flex items-center gap-3 rounded-[var(--esc-radius,6px)] px-1.5 py-2 text-[13px] hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        >
                            <span class="w-20 shrink-0 text-[12px] text-[var(--esc-panel-text-tertiary)]">{{
                                relationLabel(link.relation)
                            }}</span>
                            <span class="shrink-0 tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                                link.ticket.reference
                            }}</span>
                            <span class="min-w-0 flex-1 truncate text-[var(--esc-panel-text)]">{{
                                link.ticket.subject
                            }}</span>
                        </Link>
                    </li>
                </ul>
                <p v-else class="mt-1.5 text-[13px] text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.ticket.no_links') }}
                </p>
                <div class="mt-5">
                    <KnowledgePanel :ticket-reference="ticket.reference" />
                </div>
                <h3 class="mt-5 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.ticket.activity') }}
                </h3>
                <div class="mt-2">
                    <ActivityTimeline :activities="ticket.activities || []" />
                </div>
            </template>
        </div>

        <!-- Composer -->
        <div
            class="shrink-0 px-4 pb-4 max-sm:sticky max-sm:bottom-0 max-sm:bg-[var(--esc-panel-bg)] max-sm:pt-2 sm:px-6"
            data-testid="esc-composer-dock"
        >
            <div
                v-if="chat.active"
                class="overflow-hidden rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-border-input)]"
            >
                <ChatComposer
                    :session-id="ticket.chat_session_id"
                    :send-endpoint="chat.sendEndpoint || ''"
                    :typing-endpoint="chat.typingEndpoint || ''"
                    allow-notes
                    @send="emit('chat-send', $event)"
                />
            </div>
            <Composer
                v-else
                ref="composerRef"
                v-model:mode="composerMode"
                :reply-action="routes.reply || ''"
                :note-action="routes.note || ''"
                :status-action="notesOnly ? '' : routes.status || ''"
                :canned-responses="cannedResponses"
                :notes-only="notesOnly"
                :draft-key="ticket.reference"
                :typing-endpoint="routes.typing || ''"
            />
        </div>

        <TicketMergeDialog v-if="mergeOpen" :ticket-reference="ticket.reference" @close="mergeOpen = false" />
    </div>
</template>
