<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ settings: Object });

const form = useForm({
    guest_tickets_enabled: props.settings.guest_tickets_enabled,
    allow_customer_close: props.settings.allow_customer_close,
    auto_close_resolved_after_days: props.settings.auto_close_resolved_after_days,
    max_attachments_per_reply: props.settings.max_attachments_per_reply,
    max_attachment_size_kb: props.settings.max_attachment_size_kb,
});

function submit() {
    form.post(route('escalated.admin.settings.update'));
}
</script>

<template>
    <EscalatedLayout title="Settings">
        <form @submit.prevent="submit" class="mx-auto max-w-2xl space-y-6">
            <!-- General -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">General</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-neutral-200">Guest Tickets</span>
                            <p class="mt-0.5 text-xs text-neutral-500">Allow visitors to submit tickets without signing in</p>
                        </div>
                        <button type="button" @click="form.guest_tickets_enabled = !form.guest_tickets_enabled"
                                :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                         form.guest_tickets_enabled ? 'bg-emerald-500' : 'bg-neutral-700']">
                            <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                           form.guest_tickets_enabled ? 'translate-x-5' : 'translate-x-0']" />
                        </button>
                    </label>

                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-neutral-200">Allow Customer Close</span>
                            <p class="mt-0.5 text-xs text-neutral-500">Let customers close their own tickets</p>
                        </div>
                        <button type="button" @click="form.allow_customer_close = !form.allow_customer_close"
                                :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                         form.allow_customer_close ? 'bg-emerald-500' : 'bg-neutral-700']">
                            <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                           form.allow_customer_close ? 'translate-x-5' : 'translate-x-0']" />
                        </button>
                    </label>

                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Auto-close resolved tickets after</label>
                        <p class="mt-0.5 text-xs text-neutral-500">Days after resolution before auto-closing (0 to disable)</p>
                        <div class="mt-2 flex items-center gap-2">
                            <input v-model.number="form.auto_close_resolved_after_days" type="number" min="0" max="365"
                                   class="w-24 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                            <span class="text-sm text-neutral-500">days</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Limits -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">Limits</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Max attachments per reply</label>
                        <input v-model.number="form.max_attachments_per_reply" type="number" min="1" max="20"
                               class="mt-2 w-24 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Max attachment size</label>
                        <div class="mt-2 flex items-center gap-2">
                            <input v-model.number="form.max_attachment_size_kb" type="number" min="512" max="102400" step="512"
                                   class="w-32 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                            <span class="text-sm text-neutral-500">KB ({{ Math.round(form.max_attachment_size_kb / 1024) }} MB)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    {{ form.processing ? 'Saving...' : 'Save Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
