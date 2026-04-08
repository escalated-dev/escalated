<script setup>
import { ref, inject, computed } from 'vue';
import { router } from '@inertiajs/vue3';
import AttachmentList from './AttachmentList.vue';
import TicketSplitDialog from './TicketSplitDialog.vue';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    replies: { type: Array, required: true },
    currentUserId: { type: [Number, String], default: null },
    ticketReference: { type: String, default: '' },
    routePrefix: { type: String, default: '' },
    pinnable: { type: Boolean, default: false },
    splittable: { type: Boolean, default: false },
});

const splitReply = ref(null);

function openSplitDialog(reply) {
    splitReply.value = reply;
}

function closeSplitDialog() {
    splitReply.value = null;
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const { t } = useI18n();

function formatDate(date) {
    return new Date(date).toLocaleString();
}

function togglePin(reply) {
    if (!props.routePrefix || !props.ticketReference) return;
    router.post(
        route(`${props.routePrefix}.tickets.pin`, [props.ticketReference, reply.id]),
        {},
        { preserveScroll: true },
    );
}
</script>

<template>
    <div class="space-y-4" role="feed" aria-label="Reply thread">
        <div
            v-for="reply in replies"
            :key="reply.id"
            :class="[
                'rounded-xl border p-4',
                escDark
                    ? reply.is_internal_note
                        ? 'border-amber-500/20 bg-amber-500/5'
                        : 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]'
                    : reply.is_internal_note
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-white',
            ]"
        >
            <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span
                        :class="['font-medium', escDark ? 'text-[var(--esc-panel-text-secondary)]' : 'text-gray-900']"
                        >{{ reply.author?.name || t('ticket.unknown') }}</span
                    >
                    <span
                        v-if="reply.is_internal_note"
                        :class="[
                            'rounded px-1.5 py-0.5 text-xs font-medium',
                            escDark ? 'bg-amber-500/15 text-amber-400' : 'bg-yellow-200 text-yellow-800',
                        ]"
                    >
                        {{ t('reply.internal_note') }}
                    </span>
                    <span
                        v-if="reply.is_pinned"
                        :class="[
                            'rounded px-1.5 py-0.5 text-xs font-medium',
                            escDark ? 'bg-cyan-500/15 text-cyan-400' : 'bg-blue-100 text-blue-700',
                        ]"
                    >
                        {{ t('reply.pinned') }}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        v-if="splittable && !reply.is_internal_note"
                        :class="[
                            'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                            escDark
                                ? 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
                        ]"
                        @click="openSplitDialog(reply)"
                    >
                        {{ t('reply.split') }}
                    </button>
                    <button
                        v-if="pinnable && reply.is_internal_note"
                        :class="[
                            'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                            escDark
                                ? reply.is_pinned
                                    ? 'bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25'
                                    : 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]'
                                : reply.is_pinned
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
                        ]"
                        @click="togglePin(reply)"
                    >
                        {{ reply.is_pinned ? t('reply.unpin') : t('reply.pin') }}
                    </button>
                    <span :class="['text-xs', escDark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500']">{{
                        formatDate(reply.created_at)
                    }}</span>
                </div>
            </div>
            <div
                :class="[
                    'prose prose-sm max-w-none',
                    escDark ? 'prose-invert text-[var(--esc-panel-text-secondary)]' : 'text-gray-700',
                ]"
                v-html="sanitizeHtml(reply.body)"
            ></div>
            <AttachmentList v-if="reply.attachments?.length" :attachments="reply.attachments" class="mt-3" />
        </div>
        <div
            v-if="!replies?.length"
            :class="['py-8 text-center text-sm', escDark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500']"
        >
            {{ t('ticket.no_replies') }}
        </div>
        <TicketSplitDialog
            v-if="splitReply"
            :ticket-reference="ticketReference"
            :reply-id="splitReply.id"
            :reply-author="splitReply.author?.name || ''"
            :reply-excerpt="stripHtml(splitReply.body)"
            @close="closeSplitDialog"
        />
    </div>
</template>
