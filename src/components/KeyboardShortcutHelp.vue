<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    show: { type: Boolean, default: false },
    /** 'list' or 'detail'. */
    context: { type: String, default: 'list' },
    /** A ticket shown beside its list also answers the list keys. */
    withList: { type: Boolean, default: false },
    /** The agent panel adds the command palette and the g sequences. */
    agent: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show']);
const { t } = useI18n();

const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');

const shortcutGroups = computed(() => {
    const list = {
        key: 'list',
        title: t('keyboard.list_view'),
        shortcuts: [
            { keys: ['j'], description: t('keyboard.move_down') },
            { keys: ['k'], description: t('keyboard.move_up') },
            { keys: ['x'], description: t('keyboard.toggle_select') },
            { keys: ['Enter'], description: t('keyboard.open_ticket') },
            { keys: ['/'], description: t('agent_panel.keys.search') },
        ],
    };
    const detail = {
        key: 'detail',
        title: t('keyboard.detail_view'),
        shortcuts: [
            { keys: ['r'], description: t('keyboard.reply') },
            { keys: ['n'], description: t('keyboard.internal_note') },
            { keys: ['s'], description: t('keyboard.change_status') },
            { keys: ['p'], description: t('keyboard.change_priority') },
            { keys: ['f'], description: t('keyboard.follow_unfollow') },
            { keys: ['a'], description: t('agent_panel.keys.assign_me') },
            { keys: ['e'], description: t('agent_panel.keys.resolve') },
            { keys: ['z'], description: t('agent_panel.keys.snooze') },
            { keys: ['i'], description: t('agent_panel.keys.context') },
        ],
    };
    const global = {
        key: 'global',
        title: t('keyboard.global'),
        shortcuts: [{ keys: ['?'], description: t('keyboard.show_help') }],
    };
    if (props.agent) {
        global.shortcuts.push(
            { keys: [isMac ? '⌘' : 'Ctrl', 'K'], description: t('agent_panel.keys.palette') },
            { keys: ['g', 'i'], description: t('agent_panel.keys.go_inbox') },
            { keys: ['g', 'u'], description: t('agent_panel.keys.go_unassigned') },
            { keys: ['g', 'a'], description: t('agent_panel.keys.go_all') },
        );
    }
    if (props.context === 'detail') {
        // In the detail view the list keys skip "select", which the list beside a ticket does not offer.
        const listKeys = {
            ...list,
            shortcuts: [
                ...list.shortcuts.filter((s) => s.keys[0] !== 'x'),
                { keys: ['Shift', 'J'], description: t('agent_panel.keys.next_ticket') },
                { keys: ['Shift', 'K'], description: t('agent_panel.keys.previous_ticket') },
            ],
        };
        return props.withList ? [detail, listKeys, global] : [detail, global];
    }
    return [list, global];
});

const dialogRef = ref(null);
const closeRef = ref(null);
let returnFocus = null;

function closeModal() {
    emit('update:show', false);
}

function onDocumentKeydown(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
    }
}

watch(
    () => props.show,
    async (show) => {
        if (typeof document === 'undefined') return;
        if (show) {
            returnFocus = document.activeElement;
            document.addEventListener('keydown', onDocumentKeydown);
            await nextTick();
            closeRef.value?.focus();
        } else {
            document.removeEventListener('keydown', onDocumentKeydown);
            if (returnFocus?.isConnected) returnFocus.focus?.();
            returnFocus = null;
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('keydown', onDocumentKeydown);
});

function onDialogKeydown(event) {
    // Only the close button is focusable; keep Tab inside the dialog.
    if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.value?.focus();
    }
}

const kbdClass =
    'inline-flex min-w-[22px] items-center justify-center rounded-[4px] border border-[var(--esc-panel-border-input)] px-1.5 py-px font-sans text-[12px] text-[var(--esc-panel-text-secondary)]';
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="closeModal"></div>
            <div
                ref="dialogRef"
                role="dialog"
                aria-modal="true"
                :aria-label="t('keyboard.title')"
                class="relative z-10 w-full max-w-md overflow-hidden rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] text-[var(--esc-panel-text)] shadow-2xl"
                @keydown="onDialogKeydown"
            >
                <div class="flex items-center justify-between border-b border-[var(--esc-panel-border)] px-5 py-3">
                    <h2 class="text-[14px] font-semibold text-[var(--esc-panel-text)]">
                        {{ t('keyboard.title') }}
                    </h2>
                    <button
                        ref="closeRef"
                        type="button"
                        :aria-label="t('keyboard.close')"
                        class="-mr-1.5 rounded-[var(--esc-radius,6px)] p-1.5 text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        @click="closeModal"
                    >
                        <svg
                            class="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="max-h-[65vh] overflow-y-auto px-5 py-3">
                    <section
                        v-for="(group, gi) in shortcutGroups"
                        :key="group.key"
                        :class="gi > 0 ? 'mt-3 border-t border-[var(--esc-panel-border)] pt-3' : ''"
                    >
                        <h3 class="mb-1.5 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                            {{ group.title }}
                        </h3>
                        <dl>
                            <div
                                v-for="shortcut in group.shortcuts"
                                :key="shortcut.keys.join('+')"
                                class="flex items-center justify-between py-[3px]"
                            >
                                <dt class="text-[13px] text-[var(--esc-panel-text-secondary)]">
                                    {{ shortcut.description }}
                                </dt>
                                <dd class="flex items-center gap-1">
                                    <kbd v-for="key in shortcut.keys" :key="key" :class="kbdClass">{{ key }}</kbd>
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div
                    class="border-t border-[var(--esc-panel-border)] px-5 py-2.5 text-center text-[12px] text-[var(--esc-panel-text-tertiary)]"
                >
                    {{ t('keyboard.esc_to_close') }}
                </div>
            </div>
        </div>
    </Teleport>
</template>
