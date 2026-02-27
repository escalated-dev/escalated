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
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
            >
                Add Webhook
            </Link>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            URL
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Events
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Active
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Last Status
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!webhooks?.length">
                        <td colspan="5" class="px-4 py-12 text-center">
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
                                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-9.86a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                />
                            </svg>
                            <p class="text-sm text-neutral-500">No webhooks configured</p>
                            <p class="mt-1 text-xs text-neutral-600">
                                Set up webhooks to send event notifications to external services
                            </p>
                        </td>
                    </tr>
                    <tr v-for="webhook in webhooks" :key="webhook.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3 text-sm font-mono text-neutral-300 max-w-xs truncate">
                            {{ webhook.url }}
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ (webhook.events || []).length }} events</td>
                        <td class="px-4 py-3 text-sm">
                            <span :class="webhook.active ? 'text-emerald-400' : 'text-neutral-500'">{{
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
                            <span v-else class="text-neutral-500">&mdash;</span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <Link
                                :href="route('escalated.admin.webhooks.deliveries', webhook.id)"
                                class="text-neutral-400 hover:text-neutral-200"
                                >Log</Link
                            >
                            <Link
                                :href="route('escalated.admin.webhooks.edit', webhook.id)"
                                class="ml-3 text-neutral-300 hover:text-white"
                                >Edit</Link
                            >
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
