<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    workflows: { type: Array, default: () => [] },
});

const dragIndex = ref(null);

function destroy(id) {
    if (confirm('Delete this workflow? This cannot be undone.')) {
        router.delete(route('escalated.admin.workflows.destroy', id));
    }
}

function toggleActive(workflow) {
    router.put(route('escalated.admin.workflows.toggle', workflow.id), {
        active: !workflow.active,
    });
}

function onDragStart(index) {
    dragIndex.value = index;
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event, workflows, targetIndex) {
    event.preventDefault();
    if (dragIndex.value === null || dragIndex.value === targetIndex) return;
    const ids = workflows.map((w) => w.id);
    const [moved] = ids.splice(dragIndex.value, 1);
    ids.splice(targetIndex, 0, moved);
    router.post(route('escalated.admin.workflows.reorder'), { ids });
    dragIndex.value = null;
}

function onDragEnd() {
    dragIndex.value = null;
}

function triggerBadgeClass(trigger) {
    const classes = {
        ticket_created: 'bg-blue-500/10 text-blue-400',
        ticket_updated: 'bg-cyan-500/10 text-cyan-400',
        reply_added: 'bg-emerald-500/10 text-emerald-400',
        status_changed: 'bg-violet-500/10 text-violet-400',
        ticket_assigned: 'bg-indigo-500/10 text-indigo-400',
        ticket_escalated: 'bg-red-500/10 text-red-400',
        sla_breached: 'bg-rose-500/10 text-rose-400',
        sla_warning: 'bg-amber-500/10 text-amber-400',
        chat_started: 'bg-teal-500/10 text-teal-400',
        chat_ended: 'bg-gray-500/10 text-gray-400',
    };
    return classes[trigger] || 'bg-gray-500/10 text-gray-400';
}

function triggerLabel(trigger) {
    return (trigger || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<template>
    <EscalatedLayout title="Workflows">
        <div class="mb-4 flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Workflows</h2>
                <p class="text-xs text-[var(--esc-panel-text-muted)]">
                    Event-driven automations with conditions, actions, and delays
                </p>
            </div>
            <div class="flex items-center gap-3">
                <Link
                    :href="route('escalated.admin.workflows.logs')"
                    class="rounded-lg border border-[var(--esc-panel-border)] px-3 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                >
                    View Logs
                </Link>
                <Link
                    :href="route('escalated.admin.workflows.create')"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
                >
                    Create Workflow
                </Link>
            </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th class="w-8 px-2 py-3" />
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Name
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Trigger
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Status
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Last Triggered
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Runs
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!workflows?.length">
                        <td colspan="7" class="px-4 py-12 text-center">
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
                                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No workflows yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Create event-driven automations with conditions and actions
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="(workflow, i) in workflows"
                        :key="workflow.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                        draggable="true"
                        @dragstart="onDragStart(i)"
                        @dragover="onDragOver($event)"
                        @drop="onDrop($event, workflows, i)"
                        @dragend="onDragEnd"
                    >
                        <td class="px-2 py-3">
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
                        </td>
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.workflows.edit', workflow.id)"
                                class="text-sm font-medium text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                {{ workflow.name }}
                            </Link>
                            <p
                                v-if="workflow.description"
                                class="mt-0.5 truncate text-xs text-[var(--esc-panel-text-muted)]"
                            >
                                {{ workflow.description }}
                            </p>
                        </td>
                        <td class="px-4 py-3">
                            <span
                                class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                                :class="triggerBadgeClass(workflow.trigger)"
                            >
                                {{ triggerLabel(workflow.trigger) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <button
                                type="button"
                                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                :class="workflow.active ? 'bg-emerald-500' : 'bg-[var(--esc-panel-border)]'"
                                @click="toggleActive(workflow)"
                            >
                                <span
                                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                    :class="workflow.active ? 'translate-x-4' : 'translate-x-0'"
                                />
                            </button>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ workflow.last_triggered_at || '---' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ workflow.trigger_count || 0 }}
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.workflows.edit', workflow.id)"
                                class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                Edit
                            </Link>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(workflow.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
