<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

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
    form.actions.forEach((a, i) => { a.order = i; });
}

function moveAction(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.actions.length) return;
    const temp = form.actions[index];
    form.actions[index] = form.actions[newIndex];
    form.actions[newIndex] = temp;
    form.actions.forEach((a, i) => { a.order = i; });
}

function create() {
    form.post(route('escalated.admin.macros.store'), {
        onSuccess: () => { form.reset(); showForm.value = false; },
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
        onSuccess: () => { editingMacro.value = null; form.reset(); showForm.value = false; },
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

const inputClass = 'w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';
const selectClass = 'rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';
</script>

<template>
    <EscalatedLayout title="Macros">
        <!-- Top bar -->
        <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-neutral-500">
                Macros automate repetitive actions on tickets.
            </p>
            <button @click="showForm ? cancelEdit() : (showForm = true)"
                    :class="showForm
                        ? 'rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]'
                        : 'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400'">
                {{ showForm ? 'Cancel' : 'Create Macro' }}
            </button>
        </div>

        <!-- Create/Edit form -->
        <form v-if="showForm" @submit.prevent="handleSubmit" class="mb-6 space-y-4 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1 block text-sm font-medium text-neutral-300">Name</label>
                    <input v-model="form.name" type="text" required placeholder="e.g., Close & Thank"
                           :class="inputClass" />
                </div>
                <div>
                    <label class="mb-1 block text-sm font-medium text-neutral-300">Description</label>
                    <input v-model="form.description" type="text" placeholder="Optional description"
                           :class="inputClass" />
                </div>
            </div>

            <div class="flex items-center gap-3">
                <label class="flex items-center gap-2">
                    <input v-model="form.is_shared" type="checkbox"
                           class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10" />
                    <span class="text-sm text-neutral-300">Shared with all agents</span>
                </label>
            </div>

            <!-- Action builder -->
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-neutral-300">Actions</label>
                    <button type="button" @click="addAction"
                            class="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-200">
                        + Add Action
                    </button>
                </div>

                <div v-if="!form.actions.length" class="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center">
                    <p class="text-sm text-neutral-600">No actions yet. Add actions to define what this macro does.</p>
                </div>

                <div v-else class="space-y-2">
                    <div v-for="(action, index) in form.actions" :key="index"
                         class="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <!-- Order controls -->
                        <div class="flex flex-col gap-0.5">
                            <button type="button" @click="moveAction(index, -1)"
                                    :disabled="index === 0"
                                    class="rounded p-0.5 text-neutral-600 transition-colors hover:bg-white/[0.06] hover:text-neutral-400 disabled:opacity-30">
                                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                            </button>
                            <button type="button" @click="moveAction(index, 1)"
                                    :disabled="index === form.actions.length - 1"
                                    class="rounded p-0.5 text-neutral-600 transition-colors hover:bg-white/[0.06] hover:text-neutral-400 disabled:opacity-30">
                                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>

                        <!-- Action number -->
                        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-xs font-semibold text-neutral-500">
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

                        <select v-else-if="action.type === 'priority'" v-model="action.value" :class="[selectClass, 'flex-1']">
                            <option value="">Select priority...</option>
                            <option v-for="p in priorityOptions" :key="p" :value="p">{{ p }}</option>
                        </select>

                        <input v-else-if="action.type === 'assign'" v-model="action.value" type="text"
                               placeholder="Agent ID or email"
                               :class="[inputClass, 'flex-1']" />

                        <input v-else-if="action.type === 'tags'" v-model="action.value" type="text"
                               placeholder="Comma-separated tag names"
                               :class="[inputClass, 'flex-1']" />

                        <input v-else-if="action.type === 'department'" v-model="action.value" type="text"
                               placeholder="Department ID or name"
                               :class="[inputClass, 'flex-1']" />

                        <textarea v-else-if="action.type === 'reply' || action.type === 'note'"
                                  v-model="action.value" rows="2"
                                  :placeholder="action.type === 'reply' ? 'Reply message...' : 'Note content...'"
                                  :class="[inputClass, 'flex-1']">
                        </textarea>

                        <input v-else v-model="action.value" type="text" placeholder="Value"
                               :class="[inputClass, 'flex-1']" />

                        <!-- Remove -->
                        <button type="button" @click="removeAction(index)"
                                class="shrink-0 rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    {{ editingMacro ? 'Update Macro' : 'Create Macro' }}
                </button>
            </div>
        </form>

        <!-- Macros table -->
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Description</th>
                        <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                        <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Shared</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Creator</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!macros?.length">
                        <td colspan="6" class="px-4 py-12 text-center">
                            <svg class="mx-auto mb-3 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <p class="text-sm text-neutral-500">No macros yet</p>
                            <p class="mt-1 text-xs text-neutral-600">Create macros to automate repetitive ticket actions</p>
                        </td>
                    </tr>
                    <tr v-for="macro in macros" :key="macro.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3">
                            <span class="text-sm font-medium text-neutral-200">{{ macro.name }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span class="text-sm text-neutral-400">{{ macro.description || '--' }}</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span class="inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-400 ring-1 ring-white/[0.06]">
                                {{ macro.actions?.length || 0 }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span v-if="macro.is_shared"
                                  class="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/20">
                                Shared
                            </span>
                            <span v-else class="text-xs text-neutral-600">Private</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">
                            {{ macro.creator?.name || macro.user?.name || '--' }}
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button @click="startEdit(macro)" class="text-neutral-300 hover:text-white">Edit</button>
                            <button @click="destroy(macro.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
