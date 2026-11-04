<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import {
    absoluteTime,
    initials,
    isLive,
    isUnread,
    isUrgent,
    lastActivity,
    latestPreview,
    priorityColor,
    relativeTime,
    requesterName,
    slaState,
} from '../utils/agentTicket';
import { ticketUrl } from '../utils/agentQueues';
import PanelIcon from './PanelIcon.vue';
import TicketFilters from './TicketFilters.vue';

/**
 * The list column of the agent inbox: queue header, stat strip, search and
 * filters, and the ticket rows. Used by Agent/TicketIndex and, on wide
 * screens, beside the ticket in Agent/TicketShow.
 */
const props = defineProps({
    /** A paginator (`{ data, current_page, last_page, total, prev_page_url, next_page_url }`) or `{ data }`. */
    tickets: { type: Object, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    /** `inbox.stats`: `{ open, urgent, sla_at_risk, resolved_today }`. The strip renders only when given. */
    stats: { type: Object, default: null },
    filters: { type: Object, default: () => ({}) },
    departments: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] },
    /** Where search, filters and the stat strip navigate to. */
    indexUrl: { type: String, required: true },
    prefix: { type: String, default: 'support' },
    /** The reference of the ticket open beside the list. */
    selectedReference: { type: String, default: '' },
    selectable: { type: Boolean, default: true },
    selectedIds: { type: Array, default: () => [] },
    newTicketUrl: { type: String, default: '' },
});

const emit = defineEmits(['update:selectedIds', 'open']);
const { t } = useI18n();

const rows = computed(() => props.tickets?.data || []);

// --- Stat strip ------------------------------------------------------------
const STAT_TILES = [
    { key: 'open', filters: { status: 'open' } },
    { key: 'urgent', filters: { priority: 'urgent' }, tone: 'var(--esc-priority-urgent)' },
    { key: 'sla_at_risk', filters: { sla_at_risk: 1 }, tone: 'var(--esc-sla-warn)' },
    { key: 'resolved_today', filters: { status: 'resolved', resolved_today: 1 } },
];

const statTiles = computed(() => {
    if (!props.stats) return [];
    return STAT_TILES.filter((tile) => typeof props.stats[tile.key] === 'number').map((tile) => ({
        ...tile,
        value: props.stats[tile.key],
        label: t(`agent_panel.inbox.stats.${tile.key}`),
        active: Object.entries(tile.filters).every(([k, v]) => String(props.filters?.[k] ?? '') === String(v)),
    }));
});

function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([key, v]) => key !== 'page' && v !== '' && v !== null && v !== undefined),
    );
}

function navigate(params) {
    router.get(props.indexUrl.split('?')[0], cleanParams(params), {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}

function toggleStat(tile) {
    const next = { ...props.filters };
    for (const [key, value] of Object.entries(tile.filters)) {
        if (tile.active) delete next[key];
        else next[key] = value;
    }
    navigate(next);
}

// --- Search and filters ------------------------------------------------------
const search = ref(props.filters?.search || '');
const searchRef = ref(null);
let searchTimer = null;

watch(
    () => props.filters?.search,
    (value) => {
        if ((value || '') !== search.value) search.value = value || '';
    },
);

function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => navigate({ ...props.filters, search: search.value.trim() }), 300);
}

function onSearchKeydown(event) {
    if (event.key === 'Escape') {
        event.target.blur();
    } else if (event.key === 'ArrowDown' && rows.value.length) {
        event.preventDefault();
        focusRow(0);
    }
}

onBeforeUnmount(() => clearTimeout(searchTimer));

const filtersOpen = ref(false);
const filtersRef = ref(null);
const filterToggleRef = ref(null);

function closeFilters(returnFocus = false) {
    filtersOpen.value = false;
    if (returnFocus) filterToggleRef.value?.focus();
}

function onFiltersOutside(event) {
    const inside = [filtersRef.value, filterToggleRef.value].some((el) => el?.contains(event.target));
    if (!inside) closeFilters();
}

watch(filtersOpen, (open) => {
    if (typeof document === 'undefined') return;
    if (open) document.addEventListener('mousedown', onFiltersOutside, true);
    else document.removeEventListener('mousedown', onFiltersOutside, true);
});

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('mousedown', onFiltersOutside, true);
});
const FILTER_KEYS = [
    'status',
    'priority',
    'department_id',
    'tag',
    'ticket_type',
    'requester',
    'created_after',
    'created_before',
    'has_attachments',
    'snoozed',
    'following',
];
const activeFilterCount = computed(
    () => FILTER_KEYS.filter((key) => props.filters?.[key] !== undefined && props.filters?.[key] !== '').length,
);

// --- Rows ------------------------------------------------------------------
const focusedIndex = ref(
    Math.max(
        0,
        rows.value.findIndex((ticket) => ticket.reference === props.selectedReference),
    ),
);
const rowLinks = ref([]);
// The focused row is only highlighted once the keyboard is in use.
const keyboardActive = ref(false);

watch(rows, () => {
    const selected = rows.value.findIndex((ticket) => ticket.reference === props.selectedReference);
    focusedIndex.value = selected >= 0 ? selected : Math.min(focusedIndex.value, Math.max(rows.value.length - 1, 0));
});

function linkEl(index) {
    const link = rowLinks.value[index];
    return link?.$el || link;
}

async function focusRow(index) {
    if (!rows.value.length) return;
    keyboardActive.value = true;
    focusedIndex.value = Math.max(0, Math.min(index, rows.value.length - 1));
    await nextTick();
    linkEl(focusedIndex.value)?.focus?.();
}

// Before the keyboard is used nothing looks focused, so the first j or k
// lands on the current row (the open ticket, else the first) rather than
// skipping past it. With a ticket open, that row is already in view, so
// the first press moves on from it.
function step(delta) {
    const current = rows.value[focusedIndex.value];
    const fresh = !keyboardActive.value && !(current && current.reference === props.selectedReference);
    focusRow(fresh ? focusedIndex.value : focusedIndex.value + delta);
}

function moveDown() {
    step(1);
}

function moveUp() {
    step(-1);
}

function toggleSelectFocused() {
    const ticket = rows.value[focusedIndex.value];
    if (ticket) toggleOne(ticket.id);
}

function open(ticket) {
    emit('open', ticket);
    router.visit(ticketUrl(props.prefix, ticket.reference), { preserveScroll: true, preserveState: true });
}

function openFocused() {
    const ticket = rows.value[focusedIndex.value];
    if (ticket) open(ticket);
}

function focusSearch() {
    searchRef.value?.focus();
}

function onListKeydown(event) {
    // Focus is already on a row here, so the arrows always move.
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusRow(focusedIndex.value + 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusRow(focusedIndex.value - 1);
    } else if (event.key === 'Home') {
        event.preventDefault();
        focusRow(0);
    } else if (event.key === 'End') {
        event.preventDefault();
        focusRow(rows.value.length - 1);
    }
}

function onRowClick(event, ticket, index) {
    // Let modified clicks open a new tab as links normally do.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    focusedIndex.value = index;
    open(ticket);
}

defineExpose({ moveDown, moveUp, toggleSelectFocused, openFocused, focusSearch });

// --- Selection ---------------------------------------------------------------
const selecting = computed(() => props.selectedIds.length > 0);

function toggleOne(id) {
    const ids = [...props.selectedIds];
    const index = ids.indexOf(id);
    if (index >= 0) ids.splice(index, 1);
    else ids.push(id);
    emit('update:selectedIds', ids);
}

// --- Row display -------------------------------------------------------------
const now = ref(Date.now());
let clock = null;
if (typeof window !== 'undefined') {
    clock = setInterval(() => (now.value = Date.now()), 60000);
}
onBeforeUnmount(() => clearInterval(clock));

function slaLabel(ticket) {
    const sla = slaState(ticket, now.value);
    if (!sla) return null;
    if (sla.state === 'breach') return { tone: 'var(--esc-sla-breach)', text: t('agent_panel.sla.breached') };
    return { tone: 'var(--esc-sla-warn)', text: t('agent_panel.sla.minutes_left', { count: sla.minutes }) };
}

const pagination = computed(() => {
    const p = props.tickets || {};
    if (!p.last_page || p.last_page <= 1) return null;
    return {
        current: p.current_page,
        last: p.last_page,
        prev: p.prev_page_url || null,
        next: p.next_page_url || null,
    };
});
</script>

<template>
    <div class="flex h-full min-h-0 flex-col" data-testid="esc-queue-list">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
            <div class="min-w-0">
                <h2 class="truncate text-[18px] font-semibold leading-6 text-[var(--esc-panel-text)]">{{ title }}</h2>
                <p v-if="subtitle" class="mt-0.5 text-[13px] text-[var(--esc-panel-text-tertiary)]">{{ subtitle }}</p>
            </div>
            <Link
                v-if="newTicketUrl"
                :href="newTicketUrl"
                class="flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2.5 text-[13px] font-medium text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
            >
                <PanelIcon name="plus" class="h-4 w-4" />
                {{ t('agent_panel.inbox.new_ticket') }}
            </Link>
        </div>

        <!-- Stat strip -->
        <div
            v-if="statTiles.length"
            class="mx-4 mb-3 flex divide-x divide-[var(--esc-panel-border)] overflow-hidden rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border)]"
            data-testid="esc-stat-strip"
        >
            <button
                v-for="tile in statTiles"
                :key="tile.key"
                type="button"
                :aria-pressed="tile.active ? 'true' : 'false'"
                :class="[
                    'min-w-0 flex-auto px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]',
                    tile.active ? 'bg-[var(--esc-panel-active)]' : 'hover:bg-[var(--esc-panel-hover)]',
                ]"
                @click="toggleStat(tile)"
            >
                <span class="block text-[18px] font-semibold leading-6 tabular-nums text-[var(--esc-panel-text)]">{{
                    tile.value
                }}</span>
                <span
                    class="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[var(--esc-panel-text-tertiary)]"
                >
                    <span
                        v-if="tile.tone && tile.value > 0"
                        class="h-1.5 w-1.5 shrink-0 rounded-full"
                        :style="{ background: tile.tone }"
                    ></span>
                    {{ tile.label }}
                </span>
            </button>
        </div>

        <!-- Search and filters -->
        <div class="relative flex gap-2 px-4 pb-3">
            <label class="relative flex-1">
                <span class="sr-only">{{ t('agent_panel.inbox.search') }}</span>
                <PanelIcon
                    name="search"
                    class="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-[var(--esc-panel-text-muted)]"
                />
                <input
                    ref="searchRef"
                    v-model="search"
                    type="search"
                    :placeholder="t('agent_panel.inbox.search_placeholder')"
                    class="h-8 w-full rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-transparent pl-8 pr-2 text-[13px] text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-tertiary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                    data-testid="esc-queue-search"
                    @input="onSearchInput"
                    @keydown="onSearchKeydown"
                />
            </label>
            <button
                ref="filterToggleRef"
                type="button"
                :class="[
                    'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--esc-radius,6px)] border text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]',
                    filtersOpen
                        ? 'border-[var(--esc-panel-text-muted)] bg-[var(--esc-panel-active)]'
                        : 'border-[var(--esc-panel-border-input)] hover:bg-[var(--esc-panel-hover)]',
                ]"
                :aria-label="t('agent_panel.inbox.filters')"
                :aria-expanded="filtersOpen ? 'true' : 'false'"
                aria-controls="esc-queue-filters"
                data-testid="esc-queue-filter-toggle"
                @click="filtersOpen = !filtersOpen"
            >
                <PanelIcon name="funnel" class="h-4 w-4" />
                <span
                    v-if="activeFilterCount"
                    class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--esc-panel-primary-bg,var(--esc-panel-accent))] px-1 text-[10px] font-semibold tabular-nums text-[var(--esc-panel-primary-text,#fff)]"
                    >{{ activeFilterCount }}</span
                >
            </button>
            <div
                v-if="filtersOpen"
                id="esc-queue-filters"
                ref="filtersRef"
                class="absolute left-4 right-4 top-full z-30 mt-1 max-h-[60vh] overflow-y-auto rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] p-3 shadow-xl"
                data-testid="esc-queue-filters"
                @keydown.esc.stop="closeFilters(true)"
            >
                <TicketFilters
                    :filters="filters"
                    :route="indexUrl.split('?')[0]"
                    :departments="departments"
                    :tags="tags"
                    show-assignee
                    show-following
                    :show-search="false"
                    :show-save-view="false"
                />
            </div>
        </div>

        <!-- Rows -->
        <div class="min-h-0 flex-1 overflow-y-auto border-t border-[var(--esc-panel-border)]">
            <ul
                v-if="rows.length"
                :aria-label="title || t('agent_panel.inbox.tickets')"
                data-testid="esc-queue-rows"
                @keydown="onListKeydown"
            >
                <li
                    v-for="(ticket, index) in rows"
                    :key="ticket.id ?? ticket.reference"
                    :class="[
                        'group relative flex gap-3 border-b border-l-2 border-b-[var(--esc-panel-border)] py-3 pl-[14px] pr-4 transition-colors',
                        ticket.reference === selectedReference
                            ? 'border-l-[var(--esc-panel-selected-border)] bg-[var(--esc-panel-selected-bg)]'
                            : 'border-l-transparent hover:bg-[var(--esc-panel-hover)]',
                        keyboardActive && focusedIndex === index && ticket.reference !== selectedReference
                            ? 'bg-[var(--esc-panel-hover)]'
                            : '',
                    ]"
                    :data-unread="isUnread(ticket) ? 'true' : undefined"
                    data-testid="esc-queue-row"
                >
                    <span
                        v-if="isUnread(ticket)"
                        class="absolute left-[5px] top-[26px] h-1.5 w-1.5 rounded-full bg-[var(--esc-panel-accent)]"
                        data-testid="esc-queue-unread"
                        ><span class="sr-only">{{ t('agent_panel.inbox.unread') }}</span></span
                    >
                    <!-- Avatar; its initials make way for a checkbox on hover and while selecting -->
                    <div
                        class="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--esc-panel-active)]"
                        data-testid="esc-queue-avatar"
                    >
                        <span
                            :class="[
                                'text-[12px] font-semibold text-[var(--esc-panel-text-secondary)] transition-opacity',
                                selectable && selecting ? 'opacity-0' : '',
                                selectable ? 'group-hover:opacity-0' : '',
                            ]"
                            aria-hidden="true"
                            >{{ initials(requesterName(ticket)) }}</span
                        >
                        <template v-if="selectable">
                            <input
                                type="checkbox"
                                :checked="selectedIds.includes(ticket.id)"
                                :aria-label="t('agent_panel.inbox.select_ticket', { reference: ticket.reference })"
                                :class="[
                                    'peer absolute inset-0 m-auto h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[var(--esc-panel-text-tertiary)] bg-[var(--esc-panel-bg)] transition-opacity checked:border-[var(--esc-panel-accent)] checked:bg-[var(--esc-panel-accent)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--esc-panel-bg)]',
                                    selecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                                ]"
                                data-testid="esc-queue-row-select"
                                @change="toggleOne(ticket.id)"
                            />
                            <svg
                                class="pointer-events-none absolute inset-0 m-auto hidden h-3 w-3 text-[var(--esc-panel-primary-text,#fff)] peer-checked:block"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M3.5 8.5l3 3 6-7" />
                            </svg>
                        </template>
                    </div>

                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 text-[12px] text-[var(--esc-panel-text-tertiary)]">
                            <span class="tabular-nums">{{ ticket.reference }}</span>
                            <span
                                v-if="isLive(ticket)"
                                class="h-1.5 w-1.5 rounded-full bg-[var(--esc-sla-ok)]"
                                :title="t('agent_panel.inbox.requester_online')"
                                data-testid="esc-queue-live"
                            ></span>
                            <time
                                class="ml-auto shrink-0 tabular-nums"
                                :datetime="lastActivity(ticket)"
                                :title="absoluteTime(lastActivity(ticket))"
                                >{{ relativeTime(lastActivity(ticket), t, now) }}</time
                            >
                        </div>
                        <Link
                            :ref="(el) => (rowLinks[index] = el)"
                            :href="ticketUrl(prefix, ticket.reference)"
                            :tabindex="focusedIndex === index ? 0 : -1"
                            :aria-current="ticket.reference === selectedReference ? 'true' : undefined"
                            :class="[
                                'mt-0.5 block truncate text-[14px] leading-5 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[var(--esc-panel-accent)]',
                                isUnread(ticket)
                                    ? 'font-semibold text-[var(--esc-panel-text)]'
                                    : 'font-medium text-[var(--esc-panel-text-secondary)]',
                            ]"
                            @click="onRowClick($event, ticket, index)"
                            @focus="focusedIndex = index"
                        >
                            {{ ticket.subject }}
                        </Link>
                        <div class="mt-0.5 flex items-center gap-3">
                            <p class="min-w-0 flex-1 truncate text-[13px] text-[var(--esc-panel-text-tertiary)]">
                                {{ latestPreview(ticket) }}
                            </p>
                            <span
                                v-if="slaLabel(ticket)"
                                class="flex shrink-0 items-center gap-1 text-[12px] font-medium"
                                :style="{ color: slaLabel(ticket).tone }"
                                data-testid="esc-queue-sla"
                            >
                                <PanelIcon name="clock" class="h-3.5 w-3.5" />
                                {{ slaLabel(ticket).text }}
                            </span>
                            <span
                                v-if="ticket.priority && isUrgent(ticket.priority)"
                                class="shrink-0 rounded-[4px] px-1.5 py-px text-[12px] font-medium"
                                :style="{
                                    color: priorityColor(ticket.priority),
                                    background: `color-mix(in srgb, ${priorityColor(ticket.priority)} 14%, transparent)`,
                                }"
                                data-testid="esc-queue-priority"
                                >{{ t(`priority.${ticket.priority}`) }}</span
                            >
                            <span
                                v-else-if="ticket.priority"
                                class="flex shrink-0 items-center gap-1.5 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                                data-testid="esc-queue-priority"
                            >
                                <span
                                    class="h-1.5 w-1.5 rounded-full"
                                    :style="{ background: priorityColor(ticket.priority) }"
                                ></span>
                                {{ t(`priority.${ticket.priority}`) }}
                            </span>
                        </div>
                    </div>
                </li>
            </ul>
            <p v-else class="px-4 py-10 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]">
                {{ t('agent_panel.inbox.empty') }}
            </p>

            <nav
                v-if="pagination"
                :aria-label="t('agent_panel.inbox.pagination')"
                class="flex items-center justify-between px-4 py-3 text-[12px] text-[var(--esc-panel-text-tertiary)]"
            >
                <span class="tabular-nums">{{
                    t('agent_panel.inbox.page_of', { current: pagination.current, last: pagination.last })
                }}</span>
                <span class="flex gap-1">
                    <Link
                        v-if="pagination.prev"
                        :href="pagination.prev"
                        preserve-scroll
                        class="rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2 py-1 text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        >{{ t('agent_panel.inbox.previous') }}</Link
                    >
                    <Link
                        v-if="pagination.next"
                        :href="pagination.next"
                        preserve-scroll
                        class="rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] px-2 py-1 text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        >{{ t('agent_panel.inbox.next') }}</Link
                    >
                </span>
            </nav>
        </div>
    </div>
</template>
