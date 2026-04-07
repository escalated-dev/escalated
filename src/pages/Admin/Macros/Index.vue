<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ macros: Array });

const showForm = ref(false);
const editingMacro = ref(null);

const form = useForm({
    name: '',
    description: '',
    is_shared: false,
    actions: [],
});

const actionTypes = [
    { value: 'status', label: 'Set Status' },
    { value: 'priority', label: 'Set Priority' },
    { value: 'assign', label: 'Assign To' },
    { value: 'tags', label: 'Add Tags' },
    { value: 'department', label: 'Move to Department' },
    { value: 'reply', label: 'Send Reply' },
    { value: 'note', label: 'Add Internal Note' },
];

const statusOptions = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'];
const priorityOptions = ['low', 'medium', 'high', 'urgent', 'critical'];

function addAction() {
    form.actions.push({ type: 'status', value: '', order: form.actions.length });
}

function removeAction(index) {
    form.actions.splice(index, 1);
    form.actions.forEach((a, i) => {
        a.order = i;
    });
}

function moveAction(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.actions.length) return;
    const temp = form.actions[index];
    form.actions[index] = form.actions[newIndex];
    form.actions[newIndex] = temp;
    form.actions.forEach((a, i) => {
        a.order = i;
    });
}

function create() {
    form.post(route('escalated.admin.macros.store'), {
        onSuccess: () => {
            form.reset();
            showForm.value = false;
        },
    });
}

function startEdit(macro) {
    editingMacro.value = macro.id;
    form.name = macro.name;
    form.description = macro.description || '';
    form.is_shared = macro.is_shared || false;
    form.actions = (macro.actions || []).map((a, i) => ({
        type: a.type,
        value: a.value || '',
        order: a.order ?? i,
    }));
    showForm.value = true;
}

function update() {
    form.put(route('escalated.admin.macros.update', editingMacro.value), {
        onSuccess: () => {
            editingMacro.value = null;
            form.reset();
            showForm.value = false;
        },
    });
}

function destroy(id) {
    if (confirm('Delete this macro? This cannot be undone.')) {
        router.delete(route('escalated.admin.macros.destroy', id));
    }
}

function cancelEdit() {
    editingMacro.value = null;
    form.reset();
    showForm.value = false;
}

function handleSubmit() {
    if (editingMacro.value) {
        update();
    } else {
        create();
    }
}

const inputClass =
    'w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';
const selectClass =
    'rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';
</script>

<template>
    <EscalatedLayout title="Macros">
        <!-- Top bar -->
        <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-[var(--esc-panel-text-muted)]">Macros automate repetitive actions on tickets.</p>
            <button
                :class="
                    showForm
                        ? 'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]'
                        : 'rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]'
                "
                @click="showForm ? cancelEdit() : (showForm = true)"
            >
                {{ showForm ? 'Cancel' : 'Create Macro' }}
            </button>
        </div>

        <!-- Create/Edit form -->
        <form
            v-if="showForm"
            class="mb-6 space-y-4 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5"
            @submit.prevent="handleSubmit"
        >
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                    <input
                        v-model="form.name"
                        type="text"
                        required
                        placeholder="e.g., Close & Thank"
                        :class="inputClass"
                    />
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                        >Description</label
                    >
                    <input
                        v-model="form.description"
                        type="text"
                        placeholder="Optional description"
                        :class="inputClass"
                    />
                </div>
            </div>

            <div class="flex items-center gap-3">
                <label class="flex items-center gap-2">
                    <input
                        v-model="form.is_shared"
                        type="checkbox"
                        class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-cyan-500 focus:ring-[var(--esc-panel-border-input)]"
                    />
                    <span class="text-sm text-[var(--esc-panel-text-secondary)]">Shared with all agents</span>
                </label>
            </div>

            <!-- Action builder -->
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">Actions</label>
                    <button
                        type="button"
                        class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-3 py-1.5 text-xs font-medium text-[var(--esc-panel-text-tertiary)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                        @click="addAction"
                    >
                        + Add Action
                    </button>
                </div>

                <div
                    v-if="!form.actions.length"
                    class="rounded-lg border border-dashed border-[var(--esc-panel-border-input)] px-4 py-6 text-center"
                >
                    <p class="text-sm text-[var(--esc-panel-text-muted)]">
                        No actions yet. Add actions to define what this macro does.
                    </p>
                </div>

                <div v-else class="space-y-2">
                    <div
                        v-for="(action, index) in form.actions"
                        :key="index"
                        class="flex items-center gap-2 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] p-3"
                    >
                        <!-- Order controls -->
                        <div class="flex flex-col gap-0.5">
                            <button
                                type="button"
                                :disabled="index === 0"
                                class="rounded p-0.5 text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-tertiary)] disabled:opacity-30"
                                @click="moveAction(index, -1)"
                            >
                                <svg
                                    class="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                :disabled="index === form.actions.length - 1"
                                class="rounded p-0.5 text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-tertiary)] disabled:opacity-30"
                                @click="moveAction(index, 1)"
                            >
                                <svg
                                    class="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                        </div>

                        <!-- Action number -->
                        <span
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--esc-panel-hover)] text-xs font-semibold text-[var(--esc-panel-text-muted)]"
                        >
                            {{ index + 1 }}
                        </span>

                        <!-- Type dropdown -->
                        <select v-model="action.type" :class="selectClass">
                            <option v-for="at in actionTypes" :key="at.value" :value="at.value">{{ at.label }}</option>
                        </select>

                        <!-- Value input (context-dependent) -->
                        <select v-if="action.type === 'status'" v-model="action.value" :class="[selectClass, 'flex-1']">
                            <option value="">Select status...</option>
                            <option v-for="s in statusOptions" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
                        </select>

                        <select
                            v-else-if="action.type === 'priority'"
                            v-model="action.value"
                            :class="[selectClass, 'flex-1']"
                        >
                            <option value="">Select priority...</option>
                            <option v-for="p in priorityOptions" :key="p" :value="p">{{ p }}</option>
                        </select>

                        <input
                            v-else-if="action.type === 'assign'"
                            v-model="action.value"
                            type="text"
                            placeholder="Agent ID or email"
                            :class="[inputClass, 'flex-1']"
                        />

                        <input
                            v-else-if="action.type === 'tags'"
                            v-model="action.value"
                            type="text"
                            placeholder="Comma-separated tag names"
                            :class="[inputClass, 'flex-1']"
                        />

                        <input
                            v-else-if="action.type === 'department'"
                            v-model="action.value"
                            type="text"
                            placeholder="Department ID or name"
                            :class="[inputClass, 'flex-1']"
                        />

                        <textarea
                            v-else-if="action.type === 'reply' || action.type === 'note'"
                            v-model="action.value"
                            rows="2"
                            :placeholder="action.type === 'reply' ? 'Reply message...' : 'Note content...'"
                            :class="[inputClass, 'flex-1']"
                        >
                        </textarea>

                        <input
                            v-else
                            v-model="action.value"
                            type="text"
                            placeholder="Value"
                            :class="[inputClass, 'flex-1']"
                        />

                        <!-- Remove -->
                        <button
                            type="button"
                            class="shrink-0 rounded-lg p-1.5 text-[var(--esc-panel-text-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                            @click="removeAction(index)"
                        >
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ editingMacro ? 'Update Macro' : 'Create Macro' }}
                </button>
            </div>
        </form>

        <!-- Macros table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Name
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Description
                        </th>
                        <th
                            class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                        <th
                            class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Shared
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Creator
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        ></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!macros?.length">
                        <td colspan="6" class="px-4 py-12 text-center">
                            <svg
                                class="mx-auto mb-3 h-8 w-8 text-[var(--esc-panel-text-muted)]"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No macros yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Create macros to automate repetitive ticket actions
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="macro in macros"
                        :key="macro.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td class="px-4 py-3">
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">{{
                                macro.name
                            }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span class="text-sm text-[var(--esc-panel-text-tertiary)]">{{
                                macro.description || '--'
                            }}</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span
                                class="inline-flex items-center rounded-full bg-[var(--esc-panel-hover)] px-2 py-0.5 text-xs font-medium text-[var(--esc-panel-text-tertiary)] ring-1 ring-[var(--esc-panel-border)]"
                            >
                                {{ macro.actions?.length || 0 }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span
                                v-if="macro.is_shared"
                                class="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/20"
                            >
                                Shared
                            </span>
                            <span v-else class="text-xs text-[var(--esc-panel-text-muted)]">Private</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ macro.creator?.name || macro.user?.name || '--' }}
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button
                                class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                @click="startEdit(macro)"
                            >
                                Edit
                            </button>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(macro.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
