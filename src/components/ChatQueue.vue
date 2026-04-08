<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useChat } from '../composables/useChat';

const props = defineProps({
    sessions: { type: Array, default: () => [] },
    acceptEndpoint: { type: String, default: '' },
});

const emit = defineEmits(['accept', 'refresh']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const { t } = useI18n();

// Live elapsed timers
const now = ref(Date.now());
let timerInterval = null;

onMounted(() => {
    timerInterval = setInterval(() => {
        now.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timerInterval);
});

function waitTime(createdAt) {
    if (!createdAt) return '0s';
    const diffMs = now.value - new Date(createdAt).getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    if (totalSecs < 60) return `${totalSecs}s`;
    const mins = Math.floor(totalSecs / 60);
    if (mins < 60) return `${mins}m ${totalSecs % 60}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
}

const sortedSessions = computed(() => {
    return [...props.sessions].sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
    });
});

async function acceptChat(session) {
    emit('accept', session);
    if (props.acceptEndpoint) {
        try {
            await fetch(props.acceptEndpoint.replace(':id', session.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });
        } catch {
            // handled by caller
        }
    }
}

// Subscribe to queue for real-time updates
const { subscribeToChatQueue } = useChat();

onMounted(() => {
    subscribeToChatQueue({
        onNewChat() {
            emit('refresh');
        },
        onChatAccepted() {
            emit('refresh');
        },
    });
});
</script>

<template>
    <div>
        <!-- Empty state -->
        <div
            v-if="!sortedSessions.length"
            :class="[
                'rounded-xl border p-8 text-center',
                escDark ? 'border-white/[0.06] bg-neutral-900/60' : 'border-gray-200 bg-white',
            ]"
        >
            <svg
                :class="['mx-auto mb-3 h-10 w-10', escDark ? 'text-neutral-700' : 'text-gray-300']"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
            </svg>
            <p :class="['text-sm', escDark ? 'text-neutral-600' : 'text-gray-400']">
                {{ t('chat.no_chats_waiting') }}
            </p>
        </div>

        <!-- Queue list -->
        <div
            v-else
            :class="[
                'overflow-hidden rounded-xl border',
                escDark ? 'border-white/[0.06] bg-neutral-900/60' : 'border-gray-200 bg-white',
            ]"
        >
            <table class="min-w-full">
                <thead>
                    <tr :class="escDark ? 'bg-white/[0.02]' : 'bg-gray-50'">
                        <th
                            :class="[
                                'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider',
                                escDark ? 'text-neutral-500' : 'text-gray-500',
                            ]"
                        >
                            {{ t('chat.customer') }}
                        </th>
                        <th
                            :class="[
                                'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider',
                                escDark ? 'text-neutral-500' : 'text-gray-500',
                            ]"
                        >
                            {{ t('chat.department') }}
                        </th>
                        <th
                            :class="[
                                'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider',
                                escDark ? 'text-neutral-500' : 'text-gray-500',
                            ]"
                        >
                            {{ t('chat.first_message') }}
                        </th>
                        <th
                            :class="[
                                'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider',
                                escDark ? 'text-neutral-500' : 'text-gray-500',
                            ]"
                        >
                            {{ t('chat.wait_time') }}
                        </th>
                        <th
                            :class="[
                                'px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider',
                                escDark ? 'text-neutral-500' : 'text-gray-500',
                            ]"
                        ></th>
                    </tr>
                </thead>
                <tbody :class="escDark ? 'divide-y divide-white/[0.04]' : 'divide-y divide-gray-100'">
                    <tr
                        v-for="session in sortedSessions"
                        :key="session.id"
                        :class="['transition-colors', escDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50']"
                    >
                        <td class="px-4 py-3">
                            <div :class="['text-sm font-medium', escDark ? 'text-neutral-200' : 'text-gray-900']">
                                {{ session.customer_name || t('ticket.unknown') }}
                            </div>
                            <div :class="['text-xs', escDark ? 'text-neutral-600' : 'text-gray-400']">
                                {{ session.customer_email || '' }}
                            </div>
                        </td>
                        <td :class="['px-4 py-3 text-sm', escDark ? 'text-neutral-400' : 'text-gray-500']">
                            {{ session.department?.name || '---' }}
                        </td>
                        <td
                            :class="[
                                'max-w-[200px] truncate px-4 py-3 text-sm',
                                escDark ? 'text-neutral-400' : 'text-gray-600',
                            ]"
                        >
                            {{ session.first_message || '...' }}
                        </td>
                        <td class="px-4 py-3">
                            <span
                                :class="[
                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    escDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700',
                                ]"
                            >
                                {{ waitTime(session.created_at) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <button
                                :class="[
                                    'rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-all',
                                    escDark
                                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400'
                                        : 'bg-blue-600 hover:bg-blue-500',
                                ]"
                                @click="acceptChat(session)"
                            >
                                {{ t('chat.accept') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
