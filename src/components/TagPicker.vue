<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from '../composables/useI18n';

/**
 * The agent panel's tag popover: a filter box and every tag as a checkable
 * item. Place it next to its trigger inside a `relative` wrapper, like
 * PanelMenu; a click outside that wrapper or Escape closes it.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    tags: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:open', 'update:modelValue']);
const { t } = useI18n();

const root = ref(null);
const input = ref(null);
const query = ref('');

const shown = computed(() => {
    const q = query.value.trim().toLowerCase();
    return q ? props.tags.filter((tag) => String(tag.name).toLowerCase().includes(q)) : props.tags;
});

function toggle(tag) {
    const ids = [...props.modelValue];
    const index = ids.indexOf(tag.id);
    if (index >= 0) ids.splice(index, 1);
    else ids.push(tag.id);
    emit('update:modelValue', ids);
}

function close(returnFocus = false) {
    emit('update:open', false);
    if (returnFocus) root.value?.parentElement?.querySelector('[aria-haspopup]')?.focus?.();
}

function items() {
    return [...(root.value?.querySelectorAll('[role="menuitemcheckbox"]') || [])];
}

function onKeydown(event) {
    const list = items();
    const index = list.indexOf(document.activeElement);
    if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        list[index < 0 ? 0 : (index + 1) % list.length]?.focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (index <= 0) input.value?.focus();
        else list[index - 1]?.focus();
    } else if (event.key === 'Tab') {
        close();
    }
}

function onDocumentPointer(event) {
    const wrapper = root.value?.parentElement;
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
            input.value?.focus();
        } else {
            document.removeEventListener('mousedown', onDocumentPointer, true);
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocumentPointer, true);
});
</script>

<template>
    <div
        v-if="open"
        ref="root"
        class="absolute left-0 top-full z-40 mt-1 w-60 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] shadow-lg"
        data-testid="esc-tag-picker"
        @keydown="onKeydown"
    >
        <div class="border-b border-[var(--esc-panel-border)] p-1.5">
            <input
                ref="input"
                v-model="query"
                type="text"
                :aria-label="t('agent_panel.ticket.filter_tags')"
                :placeholder="t('agent_panel.ticket.filter_tags')"
                class="h-7 w-full rounded-[var(--esc-radius,6px)] bg-transparent px-2 text-[13px] text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-tertiary)] outline-none"
            />
        </div>
        <div role="menu" :aria-label="t('agent_panel.ticket.tags')" class="max-h-64 overflow-y-auto py-1">
            <button
                v-for="tag in shown"
                :key="tag.id"
                type="button"
                role="menuitemcheckbox"
                :aria-checked="modelValue.includes(tag.id) ? 'true' : 'false'"
                class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[var(--esc-panel-text-secondary)] outline-none hover:bg-[var(--esc-panel-hover)] focus:bg-[var(--esc-panel-active)]"
                @click="toggle(tag)"
            >
                <span
                    class="h-2 w-2 shrink-0 rounded-full"
                    :style="{ background: tag.color || 'var(--esc-panel-text-tertiary)' }"
                ></span>
                <span class="min-w-0 flex-1 truncate">{{ tag.name }}</span>
                <span
                    v-if="modelValue.includes(tag.id)"
                    class="text-[12px] text-[var(--esc-panel-text-tertiary)]"
                    aria-hidden="true"
                    >&#10003;</span
                >
            </button>
            <p v-if="!shown.length" class="px-3 py-2 text-[13px] text-[var(--esc-panel-text-tertiary)]">
                {{ t('agent_panel.ticket.no_tags_match') }}
            </p>
        </div>
    </div>
</template>
