<script setup>
import { inject, computed } from 'vue';
import AttachmentList from './AttachmentList.vue';

defineProps({
    replies: { type: Array, required: true },
    currentUserId: { type: [Number, String], default: null },
});

const escDark = inject('esc-dark', computed(() => false));

function formatDate(date) {
    return new Date(date).toLocaleString();
}
</script>

<template>
    <div class="space-y-4">
        <div v-for="reply in replies" :key="reply.id"
             :class="['rounded-xl border p-4', escDark.value
                 ? (reply.is_internal_note ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/[0.06] bg-gray-900/60')
                 : (reply.is_internal_note ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white')]">
            <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span :class="['font-medium', escDark.value ? 'text-gray-200' : 'text-gray-900']">{{ reply.author?.name || 'Unknown' }}</span>
                    <span v-if="reply.is_internal_note"
                          :class="['rounded px-1.5 py-0.5 text-xs font-medium', escDark.value ? 'bg-amber-500/15 text-amber-400' : 'bg-yellow-200 text-yellow-800']">
                        Internal Note
                    </span>
                </div>
                <span :class="['text-xs', escDark.value ? 'text-gray-500' : 'text-gray-500']">{{ formatDate(reply.created_at) }}</span>
            </div>
            <div :class="['prose prose-sm max-w-none', escDark.value ? 'prose-invert text-gray-300' : 'text-gray-700']" v-html="reply.body"></div>
            <AttachmentList v-if="reply.attachments?.length" :attachments="reply.attachments" class="mt-3" />
        </div>
        <div v-if="!replies?.length" :class="['py-8 text-center text-sm', escDark.value ? 'text-gray-500' : 'text-gray-500']">No replies yet.</div>
    </div>
</template>
