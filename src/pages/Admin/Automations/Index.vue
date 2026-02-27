<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ automations: Array });

function destroy(id) {
    if (confirm('Delete this automation?')) {
        router.delete(route('escalated.admin.automations.destroy', id));
    }
}

function conditionsSummary(automation) {
    return (automation.conditions || []).map((c) => `${c.field} ${c.operator} ${c.value}`).join(', ');
}

function actionsSummary(automation) {
    return (automation.actions || []).map((a) => `${a.type}: ${a.value}`).join(', ');
}
</script>

<template>
    <EscalatedLayout title="Automations">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.automations.create')"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Automation
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
                            Conditions
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Active
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Last Run
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!automations?.length">
                        <td colspan="6" class="px-4 py-12 text-center">
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
                            <p class="text-sm text-neutral-500">No automations yet</p>
                            <p class="mt-1 text-xs text-neutral-600">
                                Create time-based automations to act on idle tickets
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="automation in automations"
                        :key="automation.id"
                        class="transition-colors hover:bg-white/[0.03]"
                    >
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ automation.name }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400 max-w-xs truncate">
                            {{ conditionsSummary(automation) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400 max-w-xs truncate">
                            {{ actionsSummary(automation) }}
                        </td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="automation.active ? 'text-emerald-400' : 'text-neutral-500'">{{
                                automation.active ? 'Yes' : 'No'
                            }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ automation.last_run_at || '---' }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.automations.edit', automation.id)"
                                class="text-neutral-300 hover:text-white"
                                >Edit</Link
                            >
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(automation.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
