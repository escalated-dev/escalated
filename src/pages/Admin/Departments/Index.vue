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
                  class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400">
                Add Department
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-gray-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tickets</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Agents</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="dept in departments" :key="dept.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-gray-200">{{ dept.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ dept.tickets_count }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ dept.agents_count }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="dept.is_active ? 'text-emerald-400' : 'text-gray-500'">{{ dept.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.departments.edit', dept.id)" class="text-cyan-400 hover:text-cyan-300">Edit</Link>
                            <button @click="destroy(dept.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
