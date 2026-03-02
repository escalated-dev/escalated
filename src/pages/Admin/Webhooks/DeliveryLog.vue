<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    webhook: Object,
    deliveries: Object,
});

const expandedId = ref(null);

function retry(deliveryId) {
    router.post(route('escalated.admin.webhooks.retry', deliveryId), {}, { preserveScroll: true });
}

function togglePayload(id) {
    expandedId.value = expandedId.value === id ? null : id;
}
</script>

<template>
    <EscalatedLayout :title="`Webhook Delivery Log - ${webhook.url}`">
        <div class="mb-4">
            <a
                :href="route('escalated.admin.webhooks.index')"
                class="text-sm text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
            >
                &larr; Back to Webhooks
            </a>
        </div>

        <div class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Event
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Status
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Attempts
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Timestamp
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!deliveries?.data?.length">
                        <td colspan="5" class="px-4 py-12 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No deliveries yet.
                        </td>
                    </tr>
                    <template v-for="delivery in deliveries?.data" :key="delivery.id">
                        <tr class="transition-colors hover:bg-[var(--esc-panel-hover)]">
                            <td class="px-4 py-3 text-sm font-mono text-[var(--esc-panel-text-secondary)]">
                                {{ delivery.event }}
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <span
                                    :class="
                                        delivery.response_code >= 200 && delivery.response_code < 300
                                            ? 'text-emerald-400'
                                            : 'text-rose-400'
                                    "
                                >
                                    {{ delivery.response_code || 'Failed' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ delivery.attempts }}
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ delivery.created_at }}
                            </td>
                            <td class="px-4 py-3 text-right text-sm">
                                <button
                                    class="text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text-secondary)]"
                                    @click="togglePayload(delivery.id)"
                                >
                                    {{ expandedId === delivery.id ? 'Hide' : 'Payload' }}
                                </button>
                                <button
                                    class="ml-3 text-[var(--esc-panel-accent)] hover:text-cyan-300"
                                    @click="retry(delivery.id)"
                                >
                                    Retry
                                </button>
                            </td>
                        </tr>
                        <tr v-if="expandedId === delivery.id">
                            <td colspan="5" class="bg-[var(--esc-panel-hover)] px-4 py-3">
                                <pre
                                    class="max-h-40 overflow-auto rounded-lg bg-[var(--esc-panel-surface-alt)] p-3 text-xs text-[var(--esc-panel-text-tertiary)]"
                                    >{{ JSON.stringify(delivery.payload, null, 2) }}</pre
                                >
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
