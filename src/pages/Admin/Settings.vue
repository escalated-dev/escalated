<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { useForm, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { usePluginExtensions } from '../../composables/usePluginExtensions';

const props = defineProps({ settings: Object });
const page = usePage();

const form = useForm({
    guest_tickets_enabled: props.settings.guest_tickets_enabled,
    allow_customer_close: props.settings.allow_customer_close,
    auto_close_resolved_after_days: props.settings.auto_close_resolved_after_days,
    max_attachments_per_reply: props.settings.max_attachments_per_reply,
    max_attachment_size_kb: props.settings.max_attachment_size_kb,
    ticket_reference_prefix: props.settings.ticket_reference_prefix,
    inbound_email_enabled: props.settings.inbound_email_enabled ?? false,
    inbound_email_adapter: props.settings.inbound_email_adapter ?? 'mailgun',
    inbound_email_address: props.settings.inbound_email_address ?? '',
    mailgun_signing_key: props.settings.mailgun_signing_key ?? '',
    postmark_inbound_token: props.settings.postmark_inbound_token ?? '',
    ses_region: props.settings.ses_region ?? '',
    ses_topic_arn: props.settings.ses_topic_arn ?? '',
    imap_host: props.settings.imap_host ?? '',
    imap_port: props.settings.imap_port ?? 993,
    imap_encryption: props.settings.imap_encryption ?? 'ssl',
    imap_username: props.settings.imap_username ?? '',
    imap_password: props.settings.imap_password ?? '',
    imap_mailbox: props.settings.imap_mailbox ?? 'INBOX',
});

const webhookBaseUrl = computed(() => {
    const prefix = page.props.escalated?.prefix || 'support';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/${prefix}/inbound`;
});

const { getPageComponents } = usePluginExtensions();

function submit() {
    form.post(route('escalated.admin.settings.update'));
}
</script>

<template>
    <EscalatedLayout title="Settings">
        <form class="mx-auto max-w-2xl space-y-6" @submit.prevent="submit">
            <!-- General -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">General</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Guest Tickets</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Allow visitors to submit tickets without signing in
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.guest_tickets_enabled ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.guest_tickets_enabled = !form.guest_tickets_enabled"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.guest_tickets_enabled ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>

                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Allow Customer Close</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Let customers close their own tickets
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.allow_customer_close ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.allow_customer_close = !form.allow_customer_close"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.allow_customer_close ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>

                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Auto-close resolved tickets after</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            Days after resolution before auto-closing (0 to disable)
                        </p>
                        <div class="mt-2 flex items-center gap-2">
                            <input
                                v-model.number="form.auto_close_resolved_after_days"
                                type="number"
                                min="0"
                                max="365"
                                class="w-24 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <span class="text-sm text-[var(--esc-panel-text-muted)]">days</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Limits -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Limits</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Max attachments per reply</label
                        >
                        <input
                            v-model.number="form.max_attachments_per_reply"
                            type="number"
                            min="1"
                            max="20"
                            class="mt-2 w-24 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Max attachment size</label
                        >
                        <div class="mt-2 flex items-center gap-2">
                            <input
                                v-model.number="form.max_attachment_size_kb"
                                type="number"
                                min="512"
                                max="102400"
                                step="512"
                                class="w-32 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <span class="text-sm text-[var(--esc-panel-text-muted)]"
                                >KB ({{ Math.round(form.max_attachment_size_kb / 1024) }} MB)</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tickets -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Tickets</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Reference Prefix</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            Prefix for ticket references (e.g. ESC produces ESC-00001)
                        </p>
                        <input
                            v-model="form.ticket_reference_prefix"
                            type="text"
                            maxlength="10"
                            class="mt-2 w-32 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] uppercase focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                </div>
            </div>

            <!-- Inbound Email -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Inbound Email</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Inbound Email</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Allow creating and replying to tickets via email
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.inbound_email_enabled ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.inbound_email_enabled = !form.inbound_email_enabled"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.inbound_email_enabled ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>

                    <template v-if="form.inbound_email_enabled">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Email Provider</label
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                How inbound emails are received
                            </p>
                            <select
                                v-model="form.inbound_email_adapter"
                                class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            >
                                <option value="mailgun">Mailgun</option>
                                <option value="postmark">Postmark</option>
                                <option value="ses">AWS SES</option>
                                <option value="imap">IMAP</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Support Email Address</label
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                The email address customers will send emails to (e.g. support@example.com)
                            </p>
                            <input
                                v-model="form.inbound_email_address"
                                type="email"
                                placeholder="support@example.com"
                                class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                        </div>

                        <!-- Mailgun -->
                        <template v-if="form.inbound_email_adapter === 'mailgun'">
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Signing Key</label
                                >
                                <input
                                    v-model="form.mailgun_signing_key"
                                    type="password"
                                    class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Webhook URL</label
                                >
                                <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                    Configure this URL in your Mailgun dashboard
                                </p>
                                <input
                                    :value="`${webhookBaseUrl}/mailgun`"
                                    type="text"
                                    readonly
                                    class="mt-2 w-full max-w-lg rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-tertiary)] select-all cursor-default focus:outline-none"
                                />
                            </div>
                        </template>

                        <!-- Postmark -->
                        <template v-if="form.inbound_email_adapter === 'postmark'">
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Inbound Token</label
                                >
                                <input
                                    v-model="form.postmark_inbound_token"
                                    type="password"
                                    class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Webhook URL</label
                                >
                                <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                    Configure this URL in your Postmark server settings
                                </p>
                                <input
                                    :value="`${webhookBaseUrl}/postmark`"
                                    type="text"
                                    readonly
                                    class="mt-2 w-full max-w-lg rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-tertiary)] select-all cursor-default focus:outline-none"
                                />
                            </div>
                        </template>

                        <!-- AWS SES -->
                        <template v-if="form.inbound_email_adapter === 'ses'">
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Region</label
                                >
                                <input
                                    v-model="form.ses_region"
                                    type="text"
                                    placeholder="us-east-1"
                                    class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Topic ARN</label
                                >
                                <input
                                    v-model="form.ses_topic_arn"
                                    type="text"
                                    placeholder="arn:aws:sns:us-east-1:123456789:ses-inbound"
                                    class="mt-2 w-full max-w-lg rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Webhook URL</label
                                >
                                <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                    Configure this URL as your SNS subscription endpoint
                                </p>
                                <input
                                    :value="`${webhookBaseUrl}/ses`"
                                    type="text"
                                    readonly
                                    class="mt-2 w-full max-w-lg rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-tertiary)] select-all cursor-default focus:outline-none"
                                />
                            </div>
                        </template>

                        <!-- IMAP -->
                        <template v-if="form.inbound_email_adapter === 'imap'">
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Host</label
                                >
                                <input
                                    v-model="form.imap_host"
                                    type="text"
                                    placeholder="imap.example.com"
                                    class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div class="flex items-end gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                        >Port</label
                                    >
                                    <input
                                        v-model.number="form.imap_port"
                                        type="number"
                                        min="1"
                                        max="65535"
                                        class="mt-2 w-24 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                        >Encryption</label
                                    >
                                    <select
                                        v-model="form.imap_encryption"
                                        class="mt-2 w-28 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                    >
                                        <option value="ssl">SSL</option>
                                        <option value="tls">TLS</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Username</label
                                >
                                <input
                                    v-model="form.imap_username"
                                    type="text"
                                    class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Password</label
                                >
                                <input
                                    v-model="form.imap_password"
                                    type="password"
                                    class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                    >Mailbox</label
                                >
                                <input
                                    v-model="form.imap_mailbox"
                                    type="text"
                                    placeholder="INBOX"
                                    class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                        </template>
                    </template>
                </div>
            </div>

            <PluginSlot slot="admin.settings.extra" :components="getPageComponents('admin.settings', 'extra')" />

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : 'Save Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
