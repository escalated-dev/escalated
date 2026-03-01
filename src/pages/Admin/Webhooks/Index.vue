<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';

defineProps({ webhooks: Array });

function destroy(id) {
    if (confirm('Delete this webhook?')) {
        router.delete(route('escalated.admin.webhooks.destroy', id));
    }
}

function lastDeliveryStatus(webhook) {
    const last = webhook.deliveries?.[0];
    if (!last) return null;
    return last.response_code;
}
</script>

<template>
    <EscalatedLayout title="Webhooks">
        <div class="mb-4 flex justify-end">
            <Link
                :href="route('escalated.admin.webhooks.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                Add Webhook
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            URL
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Events
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Active
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Last Status
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!webhooks?.length">
                        <td colspan="5" class="px-4 py-12 text-center">
                            <svg
                                class="mx-auto mb-3 h-8 w-8 text-[var(--esc-panel-text-muted)]"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-9.86a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                />
                            </svg>
                            <p class="text-sm text-[var(--esc-panel-text-muted)]">No webhooks configured</p>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Set up webhooks to send event notifications to external services
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="webhook in webhooks"
                        :key="webhook.id"
                        class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                    >
                        <td
                            class="px-4 py-3 text-sm font-mono text-[var(--esc-panel-text-secondary)] max-w-xs truncate"
                        >
                            {{ webhook.url }}
                        </td>
                        <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                            {{ (webhook.events || []).length }} events
                        </td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="webhook.active ? 'text-emerald-400' : 'text-[var(--esc-panel-text-muted)]'">{{
                                webhook.active ? 'Yes' : 'No'
                            }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                v-if="lastDeliveryStatus(webhook)"
                                :class="
                                    lastDeliveryStatus(webhook) >= 200 && lastDeliveryStatus(webhook) < 300
                                        ? 'text-emerald-400'
                                        : 'text-rose-400'
                                "
                            >
                                {{ lastDeliveryStatus(webhook) }}
                            </span>
                            <span v-else class="text-[var(--esc-panel-text-muted)]">&mdash;</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.webhooks.deliveries', webhook.id)"
                                class="text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                            >
                                Log
                            </Link>
                            <Link
                                :href="route('escalated.admin.webhooks.edit', webhook.id)"
                                class="ml-3 text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                            >
                                Edit
                            </Link>
                            <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(webhook.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
