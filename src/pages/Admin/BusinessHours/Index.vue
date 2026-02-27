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
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Schedule
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Name
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Timezone
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Default
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Holidays
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!schedules?.length">
                        <td colspan="5" class="px-4 py-12 text-center">
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
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p class="text-sm text-neutral-500">No business schedules yet</p>
                            <p class="mt-1 text-xs text-neutral-600">
                                Create a schedule to define your team's working hours
                            </p>
                        </td>
                    </tr>
                    <tr v-for="sched in schedules" :key="sched.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ sched.name }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ sched.timezone }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                v-if="sched.is_default"
                                class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20"
                                >Default</span
                            >
                            <span v-else class="text-neutral-500">-</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ sched.holidays?.length || 0 }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.business-hours.edit', sched.id)"
                                class="text-neutral-300 hover:text-white"
                                >Edit</Link
                            >
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
