<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    settings: Object,
    purgePreview: { type: Object, default: () => ({}) },
});

const form = useForm({
    retention_closed_tickets: props.settings.retention_closed_tickets ?? 'never',
    retention_attachments: props.settings.retention_attachments ?? 'never',
    retention_audit_logs: props.settings.retention_audit_logs ?? 'never',
    retention_user_data_gdpr: props.settings.retention_user_data_gdpr ?? false,
});

function submit() {
    form.post(route('escalated.admin.settings.data-retention.update'));
}

const ticketOptions = [
    { value: 'never', label: 'Never delete' },
    { value: '1_year', label: '1 year' },
    { value: '2_years', label: '2 years' },
    { value: '3_years', label: '3 years' },
    { value: '5_years', label: '5 years' },
];

const attachmentOptions = [
    { value: 'never', label: 'Never delete' },
    { value: '1_year', label: '1 year' },
    { value: '2_years', label: '2 years' },
    { value: '3_years', label: '3 years' },
    { value: '5_years', label: '5 years' },
];

const auditLogOptions = [
    { value: 'never', label: 'Never delete' },
    { value: '90_days', label: '90 days' },
    { value: '180_days', label: '180 days' },
    { value: '365_days', label: '365 days' },
];
</script>

<template>
    <EscalatedLayout title="Data Retention">
        <form class="mx-auto max-w-2xl space-y-6" @submit.prevent="submit">
            <!-- Closed Tickets -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Retention Policies</h3>
                <p class="mb-5 text-xs text-[var(--esc-panel-text-muted)]">
                    Configure how long data is retained before automatic purging. Records are soft-deleted first with a
                    30-day grace period before permanent removal.
                </p>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Closed Tickets</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            How long to keep closed tickets before purging
                        </p>
                        <select
                            v-model="form.retention_closed_tickets"
                            class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        >
                            <option v-for="opt in ticketOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Attachments</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            How long to keep attachments on closed tickets
                        </p>
                        <select
                            v-model="form.retention_attachments"
                            class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        >
                            <option v-for="opt in attachmentOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Audit Logs</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            How long to keep audit log entries
                        </p>
                        <select
                            v-model="form.retention_audit_logs"
                            class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        >
                            <option v-for="opt in auditLogOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >GDPR User Data Handling</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Anonymize user data upon account deletion to comply with GDPR
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.retention_user_data_gdpr ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.retention_user_data_gdpr = !form.retention_user_data_gdpr"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.retention_user_data_gdpr ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                </div>
            </div>

            <!-- Purge Preview -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text)]">Purge Preview</h3>
                <p class="mb-4 text-xs text-[var(--esc-panel-text-muted)]">
                    Estimated records that would be purged based on current settings.
                </p>
                <div class="grid grid-cols-3 gap-4">
                    <div
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4 text-center"
                    >
                        <div class="text-2xl font-bold text-[var(--esc-panel-text-secondary)]">
                            {{ purgePreview.tickets ?? 0 }}
                        </div>
                        <div class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">Closed Tickets</div>
                    </div>
                    <div
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4 text-center"
                    >
                        <div class="text-2xl font-bold text-[var(--esc-panel-text-secondary)]">
                            {{ purgePreview.attachments ?? 0 }}
                        </div>
                        <div class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">Attachments</div>
                    </div>
                    <div
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4 text-center"
                    >
                        <div class="text-2xl font-bold text-[var(--esc-panel-text-secondary)]">
                            {{ purgePreview.audit_logs ?? 0 }}
                        </div>
                        <div class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">Audit Logs</div>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : 'Save Retention Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
