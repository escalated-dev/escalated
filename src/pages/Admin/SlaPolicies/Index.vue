<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ policies: Array });

function destroy(id) {
    if (confirm('Delete this SLA policy?')) {
        router.delete(route('escalated.admin.sla-policies.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="SLA Policies">
        <div class="mb-4 flex justify-end">
            <Link :href="route('escalated.admin.sla-policies.create')"
                  class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400">
                Add Policy
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-gray-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Default</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Business Hours</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tickets</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="policy in policies" :key="policy.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-gray-200">{{ policy.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ policy.is_default ? 'Yes' : 'No' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ policy.business_hours_only ? 'Yes' : 'No' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ policy.tickets_count }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="policy.is_active ? 'text-emerald-400' : 'text-gray-500'">{{ policy.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.sla-policies.edit', policy.id)" class="text-cyan-400 hover:text-cyan-300">Edit</Link>
                            <button @click="destroy(policy.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
