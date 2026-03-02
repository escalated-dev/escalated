<script setup>
import { computed, inject } from 'vue';

defineProps({
    attachments: { type: Array, required: true },
});

const dark = inject(
    'esc-dark',
    computed(() => false),
);

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
        <div
            v-for="attachment in attachments"
            :key="attachment.id"
            :class="[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                dark ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]' : 'border-gray-200 bg-gray-50',
            ]"
        >
            <span>{{ iconForMime(attachment.mime_type) }}</span>
            <a
                :href="attachment.url"
                target="_blank"
                :class="[
                    'flex-1 truncate font-medium hover:underline',
                    dark ? 'text-[var(--esc-panel-text)]' : 'text-blue-600',
                ]"
            >
                {{ attachment.original_filename }}
            </a>
            <span :class="['text-xs', dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-400']">{{
                formatSize(attachment.size)
            }}</span>
        </div>
    </div>
</template>
