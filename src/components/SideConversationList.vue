<script setup>
import { ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import SideConversation from './SideConversation.vue';

const props = defineProps({
    ticketReference: { type: String, required: true },
});

const conversations = ref([]);
const expanded = ref(true);
const showNew = ref(false);
const newSubject = ref('');
const newChannel = ref('internal');
const newBody = ref('');
const creating = ref(false);

onMounted(() => {
    fetchConversations();
});

async function fetchConversations() {
    try {
        const response = await fetch(route('escalated.admin.tickets.side-conversations.index', props.ticketReference), {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            conversations.value = data.conversations || [];
        }
    } catch {
        // silently ignore
    }
}

function createConversation() {
    if (!newSubject.value.trim() || !newBody.value.trim() || creating.value) return;
    creating.value = true;

    router.post(
        route('escalated.admin.tickets.side-conversations.store', props.ticketReference),
        {
            subject: newSubject.value,
            channel: newChannel.value,
            body: newBody.value,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                newSubject.value = '';
                newBody.value = '';
                newChannel.value = 'internal';
                showNew.value = false;
                fetchConversations();
            },
            onFinish: () => {
                creating.value = false;
            },
        },
    );
}
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4">
        <button
            class="flex w-full items-center justify-between text-sm font-semibold text-neutral-200"
            @click="expanded = !expanded"
        >
            <span>Side Conversations ({{ conversations.length }})</span>
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
            <SideConversation
                v-for="conv in conversations"
                :key="conv.id"
                :conversation="conv"
                :ticket-reference="ticketReference"
                @updated="fetchConversations"
            />

            <div v-if="!conversations.length && !showNew" class="text-xs text-neutral-500">No side conversations.</div>

            <!-- New conversation form -->
            <div v-if="showNew" class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                <input
                    v-model="newSubject"
                    type="text"
                    placeholder="Subject..."
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <select
                    v-model="newChannel"
                    class="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none"
                >
                    <option value="internal">Internal</option>
                    <option value="email">Email</option>
                </select>
                <textarea
                    v-model="newBody"
                    rows="3"
                    placeholder="Write the first message..."
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                ></textarea>
                <div class="flex gap-2">
                    <button
                        :disabled="!newSubject.trim() || !newBody.trim() || creating"
                        :class="[
                            'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-cyan-400 hover:to-violet-400',
                            (!newSubject.trim() || !newBody.trim() || creating) && 'cursor-not-allowed opacity-40',
                        ]"
                        @click="createConversation"
                    >
                        Create
                    </button>
                    <button
                        class="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-300"
                        @click="showNew = false"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <button
                v-if="!showNew"
                class="w-full rounded-lg border border-dashed border-white/[0.08] py-2 text-xs text-neutral-400 transition-colors hover:border-white/[0.15] hover:text-neutral-300"
                @click="showNew = true"
            >
                + New Side Conversation
            </button>
        </div>
    </div>
</template>
