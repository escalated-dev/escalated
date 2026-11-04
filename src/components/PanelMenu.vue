<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue';
import PanelIcon from './PanelIcon.vue';

/**
 * A small dropdown menu for the agent panel. Place it next to its trigger
 * inside a `relative` wrapper; clicks outside that wrapper and Escape close
 * it, and the arrow keys move between items.
 *
 * Items: `{ key, label, dot?, icon?, checked?, danger?, disabled?, hint?, heading? }`.
 * A `heading` item is a non-interactive group label; `icon` names a PanelIcon.
 *
 * With `filterPlaceholder` the menu opens with a filter box that narrows the
 * items by label (for long lists such as agents). The default slot renders
 * below the items, for a control the items cannot express (a date picker).
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    items: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    align: { type: String, default: 'left' },
    /** 'down' opens below the trigger, 'up' above it. */
    direction: { type: String, default: 'down' },
    width: { type: String, default: 'w-56' },
    /** Shows a filter box with this placeholder. */
    filterPlaceholder: { type: String, default: '' },
    /** Shown when the filter leaves no items. */
    emptyText: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'select']);
const slots = useSlots();
// With a filter box or a footer, only the items are the menu (a menu may hold
// nothing but menu items); the popover around them holds the rest.
const plain = computed(() => !props.filterPlaceholder && !slots.default);
const menuRef = ref(null);
const filterRef = ref(null);
const query = ref('');

const visibleItems = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!props.filterPlaceholder || !q) return props.items;
    return props.items.filter((item) => !item.heading && String(item.label).toLowerCase().includes(q));
});

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
            query.value = '';
            document.addEventListener('mousedown', onDocumentPointer, true);
            await nextTick();
            if (filterRef.value) {
                filterRef.value.focus();
                return;
            }
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
    const inFilter = event.target === filterRef.value;
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        els[inFilter ? 0 : (index + 1) % els.length]?.focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (index === 0 && filterRef.value) filterRef.value.focus();
        else els[(index - 1 + els.length) % els.length]?.focus();
    } else if (event.key === 'Home' && !inFilter) {
        event.preventDefault();
        els[0]?.focus();
    } else if (event.key === 'End' && !inFilter) {
        event.preventDefault();
        els[els.length - 1]?.focus();
    } else if (event.key === 'Enter' && inFilter) {
        event.preventDefault();
        const first = visibleItems.value.find((item) => !item.heading && !item.disabled);
        if (first) choose(first);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
    } else if (event.key === 'Tab' && !menuRef.value?.querySelector('[data-menu-footer]')?.contains(event.target)) {
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
        :role="plain ? 'menu' : undefined"
        :aria-label="plain ? label || undefined : undefined"
        :class="[
            'absolute z-40 max-h-80 overflow-y-auto rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] py-1 shadow-lg',
            width,
            align === 'right' ? 'right-0' : 'left-0',
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1',
        ]"
        @keydown="onKeydown"
    >
        <div v-if="filterPlaceholder" class="px-1.5 pb-1">
            <input
                ref="filterRef"
                v-model="query"
                type="text"
                :aria-label="filterPlaceholder"
                :placeholder="filterPlaceholder"
                class="h-7 w-full rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-transparent px-2 text-[13px] text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-tertiary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                data-testid="esc-menu-filter"
            />
        </div>
        <div :role="plain ? undefined : 'menu'" :aria-label="plain ? undefined : label || undefined">
            <template v-for="item in visibleItems" :key="item.key">
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
                    <PanelIcon
                        v-if="item.icon"
                        :name="item.icon"
                        class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                    />
                    <span
                        v-if="item.dot"
                        class="h-2 w-2 shrink-0 rounded-full"
                        :style="{ background: item.dot }"
                    ></span>
                    <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                    <span
                        v-if="item.checked"
                        class="text-[12px] text-[var(--esc-panel-text-tertiary)]"
                        aria-hidden="true"
                        >&#10003;</span
                    >
                    <kbd v-else-if="item.hint" class="font-sans text-[12px] text-[var(--esc-panel-text-tertiary)]">{{
                        item.hint
                    }}</kbd>
                </button>
            </template>
        </div>
        <p
            v-if="filterPlaceholder && emptyText && !visibleItems.length"
            class="px-3 py-1.5 text-[13px] text-[var(--esc-panel-text-tertiary)]"
        >
            {{ emptyText }}
        </p>
        <div v-if="$slots.default" data-menu-footer>
            <slot />
        </div>
    </div>
</template>
