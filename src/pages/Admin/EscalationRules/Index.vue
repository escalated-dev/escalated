<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ rules: Array });

function destroy(id) {
    if (confirm('Delete this escalation rule?')) {
        router.delete(route('escalated.admin.escalation-rules.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Escalation Rules">
        <div class="mb-4 flex justify-end">
            <Link :href="route('escalated.admin.escalation-rules.create')" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Add Rule
            </Link>
        </div>
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Order</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Trigger</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Active</th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="rule in rules" :key="rule.id">
                        <td class="px-4 py-3 text-sm text-gray-500">{{ rule.order }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ rule.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ rule.trigger_type }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="rule.is_active ? 'text-green-600' : 'text-gray-400'">{{ rule.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.escalation-rules.edit', rule.id)" class="text-indigo-600 hover:text-indigo-900">Edit</Link>
                            <button @click="destroy(rule.id)" class="ml-3 text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
