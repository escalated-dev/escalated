<template>
    <div class="preview-iframe">
        <div v-if="loading" class="preview-iframe__loading">Rendering preview…</div>
        <iframe :srcdoc="html" sandbox="allow-same-origin" class="preview-iframe__frame" title="Newsletter preview" />
    </div>
</template>

<script setup>
defineProps({
    html: { type: String, default: '' },
    loading: { type: Boolean, default: false },
});
</script>

<style scoped>
.preview-iframe {
    position: relative;
    height: 100%;
    min-height: 480px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
    overflow: hidden;
    background: white;
}
.preview-iframe__frame {
    width: 100%;
    height: 100%;
    border: 0;
}
.preview-iframe__loading {
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 12px;
    color: var(--escalated-text-muted, #64748b);
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 4px;
}
</style>
