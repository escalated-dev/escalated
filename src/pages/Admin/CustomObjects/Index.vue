<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { router } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';

defineProps({
    objects: { type: Array, default: () => [] },
});

function deleteObject(obj) {
    if (confirm(`Delete custom object "${obj.name}"? This will also delete all its records.`)) {
        router.delete(route('escalated.admin.custom-objects.destroy', obj.id));
    }
}
</script>

<template>
    <EscalatedLayout title="Custom Objects">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-neutral-200">Custom Objects</h2>
                <p class="mt-1 text-sm text-neutral-500">Define custom data structures with fields and relationships</p>
            </div>
            <Link
                :href="route('escalated.admin.custom-objects.create')"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                New Object
            </Link>
        </div>

        <div v-if="objects.length" class="overflow-hidden rounded-xl border border-white/[0.06]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Name
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Slug
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Fields
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Records
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="obj in objects" :key="obj.id" class="hover:bg-white/[0.02]">
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.custom-objects.edit', obj.id)"
                                class="text-sm font-medium text-neutral-200 hover:text-white"
                            >
                                {{ obj.name }}
                            </Link>
                        </td>
                        <td class="px-4 py-3 text-sm font-mono text-neutral-500">{{ obj.slug }}</td>
                        <td class="px-4 py-3 text-sm text-neutral-400">
                            {{ obj.fields_schema?.length || 0 }}
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">
                            {{ obj.records_count ?? 0 }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('escalated.admin.custom-objects.records', obj.id)"
                                class="mr-3 text-sm text-neutral-500 hover:text-neutral-200"
                            >
                                Records
                            </Link>
                            <Link
                                :href="route('escalated.admin.custom-objects.edit', obj.id)"
                                class="mr-3 text-sm text-neutral-500 hover:text-neutral-200"
                            >
                                Edit
                            </Link>
                            <button class="text-sm text-red-500/60 hover:text-red-400" @click="deleteObject(obj)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="rounded-xl border border-dashed border-white/[0.08] px-6 py-12 text-center">
            <svg
                class="mx-auto mb-3 h-10 w-10 text-neutral-700"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                />
            </svg>
            <p class="text-sm text-neutral-500">No custom objects defined yet.</p>
            <Link
                :href="route('escalated.admin.custom-objects.create')"
                class="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
            >
                Create your first custom object
            </Link>
        </div>
    </EscalatedLayout>
</template>
