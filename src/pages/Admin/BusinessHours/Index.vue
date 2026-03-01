<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ schedules: Array });

function destroy(id) {
    if (confirm('Delete this schedule?')) {
        router.delete(route('escalated.admin.business-hours.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Business Hours">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.business-hours.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                Add Schedule
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
                            Timezone
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Default
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Holidays
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!schedules?.length">
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
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No business schedules yet</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Create a schedule to define your team's working hours
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="sched in schedules"
                        :key="sched.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            {{ sched.name }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">{{ sched.timezone }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                v-if="sched.is_default"
                                class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20"
                                >Default</span
                            >
                            <span v-else class="text-[var(--esc-panel-text-muted)]">-</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ sched.holidays?.length || 0 }}
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.business-hours.edit', sched.id)"
                                class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                Edit
                            </Link>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(sched.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
