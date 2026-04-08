<script setup>
/* global localStorage */
import { inject, computed, ref, watch } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { Link, router } from '@inertiajs/vue3';
import { TICKET_TYPE_COLORS } from '../utils/constants';
import { timeAgo, slaClass } from '../utils/formatting';

const STORAGE_KEY = 'escalated-ticket-columns';

const ALL_COLUMNS = [
    { key: 'reference', label: 'Reference' },
    { key: 'subject', label: 'Subject' },
    { key: 'requester', label: 'Requester' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'department', label: 'Department' },
    { key: 'updated', label: 'Last Reply' },
    { key: 'created', label: 'Created' },
    { key: 'sla', label: 'SLA' },
    { key: 'tags', label: 'Tags' },
    { key: 'category', label: 'Category' },
];

const props = defineProps({
    tickets: { type: Object, required: true },
    routePrefix: { type: String, default: 'escalated.customer.tickets' },
    /** @deprecated Use `columns` prop instead */
    showAssignee: { type: Boolean, default: false },
    columns: {
        type: Array,
        default: () => ['reference', 'subject', 'requester', 'status', 'priority', 'updated'],
    },
    selectable: { type: Boolean, default: false },
    selectedIds: { type: Array, default: () => [] },
    assignRoute: { type: String, default: '' },
    navigable: { type: Boolean, default: false },
});

const emit = defineEmits(['update:selectedIds']);
const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const focusedIndex = ref(-1);
const showColumnPicker = ref(false);

// Resolve initial columns: merge prop with deprecated showAssignee, then override from localStorage
function resolveDefaultColumns() {
    const base = [...props.columns];
    if (props.showAssignee && !base.includes('assignee')) {
        const prioIdx = base.indexOf('priority');
        if (prioIdx >= 0) {
            base.splice(prioIdx + 1, 0, 'assignee');
        } else {
            base.push('assignee');
        }
    }
    return base;
}

function loadSavedColumns() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return null;
}

const activeColumns = ref(loadSavedColumns() || resolveDefaultColumns());

function saveColumns() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeColumns.value));
    } catch {
        // ignore
    }
}

function toggleColumn(key) {
    const idx = activeColumns.value.indexOf(key);
    if (idx >= 0) {
        if (activeColumns.value.length <= 1) return; // must keep at least one
        activeColumns.value.splice(idx, 1);
    } else {
        activeColumns.value.push(key);
    }
    saveColumns();
}

function isColumnActive(key) {
    return activeColumns.value.includes(key);
}

const visibleColumnDefs = computed(() => {
    return ALL_COLUMNS.filter((c) => activeColumns.value.includes(c.key));
});

// Close column picker on outside click
function onClickOutside(e) {
    if (!e.target.closest('[data-column-picker]')) {
        showColumnPicker.value = false;
    }
}

watch(showColumnPicker, (val) => {
    if (val) {
        document.addEventListener('click', onClickOutside, true);
    } else {
        document.removeEventListener('click', onClickOutside, true);
    }
});

function moveDown() {
    if (!props.tickets.data?.length) return;
    focusedIndex.value = Math.min(focusedIndex.value + 1, props.tickets.data.length - 1);
}
function moveUp() {
    if (!props.tickets.data?.length) return;
    focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
}
function toggleSelectFocused() {
    if (focusedIndex.value < 0 || !props.tickets.data?.length) return;
    toggleOne(props.tickets.data[focusedIndex.value].id);
}
function openFocused() {
    if (focusedIndex.value < 0 || !props.tickets.data?.length) return;
    const ticket = props.tickets.data[focusedIndex.value];
    router.visit(route(`${props.routePrefix}.show`, ticket.reference));
}

defineExpose({ moveDown, moveUp, toggleSelectFocused, openFocused });

const allSelected = computed(() => {
    if (!props.tickets.data?.length) return false;
    return props.tickets.data.every((t) => props.selectedIds.includes(t.id));
});

function toggleAll() {
    if (allSelected.value) {
        emit('update:selectedIds', []);
    } else {
        emit(
            'update:selectedIds',
            props.tickets.data.map((t) => t.id),
        );
    }
}

function toggleOne(id) {
    const ids = [...props.selectedIds];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    emit('update:selectedIds', ids);
}

function slaLabel(ticket) {
    if (ticket.sla_first_response_breached || ticket.sla_resolution_breached) return 'Breached';
    if (ticket.first_response_due_at || ticket.resolution_due_at) {
        const due = ticket.resolution_due_at || ticket.first_response_due_at;
        const mins = Math.round((new Date(due) - Date.now()) / 60000);
        if (mins < 0) return 'Overdue';
        if (mins < 60) return `${mins}m left`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h left`;
        return `${Math.floor(hrs / 24)}d left`;
    }
    return '—';
}

function ticketTypeLabel(type) {
    const entry = TICKET_TYPE_COLORS[type];
    if (!entry) return type || '—';
    // Derive label from key
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function ticketTypeBadgeClass(type, dark) {
    const entry = TICKET_TYPE_COLORS[type];
    if (!entry) return '';
    return dark ? entry.dark : entry.light;
}

function truncate(str, len = 60) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
}

const colCount = computed(() => {
    let count = visibleColumnDefs.value.length;
    if (props.selectable) count++;
    return count;
});
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark" class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
        <table class="min-w-full divide-y divide-white/[0.06]">
            <thead>
                <tr class="bg-white/[0.02]">
                    <th v-if="selectable" scope="col" class="w-10 px-3 py-3">
                        <input
                            type="checkbox"
                            :checked="allSelected"
                            aria-label="Select all tickets"
                            class="h-4 w-4 rounded border-white/20 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20"
                            @change="toggleAll"
                        />
                    </th>
                    <th
                        v-for="col in visibleColumnDefs"
                        :key="col.key"
                        scope="col"
                        class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                    >
                        {{ col.label }}
                    </th>
                    <th scope="col" class="w-10 px-2 py-3 text-right">
                        <div class="relative inline-block" data-column-picker>
                            <button
                                aria-label="Configure columns"
                                :class="[
                                    'inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors',
                                    'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06]',
                                ]"
                                @click.stop="showColumnPicker = !showColumnPicker"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                            <div
                                v-if="showColumnPicker"
                                role="menu"
                                aria-label="Column visibility"
                                class="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-white/[0.08] bg-neutral-800 py-1 shadow-xl"
                            >
                                <label
                                    v-for="col in ALL_COLUMNS"
                                    :key="col.key"
                                    role="menuitemcheckbox"
                                    :aria-checked="isColumnActive(col.key)"
                                    class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/[0.06]"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="isColumnActive(col.key)"
                                        class="h-3.5 w-3.5 rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-cyan-500/20"
                                        @change="toggleColumn(col.key)"
                                    />
                                    {{ col.label }}
                                </label>
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
                <tr
                    v-for="(ticket, index) in tickets.data"
                    :key="ticket.id"
                    :class="[
                        'group transition-colors',
                        navigable && focusedIndex === index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                    ]"
                >
                    <td v-if="selectable" class="w-10 px-3 py-3">
                        <input
                            type="checkbox"
                            :checked="selectedIds.includes(ticket.id)"
                            aria-label="Select ticket"
                            class="h-4 w-4 rounded border-white/20 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20"
                            @change="toggleOne(ticket.id)"
                        />
                    </td>
                    <!-- reference -->
                    <td v-if="isColumnActive('reference')" class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        <div class="flex items-center gap-2">
                            <span
                                v-if="slaClass(ticket)"
                                :class="['h-2 w-2 shrink-0 rounded-full', slaClass(ticket)]"
                            ></span>
                            <Link
                                :href="route(`${routePrefix}.show`, ticket.reference)"
                                class="text-white hover:text-neutral-300"
                            >
                                {{ ticket.reference }}
                            </Link>
                        </div>
                    </td>
                    <!-- subject -->
                    <td v-if="isColumnActive('subject')" class="px-4 py-3 text-sm text-neutral-300">
                        {{ truncate(ticket.subject) }}
                    </td>
                    <!-- requester -->
                    <td v-if="isColumnActive('requester')" class="px-4 py-3 text-sm text-neutral-400">
                        <div>{{ ticket.requester?.name || ticket.requester_name || 'Unknown' }}</div>
                        <div class="truncate text-xs text-neutral-600" style="max-width: 150px">
                            {{ ticket.requester?.email || ticket.requester_email || '' }}
                        </div>
                    </td>
                    <!-- status -->
                    <td v-if="isColumnActive('status')" class="px-4 py-3">
                        <div class="flex items-center gap-1.5">
                            <StatusBadge :status="ticket.status" />
                            <span
                                v-if="ticket.snoozed_until && new Date(ticket.snoozed_until) > Date.now()"
                                class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-amber-500/20"
                                :title="'Snoozed until ' + new Date(ticket.snoozed_until).toLocaleString()"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                Snoozed
                            </span>
                        </div>
                    </td>
                    <!-- priority -->
                    <td v-if="isColumnActive('priority')" class="px-4 py-3">
                        <PriorityBadge :priority="ticket.priority" />
                    </td>
                    <!-- assignee -->
                    <td v-if="isColumnActive('assignee')" class="px-4 py-3 text-sm text-neutral-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <!-- department -->
                    <td v-if="isColumnActive('department')" class="px-4 py-3 text-sm text-neutral-500">
                        {{ ticket.department?.name || '—' }}
                    </td>
                    <!-- updated (last reply) -->
                    <td v-if="isColumnActive('updated')" class="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                        <template v-if="ticket.latest_reply || ticket.last_reply_at">
                            <div class="text-neutral-400">
                                {{ timeAgo(ticket.latest_reply?.created_at || ticket.last_reply_at) }}
                            </div>
                            <div class="text-xs text-neutral-600">
                                {{ ticket.latest_reply?.author?.name || ticket.last_reply_author || '' }}
                            </div>
                        </template>
                        <span v-else class="text-neutral-700">—</span>
                    </td>
                    <!-- created -->
                    <td v-if="isColumnActive('created')" class="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
                        {{ timeAgo(ticket.created_at) }}
                    </td>
                    <!-- sla -->
                    <td v-if="isColumnActive('sla')" class="px-4 py-3 text-sm">
                        <span
                            v-if="slaClass(ticket)"
                            :class="[
                                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white',
                                slaClass(ticket),
                            ]"
                        >
                            {{ slaLabel(ticket) }}
                        </span>
                        <span v-else class="text-neutral-700">—</span>
                    </td>
                    <!-- tags -->
                    <td v-if="isColumnActive('tags')" class="px-4 py-3 text-sm">
                        <div class="flex flex-wrap gap-1">
                            <span
                                v-for="tag in ticket.tags || []"
                                :key="tag.id || tag"
                                class="inline-block rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-neutral-400"
                            >
                                {{ tag.name || tag }}
                            </span>
                            <span v-if="!ticket.tags?.length" class="text-neutral-700">—</span>
                        </div>
                    </td>
                    <!-- category (ticket type) -->
                    <td v-if="isColumnActive('category')" class="px-4 py-3 text-sm">
                        <span
                            v-if="ticket.ticket_type"
                            :class="[
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                ticketTypeBadgeClass(ticket.ticket_type, true),
                            ]"
                        >
                            {{ ticketTypeLabel(ticket.ticket_type) }}
                        </span>
                        <span v-else class="text-neutral-700">—</span>
                    </td>
                    <!-- spacer for gear column -->
                    <td class="w-10 px-2 py-3"></td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="colCount + 1" class="px-4 py-8 text-center text-sm text-neutral-600">
                        No tickets found.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Light mode -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th v-if="selectable" scope="col" class="w-10 px-3 py-3">
                        <input
                            type="checkbox"
                            :checked="allSelected"
                            aria-label="Select all tickets"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            @change="toggleAll"
                        />
                    </th>
                    <th
                        v-for="col in visibleColumnDefs"
                        :key="col.key"
                        scope="col"
                        class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500"
                    >
                        {{ col.label }}
                    </th>
                    <th scope="col" class="w-10 px-2 py-3 text-right">
                        <div class="relative inline-block" data-column-picker>
                            <button
                                aria-label="Configure columns"
                                :class="[
                                    'inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors',
                                    'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                                ]"
                                @click.stop="showColumnPicker = !showColumnPicker"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                            <div
                                v-if="showColumnPicker"
                                role="menu"
                                aria-label="Column visibility"
                                class="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
                            >
                                <label
                                    v-for="col in ALL_COLUMNS"
                                    :key="col.key"
                                    role="menuitemcheckbox"
                                    :aria-checked="isColumnActive(col.key)"
                                    class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="isColumnActive(col.key)"
                                        class="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        @change="toggleColumn(col.key)"
                                    />
                                    {{ col.label }}
                                </label>
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr
                    v-for="(ticket, index) in tickets.data"
                    :key="ticket.id"
                    :class="['group', navigable && focusedIndex === index ? 'bg-indigo-50' : 'hover:bg-gray-50']"
                >
                    <td v-if="selectable" class="w-10 px-3 py-3">
                        <input
                            type="checkbox"
                            :checked="selectedIds.includes(ticket.id)"
                            aria-label="Select ticket"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            @change="toggleOne(ticket.id)"
                        />
                    </td>
                    <!-- reference -->
                    <td
                        v-if="isColumnActive('reference')"
                        class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                v-if="slaClass(ticket)"
                                :class="['h-2 w-2 shrink-0 rounded-full', slaClass(ticket)]"
                            ></span>
                            <Link
                                :href="route(`${routePrefix}.show`, ticket.reference)"
                                class="text-indigo-600 hover:text-indigo-900"
                            >
                                {{ ticket.reference }}
                            </Link>
                        </div>
                    </td>
                    <!-- subject -->
                    <td v-if="isColumnActive('subject')" class="px-4 py-3 text-sm text-gray-900">
                        {{ truncate(ticket.subject) }}
                    </td>
                    <!-- requester -->
                    <td v-if="isColumnActive('requester')" class="px-4 py-3 text-sm text-gray-500">
                        <div>{{ ticket.requester?.name || ticket.requester_name || 'Unknown' }}</div>
                        <div class="truncate text-xs text-gray-400" style="max-width: 150px">
                            {{ ticket.requester?.email || ticket.requester_email || '' }}
                        </div>
                    </td>
                    <!-- status -->
                    <td v-if="isColumnActive('status')" class="px-4 py-3">
                        <div class="flex items-center gap-1.5">
                            <StatusBadge :status="ticket.status" />
                            <span
                                v-if="ticket.snoozed_until && new Date(ticket.snoozed_until) > Date.now()"
                                class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-amber-500/20"
                                :title="'Snoozed until ' + new Date(ticket.snoozed_until).toLocaleString()"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                Snoozed
                            </span>
                        </div>
                    </td>
                    <!-- priority -->
                    <td v-if="isColumnActive('priority')" class="px-4 py-3">
                        <PriorityBadge :priority="ticket.priority" />
                    </td>
                    <!-- assignee -->
                    <td v-if="isColumnActive('assignee')" class="px-4 py-3 text-sm text-gray-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <!-- department -->
                    <td v-if="isColumnActive('department')" class="px-4 py-3 text-sm text-gray-500">
                        {{ ticket.department?.name || '—' }}
                    </td>
                    <!-- updated (last reply) -->
                    <td v-if="isColumnActive('updated')" class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        <template v-if="ticket.latest_reply || ticket.last_reply_at">
                            <div>{{ timeAgo(ticket.latest_reply?.created_at || ticket.last_reply_at) }}</div>
                            <div class="text-xs text-gray-400">
                                {{ ticket.latest_reply?.author?.name || ticket.last_reply_author || '' }}
                            </div>
                        </template>
                        <span v-else class="text-gray-400">—</span>
                    </td>
                    <!-- created -->
                    <td v-if="isColumnActive('created')" class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {{ timeAgo(ticket.created_at) }}
                    </td>
                    <!-- sla -->
                    <td v-if="isColumnActive('sla')" class="px-4 py-3 text-sm">
                        <span
                            v-if="slaClass(ticket)"
                            :class="[
                                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white',
                                slaClass(ticket),
                            ]"
                        >
                            {{ slaLabel(ticket) }}
                        </span>
                        <span v-else class="text-gray-400">—</span>
                    </td>
                    <!-- tags -->
                    <td v-if="isColumnActive('tags')" class="px-4 py-3 text-sm">
                        <div class="flex flex-wrap gap-1">
                            <span
                                v-for="tag in ticket.tags || []"
                                :key="tag.id || tag"
                                class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                                {{ tag.name || tag }}
                            </span>
                            <span v-if="!ticket.tags?.length" class="text-gray-400">—</span>
                        </div>
                    </td>
                    <!-- category (ticket type) -->
                    <td v-if="isColumnActive('category')" class="px-4 py-3 text-sm">
                        <span
                            v-if="ticket.ticket_type"
                            :class="[
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                ticketTypeBadgeClass(ticket.ticket_type, false),
                            ]"
                        >
                            {{ ticketTypeLabel(ticket.ticket_type) }}
                        </span>
                        <span v-else class="text-gray-400">—</span>
                    </td>
                    <!-- spacer for gear column -->
                    <td class="w-10 px-2 py-3"></td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="colCount + 1" class="px-4 py-8 text-center text-sm text-gray-500">
                        No tickets found.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
