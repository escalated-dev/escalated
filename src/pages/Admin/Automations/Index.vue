<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

/**
 * Automations are the time-based half of the admin automation surface: a cron
 * scan matches open tickets on how long they have been sitting and applies
 * actions. Workflows are the event-driven half, and Macros are the agent's
 * manual one. The three co-exist; none subsumes the others.
 */
defineProps({
    automations: { type: Array, default: () => [] },
});

const FIELD_LABELS = {
    hours_since_created: 'Hours since created',
    hours_since_updated: 'Hours since updated',
    hours_since_assigned: 'Hours since assigned',
    status: 'Status',
    priority: 'Priority',
    assigned: 'Assignment',
    ticket_type: 'Type',
    subject_contains: 'Subject contains',
};

const ACTION_LABELS = {
    change_status: 'Change status',
    assign: 'Assign to',
    add_tag: 'Add tag',
    change_priority: 'Change priority',
    add_note: 'Add internal note',
    set_ticket_type: 'Set type',
};

function destroy(id) {
    if (confirm('Delete this automation? This cannot be undone.')) {
        router.delete(route('escalated.admin.automations.destroy', id));
    }
}

function toggleActive(automation) {
    router.put(route('escalated.admin.automations.update', automation.id), {
        name: automation.name,
        conditions: automation.conditions ?? [],
        actions: automation.actions ?? [],
        active: !automation.active,
    });
}

/** A condition in the words an admin would use, not the words it is stored in. */
function conditionSummary(condition) {
    const label = FIELD_LABELS[condition?.field] ?? condition?.field ?? '';

    if (!label) {
        return '';
    }

    if (String(condition.field ?? '').startsWith('hours_since_')) {
        return `${label} ${condition.operator ?? '>'} ${condition.value}`;
    }

    return `${label} is ${condition.value}`;
}

function actionSummary(action) {
    const label = ACTION_LABELS[action?.type] ?? action?.type ?? '';

    if (!label) {
        return '';
    }

    return action.value === undefined || action.value === null || action.value === ''
        ? label
        : `${label}: ${action.value}`;
}
</script>

<template>
    <EscalatedLayout title="Automations">
        <div class="mb-4 flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Automations</h2>
                <p class="text-xs text-[var(--esc-panel-text-muted)]">
                    Time-based rules. A scheduled scan matches open tickets on how long they have been waiting and
                    applies actions — for events as they happen, use Workflows.
                </p>
            </div>
            <Link
                :href="route('escalated.admin.automations.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                Create Automation
            </Link>
        </div>

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
                            When
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Then
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Status
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!automations?.length">
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
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No automations yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Chase tickets that have gone quiet — escalate after 24 hours, close after a week
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="automation in automations"
                        :key="automation.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.automations.edit', automation.id)"
                                class="text-sm font-medium text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-accent)]"
                            >
                                {{ automation.name }}
                            </Link>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex flex-wrap gap-1">
                                <span
                                    v-for="(condition, i) in automation.conditions ?? []"
                                    :key="i"
                                    class="rounded bg-[var(--esc-panel-hover)] px-2 py-0.5 text-[11px] text-[var(--esc-panel-text-muted)]"
                                >
                                    {{ conditionSummary(condition) }}
                                </span>
                                <span
                                    v-if="!(automation.conditions ?? []).length"
                                    class="text-[11px] text-[var(--esc-panel-text-muted)]"
                                >
                                    —
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex flex-wrap gap-1">
                                <span
                                    v-for="(action, i) in automation.actions ?? []"
                                    :key="i"
                                    class="rounded bg-[var(--esc-panel-accent)]/10 px-2 py-0.5 text-[11px] text-[var(--esc-panel-accent)]"
                                >
                                    {{ actionSummary(action) }}
                                </span>
                                <span
                                    v-if="!(automation.actions ?? []).length"
                                    class="text-[11px] text-[var(--esc-panel-text-muted)]"
                                >
                                    —
                                </span>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <button
                                type="button"
                                class="rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
                                :class="
                                    automation.active
                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                                "
                                @click="toggleActive(automation)"
                            >
                                {{ automation.active ? 'Active' : 'Paused' }}
                            </button>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('escalated.admin.automations.edit', automation.id)"
                                class="text-xs font-medium text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-accent)]"
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                class="ml-3 text-xs font-medium text-[var(--esc-panel-text-muted)] transition-colors hover:text-red-400"
                                @click="destroy(automation.id)"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
