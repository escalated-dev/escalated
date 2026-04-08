<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    sessionId: { type: [String, Number], default: null },
    disabled: { type: Boolean, default: false },
    allowNotes: { type: Boolean, default: false },
    allowAttachments: { type: Boolean, default: true },
    sendEndpoint: { type: String, default: '' },
    typingEndpoint: { type: String, default: '' },
});

const emit = defineEmits(['send', 'typing']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const { t } = useI18n();

const body = ref('');
const isNote = ref(false);
const files = ref([]);
const submitting = ref(false);
const textareaRef = ref(null);

// Typing indicator: debounced POST every 3 seconds while typing
let lastTypingSent = 0;
let typingTimer = null;

function onInput() {
    emit('typing');
    if (!props.typingEndpoint) return;
    const now = Date.now();
    if (now - lastTypingSent < 3000) return;
    lastTypingSent = now;
    sendTypingIndicator();

    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
        lastTypingSent = 0;
    }, 4000);
}

async function sendTypingIndicator() {
    try {
        await fetch(props.typingEndpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
    } catch {
        // silently ignore
    }
}

function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
    }
}

function triggerFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.addEventListener('change', () => {
        if (input.files) {
            files.value = [...files.value, ...Array.from(input.files)];
        }
    });
    input.click();
}

function removeFile(index) {
    files.value.splice(index, 1);
}

async function submit() {
    if (!body.value.trim() || submitting.value || props.disabled) return;
    submitting.value = true;
    window.clearTimeout(typingTimer);
    lastTypingSent = 0;

    const payload = {
        body: body.value,
        is_internal_note: isNote.value,
        attachments: files.value,
    };

    emit('send', payload);

    if (props.sendEndpoint) {
        try {
            await fetch(props.sendEndpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(payload),
            });
        } catch {
            // error handling delegated to caller
        }
    }

    body.value = '';
    files.value = [];
    isNote.value = false;
    submitting.value = false;

    // Re-focus textarea
    textareaRef.value?.focus();
}
</script>

<template>
    <div
        :class="[
            'border-t',
            isNote
                ? escDark
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-yellow-200 bg-yellow-50'
                : escDark
                  ? 'border-white/[0.06] bg-neutral-900/60'
                  : 'border-gray-200 bg-white',
        ]"
    >
        <!-- Note/Reply toggle -->
        <div v-if="allowNotes" class="flex gap-1 px-3 pt-2">
            <button
                :class="[
                    'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                    !isNote
                        ? escDark
                            ? 'bg-cyan-500/15 text-white'
                            : 'bg-blue-100 text-blue-700'
                        : escDark
                          ? 'text-neutral-500 hover:text-neutral-300'
                          : 'text-gray-400 hover:text-gray-600',
                ]"
                @click="isNote = false"
            >
                {{ t('reply.reply') }}
            </button>
            <button
                :class="[
                    'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                    isNote
                        ? escDark
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-yellow-100 text-yellow-700'
                        : escDark
                          ? 'text-neutral-500 hover:text-neutral-300'
                          : 'text-gray-400 hover:text-gray-600',
                ]"
                aria-label="Internal note"
                @click="isNote = true"
            >
                {{ t('chat.note') }}
            </button>
        </div>

        <!-- File list -->
        <div v-if="files.length" class="flex flex-wrap gap-2 px-3 pt-2">
            <span
                v-for="(file, i) in files"
                :key="i"
                :class="[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    escDark ? 'bg-neutral-800 text-neutral-400' : 'bg-gray-100 text-gray-600',
                ]"
            >
                {{ file.name }}
                <button
                    aria-label="Remove attachment"
                    :class="[escDark ? 'text-rose-400 hover:text-rose-300' : 'text-red-500 hover:text-red-700']"
                    @click="removeFile(i)"
                >
                    &times;
                </button>
            </span>
        </div>

        <!-- Input row -->
        <div class="flex items-end gap-2 p-3">
            <!-- Attachment button -->
            <button
                v-if="allowAttachments"
                :disabled="disabled"
                :class="[
                    'flex-shrink-0 rounded-lg p-2 transition-colors',
                    disabled
                        ? 'cursor-not-allowed opacity-40'
                        : escDark
                          ? 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
                ]"
                aria-label="Attach file"
                @click="triggerFileInput"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                    />
                </svg>
            </button>

            <!-- Text input -->
            <textarea
                ref="textareaRef"
                v-model="body"
                :disabled="disabled"
                rows="1"
                :placeholder="isNote ? t('reply.write_internal_note') : t('chat.placeholder')"
                :class="[
                    'flex-1 resize-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-1',
                    disabled && 'cursor-not-allowed opacity-50',
                    escDark
                        ? 'border-white/10 bg-neutral-950 text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:ring-white/10'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
                ]"
                aria-label="Chat message"
                @input="onInput"
                @keydown="handleKeydown"
            ></textarea>

            <!-- Send button -->
            <button
                :disabled="!body.trim() || submitting || disabled"
                :class="[
                    'flex-shrink-0 rounded-xl p-2 transition-all',
                    !body.trim() || submitting || disabled ? 'cursor-not-allowed opacity-40' : '',
                    isNote
                        ? 'bg-amber-500 text-white hover:bg-amber-400'
                        : escDark
                          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-400 hover:to-violet-400'
                          : 'bg-blue-600 text-white hover:bg-blue-500',
                ]"
                aria-label="Send message"
                @click="submit"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>
