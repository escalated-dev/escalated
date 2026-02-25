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
            <a :href="route('escalated.admin.webhooks.index')" class="text-sm text-neutral-400 hover:text-neutral-200">
                &larr; Back to Webhooks
            </a>
        </div>

        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Event
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Status
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Attempts
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Timestamp
                        </th>
                        <th
                            class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!deliveries?.data?.length">
                        <td colspan="5" class="px-4 py-12 text-center text-sm text-neutral-500">No deliveries yet.</td>
                    </tr>
                    <template v-for="delivery in deliveries?.data" :key="delivery.id">
                        <tr class="transition-colors hover:bg-white/[0.03]">
                            <td class="px-4 py-3 text-sm font-mono text-neutral-300">{{ delivery.event }}</td>
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
                            <td class="px-4 py-3 text-sm text-neutral-400">{{ delivery.attempts }}</td>
                            <td class="px-4 py-3 text-sm text-neutral-400">{{ delivery.created_at }}</td>
                            <td class="px-4 py-3 text-right text-sm">
                                <button
                                    class="text-neutral-400 hover:text-neutral-200"
                                    @click="togglePayload(delivery.id)"
                                >
                                    {{ expandedId === delivery.id ? 'Hide' : 'Payload' }}
                                </button>
                                <button class="ml-3 text-cyan-400 hover:text-cyan-300" @click="retry(delivery.id)">
                                    Retry
                                </button>
                            </td>
                        </tr>
                        <tr v-if="expandedId === delivery.id">
                            <td colspan="5" class="bg-white/[0.01] px-4 py-3">
                                <pre
                                    class="max-h-40 overflow-auto rounded-lg bg-neutral-950 p-3 text-xs text-neutral-400"
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
