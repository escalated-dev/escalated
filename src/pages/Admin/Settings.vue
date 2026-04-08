<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import PluginSlot from '../../components/PluginSlot.vue';
import { useForm, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { usePluginExtensions } from '../../composables/usePluginExtensions';

const props = defineProps({ settings: Object, departments: Array });
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
    show_powered_by: props.settings.show_powered_by ?? true,
    widget_enabled: props.settings.widget_enabled ?? false,
    widget_color: props.settings.widget_color ?? '#4F46E5',
    widget_position: props.settings.widget_position ?? 'bottom-right',
    widget_greeting: props.settings.widget_greeting ?? 'Hi there! How can we help?',
    widget_departments: props.settings.widget_departments ?? '',
    knowledge_base_enabled: props.settings.knowledge_base_enabled ?? true,
    knowledge_base_public: props.settings.knowledge_base_public ?? true,
    knowledge_base_feedback_enabled: props.settings.knowledge_base_feedback_enabled ?? true,
    // Chat settings
    chat_enabled: props.settings.chat_enabled ?? false,
    chat_sound_notifications: props.settings.chat_sound_notifications ?? true,
    chat_pre_chat_name: props.settings.chat_pre_chat_name ?? true,
    chat_pre_chat_email: props.settings.chat_pre_chat_email ?? true,
    chat_pre_chat_department: props.settings.chat_pre_chat_department ?? false,
    chat_routing_strategy: props.settings.chat_routing_strategy ?? 'round_robin',
    chat_offline_behavior: props.settings.chat_offline_behavior ?? 'ticket_form',
    chat_max_queue: props.settings.chat_max_queue ?? 10,
    chat_concurrent_limit: props.settings.chat_concurrent_limit ?? 5,
    chat_auto_close_minutes: props.settings.chat_auto_close_minutes ?? 30,
    chat_queue_message: props.settings.chat_queue_message ?? '',
    chat_offline_message: props.settings.chat_offline_message ?? '',
    // Widget theme
    widget_primary_color: props.settings.widget_primary_color ?? '#4F46E5',
    widget_background_color: props.settings.widget_background_color ?? '#ffffff',
    widget_text_color: props.settings.widget_text_color ?? '#1f2937',
    widget_agent_bubble_color: props.settings.widget_agent_bubble_color ?? '#4F46E5',
    widget_customer_bubble_color: props.settings.widget_customer_bubble_color ?? '#f3f4f6',
    widget_header_background: props.settings.widget_header_background ?? '#4F46E5',
    widget_font_family: props.settings.widget_font_family ?? 'system',
    widget_border_radius: props.settings.widget_border_radius ?? 12,
    widget_launcher_size: props.settings.widget_launcher_size ?? 'medium',
    widget_show_branding: props.settings.widget_show_branding ?? true,
    widget_custom_css: props.settings.widget_custom_css ?? '',
    widget_pre_chat_message: props.settings.widget_pre_chat_message ?? '',
    widget_chat_header_text: props.settings.widget_chat_header_text ?? 'Support',
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

            <!-- Knowledge Base -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Knowledge Base</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Enable Knowledge Base</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Show the knowledge base to customers and visitors
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.knowledge_base_enabled ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.knowledge_base_enabled = !form.knowledge_base_enabled"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.knowledge_base_enabled ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Public Access</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Allow unauthenticated visitors to browse the knowledge base
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.knowledge_base_public ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.knowledge_base_public = !form.knowledge_base_public"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.knowledge_base_public ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Article Feedback</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Show helpful / not helpful buttons on articles
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.knowledge_base_feedback_enabled ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.knowledge_base_feedback_enabled = !form.knowledge_base_feedback_enabled"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.knowledge_base_feedback_enabled ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                </div>
            </div>

            <!-- Branding -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Branding</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Show "Powered by Escalated"</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Display attribution badge in the support portal footer
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.show_powered_by ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.show_powered_by = !form.show_powered_by"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.show_powered_by ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                </div>
            </div>

            <!-- Support Widget -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Support Widget</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Enable Widget</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Show an embeddable support widget on your site
                            </p>
                        </div>
                        <button
                            type="button"
                            :class="[
                                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                form.widget_enabled ? 'bg-emerald-500' : 'bg-neutral-700',
                            ]"
                            @click="form.widget_enabled = !form.widget_enabled"
                        >
                            <span
                                :class="[
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                    form.widget_enabled ? 'translate-x-5' : 'translate-x-0',
                                ]"
                            />
                        </button>
                    </label>
                    <template v-if="form.widget_enabled">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Widget Color</label
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Primary color for the widget button and header
                            </p>
                            <div class="mt-2 flex items-center gap-3">
                                <input
                                    v-model="form.widget_color"
                                    type="color"
                                    class="h-9 w-12 cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] p-0.5"
                                />
                                <input
                                    v-model="form.widget_color"
                                    type="text"
                                    maxlength="7"
                                    class="w-28 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] uppercase focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Position</label
                            >
                            <select
                                v-model="form.widget_position"
                                class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Greeting Message</label
                            >
                            <input
                                v-model="form.widget_greeting"
                                type="text"
                                maxlength="255"
                                class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div v-if="departments?.length">
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Departments</label
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Select which departments appear in the widget (leave empty for all)
                            </p>
                            <div class="mt-2 space-y-2">
                                <label v-for="dept in departments" :key="dept.id" class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        :value="dept.id"
                                        :checked="
                                            form.widget_departments.split(',').filter(Boolean).includes(String(dept.id))
                                        "
                                        class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-emerald-500 focus:ring-emerald-500"
                                        @change="
                                            (e) => {
                                                const ids = form.widget_departments.split(',').filter(Boolean);
                                                if (e.target.checked) {
                                                    ids.push(String(dept.id));
                                                } else {
                                                    const idx = ids.indexOf(String(dept.id));
                                                    if (idx > -1) ids.splice(idx, 1);
                                                }
                                                form.widget_departments = ids.join(',');
                                            }
                                        "
                                    />
                                    <span class="text-sm text-[var(--esc-panel-text-secondary)]">{{ dept.name }}</span>
                                </label>
                            </div>
                        </div>
                        <div
                            class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4"
                        >
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Embed Code</label
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Add this snippet to your website to show the support widget
                            </p>
                            <code
                                class="mt-2 block whitespace-pre-wrap break-all rounded-lg bg-[var(--esc-panel-bg)] p-3 text-xs text-[var(--esc-panel-text-tertiary)] select-all"
                                >&lt;script src="/{{ page.props.escalated?.prefix || 'support' }}/widget/embed.js"
                                data-color="{{ form.widget_color }}" data-position="{{
                                    form.widget_position
                                }}"&gt;&lt;/script&gt;</code
                            >
                        </div>
                    </template>
                </div>
            </div>

            <!-- Live Chat -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Live Chat</h3>
                <div class="space-y-5">
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Enable Live Chat</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Allow customers to start real-time chat sessions
                            </p>
                        </div>
                        <input
                            v-model="form.chat_enabled"
                            type="checkbox"
                            :true-value="true"
                            :false-value="false"
                            class="h-4 w-4 rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-accent)] focus:ring-[var(--esc-panel-accent)]/20"
                        />
                    </label>
                    <label class="flex items-center justify-between">
                        <div>
                            <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Sound Notifications</span
                            >
                            <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                                Play sound on new chat messages
                            </p>
                        </div>
                        <input
                            v-model="form.chat_sound_notifications"
                            type="checkbox"
                            :true-value="true"
                            :false-value="false"
                            class="h-4 w-4 rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-accent)] focus:ring-[var(--esc-panel-accent)]/20"
                        />
                    </label>
                </div>
            </div>

            <!-- Chat Routing -->
            <div
                v-if="form.chat_enabled"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Chat Routing</h3>
                <div class="space-y-5">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Routing Strategy</label
                        >
                        <select
                            v-model="form.chat_routing_strategy"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                        >
                            <option value="round_robin">Round Robin</option>
                            <option value="least_active">Least Active</option>
                            <option value="manual">Manual (Queue)</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Offline Behavior</label
                        >
                        <select
                            v-model="form.chat_offline_behavior"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                        >
                            <option value="ticket_form">Show Ticket Form</option>
                            <option value="offline_message">Show Offline Message</option>
                            <option value="hide">Hide Chat</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Max Queue Size</label
                            >
                            <input
                                v-model.number="form.chat_max_queue"
                                type="number"
                                min="1"
                                class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Concurrent Limit</label
                            >
                            <input
                                v-model.number="form.chat_concurrent_limit"
                                type="number"
                                min="1"
                                class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Auto-close after (minutes)</label
                        >
                        <input
                            v-model.number="form.chat_auto_close_minutes"
                            type="number"
                            min="1"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Queue Message</label
                        >
                        <input
                            v-model="form.chat_queue_message"
                            type="text"
                            placeholder="You're in the queue..."
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)]"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Offline Message</label
                        >
                        <input
                            v-model="form.chat_offline_message"
                            type="text"
                            placeholder="Sorry, we're not available right now..."
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)]"
                        />
                    </div>
                </div>
            </div>

            <!-- Widget Theme -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Widget Theme</h3>
                <div class="space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Primary Color</label
                            >
                            <input
                                v-model="form.widget_primary_color"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Header Background</label
                            >
                            <input
                                v-model="form.widget_header_background"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Agent Bubble Color</label
                            >
                            <input
                                v-model="form.widget_agent_bubble_color"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Customer Bubble Color</label
                            >
                            <input
                                v-model="form.widget_customer_bubble_color"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Background Color</label
                            >
                            <input
                                v-model="form.widget_background_color"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Text Color</label
                            >
                            <input
                                v-model="form.widget_text_color"
                                type="color"
                                class="h-10 w-full cursor-pointer rounded-lg border border-[var(--esc-panel-border-input)]"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Font Family</label
                        >
                        <select
                            v-model="form.widget_font_family"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                        >
                            <option value="system">System Default</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Nunito">Nunito</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Border Radius ({{ form.widget_border_radius }}px)</label
                        >
                        <input
                            v-model.number="form.widget_border_radius"
                            type="range"
                            min="0"
                            max="20"
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Launcher Size</label
                        >
                        <div class="flex gap-3">
                            <label
                                v-for="size in ['small', 'medium', 'large']"
                                :key="size"
                                class="flex items-center gap-2"
                            >
                                <input
                                    v-model="form.widget_launcher_size"
                                    type="radio"
                                    :value="size"
                                    class="text-[var(--esc-panel-accent)] focus:ring-[var(--esc-panel-accent)]/20"
                                />
                                <span class="text-sm capitalize text-[var(--esc-panel-text-secondary)]">{{
                                    size
                                }}</span>
                            </label>
                        </div>
                    </div>
                    <label class="flex items-center justify-between">
                        <span class="text-sm font-medium text-[var(--esc-panel-text-secondary)]">Show Branding</span>
                        <input
                            v-model="form.widget_show_branding"
                            type="checkbox"
                            :true-value="true"
                            :false-value="false"
                            class="h-4 w-4 rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-accent)] focus:ring-[var(--esc-panel-accent)]/20"
                        />
                    </label>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Pre-chat Message</label
                        >
                        <input
                            v-model="form.widget_pre_chat_message"
                            type="text"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)]"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Chat Header Text</label
                        >
                        <input
                            v-model="form.widget_chat_header_text"
                            type="text"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)]"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Custom CSS</label
                        >
                        <textarea
                            v-model="form.widget_custom_css"
                            rows="4"
                            placeholder=".esc-w-panel { /* custom styles */ }"
                            class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 font-mono text-xs text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)]"
                        ></textarea>
                    </div>
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
