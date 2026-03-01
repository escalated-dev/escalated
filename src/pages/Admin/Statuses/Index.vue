<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    statuses: Array,
    categories: Array,
});

const categoryLabels = {
    new: 'New',
    open: 'Open',
    pending: 'Pending',
    on_hold: 'On-Hold',
    solved: 'Solved',
};

const groupedStatuses = computed(() => {
    const groups = {};
    for (const cat of props.categories || []) {
        groups[cat] = (props.statuses || []).filter((s) => s.category === cat);
    }
    return groups;
});

function destroy(id) {
    if (confirm('Delete this status?')) {
        router.delete(route('escalated.admin.statuses.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Ticket Statuses">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.statuses.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                Add Status
            </Link>
        </div>

        <div
            v-if="!statuses?.length"
            class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] px-4 py-12 text-center"
        >
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <p class="text-sm text-[var(--esc-panel-text-muted)]">No custom statuses yet</p>
            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                Create sub-statuses to track ticket progress in detail
            </p>
        </div>

        <div v-for="cat in categories" :key="cat" class="mb-6">
            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--esc-panel-text-tertiary)]">
                {{ categoryLabels[cat] || cat }}
            </h3>
            <div
                class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]"
            >
                <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                    <thead>
                        <tr class="bg-[var(--esc-panel-hover)]">
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Color
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Label
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Default
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Position
                            </th>
                            <th
                                class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--esc-panel-border)]">
                        <tr v-if="!groupedStatuses[cat]?.length">
                            <td colspan="5" class="px-4 py-6 text-center text-sm text-[var(--esc-panel-text-muted)]">
                                No statuses in this category
                            </td>
                        </tr>
                        <tr
                            v-for="status in groupedStatuses[cat]"
                            :key="status.id"
                            class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                        >
                            <td class="px-4 py-3">
                                <span
                                    class="inline-block h-4 w-4 rounded-full ring-1 ring-[var(--esc-panel-border-input)]"
                                    :style="{ backgroundColor: status.color }"
                                ></span>
                            </td>
                            <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                {{ status.label }}
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <span
                                    v-if="status.is_default"
                                    class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20"
                                    >Default</span
                                >
                                <span v-else class="text-[var(--esc-panel-text-muted)]">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ status.position }}
                            </td>
                            <td class="px-4 py-3 text-right text-sm">
                                <Link
                                    :href="route('escalated.admin.statuses.edit', status.id)"
                                    class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                >
                                    Edit
                                </Link>
                                <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(status.id)">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </EscalatedLayout>
</template>
