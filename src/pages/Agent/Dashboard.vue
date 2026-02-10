<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { Link } from '@inertiajs/vue3';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatsCard from '../../components/StatsCard.vue';
import StatusBadge from '../../components/StatusBadge.vue';
import PriorityBadge from '../../components/PriorityBadge.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { usePluginExtensions } from '../../composables/usePluginExtensions';

const props = defineProps({
    stats: Object,
    recentTickets: Array,
    needsAttention: { type: Object, default: () => ({}) },
    myPerformance: { type: Object, default: () => ({}) },
});

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

function truncate(str, len = 50) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
}

const hasSlaBreaching = computed(() => needsAttention.value?.sla_breaching?.length > 0);
const hasUnassignedUrgent = computed(() => needsAttention.value?.unassigned_urgent?.length > 0);
const needsAttention = computed(() => props.needsAttention);

const { dashboardWidgets, getPageComponents } = usePluginExtensions();

// Load a plugin widget component dynamically
const loadWidgetComponent = (plugin, component) => {
    return defineAsyncComponent(() =>
        import(`../../../../../plugins/escalated/${plugin}/resources/js/Components/${component}.vue`)
    );
};
</script>

<template>
    <EscalatedLayout title="Agent Dashboard">
        <!-- Plugin: dashboard header slot -->
        <PluginSlot slot="dashboard.header" :components="getPageComponents('dashboard', 'header')" />

        <!-- Stats row -->
        <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatsCard label="Open Tickets" :value="stats.open" color="cyan" />
            <StatsCard label="My Assigned" :value="stats.my_assigned" color="violet" />
            <StatsCard label="Unassigned" :value="stats.unassigned" color="amber" />
            <StatsCard label="SLA Breached" :value="stats.sla_breached" color="red" />
            <StatsCard label="Resolved Today" :value="stats.resolved_today" color="green" />
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2 space-y-6">
                <!-- Needs Attention -->
                <div v-if="hasSlaBreaching || hasUnassignedUrgent">
                    <h2 class="mb-4 text-lg font-semibold text-neutral-200">Needs Attention</h2>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div v-if="hasSlaBreaching" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                            <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-400">
                                <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                                SLA Breaching
                            </h3>
                            <div v-for="ticket in needsAttention.sla_breaching" :key="ticket.id" class="mb-2 last:mb-0">
                                <Link :href="route('escalated.agent.tickets.show', ticket.reference)"
                                      class="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.04]">
                                    <span class="font-mono text-xs text-neutral-400">{{ ticket.reference }}</span>
                                    <span class="truncate text-neutral-300" style="max-width: 140px">{{ ticket.requester?.name }}</span>
                                </Link>
                            </div>
                        </div>
                        <div v-if="hasUnassignedUrgent" class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
                                <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                                Unassigned Urgent
                            </h3>
                            <div v-for="ticket in needsAttention.unassigned_urgent" :key="ticket.id" class="mb-2 last:mb-0">
                                <Link :href="route('escalated.agent.tickets.show', ticket.reference)"
                                      class="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.04]">
                                    <span class="font-mono text-xs text-neutral-400">{{ ticket.reference }}</span>
                                    <PriorityBadge :priority="ticket.priority" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Tickets -->
                <div>
                    <h2 class="mb-4 text-lg font-semibold text-neutral-200">Recent Tickets</h2>
                    <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
                        <table class="min-w-full divide-y divide-white/[0.06]">
                            <thead>
                                <tr class="bg-white/[0.02]">
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Reference</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Subject</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Requester</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Priority</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Assignee</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Last Reply</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/[0.04]">
                                <tr v-for="ticket in recentTickets" :key="ticket.id" class="transition-colors hover:bg-white/[0.03]">
                                    <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                                        <div class="flex items-center gap-2">
                                            <span v-if="slaClass(ticket)" :class="['h-2 w-2 shrink-0 rounded-full', slaClass(ticket)]"></span>
                                            <Link :href="route('escalated.agent.tickets.show', ticket.reference)" class="text-white hover:text-neutral-300">
                                                {{ ticket.reference }}
                                            </Link>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-neutral-300">{{ truncate(ticket.subject) }}</td>
                                    <td class="px-4 py-3 text-sm text-neutral-400">{{ ticket.requester?.name }}</td>
                                    <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                                    <td class="px-4 py-3"><PriorityBadge :priority="ticket.priority" /></td>
                                    <td class="px-4 py-3 text-sm text-neutral-500">{{ ticket.assignee?.name || 'Unassigned' }}</td>
                                    <td class="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                                        <template v-if="ticket.latest_reply">
                                            <div class="text-neutral-400">{{ timeAgo(ticket.latest_reply.created_at) }}</div>
                                            <div class="text-xs text-neutral-600">{{ ticket.latest_reply.author?.name || '' }}</div>
                                        </template>
                                        <span v-else class="text-neutral-700">—</span>
                                    </td>
                                </tr>
                                <tr v-if="!recentTickets?.length">
                                    <td colspan="7" class="px-4 py-8 text-center text-sm text-neutral-500">No recent tickets</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- My Performance sidebar -->
            <div class="space-y-4">
                <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
                    <h3 class="mb-4 text-sm font-semibold text-neutral-200">My Performance</h3>
                    <dl class="space-y-3">
                        <div class="flex items-center justify-between">
                            <dt class="text-sm text-neutral-500">Resolved This Week</dt>
                            <dd class="text-lg font-bold text-white">{{ myPerformance.resolved_this_week || 0 }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>

        <!-- Plugin dashboard widgets -->
        <div v-if="dashboardWidgets.length" class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div v-for="widget in dashboardWidgets" :key="widget.id"
                 :class="['rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5',
                          widget.width === 'full' ? 'md:col-span-2' : '']">
                <h3 v-if="widget.title" class="mb-3 text-sm font-semibold text-neutral-200">{{ widget.title }}</h3>
                <component
                    :is="loadWidgetComponent(widget.plugin, widget.component)"
                    v-bind="widget.data || {}"
                />
            </div>
        </div>

        <!-- Plugin: dashboard footer slot -->
        <PluginSlot slot="dashboard.footer" :components="getPageComponents('dashboard', 'footer')" />
    </EscalatedLayout>
</template>
