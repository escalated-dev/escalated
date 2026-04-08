<script setup>
import { inject, computed, reactive, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../utils/constants';

const props = defineProps({
    statuses: {
        type: Array,
        default: () => TICKET_STATUSES,
    },
    priorities: { type: Array, default: () => TICKET_PRIORITIES },
    agents: { type: Array, default: () => [] },
    departments: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] },
    filters: { type: Object, default: () => ({}) },
    route: { type: String, required: true },
    modelValue: { type: Object, default: () => ({}) },
    showFollowing: { type: Boolean, default: false },
    showAssignee: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'save-view']);
const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const initial = { ...props.filters, ...props.modelValue };

const filterData = reactive({
    status: initial.status || '',
    priority: initial.priority || '',
    assigned_to: initial.assigned_to || '',
    department_id: initial.department_id || '',
    search: initial.search || '',
    following: initial.following || '',
    created_after: initial.created_after || '',
    created_before: initial.created_before || '',
    tag: initial.tag || '',
    has_attachments: initial.has_attachments || '',
    requester: initial.requester || '',
    ticket_type: initial.ticket_type || '',
});

const showAdvanced = ref(
    !!(initial.created_after || initial.created_before || initial.tag || initial.has_attachments || initial.requester),
);

// Debounced watcher that navigates via Inertia router
let debounceTimer = null;

watch(
    filterData,
    (val) => {
        emit('update:modelValue', { ...val });

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            // Strip empty values to keep the URL clean
            const params = {};
            for (const [key, value] of Object.entries(val)) {
                if (value !== '' && value !== null && value !== undefined) {
                    params[key] = value;
                }
            }
            router.get(props.route, params, { preserveState: true, preserveScroll: true });
        }, 300);
    },
    { deep: true },
);

const inputClass = computed(() =>
    escDark.value
        ? 'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]'
        : 'rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none',
);

const selectClass = computed(() =>
    escDark.value
        ? 'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]'
        : 'rounded-md border border-gray-300 px-2 py-1.5 text-sm',
);

const checkboxClass = computed(() =>
    escDark.value
        ? 'h-4 w-4 rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-accent)] focus:ring-[var(--esc-panel-accent)]/20'
        : 'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500',
);

const toggleBtnClass = computed(() =>
    escDark.value
        ? 'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-surface-alt)] transition-colors'
        : 'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors',
);

const labelClass = computed(() =>
    escDark.value ? 'text-xs font-medium text-[var(--esc-panel-text-tertiary)]' : 'text-xs font-medium text-gray-500',
);

const hasActiveFilters = computed(() => {
    return Object.values(filterData).some((v) => v !== '' && v !== null && v !== undefined);
});

defineExpose({ filterData });
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
            <input
                v-model="filterData.search"
                type="text"
                placeholder="Search tickets..."
                aria-label="Search tickets"
                :class="inputClass"
            />
            <button type="button" :class="toggleBtnClass" @click="showAdvanced = !showAdvanced">
                {{ showAdvanced ? 'Simple' : 'Advanced' }}
            </button>
            <button
                v-if="hasActiveFilters"
                type="button"
                :class="[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    escDark
                        ? 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                ]"
                @click="emit('save-view')"
            >
                Save as View
            </button>
            <select v-model="filterData.status" aria-label="Filter by status" :class="selectClass">
                <option value="">All Statuses</option>
                <option v-for="s in statuses" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
            </select>
            <select v-model="filterData.priority" aria-label="Filter by priority" :class="selectClass">
                <option value="">All Priorities</option>
                <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
            </select>
            <select v-model="filterData.ticket_type" aria-label="Filter by type" :class="selectClass">
                <option value="">All Types</option>
                <option value="question">Question</option>
                <option value="problem">Problem</option>
                <option value="incident">Incident</option>
                <option value="task">Task</option>
            </select>
            <select
                v-if="agents.length"
                v-model="filterData.assigned_to"
                aria-label="Filter by agent"
                :class="selectClass"
            >
                <option value="">All Agents</option>
                <option v-for="a in agents" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
            <select
                v-if="departments.length"
                v-model="filterData.department_id"
                aria-label="Filter by department"
                :class="selectClass"
            >
                <option value="">All Departments</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <label v-if="showFollowing" class="flex items-center gap-2">
                <input
                    v-model="filterData.following"
                    type="checkbox"
                    true-value="1"
                    false-value=""
                    :class="checkboxClass"
                />
                <span :class="['text-sm', escDark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600']"
                    >Following</span
                >
            </label>
        </div>

        <!-- Advanced filters -->
        <div
            v-if="showAdvanced"
            class="flex flex-wrap items-end gap-4 rounded-lg border p-3"
            :class="
                escDark
                    ? 'border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)]'
                    : 'border-gray-200 bg-gray-50'
            "
        >
            <div class="flex flex-col gap-1">
                <label :class="labelClass">Created after</label>
                <input
                    v-model="filterData.created_after"
                    type="date"
                    aria-label="Created after date"
                    :class="inputClass"
                />
            </div>
            <div class="flex flex-col gap-1">
                <label :class="labelClass">Created before</label>
                <input
                    v-model="filterData.created_before"
                    type="date"
                    aria-label="Created before date"
                    :class="inputClass"
                />
            </div>
            <div class="flex flex-col gap-1">
                <label :class="labelClass">Tag</label>
                <input
                    v-model="filterData.tag"
                    type="text"
                    placeholder="Tag name..."
                    aria-label="Filter by tag name"
                    :class="inputClass"
                />
            </div>
            <div class="flex flex-col gap-1">
                <label :class="labelClass">Requester</label>
                <input
                    v-model="filterData.requester"
                    type="text"
                    placeholder="Name or email..."
                    aria-label="Filter by requester"
                    :class="inputClass"
                />
            </div>
            <label class="flex items-center gap-2 self-center pt-4">
                <input
                    v-model="filterData.has_attachments"
                    type="checkbox"
                    true-value="1"
                    false-value=""
                    :class="checkboxClass"
                />
                <span :class="['text-sm', escDark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600']"
                    >Has attachments</span
                >
            </label>
        </div>
    </div>
</template>
