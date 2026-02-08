<script setup>
import EscalatedLayout from '../../../../Components/Escalated/EscalatedLayout.vue';
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
            <Link :href="route('escalated.admin.sla-policies.create')" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Add Policy
            </Link>
        </div>
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Default</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Business Hours</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tickets</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Active</th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="policy in policies" :key="policy.id">
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ policy.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ policy.is_default ? 'Yes' : 'No' }}</td>
                        <td class="px-4 py-3 text-sm">{{ policy.business_hours_only ? 'Yes' : 'No' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ policy.tickets_count }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="policy.is_active ? 'text-green-600' : 'text-gray-400'">{{ policy.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.sla-policies.edit', policy.id)" class="text-indigo-600 hover:text-indigo-900">Edit</Link>
                            <button @click="destroy(policy.id)" class="ml-3 text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
