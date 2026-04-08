<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    ticketReference: { type: String, required: true },
    replyId: { type: [Number, String], required: true },
    replyAuthor: { type: String, default: '' },
    replyExcerpt: { type: String, default: '' },
});

const emit = defineEmits(['close']);

const subject = ref('');
const splitting = ref(false);

function confirmSplit() {
    if (splitting.value) return;
    splitting.value = true;

    const payload = { reply_id: props.replyId };
    if (subject.value.trim()) {
        payload.subject = subject.value.trim();
    }

    router.post(route('escalated.admin.tickets.split', props.ticketReference), payload, {
        onFinish: () => {
            splitting.value = false;
        },
        onError: () => {
            splitting.value = false;
        },
    });
}
</script>

<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            @click.self="emit('close')"
        >
            <div class="w-full max-w-lg rounded-xl border border-white/[0.06] bg-neutral-900 p-6 shadow-2xl">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-neutral-200">Split to New Ticket</h3>
                    <button class="text-neutral-500 hover:text-neutral-300" @click="emit('close')">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p class="mb-4 text-sm text-neutral-400">
                    This will create a new ticket from the selected reply
                    <span v-if="replyAuthor" class="text-neutral-300">by {{ replyAuthor }}</span
                    >. The new ticket will be linked to
                    <span class="font-mono text-neutral-300">{{ ticketReference }}</span
                    >.
                </p>

                <!-- Reply excerpt preview -->
                <div v-if="replyExcerpt" class="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Reply content</p>
                    <p class="mt-1 line-clamp-3 text-sm text-neutral-300">{{ replyExcerpt }}</p>
                </div>

                <label class="mb-1 block text-sm font-medium text-neutral-400">
                    Subject <span class="text-neutral-600">(optional override)</span>
                </label>
                <input
                    v-model="subject"
                    type="text"
                    placeholder="Leave empty to auto-generate from source ticket"
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />

                <div class="mt-5 flex justify-end gap-3">
                    <button
                        class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
                        @click="emit('close')"
                    >
                        Cancel
                    </button>
                    <button
                        :disabled="splitting"
                        :class="[
                            'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400',
                            splitting && 'cursor-not-allowed opacity-40',
                        ]"
                        @click="confirmSplit"
                    >
                        {{ splitting ? 'Splitting...' : 'Split to New Ticket' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
