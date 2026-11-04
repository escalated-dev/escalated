<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { useMentions } from '../composables/useMentions';
import { toast } from '../composables/useAgentToasts';
import { readFlash } from '../utils/flash';
import MentionDropdown from './MentionDropdown.vue';
import PanelIcon from './PanelIcon.vue';
import PanelMenu from './PanelMenu.vue';

/**
 * The agent composer: Reply / Internal note tabs, a formatting toolbar,
 * attachments, canned responses, and a split Send button whose menu sends and
 * then sets the status. Drafts are kept per ticket and mode in localStorage.
 *
 * Idle and empty it is one line with no toolbar; focus, a draft, files or an
 * open menu open it up, and the text box grows with the text. A public reply
 * names its recipient; an internal note is amber. Ctrl/Cmd Enter sends,
 * Ctrl/Cmd Shift Enter sends and resolves. Files can be dropped or pasted.
 *
 * It posts `{ body, is_internal_note, attachments }` to `replyAction` or
 * `noteAction`, like ReplyComposer.
 */
const props = defineProps({
    replyAction: { type: String, default: '' },
    noteAction: { type: String, required: true },
    /** Where "Send and ..." posts `{ status }` after the reply. Empty hides the menu. */
    statusAction: { type: String, default: '' },
    cannedResponses: { type: Array, default: () => [] },
    /** Light agents may only add internal notes. */
    notesOnly: { type: Boolean, default: false },
    /** Keys the saved draft. */
    draftKey: { type: String, default: '' },
    mode: { type: String, default: 'reply' },
    typingEndpoint: { type: String, default: '' },
    /** `{ name, email }`: who a public reply goes to. */
    recipient: { type: Object, default: null },
});

const emit = defineEmits(['update:mode', 'sent']);
const { t } = useI18n();

const canReply = computed(() => !props.notesOnly && !!props.replyAction);
const currentMode = ref(canReply.value ? props.mode : 'note');
const isNote = computed(() => currentMode.value === 'note');

watch(
    () => props.mode,
    (mode) => {
        currentMode.value = canReply.value ? mode : 'note';
    },
);

function setMode(mode) {
    if (mode === 'reply' && !canReply.value) return;
    saveDraft();
    currentMode.value = mode;
    emit('update:mode', mode);
    body.value = loadDraft();
}

// --- Drafts ----------------------------------------------------------------
function storage() {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

function storageKey(mode = currentMode.value) {
    return props.draftKey ? `escalated-draft:${props.draftKey}:${mode}` : '';
}

function loadDraft(mode = currentMode.value) {
    const key = storageKey(mode);
    if (!key) return '';
    try {
        return storage()?.getItem(key) || '';
    } catch {
        return '';
    }
}

const draftSaved = ref(false);
let draftTimer = null;

function saveDraft() {
    clearTimeout(draftTimer);
    const key = storageKey();
    if (!key) return;
    try {
        if (body.value.trim()) storage()?.setItem(key, body.value);
        else storage()?.removeItem(key);
        draftSaved.value = !!body.value.trim();
    } catch {
        // storage full or blocked: the text stays in the box
    }
}

function discard() {
    if (!hasContent.value) return;
    const message = t('agent_panel.composer.discard_confirm');
    const confirmed =
        typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm(message) : true;
    if (!confirmed) return;
    body.value = '';
    files.value = [];
    sendError.value = '';
    clearDraft();
    nextTick(autosize);
}

function clearDraft(mode = currentMode.value) {
    const key = storageKey(mode);
    try {
        if (key) storage()?.removeItem(key);
    } catch {
        // nothing to clear
    }
    draftSaved.value = false;
}

const body = ref(loadDraft());
draftSaved.value = !!body.value;

watch(
    () => props.draftKey,
    () => {
        body.value = loadDraft();
        draftSaved.value = !!body.value;
        files.value = [];
    },
);

onBeforeUnmount(() => {
    if (draftTimer) saveDraft();
    window.clearTimeout(typingTimer);
});

// --- Editing ---------------------------------------------------------------
const rootRef = ref(null);
const textareaRef = ref(null);
const focused = ref(false);
const dragging = ref(false);
const hasContent = computed(() => !!body.value.trim() || files.value.length > 0);
const expanded = computed(
    () =>
        focused.value ||
        hasContent.value ||
        cannedOpen.value ||
        emojiOpen.value ||
        sendMenuOpen.value ||
        !!sendError.value ||
        submitting.value,
);

function onFocusOut(event) {
    if (!rootRef.value?.contains(event.relatedTarget)) focused.value = false;
}

// The box grows with the text up to 40% of the window, then scrolls.
function autosize() {
    const el = textareaRef.value;
    if (!el || typeof window === 'undefined') return;
    el.style.height = 'auto';
    if (expanded.value && el.scrollHeight) el.style.height = `${el.scrollHeight + 2}px`;
    else el.style.height = '';
}

function addFiles(list) {
    const added = Array.from(list || []).filter((file) => file && typeof file.name === 'string');
    if (added.length) files.value = [...files.value, ...added];
    return added.length > 0;
}

function isFileDrag(event) {
    return [...(event.dataTransfer?.types || [])].includes('Files');
}

function onDragOver(event) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragging.value = true;
}

function onDragLeave(event) {
    if (!rootRef.value?.contains(event.relatedTarget)) dragging.value = false;
}

function onDrop(event) {
    dragging.value = false;
    if (!isFileDrag(event)) return;
    event.preventDefault();
    addFiles(event.dataTransfer?.files);
}

function onPaste(event) {
    if (addFiles(event.clipboardData?.files)) event.preventDefault();
}
const fileInputRef = ref(null);
const files = ref([]);
const submitting = ref(false);
const mentionDropdownRef = ref(null);

const {
    suggestions,
    isActive: mentionActive,
    loading: mentionLoading,
    pending: mentionPending,
    onTextChange,
    insertMention,
    close: closeMentions,
} = useMentions();

let typingTimer = null;
let lastTypingSent = 0;

function onInput() {
    autosize();
    if (textareaRef.value) onTextChange(textareaRef.value, body.value);
    draftSaved.value = false;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 500);
    sendTyping();
}

function sendTyping() {
    if (!props.typingEndpoint || isNote.value) return;
    const now = Date.now();
    if (now - lastTypingSent < 5000) return;
    lastTypingSent = now;
    fetch(props.typingEndpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
    }).catch(() => {});
}

function onKeydown(event) {
    if (mentionActive.value && mentionDropdownRef.value?.onKeydown(event)) return;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        submit(event.shiftKey && showSendMenu.value ? 'resolved' : null);
    } else if (event.key === 'Escape' && !hasContent.value) {
        event.target.blur();
    }
}

function handleMentionSelect(agent) {
    body.value = insertMention(body.value, agent);
    textareaRef.value?.focus();
    onInput();
}

function replaceSelection(transform) {
    const el = textareaRef.value;
    if (!el) return;
    const start = el.selectionStart ?? body.value.length;
    const end = el.selectionEnd ?? body.value.length;
    const selected = body.value.slice(start, end);
    const { text, cursorStart, cursorEnd } = transform(selected);
    body.value = body.value.slice(0, start) + text + body.value.slice(end);
    nextTick(() => {
        el.focus();
        el.setSelectionRange(start + cursorStart, start + cursorEnd);
    });
    onInput();
}

function wrap(open, close) {
    replaceSelection((selected) => ({
        text: `${open}${selected}${close}`,
        cursorStart: open.length,
        cursorEnd: open.length + selected.length,
    }));
}

function insertLink() {
    replaceSelection((selected) => {
        const label = selected || t('agent_panel.composer.link_text');
        const text = `<a href="https://">${label}</a>`;
        const urlStart = text.indexOf('https://');
        return { text, cursorStart: urlStart, cursorEnd: urlStart + 'https://'.length };
    });
}

function insertList() {
    replaceSelection((selected) => {
        const lines = (selected || '').split('\n').filter((line) => line.trim());
        const items = (lines.length ? lines : ['']).map((line) => `<li>${line.trim()}</li>`).join('\n');
        const text = `<ul>\n${items}\n</ul>`;
        const cursor = lines.length ? text.length : '<ul>\n<li>'.length;
        return { text, cursorStart: cursor, cursorEnd: cursor };
    });
}

function insertText(text) {
    replaceSelection(() => ({ text, cursorStart: text.length, cursorEnd: text.length }));
}

// --- Canned responses and emoji ---------------------------------------------
const cannedOpen = ref(false);
const cannedItems = computed(() =>
    props.cannedResponses.map((response, index) => ({
        key: String(response.id ?? index),
        label: response.title,
        response,
    })),
);
function onCanned(item) {
    insertText(item.response.body || '');
}

const emojiOpen = ref(false);
const EMOJI = ['\u{1F44D}', '\u{1F642}', '\u{1F64F}', '\u{1F389}', '\u{2705}', '\u{1F440}', '\u{1F4A1}', '\u{1F914}'];

// --- Attachments ---------------------------------------------------------------
function pickFiles() {
    fileInputRef.value?.click();
}

function onFiles(event) {
    addFiles(event.target.files);
    event.target.value = '';
}

function removeFile(index) {
    files.value.splice(index, 1);
}

function formatSize(bytes) {
    if (typeof bytes !== 'number') return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// --- Sending -------------------------------------------------------------------
const sendMenuOpen = ref(false);
const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
const modKey = isMac ? '⌘' : 'Ctrl';
const sendMenuItems = computed(() => [
    { key: 'waiting_on_customer', label: t('agent_panel.composer.send_pending') },
    { key: 'resolved', label: t('agent_panel.composer.send_resolve'), hint: `${modKey} Shift Enter` },
]);
const sendTitle = computed(
    () => `${isNote.value ? t('agent_panel.composer.add_note') : t('agent_panel.composer.send')} (${modKey} Enter)`,
);
const recipientLabel = computed(() => {
    const r = props.recipient;
    if (!r || !(r.name || r.email)) return null;
    const name = r.name || r.email;
    return { text: t('agent_panel.composer.to', { name }), title: r.email && r.name ? `${r.name} <${r.email}>` : name };
});
const showSendMenu = computed(() => !isNote.value && !!props.statusAction);
const canSend = computed(() => !!body.value.trim() && !submitting.value);
const sendError = ref('');

watch(body, () => {
    sendError.value = '';
});

function submit(thenStatus = null) {
    if (!canSend.value) return;
    const mode = currentMode.value;
    const action = mode === 'note' ? props.noteAction : props.replyAction;
    if (!action) return;
    submitting.value = true;
    const payload = { body: body.value, is_internal_note: mode === 'note', attachments: files.value };

    router.post(action, payload, {
        preserveScroll: true,
        onSuccess: (result) => {
            const flash = readFlash(result);
            if (!flash.success && !flash.message && !flash.error) {
                toast(mode === 'note' ? t('agent_panel.toast.note_added') : t('agent_panel.toast.reply_sent'));
            }
            body.value = '';
            files.value = [];
            clearDraft(mode);
            nextTick(autosize);
            emit('sent', { mode, status: thenStatus });
            if (thenStatus && props.statusAction) {
                router.post(props.statusAction, { status: thenStatus }, { preserveScroll: true });
            }
        },
        onError: (errors) => {
            const first = Object.values(errors || {}).flat()[0];
            sendError.value = typeof first === 'string' && first ? first : t('agent_panel.composer.send_failed');
        },
        onFinish: () => {
            submitting.value = false;
        },
    });
}

function onSendMenu(item) {
    submit(item.key);
}

function focus(mode) {
    if (mode && mode !== currentMode.value) setMode(mode);
    nextTick(() => textareaRef.value?.focus());
}

watch(expanded, () => nextTick(autosize));

defineExpose({ focus, setMode });

const toolButton =
    'flex h-7 w-7 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
</script>

<template>
    <div
        ref="rootRef"
        :class="[
            'relative rounded-[var(--esc-radius-lg,8px)] border transition-colors',
            isNote
                ? 'border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)] focus-within:border-[var(--esc-panel-note-text)]'
                : 'border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] focus-within:border-[var(--esc-panel-accent)]',
            dragging ? 'border-dashed !border-[var(--esc-panel-accent)]' : '',
        ]"
        :data-mode="currentMode"
        :data-expanded="expanded ? 'true' : 'false'"
        :data-dragging="dragging ? 'true' : undefined"
        data-testid="esc-composer"
        @focusin="focused = true"
        @focusout="onFocusOut"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
    >
        <!-- Tabs -->
        <div
            role="tablist"
            :aria-label="t('agent_panel.composer.label')"
            class="flex items-center gap-1 border-b border-[var(--esc-panel-border)] px-2"
        >
            <button
                v-if="canReply"
                type="button"
                role="tab"
                :aria-selected="!isNote ? 'true' : 'false'"
                :class="[
                    'relative shrink-0 whitespace-nowrap px-2.5 py-2 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]',
                    !isNote
                        ? 'text-[var(--esc-panel-text)] after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:bg-[var(--esc-panel-accent)]'
                        : 'text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)]',
                ]"
                data-testid="esc-composer-reply-tab"
                @click="setMode('reply')"
            >
                {{ t('agent_panel.composer.reply') }}
            </button>
            <button
                type="button"
                role="tab"
                :aria-selected="isNote ? 'true' : 'false'"
                :class="[
                    'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]',
                    isNote
                        ? 'text-[var(--esc-panel-note-text)] after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:bg-[var(--esc-panel-note-text)]'
                        : 'text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)]',
                ]"
                data-testid="esc-composer-note-tab"
                @click="setMode('note')"
            >
                <PanelIcon v-if="isNote" name="lock" class="h-3.5 w-3.5" />
                {{ t('agent_panel.composer.internal_note') }}
            </button>
            <span
                v-if="isNote"
                class="ml-auto truncate pr-1 text-[12px] text-[var(--esc-panel-note-text)]"
                data-testid="esc-composer-note-cue"
                >{{ t('agent_panel.composer.note_cue') }}</span
            >
            <span
                v-else-if="recipientLabel"
                class="ml-auto min-w-0 truncate pr-1 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                :title="recipientLabel.title"
                data-testid="esc-composer-recipient"
                >{{ recipientLabel.text }}</span
            >
        </div>

        <!-- Body -->
        <div class="relative">
            <textarea
                ref="textareaRef"
                v-model="body"
                :rows="expanded ? 4 : 1"
                :aria-label="isNote ? t('agent_panel.composer.internal_note') : t('agent_panel.composer.reply')"
                :placeholder="
                    isNote ? t('agent_panel.composer.note_placeholder') : t('agent_panel.composer.placeholder')
                "
                :class="[
                    'block max-h-[40vh] w-full resize-none overflow-y-auto bg-transparent px-3 text-[14px] leading-5 text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-tertiary)] focus:outline-none',
                    expanded ? 'min-h-[88px] py-2.5' : 'py-2',
                ]"
                data-testid="esc-composer-input"
                @input="onInput"
                @keydown="onKeydown"
                @paste="onPaste"
            ></textarea>
            <MentionDropdown
                ref="mentionDropdownRef"
                :suggestions="suggestions"
                :visible="mentionActive"
                :loading="mentionLoading"
                :pending="mentionPending"
                class="bottom-full left-0"
                @select="handleMentionSelect"
                @close="closeMentions"
            />
        </div>

        <p
            v-if="sendError"
            role="alert"
            class="flex items-start gap-1.5 px-3 pb-2 text-[13px] text-[var(--esc-sla-breach)]"
            data-testid="esc-composer-error"
        >
            <PanelIcon name="warning" class="mt-0.5 h-4 w-4 shrink-0" />
            <span>{{ sendError }}</span>
        </p>

        <!-- Attachments -->
        <ul v-if="files.length" class="flex flex-wrap gap-1.5 px-3 pb-2" data-testid="esc-composer-files">
            <li
                v-for="(file, index) in files"
                :key="`${file.name}-${index}`"
                class="flex items-center gap-1.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border)] py-0.5 pl-2 pr-1 text-[12px] text-[var(--esc-panel-text-secondary)]"
            >
                <PanelIcon name="document" class="h-3.5 w-3.5 text-[var(--esc-panel-text-tertiary)]" />
                <span class="max-w-[12rem] truncate">{{ file.name }}</span>
                <span class="tabular-nums text-[var(--esc-panel-text-tertiary)]">{{ formatSize(file.size) }}</span>
                <button
                    type="button"
                    class="rounded p-0.5 text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                    :aria-label="t('agent_panel.composer.remove_file', { name: file.name })"
                    @click="removeFile(index)"
                >
                    <PanelIcon name="x" class="h-3 w-3" />
                </button>
            </li>
        </ul>

        <!-- Toolbar: shown once the composer is in use -->
        <div v-show="expanded" class="flex items-center gap-0.5 px-2 pb-2" data-testid="esc-composer-toolbar">
            <input
                ref="fileInputRef"
                type="file"
                multiple
                class="sr-only"
                tabindex="-1"
                :aria-label="t('agent_panel.composer.attach')"
                @change="onFiles"
            />
            <button
                type="button"
                :class="toolButton"
                :aria-label="t('agent_panel.composer.attach')"
                :title="t('agent_panel.composer.attach')"
                @click="pickFiles"
            >
                <PanelIcon name="paperclip" class="h-4 w-4" />
            </button>
            <div v-if="cannedItems.length" class="relative">
                <button
                    type="button"
                    :class="toolButton"
                    aria-haspopup="menu"
                    :aria-expanded="cannedOpen ? 'true' : 'false'"
                    :aria-label="t('agent_panel.composer.canned')"
                    :title="t('agent_panel.composer.canned')"
                    data-testid="esc-composer-canned"
                    @click="cannedOpen = !cannedOpen"
                >
                    <PanelIcon name="canned" class="h-4 w-4" />
                </button>
                <PanelMenu
                    v-model:open="cannedOpen"
                    :items="cannedItems"
                    :label="t('agent_panel.composer.canned')"
                    direction="up"
                    width="w-64"
                    @select="onCanned"
                />
            </div>
            <div class="relative">
                <button
                    type="button"
                    :class="toolButton"
                    aria-haspopup="menu"
                    :aria-expanded="emojiOpen ? 'true' : 'false'"
                    :aria-label="t('agent_panel.composer.emoji')"
                    :title="t('agent_panel.composer.emoji')"
                    @click="emojiOpen = !emojiOpen"
                >
                    <PanelIcon name="smile" class="h-4 w-4" />
                </button>
                <div
                    v-if="emojiOpen"
                    role="menu"
                    :aria-label="t('agent_panel.composer.emoji')"
                    class="absolute bottom-full left-0 z-40 mb-1 grid grid-cols-4 gap-0.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] p-1 shadow-lg"
                >
                    <button
                        v-for="emoji in EMOJI"
                        :key="emoji"
                        type="button"
                        role="menuitem"
                        class="flex h-8 w-8 items-center justify-center rounded text-[16px] outline-none hover:bg-[var(--esc-panel-hover)] focus:bg-[var(--esc-panel-active)]"
                        @click="
                            insertText(emoji);
                            emojiOpen = false;
                        "
                    >
                        {{ emoji }}
                    </button>
                </div>
            </div>
            <span class="mx-1 h-4 w-px bg-[var(--esc-panel-border)]" aria-hidden="true"></span>
            <button
                type="button"
                :class="[toolButton, 'text-[13px] font-bold']"
                :aria-label="t('agent_panel.composer.bold')"
                :title="t('agent_panel.composer.bold')"
                @click="wrap('<strong>', '</strong>')"
            >
                B
            </button>
            <button
                type="button"
                :class="[toolButton, 'font-serif text-[14px] italic']"
                :aria-label="t('agent_panel.composer.italic')"
                :title="t('agent_panel.composer.italic')"
                @click="wrap('<em>', '</em>')"
            >
                I
            </button>
            <button
                type="button"
                :class="toolButton"
                :aria-label="t('agent_panel.composer.link')"
                :title="t('agent_panel.composer.link')"
                @click="insertLink"
            >
                <PanelIcon name="link" class="h-4 w-4" />
            </button>
            <button
                type="button"
                :class="toolButton"
                :aria-label="t('agent_panel.composer.list')"
                :title="t('agent_panel.composer.list')"
                @click="insertList"
            >
                <PanelIcon name="list" class="h-4 w-4" />
            </button>

            <span
                class="ml-auto mr-2 text-[12px] text-[var(--esc-panel-text-tertiary)]"
                aria-live="polite"
                data-testid="esc-composer-draft"
                >{{ draftSaved ? t('agent_panel.composer.draft_saved') : '' }}</span
            >
            <button
                v-if="hasContent"
                type="button"
                :class="[toolButton, 'mr-1']"
                :aria-label="t('agent_panel.composer.discard')"
                :title="t('agent_panel.composer.discard')"
                data-testid="esc-composer-discard"
                @click="discard"
            >
                <PanelIcon name="trash" class="h-4 w-4" />
            </button>

            <!-- Split send -->
            <div class="relative flex">
                <button
                    type="button"
                    :disabled="!canSend"
                    :class="[
                        'flex h-8 items-center gap-1.5 px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--esc-panel-accent)] disabled:cursor-not-allowed disabled:opacity-50',
                        showSendMenu ? 'rounded-l-[var(--esc-radius,6px)]' : 'rounded-[var(--esc-radius,6px)]',
                        isNote
                            ? 'border border-[var(--esc-panel-note-border)] bg-[var(--esc-panel-note-bg)] text-[var(--esc-panel-note-text)]'
                            : 'bg-[var(--esc-panel-primary-bg)] text-[var(--esc-panel-primary-text)] hover:opacity-90',
                    ]"
                    :aria-busy="submitting ? 'true' : undefined"
                    :title="sendTitle"
                    data-testid="esc-composer-send"
                    @click="submit()"
                >
                    <PanelIcon
                        :name="isNote ? 'lock' : 'send'"
                        :class="['h-4 w-4', submitting ? 'animate-pulse' : '']"
                    />
                    {{
                        submitting
                            ? t('agent_panel.composer.sending')
                            : isNote
                              ? t('agent_panel.composer.add_note')
                              : t('agent_panel.composer.send')
                    }}
                </button>
                <template v-if="showSendMenu">
                    <button
                        type="button"
                        :disabled="!canSend"
                        class="flex h-8 w-7 items-center justify-center rounded-r-[var(--esc-radius,6px)] border-l border-[color-mix(in_srgb,var(--esc-panel-primary-text)_25%,transparent)] bg-[var(--esc-panel-primary-bg)] text-[var(--esc-panel-primary-text)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--esc-panel-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-haspopup="menu"
                        :aria-expanded="sendMenuOpen ? 'true' : 'false'"
                        :aria-label="t('agent_panel.composer.more_send')"
                        data-testid="esc-composer-send-menu"
                        @click="sendMenuOpen = !sendMenuOpen"
                    >
                        <PanelIcon name="chevronDown" class="h-3.5 w-3.5" />
                    </button>
                    <PanelMenu
                        v-model:open="sendMenuOpen"
                        :items="sendMenuItems"
                        :label="t('agent_panel.composer.more_send')"
                        align="right"
                        direction="up"
                        width="w-60"
                        @select="onSendMenu"
                    />
                </template>
            </div>
        </div>
    </div>
</template>
