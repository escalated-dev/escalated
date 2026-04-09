<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    multiline: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const showDropdown = ref(false);
const inputRef = ref(null);

const variables = [
    { token: '{{ticket.reference}}', label: 'Ticket Reference' },
    { token: '{{ticket.subject}}', label: 'Ticket Subject' },
    { token: '{{ticket.status}}', label: 'Ticket Status' },
    { token: '{{agent.name}}', label: 'Agent Name' },
    { token: '{{requester.name}}', label: 'Requester Name' },
    { token: '{{requester.email}}', label: 'Requester Email' },
    { token: '{{department.name}}', label: 'Department Name' },
];

function insertVariable(token) {
    const el = inputRef.value;
    if (!el) {
        emit('update:modelValue', (props.modelValue || '') + token);
        showDropdown.value = false;
        return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = props.modelValue || '';
    const newText = text.substring(0, start) + token + text.substring(end);
    emit('update:modelValue', newText);
    showDropdown.value = false;
    // Restore cursor position after Vue updates
    requestAnimationFrame(() => {
        el.focus();
        const pos = start + token.length;
        el.setSelectionRange(pos, pos);
    });
}

function onInput(event) {
    emit('update:modelValue', event.target.value);
}

const inputClass =
    'w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]';
</script>

<template>
    <div class="relative">
        <textarea
            v-if="multiline"
            ref="inputRef"
            :value="modelValue"
            :placeholder="placeholder"
            rows="3"
            :class="inputClass + ' resize-y'"
            @input="onInput"
        />
        <input
            v-else
            ref="inputRef"
            :value="modelValue"
            :placeholder="placeholder"
            type="text"
            :class="inputClass"
            @input="onInput"
        />

        <!-- Insert Variable button -->
        <div class="mt-1.5 flex justify-end">
            <div class="relative">
                <button
                    type="button"
                    class="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                    @click="showDropdown = !showDropdown"
                >
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                        />
                    </svg>
                    Insert Variable
                </button>
                <div
                    v-if="showDropdown"
                    class="absolute right-0 bottom-full z-10 mb-1 w-48 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] py-1 shadow-xl"
                >
                    <button
                        v-for="v in variables"
                        :key="v.token"
                        type="button"
                        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-[var(--esc-panel-hover)]"
                        @click="insertVariable(v.token)"
                    >
                        <span class="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400">{{
                            v.token
                        }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
