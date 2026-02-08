<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatusBadge from '../../components/StatusBadge.vue';
import PriorityBadge from '../../components/PriorityBadge.vue';
import ReplyThread from '../../components/ReplyThread.vue';
import ReplyComposer from '../../components/ReplyComposer.vue';
import TicketSidebar from '../../components/TicketSidebar.vue';
import AttachmentList from '../../components/AttachmentList.vue';
import { router, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    ticket: Object,
    departments: Array,
    tags: Array,
    cannedResponses: Array,
});

const page = usePage();
const activeTab = ref('reply');

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
</script>

<template>
    <EscalatedLayout :title="ticket.subject">
        <div class="mb-4 flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium text-gray-500">{{ ticket.reference }}</span>
            <StatusBadge :status="ticket.status" />
            <PriorityBadge :priority="ticket.priority" />
            <span class="text-sm text-gray-500">by {{ ticket.requester?.name }}</span>
            <div class="ml-auto flex gap-2">
                <button v-if="!ticket.assigned_to" @click="assignToMe"
                        class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
                    Assign to Me
                </button>
                <select @change="changeStatus($event.target.value); $event.target.value = ''"
                        class="rounded-lg border-gray-300 text-sm">
                    <option value="">Change Status...</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_on_customer">Waiting on Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <select @change="changePriority($event.target.value); $event.target.value = ''"
                        class="rounded-lg border-gray-300 text-sm">
                    <option value="">Change Priority...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2 space-y-6">
                <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <p class="whitespace-pre-wrap text-sm text-gray-700">{{ ticket.description }}</p>
                    <AttachmentList v-if="ticket.attachments?.length" :attachments="ticket.attachments" class="mt-3" />
                </div>
                <div>
                    <div class="mb-4 flex gap-4 border-b border-gray-200">
                        <button @click="activeTab = 'reply'"
                                :class="['pb-2 text-sm font-medium', activeTab === 'reply' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500']">
                            Reply
                        </button>
                        <button @click="activeTab = 'note'"
                                :class="['pb-2 text-sm font-medium', activeTab === 'note' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500']">
                            Internal Note
                        </button>
                    </div>
                    <ReplyComposer v-if="activeTab === 'reply'"
                                   :action="route('escalated.agent.tickets.reply', ticket.reference)"
                                   :canned-responses="cannedResponses" />
                    <ReplyComposer v-else
                                   :action="route('escalated.agent.tickets.note', ticket.reference)"
                                   placeholder="Write an internal note..."
                                   submit-label="Add Note" />
                </div>
                <div>
                    <h2 class="mb-4 text-lg font-semibold text-gray-900">Conversation</h2>
                    <ReplyThread :replies="ticket.replies || []" :current-user-id="page.props.auth?.user?.id" />
                </div>
            </div>
            <div>
                <TicketSidebar :ticket="ticket" :tags="tags" :departments="departments" />
            </div>
        </div>
    </EscalatedLayout>
</template>
