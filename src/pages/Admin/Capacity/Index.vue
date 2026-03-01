<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import AgentLoadIndicator from '../../../components/AgentLoadIndicator.vue';
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ capacities: Array });

const editingId = ref(null);
const editForm = useForm({ max_concurrent: 10 });

function startEdit(cap) {
    editingId.value = cap.id;
    editForm.max_concurrent = cap.max_concurrent;
}

function saveEdit(id) {
    editForm.put(route('escalated.admin.capacity.update', id), {
        preserveScroll: true,
        onSuccess: () => {
            editingId.value = null;
        },
    });
}
</script>

<template>
    <EscalatedLayout title="Agent Capacity">
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Agent
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Channel
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Max Concurrent
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Current Load
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!capacities?.length">
                        <td colspan="5" class="px-4 py-12 text-center">
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
                                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No capacity records yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Capacity records are created when agents are assigned tickets
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="cap in capacities"
                        :key="cap.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            {{ cap.agent_name }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">{{ cap.channel }}</td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-secondary)]">
                            <template v-if="editingId === cap.id">
                                <form class="flex items-center gap-2" @submit.prevent="saveEdit(cap.id)">
                                    <input
                                        v-model.number="editForm.max_concurrent"
                                        type="number"
                                        min="1"
                                        max="999"
                                        class="w-20 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                    />
                                    <button
                                        type="submit"
                                        class="text-xs text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        class="text-xs text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                                        @click="editingId = null"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </template>
                            <template v-else>{{ cap.max_concurrent }}</template>
                        </td>
                        <td class="px-4 py-3">
                            <AgentLoadIndicator :current="cap.current_count" :max="cap.max_concurrent" />
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button
                                class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                @click="startEdit(cap)"
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
