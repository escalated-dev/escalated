<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
</script>

<template>
    <EscalatedLayout title="Sandbox Environment">
        <div class="mx-auto max-w-2xl space-y-6">
            <!-- Info -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-4 text-sm font-semibold text-white">Sandbox Environment</h3>
                <p class="text-sm text-neutral-400">
                    A sandbox environment allows you to test configuration changes, automations, and workflows without
                    affecting your production data. Changes made in a sandbox can be promoted to production once
                    validated.
                </p>
                <div class="mt-4 rounded-lg border border-white/[0.06] bg-neutral-950 p-4">
                    <h4 class="mb-2 text-sm font-medium text-neutral-300">Key Features</h4>
                    <ul class="space-y-2 text-sm text-neutral-500">
                        <li class="flex items-start gap-2">
                            <svg
                                class="mt-0.5 h-4 w-4 shrink-0 text-neutral-600"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Isolated copy of your helpdesk configuration
                        </li>
                        <li class="flex items-start gap-2">
                            <svg
                                class="mt-0.5 h-4 w-4 shrink-0 text-neutral-600"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Test automations, triggers, and SLA policies safely
                        </li>
                        <li class="flex items-start gap-2">
                            <svg
                                class="mt-0.5 h-4 w-4 shrink-0 text-neutral-600"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Promote validated changes to production
                        </li>
                        <li class="flex items-start gap-2">
                            <svg
                                class="mt-0.5 h-4 w-4 shrink-0 text-neutral-600"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Sandboxes auto-expire after 30 days
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Status -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-4 text-sm font-semibold text-white">Sandbox Status</h3>
                <div class="rounded-lg border border-dashed border-white/[0.08] px-6 py-8 text-center">
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
                            d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                        />
                    </svg>
                    <p class="text-sm text-neutral-500">No sandbox active.</p>
                    <p class="mt-1 text-xs text-neutral-600">Create a sandbox to start testing changes safely.</p>
                </div>
            </div>

            <!-- Create Button -->
            <div class="flex justify-end">
                <div class="group relative">
                    <button
                        type="button"
                        disabled
                        class="cursor-not-allowed rounded-lg bg-gradient-to-r from-cyan-500/50 to-violet-500/50 px-5 py-2 text-sm font-medium text-white/50 shadow-lg shadow-black/20"
                    >
                        Create Sandbox
                    </button>
                    <div
                        class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-neutral-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    >
                        Coming soon &mdash; requires infrastructure setup
                        <div
                            class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-800"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
