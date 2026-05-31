<template>
    <div class="dynamic-filter-builder">
        <textarea
            class="dynamic-filter-builder__fallback"
            :value="JSON.stringify(modelValue, null, 2)"
            rows="10"
            spellcheck="false"
            @input="onInput"
        />
        <p class="dynamic-filter-builder__help">
            Edit the saved filter JSON. A visual builder is planned for a follow-up.
        </p>
        <div class="dynamic-filter-builder__count">{{ matchCount }} contacts match</div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: Object, required: true },
    matchCount: { type: Number, default: 0 },
});

const emit = defineEmits(['update:modelValue']);

function onInput(event) {
    try {
        emit('update:modelValue', JSON.parse(event.target.value));
    } catch {
        // Invalid JSON during typing — ignore until it parses cleanly.
    }
}
</script>

<style scoped>
.dynamic-filter-builder__fallback {
    width: 100%;
    font-family: ui-monospace, monospace;
    font-size: 13px;
    padding: 12px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
}
.dynamic-filter-builder__help {
    margin: 4px 0 0;
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
}
.dynamic-filter-builder__count {
    margin-top: 8px;
    color: var(--escalated-text-muted, #64748b);
    font-size: 13px;
}
</style>
