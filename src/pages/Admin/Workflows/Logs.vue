<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { ref } from 'vue';

defineProps({
    logs: { type: Array, default: () => [] },
    workflows: { type: Array, default: () => [] },
});

const expandedLog = ref(null);
const filterWorkflow = ref('');
const filterDateFrom = ref('');
const filterDateTo = ref('');
const filterTicket = ref('');

function toggleLog(id) {
    expandedLog.value = expandedLog.value === id ? null : id;
}

function statusBadgeClass(status) {
    switch (status) {
        case 'success':
            return 'bg-emerald-500/10 text-emerald-400';
        case 'failed':
            return 'bg-rose-500/10 text-rose-400';
        case 'skipped':
            return 'bg-gray-500/10 text-gray-400';
        default:
            return 'bg-gray-500/10 text-gray-400';
    }
}

function statusLabel(status) {
    switch (status) {
        case 'success':
            return 'Success';
        case 'failed':
            return 'Failed';
        case 'skipped':
            return 'Skipped';
        default:
            return status;
    }
}

function actionStatusIcon(status) {
    switch (status) {
        case 'success':
            return 'M4.5 12.75l6 6 9-13.5';
        case 'failed':
            return 'M6 18L18 6M6 6l12 12';
        case 'skipped':
            return 'M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z';
        default:
            return 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z';
    }
}
</script>

<template>
    <EscalatedLayout title="Workflow Logs">
        <div class="mb-4">
            <h2 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Workflow Execution Logs</h2>
            <p class="text-xs text-[var(--esc-panel-text-muted)]">Track workflow executions and debug issues</p>
        </div>

        <!-- Filters -->
        <div
            class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4"
        >
            <div>
                <label class="block text-[10px] font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                    >Workflow</label
                >
                <select
                    v-model="filterWorkflow"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                >
                    <option value="">All Workflows</option>
                    <option v-for="w in workflows" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                    >From</label
                >
                <input
                    v-model="filterDateFrom"
                    type="date"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                />
            </div>
            <div>
                <label class="block text-[10px] font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                    >To</label
                >
                <input
                    v-model="filterDateTo"
                    type="date"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                />
            </div>
            <div>
                <label class="block text-[10px] font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                    >Ticket</label
                >
                <input
                    v-model="filterTicket"
                    type="text"
                    placeholder="Reference..."
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-2 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none"
                />
            </div>
        </div>

        <!-- Logs table -->
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Timestamp
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Workflow
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Ticket
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Event
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Matched
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Duration
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!logs?.length">
                        <td colspan="8" class="px-4 py-12 text-center">
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
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No execution logs yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Logs appear when workflows are triggered
                            </p>
                        </td>
                    </tr>
                    <template v-for="log in logs" :key="log.id">
                        <tr
                            class="cursor-pointer transition-colors hover:bg-[var(--esc-panel-hover)]"
                            @click="toggleLog(log.id)"
                        >
                            <td class="px-4 py-3 text-xs text-[var(--esc-panel-text-tertiary)]">
                                {{ log.created_at }}
                            </td>
                            <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                {{ log.workflow_name }}
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ log.ticket_reference }}
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ log.event }}
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                                    :class="
                                        log.matched
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-gray-500/10 text-gray-400'
                                    "
                                >
                                    {{ log.matched ? 'Yes' : 'No' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ log.actions_executed || 0 }}
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ log.duration_ms ? log.duration_ms + 'ms' : '---' }}
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                                    :class="statusBadgeClass(log.status)"
                                >
                                    {{ statusLabel(log.status) }}
                                </span>
                            </td>
                        </tr>
                        <!-- Expanded detail row -->
                        <tr v-if="expandedLog === log.id">
                            <td colspan="8" class="bg-[var(--esc-panel-hover)] px-6 py-4">
                                <h4
                                    class="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                                >
                                    Action-by-Action Execution
                                </h4>
                                <div v-if="log.action_details?.length" class="space-y-2">
                                    <div
                                        v-for="(detail, i) in log.action_details"
                                        :key="i"
                                        class="flex items-start gap-3 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-3"
                                    >
                                        <svg
                                            class="mt-0.5 h-4 w-4 flex-shrink-0"
                                            :class="statusBadgeClass(detail.status).split(' ')[1]"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                :d="actionStatusIcon(detail.status)"
                                            />
                                        </svg>
                                        <div class="min-w-0 flex-1">
                                            <div class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                                {{ detail.action_type }}
                                            </div>
                                            <div
                                                v-if="detail.message"
                                                class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]"
                                            >
                                                {{ detail.message }}
                                            </div>
                                            <div v-if="detail.error" class="mt-1 text-xs text-rose-400">
                                                {{ detail.error }}
                                            </div>
                                        </div>
                                        <div class="text-xs text-[var(--esc-panel-text-muted)]">
                                            {{ detail.duration_ms ? detail.duration_ms + 'ms' : '' }}
                                        </div>
                                    </div>
                                </div>
                                <p v-else class="text-xs text-[var(--esc-panel-text-muted)]">
                                    No detailed action logs available
                                </p>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
