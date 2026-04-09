<script setup>
import { computed, inject } from 'vue';
import { timeAgo } from '../utils/formatting';
import { highlightMentions } from '../utils/mentionHighlight';

const props = defineProps({
    message: { type: Object, required: true },
    isAgent: { type: Boolean, default: false },
    showAvatar: { type: Boolean, default: true },
    showTimestamp: { type: Boolean, default: false },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const initials = computed(() => {
    const name = props.message.author?.name || 'U';
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
});

const formattedTime = computed(() => {
    if (!props.message.created_at) return '';
    const date = new Date(props.message.created_at);
    const diffMs = Date.now() - date.getTime();
    // If less than 24h, show relative; otherwise show absolute
    if (diffMs < 86400000) {
        return timeAgo(props.message.created_at);
    }
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
});

const isInternalNote = computed(() => props.message.is_internal_note);
</script>

<template>
    <div
        :class="[
            'flex gap-2',
            isAgent ? 'flex-row-reverse' : 'flex-row',
            !showAvatar && isAgent ? 'pr-10' : '',
            !showAvatar && !isAgent ? 'pl-10' : '',
        ]"
        :data-message-id="message.id"
    >
        <!-- Avatar -->
        <div v-if="showAvatar" class="flex-shrink-0">
            <div v-if="message.author?.avatar" class="h-8 w-8 overflow-hidden rounded-full">
                <img :src="message.author.avatar" :alt="message.author.name" class="h-full w-full object-cover" />
            </div>
            <div
                v-else
                :class="[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                    isAgent
                        ? escDark
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-blue-100 text-blue-700'
                        : escDark
                          ? 'bg-neutral-700 text-neutral-300'
                          : 'bg-gray-200 text-gray-600',
                ]"
            >
                {{ initials }}
            </div>
        </div>

        <!-- Bubble -->
        <div class="max-w-[75%]">
            <div
                :class="[
                    'rounded-2xl px-4 py-2 text-sm',
                    isInternalNote
                        ? escDark
                            ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20'
                            : 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200'
                        : isAgent
                          ? escDark
                              ? 'bg-cyan-500/15 text-neutral-200'
                              : 'bg-blue-600 text-white'
                          : escDark
                            ? 'bg-neutral-800 text-neutral-200'
                            : 'bg-gray-100 text-gray-900',
                ]"
            >
                <span v-if="isInternalNote" class="mb-1 block text-[10px] font-semibold uppercase opacity-70">
                    Internal Note
                </span>
                <p class="whitespace-pre-wrap break-words" v-html="highlightMentions(message.body || '', escDark)"></p>

                <!-- Attachments -->
                <div v-if="message.attachments?.length" class="mt-2 space-y-1">
                    <a
                        v-for="att in message.attachments"
                        :key="att.id || att.url"
                        :href="att.url"
                        target="_blank"
                        rel="noopener"
                        :class="[
                            'flex items-center gap-1 text-xs underline',
                            isAgent && !isInternalNote
                                ? escDark
                                    ? 'text-cyan-300'
                                    : 'text-blue-200'
                                : escDark
                                  ? 'text-cyan-400'
                                  : 'text-blue-600',
                        ]"
                    >
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                            />
                        </svg>
                        {{ att.name || 'Attachment' }}
                    </a>
                </div>
            </div>

            <!-- Timestamp -->
            <div
                v-if="showTimestamp"
                :class="[
                    'mt-1 text-[10px]',
                    isAgent ? 'text-right' : 'text-left',
                    escDark ? 'text-neutral-600' : 'text-gray-400',
                ]"
            >
                {{ formattedTime }}
            </div>
        </div>
    </div>
</template>
