<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ departments: Array });

function destroy(id) {
    if (confirm('Delete this department?')) {
        router.delete(route('escalated.admin.departments.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Departments">
        <div class="mb-4 flex justify-end">
            <Link :href="route('escalated.admin.departments.create')"
                  class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400">
                Add Department
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Tickets</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Agents</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Active</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="dept in departments" :key="dept.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ dept.name }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ dept.tickets_count }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ dept.agents_count }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="dept.is_active ? 'text-emerald-400' : 'text-neutral-500'">{{ dept.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.departments.edit', dept.id)" class="text-neutral-300 hover:text-white">Edit</Link>
                            <button @click="destroy(dept.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="!departments?.length">
                        <td colspan="5" class="px-4 py-12 text-center">
                            <svg class="mx-auto mb-3 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" /></svg>
                            <p class="text-sm text-neutral-500">No departments yet</p>
                            <p class="mt-1 text-xs text-neutral-600">Create your first department to organize tickets</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
