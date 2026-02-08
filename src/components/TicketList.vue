<script setup>
import { inject, computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import { Link } from '@inertiajs/vue3';

defineProps({
    tickets: { type: Object, required: true },
    routePrefix: { type: String, default: 'escalated.customer.tickets' },
    showAssignee: { type: Boolean, default: false },
});

const escDark = inject('esc-dark', computed(() => false));
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark" class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
        <table class="min-w-full divide-y divide-white/[0.06]">
            <thead>
                <tr class="bg-white/[0.02]">
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Reference</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Subject</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Priority</th>
                    <th v-if="showAssignee" class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Assignee</th>
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Created</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="ticket in tickets.data" :key="ticket.id" class="transition-colors hover:bg-white/[0.03]">
                    <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        <Link :href="route(`${routePrefix}.show`, ticket.reference)" class="text-white hover:text-neutral-300">
                            {{ ticket.reference }}
                        </Link>
                    </td>
                    <td class="px-4 py-3 text-sm text-neutral-300">{{ ticket.subject }}</td>
                    <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                    <td class="px-4 py-3"><PriorityBadge :priority="ticket.priority" /></td>
                    <td v-if="showAssignee" class="px-4 py-3 text-sm text-neutral-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                        {{ new Date(ticket.created_at).toLocaleDateString() }}
                    </td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="showAssignee ? 6 : 5" class="px-4 py-8 text-center text-sm text-neutral-600">
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
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Subject</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                    <th v-if="showAssignee" class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Assignee</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="ticket in tickets.data" :key="ticket.id" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        <Link :href="route(`${routePrefix}.show`, ticket.reference)" class="text-indigo-600 hover:text-indigo-900">
                            {{ ticket.reference }}
                        </Link>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ ticket.subject }}</td>
                    <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                    <td class="px-4 py-3"><PriorityBadge :priority="ticket.priority" /></td>
                    <td v-if="showAssignee" class="px-4 py-3 text-sm text-gray-500">
                        {{ ticket.assignee?.name || 'Unassigned' }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {{ new Date(ticket.created_at).toLocaleDateString() }}
                    </td>
                </tr>
                <tr v-if="!tickets.data?.length">
                    <td :colspan="showAssignee ? 6 : 5" class="px-4 py-8 text-center text-sm text-gray-500">
                        No tickets found.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
