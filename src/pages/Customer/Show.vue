<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatusBadge from '../../components/StatusBadge.vue';
import PriorityBadge from '../../components/PriorityBadge.vue';
import ReplyThread from '../../components/ReplyThread.vue';
import ReplyComposer from '../../components/ReplyComposer.vue';
import AttachmentList from '../../components/AttachmentList.vue';
import { router, usePage } from '@inertiajs/vue3';

const props = defineProps({ ticket: Object });
const page = usePage();

function closeTicket() {
    router.post(route('escalated.customer.tickets.close', props.ticket.reference));
}

function reopenTicket() {
    router.post(route('escalated.customer.tickets.reopen', props.ticket.reference));
}
</script>

<template>
    <EscalatedLayout :title="ticket.subject">
        <div class="mb-4 flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium text-gray-500">{{ ticket.reference }}</span>
            <StatusBadge :status="ticket.status" />
            <PriorityBadge :priority="ticket.priority" />
            <span v-if="ticket.department" class="text-sm text-gray-500">{{ ticket.department.name }}</span>
            <div class="ml-auto flex gap-2">
                <button v-if="ticket.status === 'resolved' || ticket.status === 'closed'"
                        @click="reopenTicket"
                        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    Reopen
                </button>
                <button v-if="ticket.status !== 'closed' && ticket.status !== 'resolved'"
                        @click="closeTicket"
                        class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                    Close Ticket
                </button>
            </div>
        </div>
        <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <p class="whitespace-pre-wrap text-sm text-gray-700">{{ ticket.description }}</p>
            <AttachmentList v-if="ticket.attachments?.length" :attachments="ticket.attachments" class="mt-3" />
        </div>
        <div class="mb-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Replies</h2>
            <ReplyThread :replies="ticket.replies || []" :current-user-id="page.props.auth?.user?.id" />
        </div>
        <div v-if="ticket.status !== 'closed'" class="rounded-lg border border-gray-200 bg-white p-4">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Reply</h2>
            <ReplyComposer :action="route('escalated.customer.tickets.reply', ticket.reference)" />
        </div>
    </EscalatedLayout>
</template>
