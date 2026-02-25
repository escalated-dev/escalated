<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ fields: Array });

const typeLabels = {
    text: 'Text',
    textarea: 'Textarea',
    select: 'Select',
    multi_select: 'Multi-Select',
    checkbox: 'Checkbox',
    date: 'Date',
    number: 'Number',
};

function destroy(id) {
    if (confirm('Delete this custom field?')) {
        router.delete(route('escalated.admin.custom-fields.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Custom Fields">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.custom-fields.create')"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Field
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
                            Type
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Context
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Required
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
                    <tr v-if="!fields?.length">
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
                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                                />
                            </svg>
                            <p class="text-sm text-neutral-500">No custom fields yet</p>
                            <p class="mt-1 text-xs text-neutral-600">
                                Create custom fields to capture additional data on tickets, users, and organizations
                            </p>
                        </td>
                    </tr>
                    <tr v-for="field in fields" :key="field.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ field.name }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ typeLabels[field.type] || field.type }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                class="inline-flex items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-300"
                                >{{ field.context }}</span
                            >
                        </td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                v-if="field.required"
                                class="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/20"
                                >Required</span
                            >
                            <span v-else class="text-neutral-500">-</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ field.position }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.custom-fields.edit', field.id)"
                                class="text-neutral-300 hover:text-white"
                                >Edit</Link
                            >
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(field.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
