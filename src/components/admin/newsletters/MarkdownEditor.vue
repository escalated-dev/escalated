<template>
    <div class="markdown-editor">
        <textarea
            ref="ta"
            :value="modelValue"
            :rows="rows"
            class="markdown-editor__textarea"
            :placeholder="placeholder"
            @input="$emit('update:modelValue', $event.target.value)"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    rows: { type: Number, default: 20 },
    placeholder: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const ta = ref(null);

function insertMergeField(path) {
    const el = ta.value;
    const token = `{{ ${path} }}`;
    if (!el) {
        emit('update:modelValue', `${props.modelValue}${token}`);
        return;
    }
    const start = el.selectionStart ?? props.modelValue.length;
    const end = el.selectionEnd ?? props.modelValue.length;
    const next = props.modelValue.slice(0, start) + token + props.modelValue.slice(end);
    emit('update:modelValue', next);
}

defineExpose({ insertMergeField });
</script>

<style scoped>
.markdown-editor__textarea {
    width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 12px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
    resize: vertical;
}
</style>
