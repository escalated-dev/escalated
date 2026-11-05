<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { usePluginExtensions } from '../composables/usePluginExtensions';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { readFlash } from '../utils/flash';
import { toast } from '../composables/useAgentToasts';
import { highlightMentions } from '../utils/mentionHighlight';
import {
    absoluteTime,
    describeActivity,
    initials,
    messageKind,
    priorityColor,
    relativeTime,
    snoozePresets,
} from '../utils/agentTicket';
import { ticketUrl } from '../utils/agentQueues';
import ChatActionBar from './ChatActionBar.vue';
import ChatComposer from './ChatComposer.vue';
import ChatThread from './ChatThread.vue';
import Composer from './Composer.vue';
import PanelIcon from './PanelIcon.vue';
import PanelMenu from './PanelMenu.vue';
import PluginSlot from './PluginSlot.vue';
import PresenceIndicator from './PresenceIndicator.vue';
import TagPicker from './TagPicker.vue';
import TicketContextPanel from './TicketContextPanel.vue';
import TicketMergeDialog from './TicketMergeDialog.vue';

/**
 * The ticket in the agent panel: a compact header (reference, subject and the
 * frequent actions, then status, priority, assignee, department and tags), the
 * conversation in its own scroll region with the composer under it, and the
 * customer and details panel beside it (or over it when the pane is narrow).
 * Live chats swap the conversation and composer for the chat thread and chat
 * composer.
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
    /** `[{ id, name }]`: who the ticket can be assigned to. Without it only "Assign to me" is offered. */
    agents: { type: Array, default: () => [] },
    isFollowing: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
    /** Light agents: internal notes only, no status, priority, macros or assignment. */
    notesOnly: { type: Boolean, default: false },
    currentUserId: { type: [Number, String], default: null },
    prefix: { type: String, default: 'support' },
    channelPrefix: { type: String, default: undefined },
    /** `{ reply, note, status, priority, tags, assign, department, follow, macro, merge, snooze, unsnooze, pin, typing }` */
    routes: { type: Object, default: () => ({}) },
    /** The tickets before and after this one in the list it was opened from: `{ previous, next }`. */
    adjacent: { type: Object, default: () => ({}) },
    /** `{ active, messages, typingUser, sendEndpoint, typingEndpoint, endEndpoint, transferEndpoint }` */
    chat: { type: Object, default: () => ({ active: false }) },
    /** Where the knowledge base lives; empty when it is off. */
    knowledgeBaseUrl: { type: String, default: '' },
});

const emit = defineEmits(['chat-send', 'end-chat', 'mark-unread']);
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
const CLOSED_STATUSES = ['resolved', 'closed'];

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

// --- Posting actions -----------------------------------------------------------
/**
 * Post an action. A flash from the backend confirms it through the shell;
 * without one, `done` is shown. A rejection shows the first error the
 * backend gave, or a generic one.
 */
function post(url, data = {}, done = '') {
    if (!url) return;
    router.post(url, data, {
        preserveScroll: true,
        onSuccess: (result) => {
            const flash = readFlash(result);
            if (done && !flash.success && !flash.message && !flash.error) toast(done);
        },
        onError: (errors) => {
            const first = Object.values(errors || {}).flat()[0];
            toast(typeof first === 'string' && first ? first : t('agent_panel.toast.failed'), 'error');
        },
    });
}

// --- Status, priority, resolve -----------------------------------------------
const statusOpen = ref(false);
const priorityOpen = ref(false);
const canEditStatus = computed(() => !props.notesOnly && !!props.routes.status);
const canEditPriority = computed(() => !props.notesOnly && !!props.routes.priority);
const isClosed = computed(() => CLOSED_STATUSES.includes(props.ticket.status));

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

function setStatus(item) {
    if (item.key !== props.ticket.status) {
        post(props.routes.status, { status: item.key }, t('agent_panel.toast.status', { status: item.label }));
    }
}

function setPriority(item) {
    if (item.key !== props.ticket.priority) {
        post(props.routes.priority, { priority: item.key }, t('agent_panel.toast.priority', { priority: item.label }));
    }
}

function resolve() {
    if (canEditStatus.value && props.ticket.status !== 'resolved') {
        post(
            props.routes.status,
            { status: 'resolved' },
            t('agent_panel.toast.status', { status: statusLabel('resolved') }),
        );
    }
}

function reopen() {
    if (canEditStatus.value && isClosed.value) {
        post(props.routes.status, { status: 'open' }, t('agent_panel.toast.status', { status: statusLabel('open') }));
    }
}

// --- Tags -------------------------------------------------------------------------
const tagsOpen = ref(false);
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
    post(props.routes.tags, { tag_ids: ids }, t('agent_panel.toast.tags'));
}

function removeTag(id) {
    updateTags(tagIds.value.filter((tagId) => tagId !== id));
}

// --- Assignee ---------------------------------------------------------------------
const assigneeOpen = ref(false);
const assignee = computed(() => props.ticket.assignee || null);
const assignedToMe = computed(
    () => props.currentUserId != null && String(props.ticket.assigned_to ?? '') === String(props.currentUserId),
);
const canAssign = computed(() => !props.notesOnly && !!props.routes.assign);
const canAssignToMe = computed(() => canAssign.value && props.currentUserId != null && !assignedToMe.value);
const canReassign = computed(() => canAssign.value && props.agents.length > 0);

const assigneeItems = computed(() =>
    props.agents.map((agent) => ({
        key: `agent:${agent.id}`,
        label:
            String(agent.id) === String(props.currentUserId)
                ? `${agent.name} (${t('agent_panel.ticket.you')})`
                : agent.name,
        checked: String(props.ticket.assigned_to ?? '') === String(agent.id),
        agent,
    })),
);

function assignToMe() {
    if (canAssignToMe.value)
        post(props.routes.assign, { agent_id: props.currentUserId }, t('agent_panel.toast.assigned'));
}

function assignTo(item) {
    const agent = item.agent;
    if (!agent || item.checked) return;
    if (String(agent.id) === String(props.currentUserId)) return assignToMe();
    post(props.routes.assign, { agent_id: agent.id }, t('agent_panel.toast.assigned_to', { name: agent.name }));
}

// --- Department ---------------------------------------------------------------------
const departmentOpen = ref(false);
const canChangeDepartment = computed(
    () => !props.notesOnly && !!props.routes.department && props.departments.length > 0,
);
const departmentItems = computed(() =>
    props.departments.map((department) => ({
        key: `department:${department.id}`,
        label: department.name,
        checked: String(props.ticket.department_id ?? props.ticket.department?.id ?? '') === String(department.id),
        department,
    })),
);

function setDepartment(item) {
    if (item.checked) return;
    post(
        props.routes.department,
        { department_id: item.department.id },
        t('agent_panel.toast.department', { department: item.department.name }),
    );
}

// --- Follow and copy link -----------------------------------------------------------
function toggleFollow() {
    post(
        props.routes.follow,
        {},
        props.isFollowing ? t('agent_panel.toast.unfollowed') : t('agent_panel.toast.followed'),
    );
}

const copied = ref(false);
let copiedTimer = null;
function copyLink() {
    const path = ticketUrl(props.prefix, props.ticket.reference);
    const url = typeof window !== 'undefined' ? new URL(path, window.location.origin).toString() : path;
    window.navigator?.clipboard?.writeText(url)?.catch?.(() => {});
    copied.value = true;
    toast(t('agent_panel.ticket.link_copied'));
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = false), 2000);
}
onBeforeUnmount(() => clearTimeout(copiedTimer));

// --- Snooze -------------------------------------------------------------------------
const snoozeOpen = ref(false);
const snoozeCustom = ref('');
const canSnooze = computed(() => !props.notesOnly && !!props.routes.snooze);
const snoozedUntil = computed(() => {
    const until = props.ticket.snoozed_until;
    if (!until) return null;
    const date = new Date(until);
    return Number.isNaN(date.getTime()) || date.getTime() <= now.value ? null : date;
});

function shortDate(date) {
    return date.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

const snoozeItems = computed(() => {
    const items = [];
    if (snoozedUntil.value && props.routes.unsnooze) {
        items.push({ key: 'unsnooze', label: t('agent_panel.ticket.unsnooze'), icon: 'x' });
    }
    for (const preset of snoozePresets(new Date(now.value))) {
        items.push({
            key: `snooze:${preset.key}`,
            label: t(`agent_panel.ticket.snooze_${preset.key}`),
            hint: preset.key.startsWith('in_') ? '' : shortDate(preset.until),
            until: preset.until,
        });
    }
    return items;
});

// The earliest the custom picker allows: the next minute, local time.
const snoozeMin = computed(() => {
    const d = new Date(now.value + 60000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

function snoozeUntil(date) {
    post(props.routes.snooze, { snoozed_until: date.toISOString() }, t('agent_panel.toast.snoozed'));
}

function onSnooze(item) {
    if (item.key === 'unsnooze') post(props.routes.unsnooze, {}, t('agent_panel.toast.unsnoozed'));
    else if (item.until) snoozeUntil(item.until);
}

function submitCustomSnooze() {
    const date = new Date(snoozeCustom.value);
    if (!snoozeCustom.value || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return;
    snoozeOpen.value = false;
    snoozeCustom.value = '';
    snoozeUntil(date);
}

// --- Overflow menu --------------------------------------------------------------------
const moreOpen = ref(false);
const mergeOpen = ref(false);

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
    items.push({ key: 'history', label: t('agent_panel.ticket.history'), icon: 'clock' });
    items.push({ key: 'copy', label: t('agent_panel.ticket.copy_link'), icon: 'link' });
    if (props.routes.unread) items.push({ key: 'unread', label: t('agent_panel.inbox.mark_unread'), icon: 'envelope' });
    if (props.routes.merge) items.push({ key: 'merge', label: t('agent_panel.ticket.merge'), icon: 'ticket' });
    return items;
});

function onMore(item) {
    if (item.macro)
        post(props.routes.macro, { macro_id: item.macro.id }, t('agent_panel.toast.macro', { name: item.macro.name }));
    else if (item.action) {
        if (item.action.confirmation && typeof window !== 'undefined' && !window.confirm(item.action.confirmation)) {
            return;
        }
        post(item.action.url, {}, t('agent_panel.toast.action', { name: item.action.label }));
    } else if (item.key === 'merge') mergeOpen.value = true;
    else if (item.key === 'copy') copyLink();
    else if (item.key === 'history') openHistory();
    else if (item.key === 'unread') emit('mark-unread');
}

// --- Previous and next ticket ---------------------------------------------------------
const hasAdjacent = computed(() => 'previous' in (props.adjacent || {}) || 'next' in (props.adjacent || {}));

function goTo(ticket) {
    if (ticket?.reference) {
        router.visit(ticketUrl(props.prefix, ticket.reference), { preserveScroll: true, preserveState: true });
    }
}

// --- Conversation -------------------------------------------------------------------
const pinnedNotes = computed(() => props.ticket.pinned_notes || []);

function sortTime(item) {
    const time = new Date(item.created_at).getTime();
    return Number.isNaN(time) ? 0 : time;
}

const activityOptions = computed(() => ({
    agents: props.agents,
    departments: props.departments,
    statusLabel,
    priorityLabel,
}));

const events = computed(() =>
    (props.ticket.activities || [])
        .map((activity) => ({
            id: `event-${activity.id}`,
            kind: 'event',
            type: activity.type,
            text: describeActivity(activity, t, activityOptions.value),
            created_at: activity.created_at,
        }))
        .filter((event) => event.text),
);

const thread = computed(() => {
    const items = [];
    const ticket = props.ticket;
    if (ticket.description) {
        items.push({
            id: `ticket-${ticket.id}`,
            author: ticket.requester || { name: ticket.requester_name },
            body: ticket.description,
            created_at: ticket.created_at,
            attachments: ticket.attachments || [],
            is_internal_note: false,
            is_description: true,
        });
    }
    const messages = [...items, ...(ticket.replies || [])].map((message) => ({
        ...message,
        kind: messageKind(message, ticket),
    }));
    // Stable: messages and events at the same instant keep their order.
    return [...messages, ...events.value]
        .map((item, index) => ({ item, index }))
        .sort((a, b) => sortTime(a.item) - sortTime(b.item) || a.index - b.index)
        .map(({ item }) => item);
});

const history = computed(() =>
    [...events.value]
        .sort((a, b) => sortTime(a) - sortTime(b))
        .map(({ id, text, created_at }) => ({ id, text, created_at })),
);

const EVENT_ICONS = {
    status_changed: 'flag',
    resolved: 'check',
    closed: 'check',
    reopened: 'back',
    assigned: 'user',
    unassigned: 'user',
    priority_changed: 'flag',
    tag_added: 'tag',
    tag_removed: 'tag',
    department_changed: 'folder',
    snoozed: 'clock',
    unsnoozed: 'clock',
    sla_breached: 'warning',
    escalated: 'warning',
};

function bodyHtml(body) {
    return highlightMentions(sanitizeHtml(body || ''), escDark.value);
}

function isPlainText(body) {
    return !/<[a-z][\s\S]*>/i.test(body || '');
}

function attachmentName(attachment) {
    return attachment.original_filename || attachment.filename || attachment.name || '';
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

function togglePin(reply) {
    if (!props.routes.pin) return;
    post(
        props.routes.pin(reply.id),
        {},
        reply.is_pinned ? t('agent_panel.toast.unpinned') : t('agent_panel.toast.pinned'),
    );
}

const scroller = ref(null);
const threadEnd = ref(null);

// Open on the latest message.
function scrollToLatest() {
    const el = scroller.value;
    if (el) el.scrollTop = el.scrollHeight;
    else threadEnd.value?.scrollIntoView?.({ block: 'end' });
}

watch(
    () => [props.ticket.id, thread.value.length],
    () => nextTick(scrollToLatest),
    { immediate: true, flush: 'post' },
);

// --- SLA ---------------------------------------------------------------------------
function slaText(due, breached) {
    if (!due && !breached) return null;
    if (breached) return { tone: 'var(--esc-sla-breach)', text: t('agent_panel.sla.breached'), urgent: true };
    const minutes = Math.round((new Date(due).getTime() - now.value) / 60000);
    if (minutes < 0) return { tone: 'var(--esc-sla-breach)', text: t('agent_panel.sla.overdue'), urgent: true };
    const tone = minutes <= 60 ? 'var(--esc-sla-warn)' : 'var(--esc-panel-text-tertiary)';
    const urgent = minutes <= 60;
    if (minutes < 60) return { tone, urgent, text: t('agent_panel.sla.due_minutes', { count: minutes }) };
    if (minutes < 1440)
        return { tone, urgent, text: t('agent_panel.sla.due_hours', { count: Math.round(minutes / 60) }) };
    return { tone, urgent, text: t('agent_panel.sla.due_days', { count: Math.round(minutes / 1440) }) };
}

const slaItems = computed(() => {
    const ticket = props.ticket;
    const items = [];
    const first = isClosed.value ? null : slaText(ticket.first_response_due_at, ticket.sla_first_response_breached);
    if (first && !ticket.first_response_at) {
        items.push({ key: 'first_response', label: t('agent_panel.ticket.first_response'), ...first });
    }
    const resolution = isClosed.value ? null : slaText(ticket.resolution_due_at, ticket.sla_resolution_breached);
    if (resolution) items.push({ key: 'resolution', label: t('agent_panel.ticket.resolution'), ...resolution });
    return items;
});

// The header shows the SLA that needs attention: breached, or due within the hour.
const headerSla = computed(() => slaItems.value.find((item) => item.urgent) || null);

// --- Customer and details panel ------------------------------------------------------
// Beside the conversation when both fit (the conversation keeps at least
// 600px); otherwise over it, on demand. The agent's choice is remembered for
// the wide layout.
const CONTEXT_KEY = 'escalated-context-panel';
const CONTEXT_WIDTH = 300;
const MIN_CONVERSATION = 600;
const paneRoot = ref(null);
const paneWidth = ref(0);
const contextOpen = ref(false);
const contextFocus = ref('');
const contextToggle = ref(null);
const contextInline = computed(() => paneWidth.value >= CONTEXT_WIDTH + MIN_CONVERSATION);

function contextPreference() {
    try {
        return window.localStorage.getItem(CONTEXT_KEY);
    } catch {
        return null;
    }
}

function setContext(open, { remember = true } = {}) {
    contextOpen.value = open;
    if (!open) contextFocus.value = '';
    if (remember && contextInline.value) {
        try {
            window.localStorage.setItem(CONTEXT_KEY, open ? 'open' : 'closed');
        } catch {
            // storage blocked
        }
    }
}

function toggleContext() {
    setContext(!contextOpen.value);
}

function closeContext() {
    setContext(false);
    nextTick(() => contextToggle.value?.focus());
}

function openHistory() {
    setContext(true, { remember: false });
    contextFocus.value = '';
    nextTick(() => (contextFocus.value = 'history'));
}

watch(contextInline, (inline, wasInline) => {
    if (inline && !wasInline) contextOpen.value = contextPreference() !== 'closed';
    else if (!inline && wasInline) contextOpen.value = false;
});

let resizeObserver = null;
onMounted(() => {
    if (!paneRoot.value) return;
    paneWidth.value = paneRoot.value.clientWidth || 0;
    if (contextInline.value) contextOpen.value = contextPreference() !== 'closed';
    if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
        resizeObserver = new window.ResizeObserver(([entry]) => {
            paneWidth.value = entry.contentRect.width;
        });
        resizeObserver.observe(paneRoot.value);
    }
});
onBeforeUnmount(() => resizeObserver?.disconnect());

// --- Composer ------------------------------------------------------------------------
const composerRef = ref(null);
const composerMode = ref(props.notesOnly ? 'note' : 'reply');

function focusReply() {
    if (props.notesOnly) return focusNote();
    composerRef.value?.focus('reply');
}

function focusNote() {
    composerRef.value?.focus('note');
}

defineExpose({
    focusReply,
    focusNote,
    openStatus: () => canEditStatus.value && (statusOpen.value = true),
    openPriority: () => canEditPriority.value && (priorityOpen.value = true),
    openSnooze: () => canSnooze.value && (snoozeOpen.value = true),
    assignToMe,
    resolve,
    toggleFollow,
    copyLink,
    toggleContext,
    openHistory,
    nextTicket: () => goTo(props.adjacent?.next),
    previousTicket: () => goTo(props.adjacent?.previous),
});

const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
const iconButton = `flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${ring}`;
const ghostControl = `flex h-7 items-center gap-1.5 rounded-[var(--esc-radius,6px)] px-2 text-[13px] text-[var(--esc-panel-text-secondary)] ${ring}`;
</script>

<template>
    <div ref="paneRoot" class="relative flex h-full min-h-0 flex-col" data-testid="esc-detail-pane">
        <!-- Header: stays put while the conversation scrolls -->
        <header
            class="shrink-0 border-b border-[var(--esc-panel-border)] px-4 pb-2 pt-2.5 sm:px-5"
            data-testid="esc-ticket-header"
        >
            <div class="flex items-center gap-3">
                <div
                    class="flex min-w-0 flex-1 items-center gap-1 text-[12px] leading-5 text-[var(--esc-panel-text-tertiary)]"
                >
                    <span class="shrink-0 whitespace-nowrap tabular-nums">{{ ticket.reference }}</span>
                    <button
                        type="button"
                        class="flex h-5 w-5 items-center justify-center rounded text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        :aria-label="copied ? t('agent_panel.ticket.link_copied') : t('agent_panel.ticket.copy_link')"
                        :title="copied ? t('agent_panel.ticket.link_copied') : t('agent_panel.ticket.copy_link')"
                        data-testid="esc-copy-link"
                        @click="copyLink"
                    >
                        <PanelIcon
                            :name="copied ? 'check' : 'link'"
                            :class="['h-3.5 w-3.5', copied ? 'text-[var(--esc-sla-ok)]' : '']"
                        />
                    </button>
                    <span
                        v-if="snoozedUntil"
                        class="ml-1 flex min-w-0 items-center gap-1 truncate text-[var(--esc-panel-text-secondary)]"
                        :title="absoluteTime(snoozedUntil)"
                        data-testid="esc-snoozed"
                    >
                        <PanelIcon name="clock" class="h-3.5 w-3.5 shrink-0" />
                        {{ t('agent_panel.ticket.snoozed_until', { date: shortDate(snoozedUntil) }) }}
                    </span>
                    <span
                        v-if="headerSla"
                        class="ml-1 flex min-w-0 items-center gap-1 font-medium"
                        :style="{ color: headerSla.tone }"
                        :title="`${headerSla.label}: ${headerSla.text}`"
                        data-testid="esc-header-sla"
                    >
                        <PanelIcon name="clock" class="h-3.5 w-3.5 shrink-0" />
                        <span class="sr-only">{{ headerSla.label }}:</span>
                        <span class="truncate">{{ headerSla.text }}</span>
                    </span>
                </div>

                <!-- Frequent actions -->
                <div class="flex shrink-0 items-center gap-0.5" data-testid="esc-ticket-actions">
                    <PresenceIndicator
                        :ticket-reference="ticket.reference"
                        :ticket-id="ticket.id"
                        :channel-prefix="channelPrefix"
                        route-prefix="escalated.agent"
                    />
                    <PluginSlot slot="ticket.show.actions" :components="getPageComponents('ticket.show', 'actions')" />
                    <button
                        v-if="canEditStatus && !isClosed"
                        type="button"
                        :class="`mr-1 flex h-7 items-center gap-1.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2 text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] ${ring}`"
                        :title="`${t('agent_panel.ticket.resolve')} (e)`"
                        data-testid="esc-resolve"
                        @click="resolve"
                    >
                        <PanelIcon name="check" class="h-4 w-4" />
                        <span class="max-md:sr-only">{{ t('agent_panel.ticket.resolve') }}</span>
                    </button>
                    <button
                        v-else-if="canEditStatus && isClosed"
                        type="button"
                        :class="`mr-1 flex h-7 items-center gap-1.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2 text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] ${ring}`"
                        :title="t('agent_panel.ticket.reopen')"
                        data-testid="esc-reopen"
                        @click="reopen"
                    >
                        <PanelIcon name="back" class="h-4 w-4" />
                        <span class="max-md:sr-only">{{ t('agent_panel.ticket.reopen') }}</span>
                    </button>
                    <div v-if="canSnooze" class="relative">
                        <button
                            type="button"
                            :class="[iconButton, snoozedUntil ? 'text-[var(--esc-panel-text)]' : '']"
                            aria-haspopup="menu"
                            :aria-expanded="snoozeOpen ? 'true' : 'false'"
                            :aria-label="t('agent_panel.ticket.snooze')"
                            :title="`${t('agent_panel.ticket.snooze')} (z)`"
                            data-testid="esc-snooze"
                            @click="snoozeOpen = !snoozeOpen"
                        >
                            <PanelIcon name="clock" class="h-[18px] w-[18px]" />
                        </button>
                        <PanelMenu
                            v-model:open="snoozeOpen"
                            :items="snoozeItems"
                            :label="t('agent_panel.ticket.snooze')"
                            align="right"
                            width="w-64"
                            @select="onSnooze"
                        >
                            <form
                                class="mt-1 border-t border-[var(--esc-panel-border)] px-3 pb-1.5 pt-2"
                                data-testid="esc-snooze-custom"
                                @submit.prevent="submitCustomSnooze"
                            >
                                <label class="block text-[12px] text-[var(--esc-panel-text-tertiary)]">
                                    {{ t('agent_panel.ticket.snooze_until') }}
                                    <input
                                        v-model="snoozeCustom"
                                        type="datetime-local"
                                        :min="snoozeMin"
                                        class="mt-1 h-7 w-full rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-transparent px-1.5 text-[13px] text-[var(--esc-panel-text)] [color-scheme:inherit] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    :disabled="!snoozeCustom"
                                    :class="`mt-2 h-7 w-full rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] disabled:cursor-not-allowed disabled:opacity-50 ${ring}`"
                                >
                                    {{ t('agent_panel.ticket.snooze_submit') }}
                                </button>
                            </form>
                        </PanelMenu>
                    </div>
                    <button
                        v-if="routes.follow"
                        type="button"
                        :class="[iconButton, isFollowing ? 'text-[var(--esc-priority-medium)]' : '']"
                        :aria-pressed="isFollowing ? 'true' : 'false'"
                        :aria-label="isFollowing ? t('agent_panel.ticket.unfollow') : t('agent_panel.ticket.follow')"
                        :title="`${isFollowing ? t('agent_panel.ticket.unfollow') : t('agent_panel.ticket.follow')} (f)`"
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
                                :d="'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.004l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-1.004l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'"
                            />
                        </svg>
                    </button>
                    <div class="relative">
                        <button
                            type="button"
                            :class="iconButton"
                            aria-haspopup="menu"
                            :aria-expanded="moreOpen ? 'true' : 'false'"
                            :aria-label="t('agent_panel.ticket.more')"
                            :title="t('agent_panel.ticket.more')"
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
                        ref="contextToggle"
                        type="button"
                        :class="[
                            iconButton,
                            contextOpen ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]' : '',
                        ]"
                        aria-controls="esc-context-panel"
                        :aria-expanded="contextOpen ? 'true' : 'false'"
                        :aria-label="
                            contextOpen ? t('agent_panel.ticket.hide_context') : t('agent_panel.ticket.show_context')
                        "
                        :title="`${contextOpen ? t('agent_panel.ticket.hide_context') : t('agent_panel.ticket.show_context')} (i)`"
                        data-testid="esc-context-toggle"
                        @click="toggleContext"
                    >
                        <PanelIcon name="sidebarRight" class="h-[18px] w-[18px]" />
                    </button>
                    <template v-if="hasAdjacent">
                        <span
                            class="mx-1 h-4 w-px bg-[var(--esc-panel-border)] max-sm:hidden"
                            aria-hidden="true"
                        ></span>
                        <button
                            type="button"
                            :class="[iconButton, 'max-sm:hidden']"
                            :disabled="!adjacent.previous"
                            :aria-label="t('agent_panel.ticket.previous_ticket')"
                            :title="`${t('agent_panel.ticket.previous_ticket')} (K)`"
                            data-testid="esc-previous-ticket"
                            @click="goTo(adjacent.previous)"
                        >
                            <PanelIcon name="chevronUp" class="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            :class="[iconButton, 'max-sm:hidden']"
                            :disabled="!adjacent.next"
                            :aria-label="t('agent_panel.ticket.next_ticket')"
                            :title="`${t('agent_panel.ticket.next_ticket')} (J)`"
                            data-testid="esc-next-ticket"
                            @click="goTo(adjacent.next)"
                        >
                            <PanelIcon name="chevronDown" class="h-4 w-4" />
                        </button>
                    </template>
                </div>
            </div>

            <h2
                class="mt-0.5 line-clamp-2 break-words text-[15px] font-semibold leading-5 text-[var(--esc-panel-text)]"
                :title="ticket.subject"
                data-testid="esc-subject"
            >
                {{ ticket.subject }}
            </h2>

            <!-- Properties -->
            <div class="mt-1.5 flex flex-wrap items-center gap-1" data-testid="esc-ticket-properties">
                <div class="relative">
                    <component
                        :is="canEditStatus ? 'button' : 'span'"
                        :type="canEditStatus ? 'button' : undefined"
                        :class="[
                            'flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-[var(--esc-panel-text)]',
                            canEditStatus ? `hover:brightness-110 ${ring}` : '',
                        ]"
                        :style="{ background: `color-mix(in srgb, ${statusColor(ticket.status)} 16%, transparent)` }"
                        :aria-haspopup="canEditStatus ? 'menu' : undefined"
                        :aria-expanded="canEditStatus ? (statusOpen ? 'true' : 'false') : undefined"
                        :aria-label="
                            canEditStatus
                                ? `${t('agent_panel.ticket.change_status')}: ${statusLabel(ticket.status)}`
                                : undefined
                        "
                        :title="canEditStatus ? `${t('agent_panel.ticket.change_status')} (s)` : undefined"
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
                            ghostControl,
                            canEditPriority
                                ? 'hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)]'
                                : '',
                        ]"
                        :aria-haspopup="canEditPriority ? 'menu' : undefined"
                        :aria-expanded="canEditPriority ? (priorityOpen ? 'true' : 'false') : undefined"
                        :aria-label="
                            canEditPriority
                                ? `${t('agent_panel.ticket.change_priority')}: ${ticket.priority ? priorityLabel(ticket.priority) : t('agent_panel.ticket.no_priority')}`
                                : undefined
                        "
                        :title="canEditPriority ? `${t('agent_panel.ticket.change_priority')} (p)` : undefined"
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

                <!-- Assignee -->
                <div class="relative">
                    <component
                        :is="canReassign ? 'button' : 'span'"
                        :type="canReassign ? 'button' : undefined"
                        :class="[
                            ghostControl,
                            canReassign ? 'hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)]' : '',
                        ]"
                        :aria-haspopup="canReassign ? 'menu' : undefined"
                        :aria-expanded="canReassign ? (assigneeOpen ? 'true' : 'false') : undefined"
                        :aria-label="
                            canReassign
                                ? `${t('agent_panel.ticket.change_assignee')}: ${assignee ? assignee.name : t('agent_panel.ticket.unassigned')}`
                                : undefined
                        "
                        :title="canReassign ? t('agent_panel.ticket.change_assignee') : undefined"
                        data-testid="esc-assignee"
                        @click="canReassign && (assigneeOpen = !assigneeOpen)"
                    >
                        <span
                            v-if="assignee"
                            class="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[10px] font-semibold text-[var(--esc-panel-text-secondary)]"
                            aria-hidden="true"
                            >{{ initials(assignee.name) }}</span
                        >
                        <PanelIcon v-else name="user" class="h-4 w-4 text-[var(--esc-panel-text-tertiary)]" />
                        {{ assignee ? assignee.name : t('agent_panel.ticket.unassigned') }}
                        <PanelIcon v-if="canReassign" name="chevronDown" class="h-3.5 w-3.5 opacity-70" />
                    </component>
                    <PanelMenu
                        v-if="canReassign"
                        v-model:open="assigneeOpen"
                        :items="assigneeItems"
                        :label="t('agent_panel.ticket.change_assignee')"
                        :filter-placeholder="agents.length > 6 ? t('agent_panel.ticket.find_agent') : ''"
                        :empty-text="t('agent_panel.ticket.no_agents_match')"
                        width="w-64"
                        @select="assignTo"
                    />
                </div>
                <button
                    v-if="canAssignToMe"
                    type="button"
                    :class="`h-7 rounded-[var(--esc-radius,6px)] px-2 text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] ${ring}`"
                    :title="`${t('agent_panel.ticket.assign_to_me')} (a)`"
                    data-testid="esc-assign-me"
                    @click="assignToMe"
                >
                    {{ t('agent_panel.ticket.assign_to_me') }}
                </button>

                <!-- Department -->
                <div v-if="ticket.department || canChangeDepartment" class="relative">
                    <component
                        :is="canChangeDepartment ? 'button' : 'span'"
                        :type="canChangeDepartment ? 'button' : undefined"
                        :class="[
                            ghostControl,
                            canChangeDepartment
                                ? 'hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)]'
                                : '',
                        ]"
                        :aria-haspopup="canChangeDepartment ? 'menu' : undefined"
                        :aria-expanded="canChangeDepartment ? (departmentOpen ? 'true' : 'false') : undefined"
                        :aria-label="
                            canChangeDepartment
                                ? `${t('agent_panel.ticket.change_department')}: ${ticket.department?.name || t('agent_panel.ticket.no_department')}`
                                : undefined
                        "
                        :title="
                            canChangeDepartment ? t('agent_panel.ticket.change_department') : t('ticket.department')
                        "
                        data-testid="esc-department"
                        @click="canChangeDepartment && (departmentOpen = !departmentOpen)"
                    >
                        <PanelIcon name="folder" class="h-4 w-4 text-[var(--esc-panel-text-tertiary)]" />
                        {{ ticket.department?.name || t('agent_panel.ticket.no_department') }}
                        <PanelIcon v-if="canChangeDepartment" name="chevronDown" class="h-3.5 w-3.5 opacity-70" />
                    </component>
                    <PanelMenu
                        v-if="canChangeDepartment"
                        v-model:open="departmentOpen"
                        :items="departmentItems"
                        :label="t('agent_panel.ticket.change_department')"
                        @select="setDepartment"
                    />
                </div>

                <!-- Tags -->
                <span
                    v-for="tag in ticketTags"
                    :key="tag.id"
                    :class="[
                        'flex h-7 items-center gap-1 rounded-full border border-[var(--esc-panel-border-input)] pl-2 text-[13px] text-[var(--esc-panel-text-secondary)]',
                        canEditTags ? 'pr-1' : 'pr-2.5',
                    ]"
                    data-testid="esc-tag"
                >
                    <PanelIcon
                        name="tag"
                        class="h-3.5 w-3.5 shrink-0"
                        :style="{ color: tag.color || 'var(--esc-panel-text-tertiary)' }"
                    />
                    <span class="max-w-[10rem] truncate" :title="tag.name">{{ tag.name }}</span>
                    <button
                        v-if="canEditTags"
                        type="button"
                        class="rounded-full p-0.5 text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        :aria-label="t('agent_panel.ticket.remove_tag', { name: tag.name })"
                        :title="t('agent_panel.ticket.remove_tag', { name: tag.name })"
                        @click="removeTag(tag.id)"
                    >
                        <PanelIcon name="x" class="h-3 w-3" />
                    </button>
                </span>
                <div v-if="canEditTags && tags.length" class="relative">
                    <button
                        type="button"
                        class="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-[var(--esc-panel-border-input)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        :aria-label="t('agent_panel.ticket.add_tag')"
                        :title="t('agent_panel.ticket.add_tag')"
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
            </div>

            <ChatActionBar
                v-if="chat.active"
                class="mt-2"
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
        </header>

        <div class="relative flex min-h-0 flex-1">
            <!-- Conversation -->
            <div class="flex min-w-0 flex-1 flex-col">
                <div
                    ref="scroller"
                    class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                    data-testid="esc-conversation"
                >
                    <div class="mx-auto w-full max-w-[760px] px-4 py-4 sm:px-6">
                        <ChatThread
                            v-if="chat.active"
                            :messages="chat.messages || []"
                            :typing-user="chat.typingUser || null"
                            :current-user-id="currentUserId"
                        />
                        <div
                            v-else
                            class="space-y-5"
                            role="feed"
                            :aria-label="t('agent_panel.ticket.tabs.conversation')"
                        >
                            <section v-if="pinnedNotes.length" class="space-y-2" data-testid="esc-pinned-notes">
                                <article
                                    v-for="note in pinnedNotes"
                                    :key="`pin-${note.id}`"
                                    class="rounded-[var(--esc-radius-lg,8px)] border-l-2 border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)] px-3 py-2"
                                >
                                    <div
                                        class="flex items-center gap-1.5 text-[12px] text-[var(--esc-panel-note-text)]"
                                    >
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
                                            'mt-1 break-words text-[14px] leading-[22px] text-[var(--esc-panel-text)]',
                                            isPlainText(note.body) ? 'whitespace-pre-line' : '',
                                        ]"
                                        v-html="bodyHtml(note.body)"
                                    ></div>
                                </article>
                            </section>

                            <template v-for="item in thread" :key="item.id">
                                <!-- System event -->
                                <div
                                    v-if="item.kind === 'event'"
                                    class="flex items-center gap-3 text-[12px] leading-4 text-[var(--esc-panel-text-tertiary)]"
                                    data-testid="esc-event"
                                    :data-kind="item.kind"
                                >
                                    <span class="flex w-7 shrink-0 justify-center" aria-hidden="true">
                                        <PanelIcon :name="EVENT_ICONS[item.type] || 'clock'" class="h-3.5 w-3.5" />
                                    </span>
                                    <p class="min-w-0">
                                        {{ item.text }}
                                        <span aria-hidden="true"> &middot; </span>
                                        <time :datetime="item.created_at" :title="absoluteTime(item.created_at)">{{
                                            relativeTime(item.created_at, t, now)
                                        }}</time>
                                    </p>
                                </div>

                                <!-- Internal note -->
                                <article
                                    v-else-if="item.kind === 'note'"
                                    class="rounded-[var(--esc-radius-lg,8px)] border-l-2 border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)] px-3 py-2.5"
                                    data-note="true"
                                    :data-kind="item.kind"
                                    data-testid="esc-message"
                                >
                                    <div class="flex items-center gap-1.5 text-[12px] leading-5">
                                        <PanelIcon
                                            name="lock"
                                            class="h-3.5 w-3.5 shrink-0 text-[var(--esc-panel-note-text)]"
                                        />
                                        <span class="font-medium text-[var(--esc-panel-note-text)]">{{
                                            t('agent_panel.ticket.internal_note')
                                        }}</span>
                                        <span class="min-w-0 truncate text-[var(--esc-panel-text-tertiary)]"
                                            >&middot; {{ item.author?.name || t('ticket.unknown') }} &middot;
                                            <time :datetime="item.created_at" :title="absoluteTime(item.created_at)">{{
                                                relativeTime(item.created_at, t, now)
                                            }}</time></span
                                        >
                                        <button
                                            v-if="routes.pin"
                                            type="button"
                                            class="ml-auto shrink-0 rounded px-1.5 text-[12px] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                                            @click="togglePin(item)"
                                        >
                                            {{ item.is_pinned ? t('reply.unpin') : t('reply.pin') }}
                                        </button>
                                    </div>
                                    <div
                                        :class="[
                                            'esc-message-body mt-1 break-words text-[14px] leading-[22px] text-[var(--esc-panel-text)]',
                                            isPlainText(item.body) ? 'whitespace-pre-line' : '',
                                        ]"
                                        v-html="bodyHtml(item.body)"
                                    ></div>
                                    <ul v-if="item.attachments?.length" class="mt-2 flex flex-wrap gap-2">
                                        <li
                                            v-for="attachment in item.attachments"
                                            :key="attachment.id"
                                            class="flex h-9 max-w-[18rem] items-center gap-2 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] pl-2.5 pr-1"
                                            data-testid="esc-attachment"
                                        >
                                            <PanelIcon
                                                name="document"
                                                class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                                            />
                                            <span
                                                class="min-w-0 truncate text-[13px] text-[var(--esc-panel-text)]"
                                                :title="attachmentName(attachment)"
                                                >{{ attachmentName(attachment) }}</span
                                            >
                                            <span
                                                class="shrink-0 text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                                >{{ formatSize(attachment.size) }}</span
                                            >
                                            <a
                                                :href="attachmentUrl(attachment)"
                                                target="_blank"
                                                rel="noopener"
                                                :class="iconButton"
                                                :aria-label="
                                                    t('agent_panel.ticket.download', {
                                                        name: attachmentName(attachment),
                                                    })
                                                "
                                                :title="
                                                    t('agent_panel.ticket.download', {
                                                        name: attachmentName(attachment),
                                                    })
                                                "
                                            >
                                                <PanelIcon name="download" class="h-4 w-4" />
                                            </a>
                                        </li>
                                    </ul>
                                </article>

                                <!-- Customer message or agent reply -->
                                <article v-else class="flex gap-3" :data-kind="item.kind" data-testid="esc-message">
                                    <span
                                        :class="[
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                                            item.kind === 'agent'
                                                ? 'bg-[color-mix(in_srgb,var(--esc-panel-accent)_20%,transparent)] text-[var(--esc-panel-text)]'
                                                : 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text-secondary)]',
                                        ]"
                                        aria-hidden="true"
                                        >{{ initials(item.author?.name) }}</span
                                    >
                                    <div
                                        :class="[
                                            'min-w-0 flex-1',
                                            item.kind === 'agent'
                                                ? 'border-l-2 border-[color-mix(in_srgb,var(--esc-panel-accent)_45%,transparent)] pl-3'
                                                : '',
                                        ]"
                                    >
                                        <div class="flex items-baseline gap-1.5 text-[13px] leading-5">
                                            <span class="min-w-0 truncate font-semibold text-[var(--esc-panel-text)]">{{
                                                item.author?.name || t('ticket.unknown')
                                            }}</span>
                                            <span
                                                v-if="item.kind === 'customer'"
                                                class="shrink-0 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                                                >{{ t('agent_panel.ticket.customer') }}</span
                                            >
                                            <time
                                                class="ml-auto shrink-0 text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                                :datetime="item.created_at"
                                                :title="absoluteTime(item.created_at)"
                                                >{{ relativeTime(item.created_at, t, now) }}</time
                                            >
                                        </div>
                                        <div
                                            :class="[
                                                'esc-message-body mt-0.5 break-words text-[14px] leading-[22px] text-[var(--esc-panel-text)]',
                                                isPlainText(item.body) ? 'whitespace-pre-line' : '',
                                            ]"
                                            v-html="bodyHtml(item.body)"
                                        ></div>
                                        <ul v-if="item.attachments?.length" class="mt-2 flex flex-wrap gap-2">
                                            <li
                                                v-for="attachment in item.attachments"
                                                :key="attachment.id"
                                                class="flex h-9 max-w-[18rem] items-center gap-2 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] pl-2.5 pr-1"
                                                data-testid="esc-attachment"
                                            >
                                                <PanelIcon
                                                    name="document"
                                                    class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                                                />
                                                <span
                                                    class="min-w-0 truncate text-[13px] text-[var(--esc-panel-text)]"
                                                    :title="attachmentName(attachment)"
                                                    >{{ attachmentName(attachment) }}</span
                                                >
                                                <span
                                                    class="shrink-0 text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                                    >{{ formatSize(attachment.size) }}</span
                                                >
                                                <a
                                                    :href="attachmentUrl(attachment)"
                                                    target="_blank"
                                                    rel="noopener"
                                                    :class="iconButton"
                                                    :aria-label="
                                                        t('agent_panel.ticket.download', {
                                                            name: attachmentName(attachment),
                                                        })
                                                    "
                                                    :title="
                                                        t('agent_panel.ticket.download', {
                                                            name: attachmentName(attachment),
                                                        })
                                                    "
                                                >
                                                    <PanelIcon name="download" class="h-4 w-4" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </article>
                            </template>
                            <p
                                v-if="!thread.length"
                                class="py-8 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]"
                            >
                                {{ t('ticket.no_replies') }}
                            </p>
                            <div ref="threadEnd"></div>
                        </div>
                    </div>
                </div>

                <!-- Composer -->
                <div class="shrink-0 px-4 pb-3 sm:px-6" data-testid="esc-composer-dock">
                    <div class="mx-auto w-full max-w-[760px]">
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
                            :recipient="{
                                name: ticket.requester?.name || ticket.requester_name || '',
                                email: ticket.requester?.email || ticket.requester_email || '',
                            }"
                            :typing-endpoint="routes.typing || ''"
                        />
                    </div>
                </div>
            </div>

            <!-- Customer and details -->
            <TicketContextPanel
                v-if="contextOpen"
                id="esc-context-panel"
                :ticket="ticket"
                :prefix="prefix"
                :followers-count="followersCount"
                :knowledge-base-url="knowledgeBaseUrl"
                :history="history"
                :sla="slaItems"
                :overlay="!contextInline"
                :focus-section="contextFocus"
                :status-label="statusLabel"
                :status-color="statusColor"
                @close="closeContext"
            />
        </div>

        <TicketMergeDialog v-if="mergeOpen" :ticket-reference="ticket.reference" @close="mergeOpen = false" />
    </div>
</template>
