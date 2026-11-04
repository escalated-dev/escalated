<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from '../composables/useI18n';
import PanelIcon from './PanelIcon.vue';

/**
 * The agent command palette (Cmd K / Ctrl K).
 *
 * Typing a ticket reference offers to open it; any other text offers a ticket
 * search. Below that come the commands passed in, filtered by what was typed.
 * Choosing an item emits `run` with it and closes the palette; the shell
 * decides what running means.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    /** `[{ id, label, group?, hint?, icon?, keywords?, run? }]` */
    commands: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:open', 'run', 'open-ticket', 'search']);
const { t } = useI18n();

const query = ref('');
const activeIndex = ref(0);
const inputRef = ref(null);

// ESC-1042, ESC1042, 1042, #1042
const REFERENCE = /^#?([A-Za-z]{1,10}-?)?\d{1,12}$/;

const items = computed(() => {
    const q = query.value.trim();
    const list = [];
    if (q && REFERENCE.test(q)) {
        const reference = q.replace(/^#/, '').toUpperCase();
        list.push({
            id: 'open-ticket',
            kind: 'open-ticket',
            reference,
            icon: 'ticket',
            label: t('agent_panel.palette.open_ticket', { reference }),
            group: t('agent_panel.palette.group_tickets'),
        });
    }
    if (q) {
        list.push({
            id: 'search',
            kind: 'search',
            query: q,
            icon: 'search',
            label: t('agent_panel.palette.search_for', { query: q }),
            group: t('agent_panel.palette.group_tickets'),
        });
    }
    const needle = q.toLowerCase();
    for (const command of props.commands) {
        const haystack = [command.label, command.group, ...(command.keywords || [])].join(' ').toLowerCase();
        if (!needle || haystack.includes(needle)) list.push({ kind: 'command', ...command });
    }
    return list;
});

const grouped = computed(() => {
    const groups = [];
    items.value.forEach((item, index) => {
        const name = item.group || t('agent_panel.palette.group_actions');
        let group = groups.find((g) => g.name === name);
        if (!group) {
            group = { name, items: [] };
            groups.push(group);
        }
        group.items.push({ item, index });
    });
    return groups;
});

watch(items, () => {
    activeIndex.value = 0;
});

watch(
    () => props.open,
    async (open) => {
        if (!open) return;
        query.value = '';
        activeIndex.value = 0;
        await nextTick();
        inputRef.value?.focus();
    },
    { immediate: true },
);

function close() {
    emit('update:open', false);
}

function choose(item) {
    if (!item) return;
    close();
    if (item.kind === 'open-ticket') emit('open-ticket', item.reference);
    else if (item.kind === 'search') emit('search', item.query);
    else {
        emit('run', item);
        if (typeof item.run === 'function') item.run();
    }
}

function onKeydown(event) {
    const count = items.value.length;
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (count) activeIndex.value = (activeIndex.value + 1) % count;
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (count) activeIndex.value = (activeIndex.value - 1 + count) % count;
    } else if (event.key === 'Enter') {
        event.preventDefault();
        choose(items.value[activeIndex.value]);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
    } else if (event.key === 'Tab') {
        // The input is the only focusable control; keep focus in the dialog.
        event.preventDefault();
    }
}

const activeId = computed(() => (items.value[activeIndex.value] ? `esc-palette-item-${activeIndex.value}` : undefined));
</script>

<template>
    <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
        data-testid="esc-palette"
    >
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="close"></div>
        <div
            role="dialog"
            aria-modal="true"
            :aria-label="t('agent_panel.palette.label')"
            class="relative w-full max-w-xl overflow-hidden rounded-[var(--esc-radius-lg,12px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] shadow-2xl"
        >
            <div class="flex items-center gap-2.5 border-b border-[var(--esc-panel-border)] px-4">
                <PanelIcon name="search" class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-muted)]" />
                <input
                    ref="inputRef"
                    v-model="query"
                    type="text"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="esc-palette-list"
                    aria-autocomplete="list"
                    :aria-activedescendant="activeId"
                    :aria-label="t('agent_panel.palette.label')"
                    :placeholder="t('agent_panel.palette.placeholder')"
                    class="h-12 w-full bg-transparent text-[14px] text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-muted)] outline-none"
                    @keydown="onKeydown"
                />
                <kbd
                    class="shrink-0 rounded border border-[var(--esc-panel-border-input)] px-1.5 py-0.5 font-sans text-[11px] text-[var(--esc-panel-text-tertiary)]"
                    >Esc</kbd
                >
            </div>
            <div id="esc-palette-list" role="listbox" class="max-h-[50vh] overflow-y-auto py-1.5">
                <div v-for="group in grouped" :key="group.name" role="group" :aria-label="group.name">
                    <div class="px-4 pb-1 pt-2 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                        {{ group.name }}
                    </div>
                    <div
                        v-for="{ item, index } in group.items"
                        :id="`esc-palette-item-${index}`"
                        :key="item.id"
                        role="option"
                        :aria-selected="index === activeIndex ? 'true' : 'false'"
                        :class="[
                            'mx-1.5 flex cursor-pointer items-center gap-3 rounded-[var(--esc-radius,6px)] px-2.5 py-2 text-[13px]',
                            index === activeIndex
                                ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]'
                                : 'text-[var(--esc-panel-text-secondary)]',
                        ]"
                        @mousemove="activeIndex = index"
                        @click="choose(item)"
                    >
                        <PanelIcon
                            v-if="item.icon"
                            :name="item.icon"
                            class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                        />
                        <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                        <kbd
                            v-if="item.hint"
                            class="shrink-0 font-sans text-[12px] text-[var(--esc-panel-text-tertiary)]"
                            >{{ item.hint }}</kbd
                        >
                    </div>
                </div>
                <p v-if="!items.length" class="px-4 py-6 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.palette.no_results') }}
                </p>
            </div>
        </div>
    </div>
</template>
