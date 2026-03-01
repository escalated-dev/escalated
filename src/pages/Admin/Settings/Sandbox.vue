<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
</script>

<template>
    <EscalatedLayout title="Sandbox Environment">
        <div class="mx-auto max-w-2xl space-y-6">
            <!-- Info -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text)]">Sandbox Environment</h3>
                <p class="text-sm text-[var(--esc-panel-text-tertiary)]">
                    A sandbox environment allows you to test configuration changes, automations, and workflows without
                    affecting your production data. Changes made in a sandbox can be promoted to production once
                    validated.
                </p>
                <div
                    class="mt-4 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4"
                >
                    <h4 class="mb-2 text-sm font-medium text-[var(--esc-panel-text-secondary)]">Key Features</h4>
                    <ul class="space-y-2 text-sm text-[var(--esc-panel-text-muted)]">
                        <li class="flex items-start gap-2">
                            <svg
                                class="mt-0.5 h-4 w-4 shrink-0 text-[var(--esc-panel-text-muted)]"
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
                                class="mt-0.5 h-4 w-4 shrink-0 text-[var(--esc-panel-text-muted)]"
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
                                class="mt-0.5 h-4 w-4 shrink-0 text-[var(--esc-panel-text-muted)]"
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
                                class="mt-0.5 h-4 w-4 shrink-0 text-[var(--esc-panel-text-muted)]"
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
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text)]">Sandbox Status</h3>
                <div class="rounded-lg border border-dashed border-[var(--esc-panel-active)] px-6 py-8 text-center">
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
                            d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                        />
                    </svg>
                    <p class="text-sm text-[var(--esc-panel-text-muted)]">No sandbox active.</p>
                    <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                        Create a sandbox to start testing changes safely.
                    </p>
                </div>
            </div>

            <!-- Create Button -->
            <div class="flex justify-end">
                <div class="group relative">
                    <button
                        type="button"
                        disabled
                        class="cursor-not-allowed rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)]/50 to-[var(--esc-panel-accent-secondary)]/50 px-5 py-2 text-sm font-medium text-white/50 shadow-lg shadow-[var(--esc-panel-bg)]/20"
                    >
                        Create Sandbox
                    </button>
                    <div
                        class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-[var(--esc-panel-text-secondary)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
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
