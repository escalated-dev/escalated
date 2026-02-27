<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    conversation: { type: Object, required: true },
    ticketReference: { type: String, required: true },
});

const emit = defineEmits(['updated']);
const replyBody = ref('');
const submitting = ref(false);
const expanded = ref(false);

function submitReply() {
    if (!replyBody.value.trim() || submitting.value) return;
    submitting.value = true;

    router.post(
        route('escalated.admin.tickets.side-conversations.reply', [props.ticketReference, props.conversation.id]),
        { body: replyBody.value },
        {
            preserveScroll: true,
            onSuccess: () => {
                replyBody.value = '';
                emit('updated');
            },
            onFinish: () => {
                submitting.value = false;
            },
        },
    );
}

function closeConversation() {
    router.post(
        route('escalated.admin.tickets.side-conversations.close', [props.ticketReference, props.conversation.id]),
        {},
        {
            preserveScroll: true,
            onSuccess: () => emit('updated'),
        },
    );
}
</script>

<template>
    <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <button class="flex w-full items-center justify-between" @click="expanded = !expanded">
            <div class="flex items-center gap-2">
                <span
                    :class="[
                        'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase',
                        conversation.status === 'open'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-neutral-500/15 text-neutral-400',
                    ]"
                >
                    {{ conversation.status }}
                </span>
                <span class="text-sm font-medium text-neutral-200">{{ conversation.subject }}</span>
                <span class="text-xs text-neutral-500">{{ conversation.channel }}</span>
            </div>
            <svg
                :class="['h-4 w-4 text-neutral-500 transition-transform', expanded && 'rotate-180']"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <div v-if="expanded" class="mt-3 space-y-3">
            <!-- Replies -->
            <div v-for="reply in conversation.replies" :key="reply.id" class="border-l-2 border-white/[0.06] pl-3">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-neutral-300">{{ reply.author?.name || 'System' }}</span>
                    <span class="text-xs text-neutral-500">{{ reply.created_at }}</span>
                </div>
                <p class="mt-1 whitespace-pre-wrap text-sm text-neutral-400">{{ reply.body }}</p>
            </div>

            <div v-if="!conversation.replies?.length" class="text-xs text-neutral-500">No replies yet.</div>

            <!-- Reply form -->
            <div v-if="conversation.status === 'open'" class="pt-2">
                <textarea
                    v-model="replyBody"
                    rows="2"
                    placeholder="Write a reply..."
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                ></textarea>
                <div class="mt-2 flex items-center gap-2">
                    <button
                        :disabled="!replyBody.trim() || submitting"
                        :class="[
                            'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-cyan-400 hover:to-violet-400',
                            (!replyBody.trim() || submitting) && 'cursor-not-allowed opacity-40',
                        ]"
                        @click="submitReply"
                    >
                        Reply
                    </button>
                    <button
                        class="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-300"
                        @click="closeConversation"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
