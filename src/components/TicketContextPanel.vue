<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { Link } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { usePluginExtensions } from '../composables/usePluginExtensions';
import { absoluteTime, initials, isLive, relativeTime, requesterName } from '../utils/agentTicket';
import { ticketUrl } from '../utils/agentQueues';
import PanelIcon from './PanelIcon.vue';
import PluginSlot from './PluginSlot.vue';
import KbArticleSearch from './KbArticleSearch.vue';
import TicketSubjects from './TicketSubjects.vue';

/**
 * The customer and details beside a ticket: who the customer is, their other
 * conversations, the ticket's details and custom fields, related tickets and
 * the ticket's history. Sections collapse, and the choice is remembered.
 *
 * Shown inline beside the conversation when the pane is wide enough, or over
 * it (`overlay`) on demand. What the header already shows (status, priority,
 * assignee, department, tags) is not repeated here.
 */
const props = defineProps({
    ticket: { type: Object, required: true },
    prefix: { type: String, default: 'support' },
    followersCount: { type: Number, default: 0 },
    knowledgeBaseUrl: { type: String, default: '' },
    /** The host's `escalated.agent.kb.search` URL; with it Related offers article search. */
    kbSearchUrl: { type: String, default: '' },
    /** The composer can take an article link (not in a live chat). */
    canInsertArticle: { type: Boolean, default: false },
    /** `[{ id, text, created_at }]`: the ticket's activity, newest last. */
    history: { type: Array, default: () => [] },
    /** `[{ key, label, text, tone }]`: SLA targets. */
    sla: { type: Array, default: () => [] },
    overlay: { type: Boolean, default: false },
    /** A section to open and scroll to, e.g. `history`. */
    focusSection: { type: String, default: '' },
    statusLabel: { type: Function, default: (s) => String(s || '').replace(/_/g, ' ') },
    statusColor: { type: Function, default: () => 'var(--esc-panel-text-tertiary)' },
});

const emit = defineEmits(['close', 'insert-article']);
const { t } = useI18n();
const { getPageComponents } = usePluginExtensions();
const now = Date.now();

// --- Sections ---------------------------------------------------------------
const STORAGE_KEY = 'escalated-context-sections';
const DEFAULTS = { customer: true, conversations: true, details: true, related: true, history: false };

function readSections() {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
        return { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) };
    } catch {
        return { ...DEFAULTS };
    }
}

const open = ref(readSections());

function toggle(key) {
    open.value = { ...open.value, [key]: !open.value[key] };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(open.value));
    } catch {
        // storage blocked: the choice lasts for this page
    }
}

const sectionRefs = ref({});
watch(
    () => props.focusSection,
    async (key) => {
        if (!key) return;
        open.value = { ...open.value, [key]: true };
        await nextTick();
        const el = sectionRefs.value[key];
        el?.scrollIntoView?.({ block: 'start' });
        el?.querySelector?.('button')?.focus?.();
    },
    { immediate: true },
);

// --- Customer -----------------------------------------------------------------
const requester = computed(() => props.ticket.requester || {});
const email = computed(() => requester.value.email || props.ticket.requester_email || '');
const organization = computed(() => {
    const org = requester.value.organization ?? props.ticket.organization ?? requester.value.company ?? null;
    if (!org) return '';
    return typeof org === 'string' ? org : org.name || '';
});

// Whether the customer is on the site now (the backend's `requester_online`,
// or a live chat), else when they were last seen. Nothing when the backend
// sends neither.
const presence = computed(() => {
    if (isLive(props.ticket)) return { online: true };
    const seenAt = props.ticket.requester_last_seen_at;
    return seenAt ? { online: false, seenAt } : null;
});

// The requester's other tickets. Not `related_tickets`: those are the ticket's
// linked tickets, not the customer's history.
const conversations = computed(() =>
    (props.ticket.requester_tickets || []).filter(
        (item) => item?.reference && item.reference !== props.ticket.reference,
    ),
);

// --- Details ------------------------------------------------------------------
function typeLabel(type) {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function displayValue(value) {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? t('agent_panel.ticket.yes') : t('agent_panel.ticket.no');
    return String(value);
}

const isEmpty = (value) =>
    value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length);

// Custom fields with a value; empty ones do not help resolve the ticket.
const customFields = computed(() => {
    const raw = props.ticket.custom_fields ?? props.ticket.custom_field_values ?? null;
    if (!raw) return [];
    const list = Array.isArray(raw)
        ? raw.map((field) => ({ label: field.label || field.name || field.key, value: field.value }))
        : Object.entries(raw).map(([label, value]) => ({ label, value }));
    return list.filter((field) => field.label && !isEmpty(field.value));
});

const details = computed(() => {
    const ticket = props.ticket;
    const rows = [];
    if (ticket.ticket_type)
        rows.push({ key: 'type', label: t('agent_panel.ticket.type'), value: typeLabel(ticket.ticket_type) });
    if (ticket.channel)
        rows.push({ key: 'channel', label: t('agent_panel.ticket.channel'), value: typeLabel(ticket.channel) });
    if (ticket.created_at) {
        rows.push({
            key: 'created',
            label: t('ticket.created'),
            value: relativeTime(ticket.created_at, t, now),
            title: absoluteTime(ticket.created_at),
            datetime: ticket.created_at,
        });
    }
    for (const item of props.sla)
        rows.push({ key: `sla-${item.key}`, label: item.label, value: item.text, tone: item.tone });
    rows.push({
        key: 'followers',
        label: t('agent_panel.ticket.followers'),
        value: String(props.followersCount),
        numeric: true,
    });
    if (ticket.satisfaction_rating) {
        rows.push({
            key: 'csat',
            label: t('agent_panel.ticket.satisfaction'),
            value: `${ticket.satisfaction_rating.rating}/5`,
            note: ticket.satisfaction_rating.comment || '',
            numeric: true,
        });
    }
    return rows;
});

// --- Related ------------------------------------------------------------------
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

const sections = computed(() => [
    { key: 'customer', title: t('agent_panel.ticket.customer') },
    { key: 'conversations', title: t('agent_panel.ticket.previous_conversations'), count: conversations.value.length },
    { key: 'details', title: t('agent_panel.ticket.details') },
    { key: 'related', title: t('agent_panel.ticket.related'), count: links.value.length },
    { key: 'history', title: t('agent_panel.ticket.history'), count: props.history.length },
]);

const rowLink =
    '-mx-2 flex items-center gap-2 rounded-[var(--esc-radius,6px)] px-2 py-1.5 text-[13px] hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
</script>

<template>
    <aside
        :aria-label="t('agent_panel.ticket.context')"
        :class="[
            'flex min-h-0 flex-col border-l border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)]',
            overlay ? 'absolute inset-y-0 right-0 z-30 w-[320px] max-w-full shadow-xl' : 'w-[300px] shrink-0',
        ]"
        data-testid="esc-context-panel"
        :data-overlay="overlay ? 'true' : undefined"
        @keydown.esc.stop="emit('close')"
    >
        <div
            class="flex h-10 shrink-0 items-center justify-between border-b border-[var(--esc-panel-border)] pl-4 pr-2"
        >
            <h2 class="text-[13px] font-semibold text-[var(--esc-panel-text)]">
                {{ t('agent_panel.ticket.context') }}
            </h2>
            <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                :aria-label="t('agent_panel.ticket.close_context')"
                :title="t('agent_panel.ticket.close_context')"
                data-testid="esc-context-close"
                @click="emit('close')"
            >
                <PanelIcon name="x" class="h-4 w-4" />
            </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
            <section
                v-for="section in sections"
                :key="section.key"
                :ref="(el) => (sectionRefs[section.key] = el)"
                class="border-b border-[var(--esc-panel-border)] last:border-b-0"
                :data-testid="`esc-context-${section.key}`"
            >
                <h3>
                    <button
                        type="button"
                        :aria-expanded="open[section.key] ? 'true' : 'false'"
                        :aria-controls="`esc-context-body-${section.key}`"
                        class="flex h-9 w-full items-center gap-1.5 px-4 text-left text-[12px] font-medium text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]"
                        @click="toggle(section.key)"
                    >
                        <PanelIcon
                            name="chevronDown"
                            :class="[
                                'h-3.5 w-3.5 shrink-0 transition-transform',
                                open[section.key] ? '' : '-rotate-90',
                            ]"
                        />
                        <span class="flex-1">{{ section.title }}</span>
                        <span v-if="section.count" class="tabular-nums">{{ section.count }}</span>
                    </button>
                </h3>
                <div v-show="open[section.key]" :id="`esc-context-body-${section.key}`" class="px-4 pb-3">
                    <!-- Customer -->
                    <template v-if="section.key === 'customer'">
                        <div class="flex items-center gap-2.5" data-testid="esc-customer">
                            <span
                                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[13px] font-semibold text-[var(--esc-panel-text-secondary)]"
                                aria-hidden="true"
                                >{{ initials(requesterName(ticket)) }}</span
                            >
                            <div class="min-w-0">
                                <p
                                    class="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--esc-panel-text)]"
                                >
                                    <span class="truncate">{{ requesterName(ticket) || t('ticket.unknown') }}</span>
                                </p>
                                <p
                                    v-if="presence || typeof ticket.requester_ticket_count === 'number'"
                                    class="flex min-w-0 items-center gap-1 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                                >
                                    <span
                                        v-if="presence"
                                        class="flex shrink-0 items-center gap-1.5"
                                        data-testid="esc-customer-presence"
                                    >
                                        <span
                                            v-if="presence.online"
                                            class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--esc-sla-ok)]"
                                            aria-hidden="true"
                                            data-testid="esc-customer-online-dot"
                                        ></span>
                                        <template v-if="presence.online">{{
                                            t('agent_panel.ticket.online_now')
                                        }}</template>
                                        <template v-else
                                            >{{ t('agent_panel.ticket.last_seen') }}
                                            <time :datetime="presence.seenAt" :title="absoluteTime(presence.seenAt)">{{
                                                relativeTime(presence.seenAt, t, now)
                                            }}</time></template
                                        >
                                    </span>
                                    <span
                                        v-if="presence && typeof ticket.requester_ticket_count === 'number'"
                                        aria-hidden="true"
                                        >&middot;</span
                                    >
                                    <span
                                        v-if="typeof ticket.requester_ticket_count === 'number'"
                                        class="truncate tabular-nums"
                                        >{{
                                            t('agent_panel.ticket.ticket_count', {
                                                count: ticket.requester_ticket_count,
                                            })
                                        }}</span
                                    >
                                </p>
                            </div>
                        </div>
                        <dl class="mt-2.5 space-y-1.5 text-[13px]">
                            <div v-if="email" class="flex items-center gap-2">
                                <dt class="shrink-0 text-[var(--esc-panel-text-tertiary)]">
                                    <PanelIcon name="envelope" class="h-4 w-4" />
                                    <span class="sr-only">{{ t('agent_panel.ticket.email') }}</span>
                                </dt>
                                <dd class="min-w-0 truncate">
                                    <a
                                        :href="`mailto:${email}`"
                                        :title="email"
                                        class="rounded text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                                        >{{ email }}</a
                                    >
                                </dd>
                            </div>
                            <div v-if="organization" class="flex items-center gap-2" data-testid="esc-customer-org">
                                <dt class="shrink-0 text-[var(--esc-panel-text-tertiary)]">
                                    <PanelIcon name="building" class="h-4 w-4" />
                                    <span class="sr-only">{{ t('agent_panel.ticket.organization') }}</span>
                                </dt>
                                <dd class="min-w-0 truncate text-[var(--esc-panel-text-secondary)]">
                                    {{ organization }}
                                </dd>
                            </div>
                            <div v-if="ticket.chat_metadata?.page_url" class="flex items-center gap-2">
                                <dt class="shrink-0 text-[var(--esc-panel-text-tertiary)]">
                                    <PanelIcon name="link" class="h-4 w-4" />
                                    <span class="sr-only">{{ t('agent_panel.ticket.page') }}</span>
                                </dt>
                                <dd
                                    class="min-w-0 truncate text-[var(--esc-panel-text-secondary)]"
                                    :title="ticket.chat_metadata.page_url"
                                >
                                    {{ ticket.chat_metadata.page_url }}
                                </dd>
                            </div>
                        </dl>
                        <PluginSlot
                            slot="ticket.show.context-panel"
                            :components="getPageComponents('ticket.show', 'context-panel')"
                        />
                    </template>

                    <!-- Previous conversations -->
                    <template v-else-if="section.key === 'conversations'">
                        <ul v-if="conversations.length" data-testid="esc-customer-tickets">
                            <li v-for="item in conversations" :key="item.reference">
                                <Link :href="ticketUrl(prefix, item.reference)" :class="rowLink" :title="item.subject">
                                    <span
                                        class="h-2 w-2 shrink-0 rounded-full"
                                        :style="{ background: statusColor(item.status) }"
                                        aria-hidden="true"
                                    ></span>
                                    <span class="min-w-0 flex-1">
                                        <span class="block truncate text-[var(--esc-panel-text)]">{{
                                            item.subject
                                        }}</span>
                                        <span class="block truncate text-[12px] text-[var(--esc-panel-text-tertiary)]">
                                            <span class="tabular-nums">{{ item.reference }}</span>
                                            <template v-if="item.status">
                                                &middot; {{ statusLabel(item.status) }}</template
                                            >
                                            <template v-if="item.updated_at || item.created_at">
                                                &middot;
                                                <time
                                                    :datetime="item.updated_at || item.created_at"
                                                    :title="absoluteTime(item.updated_at || item.created_at)"
                                                    >{{
                                                        relativeTime(item.updated_at || item.created_at, t, now)
                                                    }}</time
                                                >
                                            </template>
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <p v-else class="text-[13px] text-[var(--esc-panel-text-tertiary)]">
                            {{ t('agent_panel.ticket.no_previous_conversations') }}
                        </p>
                    </template>

                    <!-- Details -->
                    <template v-else-if="section.key === 'details'">
                        <dl
                            class="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-3 gap-y-1.5 text-[13px]"
                            data-testid="esc-details"
                        >
                            <template v-for="row in details" :key="row.key">
                                <dt class="text-[var(--esc-panel-text-tertiary)]">{{ row.label }}</dt>
                                <dd
                                    :class="['min-w-0 text-[var(--esc-panel-text)]', row.numeric ? 'tabular-nums' : '']"
                                    :style="row.tone ? { color: row.tone } : null"
                                >
                                    <time v-if="row.datetime" :datetime="row.datetime" :title="row.title">{{
                                        row.value
                                    }}</time>
                                    <template v-else>{{ row.value }}</template>
                                    <span v-if="row.note" class="block text-[var(--esc-panel-text-tertiary)]">{{
                                        row.note
                                    }}</span>
                                </dd>
                            </template>
                            <template v-for="field in customFields" :key="`cf-${field.label}`">
                                <dt class="text-[var(--esc-panel-text-tertiary)]">{{ field.label }}</dt>
                                <dd class="min-w-0 break-words text-[var(--esc-panel-text)]">
                                    {{ displayValue(field.value) }}
                                </dd>
                            </template>
                        </dl>
                        <div v-if="ticket.subjects?.length" class="mt-3">
                            <TicketSubjects :subjects="ticket.subjects" />
                        </div>
                        <PluginSlot
                            slot="ticket.show.sidebar"
                            :components="getPageComponents('ticket.show', 'sidebar')"
                        />
                    </template>

                    <!-- Related -->
                    <template v-else-if="section.key === 'related'">
                        <ul v-if="links.length" data-testid="esc-links">
                            <li v-for="link in links" :key="`${link.relation}-${link.ticket.reference}`">
                                <Link
                                    :href="ticketUrl(prefix, link.ticket.reference)"
                                    :class="rowLink"
                                    :title="link.ticket.subject"
                                >
                                    <span class="w-16 shrink-0 text-[12px] text-[var(--esc-panel-text-tertiary)]">{{
                                        relationLabel(link.relation)
                                    }}</span>
                                    <span class="min-w-0 flex-1 truncate text-[var(--esc-panel-text)]">
                                        <span class="tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                                            link.ticket.reference
                                        }}</span>
                                        {{ link.ticket.subject }}
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <p v-else class="text-[13px] text-[var(--esc-panel-text-tertiary)]">
                            {{ t('agent_panel.ticket.no_links') }}
                        </p>
                        <div v-if="kbSearchUrl" class="mt-3" data-testid="esc-related-kb">
                            <h4 class="mb-1.5 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                                {{ t('agent_panel.kb.articles') }}
                            </h4>
                            <KbArticleSearch
                                :search-url="kbSearchUrl"
                                :can-insert="canInsertArticle"
                                @insert="emit('insert-article', $event)"
                            />
                        </div>
                        <Link
                            v-if="knowledgeBaseUrl"
                            :href="knowledgeBaseUrl"
                            :class="[rowLink, 'mt-1 text-[var(--esc-panel-text-secondary)]']"
                            data-testid="esc-kb-link"
                        >
                            <PanelIcon name="book" class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]" />
                            {{ t('agent_panel.ticket.search_knowledge_base') }}
                        </Link>
                    </template>

                    <!-- History -->
                    <template v-else>
                        <ol v-if="history.length" class="space-y-2" data-testid="esc-history">
                            <li v-for="item in history" :key="item.id" class="text-[13px] leading-5">
                                <span class="text-[var(--esc-panel-text-secondary)]">{{ item.text }}</span>
                                <time
                                    class="block text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                    :datetime="item.created_at"
                                    >{{ absoluteTime(item.created_at) }}</time
                                >
                            </li>
                        </ol>
                        <p v-else class="text-[13px] text-[var(--esc-panel-text-tertiary)]">
                            {{ t('agent_panel.ticket.no_history') }}
                        </p>
                    </template>
                </div>
            </section>
        </div>
    </aside>
</template>
