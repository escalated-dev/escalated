<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import StatusBadge from '../../../components/StatusBadge.vue';
import PriorityBadge from '../../../components/PriorityBadge.vue';
import ReplyThread from '../../../components/ReplyThread.vue';
import ReplyComposer from '../../../components/ReplyComposer.vue';
import TicketSidebar from '../../../components/TicketSidebar.vue';
import AttachmentList from '../../../components/AttachmentList.vue';
import MacroDropdown from '../../../components/MacroDropdown.vue';
import FollowButton from '../../../components/FollowButton.vue';
import PresenceIndicator from '../../../components/PresenceIndicator.vue';
import PinnedNotes from '../../../components/PinnedNotes.vue';
import KeyboardShortcutHelp from '../../../components/KeyboardShortcutHelp.vue';
import PluginSlot from '../../../components/PluginSlot.vue';
import SnoozeButton from '../../../components/SnoozeButton.vue';
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts';
import { usePluginExtensions } from '../../../composables/usePluginExtensions';
import { router, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    ticket: Object,
    departments: Array,
    tags: Array,
    cannedResponses: Array,
    agents: Array,
    macros: { type: Array, default: () => [] },
    is_following: { type: Boolean, default: false },
    followers_count: { type: Number, default: 0 },
    is_snoozed: { type: Boolean, default: false },
});

const page = usePage();
const activeTab = ref('reply');
const showShortcutHelp = ref(false);
const replyComposerRef = ref(null);
const statusSelectRef = ref(null);
const prioritySelectRef = ref(null);

const statusForm = useForm({ status: '' });
const priorityForm = useForm({ priority: '' });
const assignForm = useForm({ agent_id: '' });

function changeStatus(status) {
    statusForm.status = status;
    statusForm.post(route('escalated.admin.tickets.status', props.ticket.reference), { preserveScroll: true });
}

function changePriority(priority) {
    priorityForm.priority = priority;
    priorityForm.post(route('escalated.admin.tickets.priority', props.ticket.reference), { preserveScroll: true });
}

function assignToMe() {
    assignForm.agent_id = page.props.auth.user.id;
    assignForm.post(route('escalated.admin.tickets.assign', props.ticket.reference), { preserveScroll: true });
}

function toggleFollow() {
    router.post(route('escalated.admin.tickets.follow', props.ticket.reference), {}, { preserveScroll: true });
}

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

        <!-- Snoozed banner (visible only when ticket is snoozed) -->
        <div
            v-if="ticket.is_snoozed || (ticket.snoozed_until && new Date(ticket.snoozed_until) > new Date())"
            class="mb-4 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium border border-amber-500/20 bg-amber-500/10 text-amber-300"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"
                    clip-rule="evenodd"
                />
            </svg>
            <span
                >Snoozed until
                {{
                    new Date(ticket.snoozed_until).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    })
                }}</span
            >
        </div>

        <div class="mb-5 flex flex-wrap items-center gap-3">
            <span class="text-sm font-mono font-medium text-[var(--esc-panel-text)]">{{ ticket.reference }}</span>
            <StatusBadge :status="ticket.status" />
            <PriorityBadge :priority="ticket.priority" />
            <span class="text-sm text-[var(--esc-panel-text-muted)]">by {{ ticket.requester?.name }}</span>
            <PresenceIndicator :ticket-reference="ticket.reference" route-prefix="escalated.admin" />
            <div class="ml-auto flex items-center gap-2">
                <FollowButton
                    :is-following="is_following"
                    :followers-count="followers_count"
                    :action="route('escalated.admin.tickets.follow', ticket.reference)"
                />
                <MacroDropdown
                    v-if="macros.length"
                    :macros="macros"
                    :action="route('escalated.admin.tickets.macro', ticket.reference)"
                />
                <button
                    v-if="!ticket.assigned_to"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
                    @click="assignToMe"
                >
                    Assign to Me
                </button>
                <SnoozeButton :ticket="ticket" route-prefix="escalated.admin" />
                <select
                    ref="statusSelectRef"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
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
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
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
                    route-prefix="escalated.admin"
                />
                <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
                    <p class="whitespace-pre-wrap text-sm text-[var(--esc-panel-text-secondary)]">
                        {{ ticket.description }}
                    </p>
                    <AttachmentList v-if="ticket.attachments?.length" :attachments="ticket.attachments" class="mt-3" />
                </div>
                <div>
                    <div class="mb-4 flex gap-4 border-b border-[var(--esc-panel-border)]">
                        <button
                            :class="[
                                'pb-2 text-sm font-medium transition-colors',
                                activeTab === 'reply'
                                    ? 'border-b-2 border-[var(--esc-panel-accent)] text-[var(--esc-panel-text)]'
                                    : 'text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]',
                            ]"
                            @click="activeTab = 'reply'"
                        >
                            Reply
                        </button>
                        <button
                            :class="[
                                'pb-2 text-sm font-medium transition-colors',
                                activeTab === 'note'
                                    ? 'border-b-2 border-amber-500 text-amber-400'
                                    : 'text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]',
                            ]"
                            @click="activeTab = 'note'"
                        >
                            Internal Note
                        </button>
                    </div>
                    <ReplyComposer
                        v-if="activeTab === 'reply'"
                        ref="replyComposerRef"
                        :action="route('escalated.admin.tickets.reply', ticket.reference)"
                        :canned-responses="cannedResponses"
                    />
                    <ReplyComposer
                        v-else
                        :action="route('escalated.admin.tickets.note', ticket.reference)"
                        placeholder="Write an internal note..."
                        submit-label="Add Note"
                    />
                </div>
                <div>
                    <h2 class="mb-4 text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Conversation</h2>
                    <ReplyThread
                        :replies="ticket.replies || []"
                        :current-user-id="page.props.auth?.user?.id"
                        :ticket-reference="ticket.reference"
                        route-prefix="escalated.admin"
                        pinnable
                    />
                </div>
            </div>
            <div class="space-y-6">
                <TicketSidebar :ticket="ticket" :tags="tags" :departments="departments" />
                <!-- Plugin: ticket show sidebar slot -->
                <PluginSlot slot="ticket.show.sidebar" :components="getPageComponents('ticket.show', 'sidebar')" />
            </div>
        </div>
        <KeyboardShortcutHelp v-model:show="showShortcutHelp" context="detail" />
    </EscalatedLayout>
</template>
