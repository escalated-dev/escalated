<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import StatusBadge from '../../components/StatusBadge.vue';
import PriorityBadge from '../../components/PriorityBadge.vue';
import ReplyThread from '../../components/ReplyThread.vue';
import AttachmentList from '../../components/AttachmentList.vue';
import SatisfactionRating from '../../components/SatisfactionRating.vue';
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({ ticket: Object, token: String });

const isResolved = ['resolved', 'closed'].includes(props.ticket.status);

const replyForm = useForm({ body: '', attachments: [] });
const showCopied = ref(false);

function submitReply() {
    replyForm.post(route('escalated.guest.tickets.reply', props.token), {
        onSuccess: () => replyForm.reset(),
    });
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    showCopied.value = true;
    setTimeout(() => showCopied.value = false, 2000);
}
</script>

<template>
    <EscalatedLayout :title="ticket.subject">
        <div class="mx-auto max-w-3xl">
            <!-- Bookmark notice -->
            <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <div class="flex items-start gap-3">
                    <svg class="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    <div>
                        <p class="text-sm font-medium text-amber-800">Bookmark this page</p>
                        <p class="mt-0.5 text-xs text-amber-600">This is your private link to view and reply to this ticket.</p>
                    </div>
                    <button @click="copyLink"
                            class="ml-auto shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">
                        {{ showCopied ? 'Copied!' : 'Copy Link' }}
                    </button>
                </div>
            </div>

            <!-- Ticket header -->
            <div class="mb-4 flex flex-wrap items-center gap-3">
                <span class="font-mono text-sm text-gray-500">{{ ticket.reference }}</span>
                <StatusBadge :status="ticket.status" />
                <PriorityBadge :priority="ticket.priority" />
                <span v-if="ticket.department" class="text-sm text-gray-500">{{ ticket.department.name }}</span>
            </div>

            <!-- CSAT Rating -->
            <SatisfactionRating v-if="isResolved && !ticket.satisfaction_rating"
                                :action="route('escalated.guest.tickets.rate', token)" />

            <!-- Description -->
            <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <p class="whitespace-pre-wrap text-sm text-gray-700">{{ ticket.description }}</p>
                <AttachmentList v-if="ticket.attachments?.length" :attachments="ticket.attachments" class="mt-3" />
            </div>

            <!-- Replies -->
            <div class="mb-6">
                <h2 class="mb-4 text-lg font-semibold text-gray-900">Replies</h2>
                <ReplyThread :replies="ticket.replies || []" />
            </div>

            <!-- Reply form -->
            <div v-if="ticket.status !== 'closed'" class="rounded-lg border border-gray-200 bg-white p-4">
                <h2 class="mb-4 text-lg font-semibold text-gray-900">Reply</h2>
                <form @submit.prevent="submitReply">
                    <textarea v-model="replyForm.body" rows="4" required placeholder="Write your reply..."
                              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    <div v-if="replyForm.errors.body" class="mt-1 text-sm text-red-600">{{ replyForm.errors.body }}</div>
                    <div class="mt-3 flex justify-end">
                        <button type="submit" :disabled="replyForm.processing"
                                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            {{ replyForm.processing ? 'Sending...' : 'Send Reply' }}
                        </button>
                    </div>
                </form>
            </div>
            <div v-else class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                This ticket is closed. No further replies can be added.
            </div>
        </div>
    </EscalatedLayout>
</template>
