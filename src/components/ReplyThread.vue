<script setup>
import AttachmentList from './AttachmentList.vue';

defineProps({
    replies: { type: Array, required: true },
    currentUserId: { type: [Number, String], default: null },
});

function formatDate(date) {
    return new Date(date).toLocaleString();
}
</script>

<template>
    <div class="space-y-4">
        <div v-for="reply in replies" :key="reply.id"
             :class="['rounded-lg border p-4', reply.is_internal_note ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white']">
            <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ reply.author?.name || 'Unknown' }}</span>
                    <span v-if="reply.is_internal_note" class="rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-medium text-yellow-800">Internal Note</span>
                </div>
                <span class="text-xs text-gray-500">{{ formatDate(reply.created_at) }}</span>
            </div>
            <div class="prose prose-sm max-w-none text-gray-700" v-html="reply.body"></div>
            <AttachmentList v-if="reply.attachments?.length" :attachments="reply.attachments" class="mt-3" />
        </div>
        <div v-if="!replies?.length" class="py-8 text-center text-sm text-gray-500">No replies yet.</div>
    </div>
</template>
