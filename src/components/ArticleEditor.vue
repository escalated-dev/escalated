<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const textarea = ref(null);

function insertMarkdown(before, after = '') {
    const el = textarea.value;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = props.modelValue;
    const selected = text.substring(start, end);
    const replacement = before + (selected || 'text') + after;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    emit('update:modelValue', newValue);

    requestAnimationFrame(() => {
        el.focus();
        const cursorPos = start + before.length + (selected ? selected.length : 4);
        el.setSelectionRange(cursorPos, cursorPos);
    });
}

function insertBold() {
    insertMarkdown('**', '**');
}
function insertItalic() {
    insertMarkdown('*', '*');
}
function insertLink() {
    insertMarkdown('[', '](url)');
}
function insertHeading() {
    insertMarkdown('## ');
}
function insertList() {
    insertMarkdown('- ');
}

const buttons = [
    { label: 'Bold', action: insertBold, icon: 'B', cls: 'font-bold' },
    { label: 'Italic', action: insertItalic, icon: 'I', cls: 'italic' },
    { label: 'Link', action: insertLink, icon: 'Link', cls: '' },
    { label: 'Heading', action: insertHeading, icon: 'H', cls: 'font-bold' },
    { label: 'List', action: insertList, icon: 'List', cls: '' },
];
</script>

<template>
    <div>
        <div class="flex gap-1 rounded-t-lg border border-white/[0.06] bg-neutral-800/60 px-2 py-1.5">
            <button
                v-for="btn in buttons"
                :key="btn.label"
                type="button"
                :title="btn.label"
                :class="[
                    'rounded px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-neutral-200',
                    btn.cls,
                ]"
                @click="btn.action"
            >
                {{ btn.icon }}
            </button>
        </div>
        <textarea
            ref="textarea"
            :value="modelValue"
            class="block w-full rounded-b-lg border border-t-0 border-white/[0.06] bg-white/[0.03] px-3 py-3 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            rows="16"
            placeholder="Write your article content using Markdown..."
            @input="emit('update:modelValue', $event.target.value)"
        ></textarea>
    </div>
</template>
