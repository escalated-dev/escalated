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
            <Link :href="route('escalated.admin.escalation-rules.create')"
                  class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400">
                Add Rule
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-gray-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Order</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Trigger</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="rule in rules" :key="rule.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm text-gray-400">{{ rule.order }}</td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-200">{{ rule.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-400">{{ rule.trigger_type }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="rule.is_active ? 'text-emerald-400' : 'text-gray-500'">{{ rule.is_active ? 'Yes' : 'No' }}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link :href="route('escalated.admin.escalation-rules.edit', rule.id)" class="text-cyan-400 hover:text-cyan-300">Edit</Link>
                            <button @click="destroy(rule.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
