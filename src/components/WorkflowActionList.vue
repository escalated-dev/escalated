<script setup>
import { ref, computed } from 'vue';
import WorkflowActionConfig from './WorkflowActionConfig.vue';

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const actionTypes = [
    {
        value: 'assign_agent',
        label: 'Assign Agent',
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        color: 'text-blue-400 bg-blue-500/10',
    },
    {
        value: 'change_status',
        label: 'Change Status',
        icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
        value: 'change_priority',
        label: 'Change Priority',
        icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12',
        color: 'text-red-400 bg-red-500/10',
    },
    {
        value: 'add_tag',
        label: 'Add Tag',
        icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z',
        color: 'text-violet-400 bg-violet-500/10',
    },
    {
        value: 'remove_tag',
        label: 'Remove Tag',
        icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z',
        color: 'text-pink-400 bg-pink-500/10',
    },
    {
        value: 'move_department',
        label: 'Move Department',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75z',
        color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
        value: 'add_note',
        label: 'Add Internal Note',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
        color: 'text-amber-400 bg-amber-500/10',
    },
    {
        value: 'send_email',
        label: 'Send Email Notification',
        icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
        color: 'text-sky-400 bg-sky-500/10',
    },
    {
        value: 'send_webhook',
        label: 'Send Webhook',
        icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
        color: 'text-indigo-400 bg-indigo-500/10',
    },
    {
        value: 'delay',
        label: 'Delay',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-orange-400 bg-orange-500/10',
    },
    {
        value: 'apply_macro',
        label: 'Apply Macro',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
        color: 'text-yellow-400 bg-yellow-500/10',
    },
    {
        value: 'close_ticket',
        label: 'Close Ticket',
        icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-gray-400 bg-gray-500/10',
    },
    {
        value: 'snooze',
        label: 'Snooze',
        icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
        color: 'text-teal-400 bg-teal-500/10',
    },
];

const showTypeSelector = ref(false);
const expandedIndex = ref(null);
const dragIndex = ref(null);

const actions = computed(() => props.modelValue);

function getActionType(value) {
    return actionTypes.find((t) => t.value === value) || actionTypes[0];
}

function addAction(typeValue) {
    const newActions = [...actions.value, { type: typeValue, config: {} }];
    emit('update:modelValue', newActions);
    showTypeSelector.value = false;
    expandedIndex.value = newActions.length - 1;
}

function removeAction(index) {
    const newActions = actions.value.filter((_, i) => i !== index);
    emit('update:modelValue', newActions);
    if (expandedIndex.value === index) expandedIndex.value = null;
}

function updateConfig(index, config) {
    const newActions = actions.value.map((a, i) => (i === index ? { ...a, config } : a));
    emit('update:modelValue', newActions);
}

function toggleExpand(index) {
    expandedIndex.value = expandedIndex.value === index ? null : index;
}

function getActionSummary(action) {
    const c = action.config || {};
    switch (action.type) {
        case 'assign_agent':
            return c.mode === 'round_robin'
                ? 'Round robin'
                : c.mode === 'least_busy'
                  ? 'Least busy'
                  : c.agent || 'Not configured';
        case 'change_status':
            return c.status || 'Not configured';
        case 'change_priority':
            return c.priority || 'Not configured';
        case 'add_tag':
        case 'remove_tag':
            return c.tag || 'Not configured';
        case 'move_department':
            return c.department || 'Not configured';
        case 'add_note':
            return c.body ? c.body.substring(0, 40) + (c.body.length > 40 ? '...' : '') : 'Not configured';
        case 'send_email':
            return c.to || 'Not configured';
        case 'send_webhook':
            return c.url || 'Not configured';
        case 'delay':
            return `Wait ${c.duration || 1} ${c.unit || 'hours'}`;
        case 'apply_macro':
            return c.macro || 'Not configured';
        case 'close_ticket':
            return 'Close immediately';
        case 'snooze':
            return `${c.duration || 1} ${c.unit || 'hours'}`;
        default:
            return 'Not configured';
    }
}

// Drag-and-drop reordering
function onDragStart(index) {
    dragIndex.value = index;
}

function onDragOver(event, index) {
    event.preventDefault();
    if (dragIndex.value === null || dragIndex.value === index) return;
    const newActions = [...actions.value];
    const [moved] = newActions.splice(dragIndex.value, 1);
    newActions.splice(index, 0, moved);
    emit('update:modelValue', newActions);
    dragIndex.value = index;
}

function onDragEnd() {
    dragIndex.value = null;
}
</script>

<template>
    <div class="space-y-0">
        <div v-for="(action, i) in actions" :key="i" class="relative">
            <!-- Connector line -->
            <div v-if="i > 0" class="flex justify-center">
                <div class="h-6 w-px bg-[var(--esc-panel-border)]" />
            </div>

            <!-- Delay divider -->
            <div
                v-if="action.type === 'delay'"
                class="my-1 flex items-center gap-3"
                draggable="true"
                @dragstart="onDragStart(i)"
                @dragover="onDragOver($event, i)"
                @dragend="onDragEnd"
            >
                <div class="h-px flex-1 border-t border-dashed border-orange-500/40" />
                <div
                    class="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5"
                >
                    <svg
                        class="h-4 w-4 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span class="text-xs font-medium text-orange-400">{{ getActionSummary(action) }}</span>
                    <button type="button" class="ml-1 text-orange-400/60 hover:text-rose-400" @click="removeAction(i)">
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="h-px flex-1 border-t border-dashed border-orange-500/40" />
            </div>

            <!-- Regular action card -->
            <div
                v-else
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] transition-all"
                :class="expandedIndex === i ? 'shadow-lg' : ''"
                draggable="true"
                @dragstart="onDragStart(i)"
                @dragover="onDragOver($event, i)"
                @dragend="onDragEnd"
            >
                <!-- Action header -->
                <div class="flex cursor-pointer items-center gap-3 px-4 py-3" @click="toggleExpand(i)">
                    <!-- Drag handle -->
                    <div class="cursor-grab text-[var(--esc-panel-text-muted)]">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="1.5" />
                            <circle cx="15" cy="6" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="18" r="1.5" />
                            <circle cx="15" cy="18" r="1.5" />
                        </svg>
                    </div>

                    <!-- Icon -->
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-lg"
                        :class="getActionType(action.type).color"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="getActionType(action.type).icon" />
                        </svg>
                    </div>

                    <!-- Label and summary -->
                    <div class="min-w-0 flex-1">
                        <div class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            {{ getActionType(action.type).label }}
                        </div>
                        <div class="truncate text-xs text-[var(--esc-panel-text-muted)]">
                            {{ getActionSummary(action) }}
                        </div>
                    </div>

                    <!-- Expand/collapse chevron -->
                    <svg
                        class="h-4 w-4 text-[var(--esc-panel-text-muted)] transition-transform"
                        :class="expandedIndex === i ? 'rotate-180' : ''"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>

                    <!-- Remove -->
                    <button
                        type="button"
                        class="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--esc-panel-text-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                        @click.stop="removeAction(i)"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Expanded config -->
                <div v-if="expandedIndex === i" class="border-t border-[var(--esc-panel-border)] px-4 pb-4">
                    <WorkflowActionConfig
                        :action-type="action.type"
                        :model-value="action.config"
                        @update:model-value="updateConfig(i, $event)"
                    />
                </div>
            </div>
        </div>

        <!-- Connector to add button -->
        <div v-if="actions.length" class="flex justify-center">
            <div class="h-6 w-px bg-[var(--esc-panel-border)]" />
        </div>

        <!-- Add action -->
        <div class="relative">
            <button
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--esc-panel-border)] px-4 py-3 text-sm text-[var(--esc-panel-text-muted)] transition-all hover:border-emerald-500/50 hover:text-emerald-400"
                @click="showTypeSelector = !showTypeSelector"
            >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Action
            </button>

            <!-- Action type selector dropdown -->
            <div
                v-if="showTypeSelector"
                class="absolute left-0 z-20 mt-2 w-full rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] py-2 shadow-2xl"
            >
                <button
                    v-for="at in actionTypes"
                    :key="at.value"
                    type="button"
                    class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[var(--esc-panel-hover)]"
                    @click="addAction(at.value)"
                >
                    <div class="flex h-7 w-7 items-center justify-center rounded-lg" :class="at.color">
                        <svg
                            class="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" :d="at.icon" />
                        </svg>
                    </div>
                    <span class="text-sm text-[var(--esc-panel-text-secondary)]">{{ at.label }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
