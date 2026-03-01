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
                <h2 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Custom Objects</h2>
                <p class="mt-1 text-sm text-[var(--esc-panel-text-muted)]">
                    Define custom data structures with fields and relationships
                </p>
            </div>
            <Link
                :href="route('escalated.admin.custom-objects.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                New Object
            </Link>
        </div>

        <div v-if="objects.length" class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Name
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Slug
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Fields
                        </th>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Records
                        </th>
                        <th
                            class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-for="obj in objects" :key="obj.id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="px-4 py-3">
                            <Link
                                :href="route('escalated.admin.custom-objects.edit', obj.id)"
                                class="text-sm font-medium text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                {{ obj.name }}
                            </Link>
                        </td>
                        <td class="px-4 py-3 text-sm font-mono text-[var(--esc-panel-text-muted)]">{{ obj.slug }}</td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ obj.fields_schema?.length || 0 }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ obj.records_count ?? 0 }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('escalated.admin.custom-objects.records', obj.id)"
                                class="mr-3 text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                            >
                                Records
                            </Link>
                            <Link
                                :href="route('escalated.admin.custom-objects.edit', obj.id)"
                                class="mr-3 text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
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

        <div v-else class="rounded-xl border border-dashed border-[var(--esc-panel-border)] px-6 py-12 text-center">
            <svg
                class="mx-auto mb-3 h-10 w-10 text-[var(--esc-panel-text-muted)]"
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
            <p class="text-sm text-[var(--esc-panel-text-muted)]">No custom objects defined yet.</p>
            <Link
                :href="route('escalated.admin.custom-objects.create')"
                class="mt-3 inline-block text-sm text-[var(--esc-panel-accent)] hover:text-[var(--esc-panel-accent)]"
            >
                Create your first custom object
            </Link>
        </div>
    </EscalatedLayout>
</template>
