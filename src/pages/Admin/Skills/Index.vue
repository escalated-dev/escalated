<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ skills: Array });

function destroy(id) {
    if (confirm('Delete this skill?')) {
        router.delete(route('escalated.admin.skills.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Skills">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.skills.create')"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Skill
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
                            Agents
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!skills?.length">
                        <td colspan="3" class="px-4 py-12 text-center">
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
                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                />
                            </svg>
                            <p class="text-sm text-neutral-500">No skills yet</p>
                            <p class="mt-1 text-xs text-neutral-600">Create skills for agent routing</p>
                        </td>
                    </tr>
                    <tr v-for="skill in skills" :key="skill.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ skill.name }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ skill.agents_count }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.skills.edit', skill.id)"
                                class="text-neutral-300 hover:text-white"
                            >
                                Edit
                            </Link>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(skill.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
