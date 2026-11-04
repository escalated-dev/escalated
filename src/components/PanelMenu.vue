<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

/**
 * A small dropdown menu for the agent panel. Place it next to its trigger
 * inside a `relative` wrapper; clicks outside that wrapper and Escape close
 * it, and the arrow keys move between items.
 *
 * Items: `{ key, label, dot?, checked?, danger?, disabled?, hint?, heading? }`.
 * A `heading` item is a non-interactive group label.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    items: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    align: { type: String, default: 'left' },
    /** 'down' opens below the trigger, 'up' above it. */
    direction: { type: String, default: 'down' },
    width: { type: String, default: 'w-56' },
});

const emit = defineEmits(['update:open', 'select']);
const menuRef = ref(null);

function close(returnFocus = false) {
    emit('update:open', false);
    if (returnFocus) {
        const trigger = menuRef.value?.parentElement?.querySelector('[aria-haspopup]');
        trigger?.focus?.();
    }
}

function itemsEls() {
    return [...(menuRef.value?.querySelectorAll('[role^="menuitem"]:not([disabled])') || [])];
}

function onDocumentPointer(event) {
    const wrapper = menuRef.value?.parentElement;
    if (wrapper && !wrapper.contains(event.target)) close();
}

watch(
    () => props.open,
    async (open) => {
        if (typeof document === 'undefined') return;
        if (open) {
            document.addEventListener('mousedown', onDocumentPointer, true);
            await nextTick();
            const els = itemsEls();
            const checked = els.find((el) => el.getAttribute('aria-checked') === 'true');
            (checked || els[0])?.focus?.();
        } else {
            document.removeEventListener('mousedown', onDocumentPointer, true);
        }
    },
);

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocumentPointer, true);
});

function onKeydown(event) {
    const els = itemsEls();
    const index = els.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        els[(index + 1) % els.length]?.focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        els[(index - 1 + els.length) % els.length]?.focus();
    } else if (event.key === 'Home') {
        event.preventDefault();
        els[0]?.focus();
    } else if (event.key === 'End') {
        event.preventDefault();
        els[els.length - 1]?.focus();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
    } else if (event.key === 'Tab') {
        close();
    }
}

function choose(item) {
    if (item.disabled || item.heading) return;
    emit('select', item);
    close(true);
}
</script>

<template>
    <div
        v-if="open"
        ref="menuRef"
        role="menu"
        :aria-label="label || undefined"
        :class="[
            'absolute z-40 max-h-80 overflow-y-auto rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] py-1 shadow-lg',
            width,
            align === 'right' ? 'right-0' : 'left-0',
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1',
        ]"
        @keydown="onKeydown"
    >
        <template v-for="item in items" :key="item.key">
            <div
                v-if="item.heading"
                role="presentation"
                class="px-3 pb-1 pt-2 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]"
            >
                {{ item.label }}
            </div>
            <button
                v-else
                type="button"
                :role="item.checked === undefined ? 'menuitem' : 'menuitemradio'"
                :aria-checked="item.checked === undefined ? undefined : item.checked ? 'true' : 'false'"
                :disabled="item.disabled || undefined"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] outline-none hover:bg-[var(--esc-panel-hover)] focus:bg-[var(--esc-panel-active)] disabled:cursor-not-allowed disabled:opacity-50',
                    item.danger ? 'text-[var(--esc-sla-breach)]' : 'text-[var(--esc-panel-text-secondary)]',
                ]"
                @click="choose(item)"
            >
                <span v-if="item.dot" class="h-2 w-2 shrink-0 rounded-full" :style="{ background: item.dot }"></span>
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <span v-if="item.checked" class="text-[12px] text-[var(--esc-panel-text-tertiary)]" aria-hidden="true"
                    >&#10003;</span
                >
                <kbd v-else-if="item.hint" class="font-sans text-[12px] text-[var(--esc-panel-text-tertiary)]">{{
                    item.hint
                }}</kbd>
            </button>
        </template>
    </div>
</template>
