<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useChat } from '../composables/useChat';
import { timeAgo } from '../utils/formatting';

const props = defineProps({
    chats: { type: Array, default: () => [] },
    agentId: { type: [String, Number], default: null },
    agentStatus: { type: String, default: 'online' },
    navigateRoute: { type: String, default: '' },
});

const emit = defineEmits(['navigate', 'status-change']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const { t } = useI18n();

const isOpen = ref(false);
const currentStatus = ref(props.agentStatus);

const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-emerald-500' },
    { value: 'away', label: 'Away', color: 'bg-amber-500' },
    { value: 'offline', label: 'Offline', color: 'bg-neutral-500' },
];

const currentStatusOption = computed(
    () => statusOptions.find((s) => s.value === currentStatus.value) || statusOptions[0],
);

function changeStatus(status) {
    currentStatus.value = status;
    emit('status-change', status);
}

const totalUnread = computed(() => {
    return props.chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
});

// Activity state for each chat
const now = ref(Date.now());
let timerInterval = null;

onMounted(() => {
    timerInterval = setInterval(() => {
        now.value = Date.now();
    }, 10000);
});

onUnmounted(() => {
    clearInterval(timerInterval);
});

function chatActivityState(chat) {
    if (!chat.last_message_at) return 'new';
    const diffMs = now.value - new Date(chat.last_message_at).getTime();
    if (diffMs > 2 * 60 * 1000) return 'idle';
    return 'active';
}

function activityDotClass(chat) {
    const state = chatActivityState(chat);
    if (state === 'new') return 'bg-blue-500 animate-pulse';
    if (state === 'idle') return 'bg-amber-500';
    return 'bg-emerald-500';
}

function navigateToChat(chat) {
    emit('navigate', chat);
}

function truncate(str, len = 40) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
}

function chatInitials(chat) {
    const name = chat.customer_name || 'U';
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Real-time: listen for new chats assigned to this agent
const { subscribeToChatQueue } = useChat();

onMounted(() => {
    subscribeToChatQueue({
        onNewChat() {
            // Parent should refresh chat list
        },
    });
});
</script>

<template>
    <!-- Toggle button -->
    <button
        :class="[
            'fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all',
            escDark
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-400 hover:to-violet-400'
                : 'bg-blue-600 text-white hover:bg-blue-500',
        ]"
        :aria-label="isOpen ? t('chat.close_panel') : t('chat.open_panel')"
        @click="isOpen = !isOpen"
    >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
        </svg>
        <!-- Unread badge -->
        <span
            v-if="totalUnread > 0"
            class="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
        >
            {{ totalUnread > 99 ? '99+' : totalUnread }}
        </span>
    </button>

    <!-- Panel -->
    <div
        v-if="isOpen"
        :class="[
            'fixed right-4 bottom-36 z-40 w-80 rounded-xl border shadow-2xl',
            escDark ? 'border-white/[0.08] bg-neutral-900' : 'border-gray-200 bg-white',
        ]"
        style="max-height: calc(100vh - 200px)"
    >
        <!-- Header -->
        <div
            :class="[
                'flex items-center justify-between border-b px-4 py-3',
                escDark ? 'border-white/[0.06]' : 'border-gray-200',
            ]"
        >
            <div class="flex items-center gap-2">
                <h3 :class="['text-sm font-semibold', escDark ? 'text-white' : 'text-gray-900']">
                    {{ t('chat.active_chats') }}
                </h3>
                <span
                    v-if="chats.length"
                    :class="[
                        'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        escDark ? 'bg-white/[0.06] text-neutral-400' : 'bg-gray-100 text-gray-500',
                    ]"
                >
                    {{ chats.length }}
                </span>
            </div>
            <!-- Status dropdown -->
            <div class="relative">
                <button
                    :class="[
                        'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
                        escDark ? 'hover:bg-white/[0.06] text-neutral-400' : 'hover:bg-gray-100 text-gray-500',
                    ]"
                    @click="
                        const idx = statusOptions.findIndex((s) => s.value === currentStatus);
                        changeStatus(statusOptions[(idx + 1) % statusOptions.length].value);
                    "
                >
                    <span :class="['h-2 w-2 rounded-full', currentStatusOption.color]"></span>
                    {{ currentStatusOption.label }}
                </button>
            </div>
        </div>

        <!-- Chat list -->
        <div class="overflow-y-auto" style="max-height: 400px">
            <div
                v-if="!chats.length"
                :class="['p-6 text-center text-sm', escDark ? 'text-neutral-600' : 'text-gray-400']"
            >
                {{ t('chat.no_active_chats') }}
            </div>
            <button
                v-for="chat in chats"
                :key="chat.id"
                :class="[
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                    escDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50',
                ]"
                @click="navigateToChat(chat)"
            >
                <!-- Avatar with status dot -->
                <div class="relative flex-shrink-0">
                    <div
                        :class="[
                            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                            escDark ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-200 text-gray-600',
                        ]"
                    >
                        {{ chatInitials(chat) }}
                    </div>
                    <span
                        :class="[
                            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2',
                            escDark ? 'border-neutral-900' : 'border-white',
                            activityDotClass(chat),
                        ]"
                    ></span>
                </div>

                <!-- Chat info -->
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                        <span :class="['truncate text-sm font-medium', escDark ? 'text-neutral-200' : 'text-gray-900']">
                            {{ chat.customer_name || t('ticket.unknown') }}
                        </span>
                        <span :class="['flex-shrink-0 text-[10px]', escDark ? 'text-neutral-600' : 'text-gray-400']">
                            {{ chat.last_message_at ? timeAgo(chat.last_message_at) : '' }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span :class="['truncate text-xs', escDark ? 'text-neutral-500' : 'text-gray-500']">
                            {{ truncate(chat.last_message) }}
                        </span>
                        <span
                            v-if="chat.unread_count"
                            class="ml-2 flex h-4 min-w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-white"
                        >
                            {{ chat.unread_count }}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    </div>
</template>
