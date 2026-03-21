<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatusBadge from '../../components/StatusBadge.vue';
import PriorityBadge from '../../components/PriorityBadge.vue';
import ReplyThread from '../../components/ReplyThread.vue';
import ReplyComposer from '../../components/ReplyComposer.vue';
import TicketSidebar from '../../components/TicketSidebar.vue';
import AttachmentList from '../../components/AttachmentList.vue';
import MacroDropdown from '../../components/MacroDropdown.vue';
import FollowButton from '../../components/FollowButton.vue';
import PresenceIndicator from '../../components/PresenceIndicator.vue';
import PinnedNotes from '../../components/PinnedNotes.vue';
import KeyboardShortcutHelp from '../../components/KeyboardShortcutHelp.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import KnowledgePanel from '../../components/KnowledgePanel.vue';
import ContextPanel from '../../components/ContextPanel.vue';
import ContextPanelSection from '../../components/ContextPanelSection.vue';
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../composables/usePluginExtensions';
import { router, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed, inject } from 'vue';

const props = defineProps({
    ticket: Object,
    departments: Array,
    tags: Array,
    cannedResponses: Array,
    macros: { type: Array, default: () => [] },
    is_following: { type: Boolean, default: false },
    followers_count: { type: Number, default: 0 },
});

const page = usePage();
const isLightAgent = computed(() => page.props.escalated?.agent_type === 'light');
const activeTab = ref(isLightAgent.value ? 'note' : 'reply');
const showShortcutHelp = ref(false);
const replyComposerRef = ref(null);
const statusSelectRef = ref(null);
const prioritySelectRef = ref(null);

const showContextPanel = ref(false);

const statusForm = useForm({ status: '' });
const priorityForm = useForm({ priority: '' });
const assignForm = useForm({ agent_id: '' });

function changeStatus(status) {
    statusForm.status = status;
    statusForm.post(route('escalated.agent.tickets.status', props.ticket.reference), { preserveScroll: true });
}

function changePriority(priority) {
    priorityForm.priority = priority;
    priorityForm.post(route('escalated.agent.tickets.priority', props.ticket.reference), { preserveScroll: true });
}

function assignToMe() {
    assignForm.agent_id = page.props.auth.user.id;
    assignForm.post(route('escalated.agent.tickets.assign', props.ticket.reference), { preserveScroll: true });
}

function toggleFollow() {
    router.post(route('escalated.agent.tickets.follow', props.ticket.reference), {}, { preserveScroll: true });
}

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const { getPageComponents } = usePluginExtensions();

// Keyboard shortcuts
useKeyboardShortcuts({
    r: () => {
        activeTab.value = 'reply';
        replyComposerRef.value?.$el?.querySelector('textarea')?.focus();
    },
    n: () => {
        activeTab.value = 'note';
    },
    s: () => {
        statusSelectRef.value?.focus();
    },
    p: () => {
        prioritySelectRef.value?.focus();
    },
    f: () => {
        toggleFollow();
    },
    '?': () => {
        showShortcutHelp.value = true;
    },
});
</script>

<template>
    <EscalatedLayout :title="ticket.subject">
        <!-- Plugin: ticket show header slot -->
        <PluginSlot slot="ticket.show.header" :components="getPageComponents('ticket.show', 'header')" />

        <div class="mb-5 flex flex-wrap items-center gap-3">
            <span :class="['text-sm font-mono font-medium', escDark ? 'text-white' : 'text-gray-900']">{{
                ticket.reference
            }}</span>
            <StatusBadge :status="ticket.status" />
            <PriorityBadge :priority="ticket.priority" />
            <span class="text-sm text-neutral-500">by {{ ticket.requester?.name }}</span>
            <PresenceIndicator :ticket-reference="ticket.reference" route-prefix="escalated.agent" />
            <div class="ml-auto flex items-center gap-2">
                <FollowButton
                    :is-following="is_following"
                    :followers-count="followers_count"
                    :action="route('escalated.agent.tickets.follow', ticket.reference)"
                />
                <MacroDropdown
                    v-if="macros.length && !isLightAgent"
                    :macros="macros"
                    :action="route('escalated.agent.tickets.macro', ticket.reference)"
                />
                <button
                    v-if="!ticket.assigned_to && !isLightAgent"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                    @click="assignToMe"
                >
                    Assign to Me
                </button>
                <template v-if="!isLightAgent">
                    <select
                        ref="statusSelectRef"
                        :class="[
                            'rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1',
                            escDark
                                ? 'border-white/10 bg-neutral-950 text-neutral-200 focus:border-white/20 focus:ring-white/10'
                                : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400 focus:ring-gray-200',
                        ]"
                        @change="
                            changeStatus($event.target.value);
                            $event.target.value = '';
                        "
                    >
                        <option value="">Change Status...</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_on_customer">Waiting on Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select
                        ref="prioritySelectRef"
                        :class="[
                            'rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1',
                            escDark
                                ? 'border-white/10 bg-neutral-950 text-neutral-200 focus:border-white/20 focus:ring-white/10'
                                : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400 focus:ring-gray-200',
                        ]"
                        @change="
                            changePriority($event.target.value);
                            $event.target.value = '';
                        "
                    >
                        <option value="">Change Priority...</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                    </select>
                </template>
                <!-- Context Panel Toggle -->
                <button
                    type="button"
                    :class="[
                        'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        showContextPanel
                            ? escDark
                                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                                : 'border-blue-300 bg-blue-50 text-blue-600'
                            : escDark
                              ? 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                              : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
                    ]"
                    @click="showContextPanel = !showContextPanel"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                    </svg>
                </button>
                <!-- Plugin: ticket show actions slot -->
                <PluginSlot slot="ticket.show.actions" :components="getPageComponents('ticket.show', 'actions')" />
            </div>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2 space-y-6">
                <PinnedNotes
                    v-if="ticket.pinned_notes?.length"
                    :notes="ticket.pinned_notes"
                    :ticket-reference="ticket.reference"
                    route-prefix="escalated.agent"
                />
                <div
                    :class="[
                        'rounded-xl border p-5',
                        escDark ? 'border-white/[0.06] bg-neutral-900/60' : 'border-gray-200 bg-white',
                    ]"
                >
                    <p :class="['whitespace-pre-wrap text-sm', escDark ? 'text-neutral-300' : 'text-gray-700']">
                        {{ ticket.description }}
                    </p>
                    <AttachmentList v-if="ticket.attachments?.length" :attachments="ticket.attachments" class="mt-3" />
                </div>
                <div>
                    <div :class="['mb-4 flex gap-4 border-b', escDark ? 'border-white/[0.06]' : 'border-gray-200']">
                        <button
                            v-if="!isLightAgent"
                            :class="[
                                'pb-2 text-sm font-medium transition-colors',
                                activeTab === 'reply'
                                    ? escDark
                                        ? 'border-b-2 border-cyan-500 text-white'
                                        : 'border-b-2 border-blue-500 text-gray-900'
                                    : escDark
                                      ? 'text-neutral-500 hover:text-neutral-300'
                                      : 'text-gray-400 hover:text-gray-600',
                            ]"
                            @click="activeTab = 'reply'"
                        >
                            Reply
                        </button>
                        <button
                            :class="[
                                'pb-2 text-sm font-medium transition-colors',
                                activeTab === 'note'
                                    ? escDark
                                        ? 'border-b-2 border-amber-500 text-amber-400'
                                        : 'border-b-2 border-amber-500 text-amber-700'
                                    : escDark
                                      ? 'text-neutral-500 hover:text-neutral-300'
                                      : 'text-gray-400 hover:text-gray-600',
                            ]"
                            @click="activeTab = 'note'"
                        >
                            Internal Note
                        </button>
                    </div>
                    <ReplyComposer
                        v-if="activeTab === 'reply' && !isLightAgent"
                        ref="replyComposerRef"
                        :action="route('escalated.agent.tickets.reply', ticket.reference)"
                        :canned-responses="cannedResponses"
                    />
                    <ReplyComposer
                        v-if="activeTab === 'note'"
                        :action="route('escalated.agent.tickets.note', ticket.reference)"
                        placeholder="Write an internal note..."
                        submit-label="Add Note"
                    />
                </div>
                <div>
                    <h2 :class="['mb-4 text-lg font-semibold', escDark ? 'text-neutral-200' : 'text-gray-900']">
                        Conversation
                    </h2>
                    <ReplyThread
                        :replies="ticket.replies || []"
                        :current-user-id="page.props.auth?.user?.id"
                        :ticket-reference="ticket.reference"
                        route-prefix="escalated.agent"
                        pinnable
                    />
                </div>
            </div>
            <div class="space-y-6">
                <TicketSidebar :ticket="ticket" :tags="tags" :departments="departments" />
                <KnowledgePanel :ticket-reference="ticket.reference" />
                <!-- Plugin: ticket show sidebar slot -->
                <PluginSlot slot="ticket.show.sidebar" :components="getPageComponents('ticket.show', 'sidebar')" />
            </div>
        </div>
        <!-- Context Panel -->
        <ContextPanel v-model:visible="showContextPanel">
            <ContextPanelSection
                title="Customer Info"
                icon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            >
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Name</span>
                        <span :class="escDark ? 'text-neutral-200' : 'text-gray-900'">{{
                            ticket.requester?.name || 'Unknown'
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Email</span>
                        <span :class="['truncate', escDark ? 'text-neutral-200' : 'text-gray-900']">{{
                            ticket.requester?.email || '---'
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Tickets</span>
                        <span :class="escDark ? 'text-neutral-200' : 'text-gray-900'">{{
                            ticket.requester_ticket_count ?? '---'
                        }}</span>
                    </div>
                </div>
            </ContextPanelSection>

            <ContextPanelSection
                title="Related Tickets"
                icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                :default-open="false"
            >
                <div v-if="ticket.related_tickets?.length" class="space-y-2">
                    <div
                        v-for="rt in ticket.related_tickets"
                        :key="rt.reference"
                        :class="[
                            'rounded-lg border px-3 py-2',
                            escDark ? 'border-white/[0.06] bg-neutral-950' : 'border-gray-200 bg-gray-50',
                        ]"
                    >
                        <span :class="['font-mono text-xs', escDark ? 'text-cyan-400' : 'text-blue-600']">{{
                            rt.reference
                        }}</span>
                        <p :class="['mt-0.5 truncate text-xs', escDark ? 'text-neutral-400' : 'text-gray-500']">
                            {{ rt.subject }}
                        </p>
                    </div>
                </div>
                <p v-else :class="['text-xs', escDark ? 'text-neutral-600' : 'text-gray-400']">
                    No related tickets found.
                </p>
            </ContextPanelSection>

            <ContextPanelSection
                title="Recent Activity"
                icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                :default-open="false"
            >
                <div v-if="ticket.activities?.length" class="space-y-2">
                    <div v-for="activity in ticket.activities.slice(0, 5)" :key="activity.id" class="text-xs">
                        <span :class="escDark ? 'text-neutral-500' : 'text-gray-600'">{{ activity.description }}</span>
                        <span :class="['ml-1', escDark ? 'text-neutral-600' : 'text-gray-400']">{{
                            activity.created_at_human
                        }}</span>
                    </div>
                </div>
                <p v-else :class="['text-xs', escDark ? 'text-neutral-600' : 'text-gray-400']">No recent activity.</p>
            </ContextPanelSection>

            <!-- Plugin: context panel slot -->
            <PluginSlot
                slot="ticket.show.context-panel"
                :components="getPageComponents('ticket.show', 'context-panel')"
            />
        </ContextPanel>

        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="detail" />
    </EscalatedLayout>
</template>
