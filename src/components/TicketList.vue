<script setup>
import { inject, computed, ref } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { Link, router } from '@inertiajs/vue3';

const props = defineProps({
    tickets: { type: Object, required: true },
    routePrefix: { type: String, default: 'escalated.customer.tickets' },
    showAssignee: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    selectedIds: { type: Array, default: () => [] },
    assignRoute: { type: String, default: '' },
});

const emit = defineEmits(['update:selectedIds']);
const escDark = inject('esc-dark', computed(() => false));

const allSelected = computed(() => {
    if (!props.tickets.data?.length) return false;
    return props.tickets.data.every(t => props.selectedIds.includes(t.id));
});

function toggleAll() {
    if (allSelected.value) {
        emit('update:selectedIds', []);
    } else {
        emit('update:selectedIds', props.tickets.data.map(t => t.id));
    }
}

function toggleOne(id) {
    const ids = [...props.selectedIds];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    emit('update:selectedIds', ids);
}

function timeAgo(date) {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function slaClass(ticket) {
    if (ticket.sla_first_response_breached || ticket.sla_resolution_breached) return 'bg-rose-500';
    if (ticket.first_response_due_at || ticket.resolution_due_at) {
        const due = ticket.resolution_due_at || ticket.first_response_due_at;
        const mins = (new Date(due) - Date.now()) / 60000;
        if (mins < 30) return 'bg-amber-500';
        return 'bg-emerald-500';
    }
    return '';
}

function truncate(str, len = 60) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
}

const colCount = computed(() => {
    let count = 5; // ref, subject, status, priority, created
    if (props.selectable) count++;
    if (props.showAssignee) count++;
    return count;
});
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark" class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
        <table class="min-w-full divide-y divide-white/[0.06]">
            <thead>
                <tr class="bg-white/[0.02]">
                    <th v-if="selectable" class="w-10 px-3 py-3">
                        <input type="checkbox" :checked="allSelected" @change="toggleAll"
                               class="h-4 w-4 rounded border-white/20 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20" />
                    </th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Reference</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Subject</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Requester</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Priority</th>
                    <th v-if="showAssignee" class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Assignee</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Last Reply</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="ticket in tickets.data" :key="ticket.id" class="group transition-colors hover:bg-white/[0.03]">
                    <td v-if="selectable" class="w-10 px-3 py-3">
                        <input type="checkbox" :checked="selectedIds.includes(ticket.id)" @change="toggleOne(ticket.id)"
                               class="h-4 w-4 rounded border-white/20 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20" />
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        <div class="flex items-center gap-2">
                            <span v-if="slaClass(ticket)" :class="['h-2 w-2 shrink-0 rounded-full', slaClass(ticket)]"></span>
                            <Link :href="route(`${routePrefix}.show`, ticket.reference)" class="text-white hover:text-neutral-300">
                                {{ ticket.reference }}
                            </Link>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-neutral-300">{{ truncate(ticket.subject) }}</td>
                    <td class="px-4 py-3 text-sm text-neutral-400">
                        <div>{{ ticket.requester?.name || ticket.requester_name || 'Unknown' }}</div>
                        <div class="truncate text-xs text-neutral-600" style="max-width: 150px">{{ ticket.requester?.email || ticket.requester_email || '' }}</div>
                    </td>
                    <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                    <td class="px-4 py-3"><PriorityBadge :priority="ticket.priority" /></td>
                    <td v-if="showAssignee" class="px-4 py-3 text-sm text-neutral-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                        <template v-if="ticket.latest_reply || ticket.last_reply_at">
                            <div class="text-neutral-400">{{ timeAgo(ticket.latest_reply?.created_at || ticket.last_reply_at) }}</div>
                            <div class="text-xs text-neutral-600">{{ ticket.latest_reply?.author?.name || ticket.last_reply_author || '' }}</div>
                        </template>
                        <span v-else class="text-neutral-700">—</span>
                    </td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="colCount" class="px-4 py-8 text-center text-sm text-neutral-600">
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
                    <th v-if="selectable" class="w-10 px-3 py-3">
                        <input type="checkbox" :checked="allSelected" @change="toggleAll"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Subject</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Requester</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                    <th v-if="showAssignee" class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Assignee</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Last Reply</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="ticket in tickets.data" :key="ticket.id" class="group hover:bg-gray-50">
                    <td v-if="selectable" class="w-10 px-3 py-3">
                        <input type="checkbox" :checked="selectedIds.includes(ticket.id)" @change="toggleOne(ticket.id)"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        <div class="flex items-center gap-2">
                            <span v-if="slaClass(ticket)" :class="['h-2 w-2 shrink-0 rounded-full', slaClass(ticket)]"></span>
                            <Link :href="route(`${routePrefix}.show`, ticket.reference)" class="text-indigo-600 hover:text-indigo-900">
                                {{ ticket.reference }}
                            </Link>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ truncate(ticket.subject) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                        <div>{{ ticket.requester?.name || ticket.requester_name || 'Unknown' }}</div>
                        <div class="truncate text-xs text-gray-400" style="max-width: 150px">{{ ticket.requester?.email || ticket.requester_email || '' }}</div>
                    </td>
                    <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                    <td class="px-4 py-3"><PriorityBadge :priority="ticket.priority" /></td>
                    <td v-if="showAssignee" class="px-4 py-3 text-sm text-gray-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        <template v-if="ticket.latest_reply || ticket.last_reply_at">
                            <div>{{ timeAgo(ticket.latest_reply?.created_at || ticket.last_reply_at) }}</div>
                            <div class="text-xs text-gray-400">{{ ticket.latest_reply?.author?.name || ticket.last_reply_author || '' }}</div>
                        </template>
                        <span v-else class="text-gray-400">—</span>
                    </td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="colCount" class="px-4 py-8 text-center text-sm text-gray-500">
                        No tickets found.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
