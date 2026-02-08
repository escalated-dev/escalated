<script setup>
defineProps({
    attachments: { type: Array, required: true },
});

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function iconForMime(mime) {
    if (mime?.startsWith('image/')) return '🖼️';
    if (mime?.startsWith('video/')) return '🎬';
    if (mime === 'application/pdf') return '📄';
    return '📎';
}
</script>

<template>
    <div class="space-y-1">
        <div v-for="attachment in attachments" :key="attachment.id"
             class="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span>{{ iconForMime(attachment.mime_type) }}</span>
            <a :href="attachment.url" target="_blank" class="flex-1 truncate font-medium text-blue-600 hover:underline">
                {{ attachment.original_filename }}
            </a>
            <span class="text-xs text-gray-400">{{ formatSize(attachment.size) }}</span>
        </div>
    </div>
</template>
