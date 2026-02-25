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
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Status
            </Link>
        </div>

        <div
            v-if="!statuses?.length"
            class="rounded-xl border border-white/[0.06] bg-neutral-900/60 px-4 py-12 text-center"
        >
            <svg
                class="mx-auto mb-3 h-8 w-8 text-neutral-700"
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
            <p class="text-sm text-neutral-500">No custom statuses yet</p>
            <p class="mt-1 text-xs text-neutral-600">Create sub-statuses to track ticket progress in detail</p>
        </div>

        <div v-for="cat in categories" :key="cat" class="mb-6">
            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-400">
                {{ categoryLabels[cat] || cat }}
            </h3>
            <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
                <table class="min-w-full divide-y divide-white/[0.06]">
                    <thead>
                        <tr class="bg-white/[0.02]">
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                            >
                                Color
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                            >
                                Label
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                            >
                                Default
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                            >
                                Position
                            </th>
                            <th
                                class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.04]">
                        <tr v-if="!groupedStatuses[cat]?.length">
                            <td colspan="5" class="px-4 py-6 text-center text-sm text-neutral-500">
                                No statuses in this category
                            </td>
                        </tr>
                        <tr
                            v-for="status in groupedStatuses[cat]"
                            :key="status.id"
                            class="transition-colors hover:bg-white/[0.03]"
                        >
                            <td class="px-4 py-3">
                                <span
                                    class="inline-block h-4 w-4 rounded-full ring-1 ring-white/10"
                                    :style="{ backgroundColor: status.color }"
                                ></span>
                            </td>
                            <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ status.label }}</td>
                            <td class="px-4 py-3 text-sm">
                                <span
                                    v-if="status.is_default"
                                    class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20"
                                    >Default</span
                                >
                                <span v-else class="text-neutral-500">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-neutral-400">{{ status.position }}</td>
                            <td class="px-4 py-3 text-right text-sm">
                                <Link
                                    :href="route('escalated.admin.statuses.edit', status.id)"
                                    class="text-neutral-300 hover:text-white"
                                    >Edit</Link
                                >
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
