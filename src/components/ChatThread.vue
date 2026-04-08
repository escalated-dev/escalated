<script setup>
import { ref, computed, inject, watch, nextTick, onMounted } from 'vue';
import ChatBubble from './ChatBubble.vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    messages: { type: Array, default: () => [] },
    typingUser: { type: String, default: null },
    currentUserId: { type: [Number, String], default: null },
});

const { t } = useI18n();
const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const threadContainer = ref(null);
const isScrolledUp = ref(false);
const hasNewMessages = ref(false);

// Determine if user is near bottom of scroll
function isNearBottom() {
    const el = threadContainer.value;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

function onScroll() {
    isScrolledUp.value = !isNearBottom();
    if (!isScrolledUp.value) {
        hasNewMessages.value = false;
    }
}

function scrollToBottom() {
    const el = threadContainer.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isScrolledUp.value = false;
    hasNewMessages.value = false;
}

// Auto-scroll on new messages
watch(
    () => props.messages.length,
    async () => {
        await nextTick();
        if (isNearBottom()) {
            scrollToBottom();
        } else {
            hasNewMessages.value = true;
        }
    },
);

onMounted(() => {
    nextTick(() => scrollToBottom());
});

/**
 * Determine whether to show avatar for a message:
 * Show on the first message of a consecutive group by the same author.
 */
function shouldShowAvatar(index) {
    if (index === 0) return true;
    const prev = props.messages[index - 1];
    const curr = props.messages[index];
    return prev.author?.id !== curr.author?.id;
}

/**
 * Determine whether to show a time separator between messages.
 * Show when there's a >5 minute gap.
 */
function shouldShowTimeSeparator(index) {
    if (index === 0) return true;
    const prev = props.messages[index - 1];
    const curr = props.messages[index];
    if (!prev.created_at || !curr.created_at) return false;
    const gap = new Date(curr.created_at) - new Date(prev.created_at);
    return gap > 5 * 60 * 1000;
}

/**
 * Show timestamp on the last message of a group or when there's a time gap.
 */
function shouldShowTimestamp(index) {
    if (index === props.messages.length - 1) return true;
    return shouldShowTimeSeparator(index + 1);
}

function formatTimeSeparator(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
        return 'Yesterday ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function isAgentMessage(message) {
    if (message.is_agent !== undefined) return message.is_agent;
    if (props.currentUserId && message.author?.id) {
        return String(message.author.id) === String(props.currentUserId);
    }
    return false;
}
</script>

<template>
    <div class="relative flex flex-col" style="min-height: 200px">
        <div
            ref="threadContainer"
            class="flex-1 space-y-1 overflow-y-auto p-4"
            style="max-height: 500px"
            @scroll="onScroll"
        >
            <!-- Empty state -->
            <div
                v-if="!messages.length"
                :class="['py-12 text-center text-sm', escDark ? 'text-neutral-600' : 'text-gray-400']"
            >
                {{ t('chat.empty_state') }}
            </div>

            <template v-for="(message, index) in messages" :key="message.id || index">
                <!-- Time separator -->
                <div
                    v-if="shouldShowTimeSeparator(index)"
                    :class="['flex items-center gap-3 py-2', escDark ? 'text-neutral-600' : 'text-gray-400']"
                >
                    <div :class="['flex-1 border-t', escDark ? 'border-neutral-800' : 'border-gray-200']"></div>
                    <span class="text-[10px] font-medium">
                        {{ formatTimeSeparator(message.created_at) }}
                    </span>
                    <div :class="['flex-1 border-t', escDark ? 'border-neutral-800' : 'border-gray-200']"></div>
                </div>

                <!-- Chat bubble -->
                <ChatBubble
                    :message="message"
                    :is-agent="isAgentMessage(message)"
                    :show-avatar="shouldShowAvatar(index)"
                    :show-timestamp="shouldShowTimestamp(index)"
                />
            </template>

            <!-- Typing indicator -->
            <div v-if="typingUser" class="flex items-center gap-2 pl-10 pt-1">
                <div
                    :class="[
                        'flex items-center gap-1 rounded-2xl px-4 py-2',
                        escDark ? 'bg-neutral-800' : 'bg-gray-100',
                    ]"
                >
                    <div class="flex gap-1">
                        <span
                            v-for="i in 3"
                            :key="i"
                            :class="[
                                'inline-block h-1.5 w-1.5 rounded-full animate-bounce',
                                escDark ? 'bg-neutral-500' : 'bg-gray-400',
                            ]"
                            :style="{ animationDelay: `${(i - 1) * 150}ms` }"
                        ></span>
                    </div>
                    <span :class="['ml-2 text-xs', escDark ? 'text-neutral-500' : 'text-gray-500']">
                        {{ t('chat.typing', { name: typingUser }) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- New messages pill -->
        <button
            v-if="hasNewMessages"
            :class="[
                'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-medium shadow-lg transition-all',
                escDark ? 'bg-cyan-500 text-white hover:bg-cyan-400' : 'bg-blue-600 text-white hover:bg-blue-500',
            ]"
            @click="scrollToBottom"
        >
            {{ t('chat.new_messages') }}
        </button>
    </div>
</template>
