<script setup>
import { router } from '@inertiajs/vue3';

defineProps({
    adapters: { type: Array, default: () => [] },
    jobs: { type: Array, default: () => [] },
});

function selectPlatform(platform) {
    router.get(route('escalated.admin.import.connect', platform));
}

function viewJob(jobId) {
    router.get(route('escalated.admin.import.progress', jobId));
}

const statusColors = {
    pending: 'text-gray-400',
    importing: 'text-blue-400',
    paused: 'text-yellow-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
};
</script>

<template>
    <div class="space-y-8">
        <div>
            <h2 class="text-lg font-semibold text-[var(--esc-panel-text)]">Import Data</h2>
            <p class="mt-1 text-sm text-[var(--esc-panel-text-secondary)]">
                Migrate tickets, contacts, and history from another helpdesk platform.
            </p>
        </div>

        <!-- Platform cards -->
        <div v-if="adapters.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
                v-for="adapter in adapters"
                :key="adapter.name"
                class="flex flex-col items-start rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6 text-left transition hover:border-[var(--esc-panel-accent)] hover:bg-[var(--esc-panel-hover)]"
                @click="selectPlatform(adapter.name)"
            >
                <span class="text-base font-medium text-[var(--esc-panel-text)]">{{ adapter.display_name }}</span>
                <span class="mt-1 text-sm text-[var(--esc-panel-text-secondary)]"
                    >Import from {{ adapter.display_name }}</span
                >
            </button>
        </div>

        <div
            v-else
            class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-8 text-center"
        >
            <p class="text-sm text-[var(--esc-panel-text-secondary)]">
                No import adapters installed. Install an import plugin (e.g., escalated-plugin-import-zendesk) to get
                started.
            </p>
        </div>

        <!-- Import history -->
        <div v-if="jobs.length">
            <h3 class="mb-3 text-sm font-semibold text-[var(--esc-panel-text)]">Import History</h3>
            <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)]">
                <table class="w-full text-sm">
                    <thead class="bg-[var(--esc-panel-surface-alt)]">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium text-[var(--esc-panel-text-secondary)]">
                                Platform
                            </th>
                            <th class="px-4 py-3 text-left font-medium text-[var(--esc-panel-text-secondary)]">
                                Status
                            </th>
                            <th class="px-4 py-3 text-left font-medium text-[var(--esc-panel-text-secondary)]">Date</th>
                            <th class="px-4 py-3 text-left font-medium text-[var(--esc-panel-text-secondary)]"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--esc-panel-border)]">
                        <tr
                            v-for="job in jobs"
                            :key="job.id"
                            class="bg-[var(--esc-panel-surface)] hover:bg-[var(--esc-panel-hover)]"
                        >
                            <td class="px-4 py-3 text-[var(--esc-panel-text)]">{{ job.platform }}</td>
                            <td class="px-4 py-3">
                                <span :class="statusColors[job.status]" class="capitalize">{{ job.status }}</span>
                            </td>
                            <td class="px-4 py-3 text-[var(--esc-panel-text-secondary)]">{{ job.created_at }}</td>
                            <td class="px-4 py-3 text-right">
                                <button
                                    class="text-sm text-[var(--esc-panel-accent)] hover:underline"
                                    @click="viewJob(job.id)"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
