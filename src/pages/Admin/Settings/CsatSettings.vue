<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, Link } from '@inertiajs/vue3';

const props = defineProps({
    settings: Object,
});

const form = useForm({
    csat_question_text: props.settings?.csat_question_text || 'How would you rate your support experience?',
    csat_scale: props.settings?.csat_scale || '1-5',
    csat_delivery_trigger: props.settings?.csat_delivery_trigger || 'on_resolve',
    csat_delay_hours: props.settings?.csat_delay_hours || 0,
});

function submit() {
    form.post(route('escalated.admin.settings.csat.update'));
}
</script>

<template>
    <EscalatedLayout title="CSAT Survey Settings">
        <div class="mx-auto max-w-2xl">
            <div class="mb-6">
                <Link :href="route('escalated.admin.settings')" class="text-sm text-neutral-500 hover:text-neutral-300">
                    &larr; Back to Settings
                </Link>
            </div>

            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h2 class="mb-6 text-lg font-semibold text-neutral-200">Customer Satisfaction Survey</h2>

                <form class="space-y-6" @submit.prevent="submit">
                    <!-- Question Text -->
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-neutral-300">Survey Question</label>
                        <textarea
                            v-model="form.csat_question_text"
                            rows="3"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                            placeholder="How would you rate your support experience?"
                        ></textarea>
                        <p v-if="form.errors.csat_question_text" class="mt-1 text-xs text-red-400">
                            {{ form.errors.csat_question_text }}
                        </p>
                        <p class="mt-1 text-xs text-neutral-600">
                            This question will be shown to customers after their ticket is resolved.
                        </p>
                    </div>

                    <!-- Rating Scale -->
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-neutral-300">Rating Scale</label>
                        <div class="flex gap-3">
                            <label
                                :class="[
                                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-all',
                                    form.csat_scale === '1-3'
                                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                                        : 'border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/[0.12]',
                                ]"
                            >
                                <input v-model="form.csat_scale" type="radio" value="1-3" class="sr-only" />
                                <span class="text-sm font-medium">1-3 Scale</span>
                                <span class="text-xs text-neutral-500">(Simple)</span>
                            </label>
                            <label
                                :class="[
                                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-all',
                                    form.csat_scale === '1-5'
                                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                                        : 'border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/[0.12]',
                                ]"
                            >
                                <input v-model="form.csat_scale" type="radio" value="1-5" class="sr-only" />
                                <span class="text-sm font-medium">1-5 Scale</span>
                                <span class="text-xs text-neutral-500">(Detailed)</span>
                            </label>
                        </div>
                        <p v-if="form.errors.csat_scale" class="mt-1 text-xs text-red-400">
                            {{ form.errors.csat_scale }}
                        </p>
                    </div>

                    <!-- Delivery Trigger -->
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-neutral-300">Delivery Trigger</label>
                        <select
                            v-model="form.csat_delivery_trigger"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        >
                            <option value="on_resolve">On ticket resolution</option>
                            <option value="delayed">Delayed after resolution</option>
                            <option value="manual">Manual only</option>
                        </select>
                        <p v-if="form.errors.csat_delivery_trigger" class="mt-1 text-xs text-red-400">
                            {{ form.errors.csat_delivery_trigger }}
                        </p>
                    </div>

                    <!-- Delay Hours (shown only for delayed trigger) -->
                    <div v-if="form.csat_delivery_trigger === 'delayed'">
                        <label class="mb-1.5 block text-sm font-medium text-neutral-300">Delay (hours)</label>
                        <input
                            v-model.number="form.csat_delay_hours"
                            type="number"
                            min="0"
                            max="168"
                            class="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-neutral-200 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        />
                        <p v-if="form.errors.csat_delay_hours" class="mt-1 text-xs text-red-400">
                            {{ form.errors.csat_delay_hours }}
                        </p>
                        <p class="mt-1 text-xs text-neutral-600">
                            How many hours after resolution to send the survey (max 168 = 7 days).
                        </p>
                    </div>

                    <!-- Submit -->
                    <div class="pt-2">
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>

            <!-- Preview -->
            <div class="mt-6 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-4 text-sm font-semibold text-neutral-200">Preview</h3>
                <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                    <p class="mb-4 text-sm text-neutral-300">{{ form.csat_question_text }}</p>
                    <div class="flex items-center justify-center gap-2">
                        <button
                            v-for="n in form.csat_scale === '1-3' ? 3 : 5"
                            :key="n"
                            class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] text-sm font-medium text-neutral-400 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400"
                        >
                            {{ n }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
