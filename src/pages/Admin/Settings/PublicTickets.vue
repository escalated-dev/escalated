<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, Link } from '@inertiajs/vue3';

const props = defineProps({
    settings: { type: Object, default: () => ({}) },
});

const form = useForm({
    guest_policy_mode: props.settings?.guest_policy_mode || 'unassigned',
    guest_policy_user_id: props.settings?.guest_policy_user_id ?? null,
    guest_policy_signup_url_template: props.settings?.guest_policy_signup_url_template || '',
});

function submit() {
    form.put(route('escalated.admin.settings.public-tickets.update'));
}

const emailPlaceholder = '{{email}}';

const MODES = [
    {
        value: 'unassigned',
        label: 'Unassigned',
        helper: 'Tickets are created with no requester. The Contact row still carries the guest email for replies and dedupe.',
    },
    {
        value: 'guest_user',
        label: 'Single shared guest user',
        helper: 'All public tickets are owned by one pre-created host-app user (below). Good for hosts that require every ticket to have a real user.',
    },
    {
        value: 'prompt_signup',
        label: 'Prompt signup',
        helper: 'Tickets start unassigned and the first confirmation email includes a signup invite linking to your host app.',
    },
];
</script>

<template>
    <EscalatedLayout title="Public Ticket Submission">
        <div class="mx-auto max-w-2xl">
            <div class="mb-6">
                <Link
                    :href="route('escalated.admin.settings')"
                    class="text-sm text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    &larr; Back to Settings
                </Link>
            </div>

            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h2 class="mb-2 text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Guest policy</h2>
                <p class="mb-6 text-sm text-[var(--esc-panel-text-muted)]">
                    Controls the identity assigned to tickets submitted via the public widget or inbound email. Applies
                    at request time, so changes take effect on the next submission -- no redeploy needed.
                </p>

                <form class="space-y-6" @submit.prevent="submit">
                    <div class="space-y-2">
                        <label
                            v-for="mode in MODES"
                            :key="mode.value"
                            :class="[
                                'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                                form.guest_policy_mode === mode.value
                                    ? 'border-[var(--esc-panel-accent)]/40 bg-[var(--esc-panel-accent)]/10'
                                    : 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] hover:border-[var(--esc-panel-border-input)]',
                            ]"
                        >
                            <input v-model="form.guest_policy_mode" type="radio" :value="mode.value" class="mt-0.5" />
                            <div>
                                <div
                                    :class="[
                                        'text-sm font-medium',
                                        form.guest_policy_mode === mode.value
                                            ? 'text-[var(--esc-panel-accent)]'
                                            : 'text-[var(--esc-panel-text-secondary)]',
                                    ]"
                                >
                                    {{ mode.label }}
                                </div>
                                <div class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                    {{ mode.helper }}
                                </div>
                            </div>
                        </label>
                    </div>

                    <div v-if="form.guest_policy_mode === 'guest_user'">
                        <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Guest user id</label
                        >
                        <input
                            v-model.number="form.guest_policy_user_id"
                            type="number"
                            min="1"
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-accent)]/40"
                            placeholder="e.g. 1"
                            required
                        />
                        <p v-if="form.errors.guest_policy_user_id" class="mt-1 text-xs text-red-400">
                            {{ form.errors.guest_policy_user_id }}
                        </p>
                        <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                            Primary key of the host-app user that will own every public ticket.
                        </p>
                    </div>

                    <div v-if="form.guest_policy_mode === 'prompt_signup'">
                        <label class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Signup URL template (optional)</label
                        >
                        <input
                            v-model="form.guest_policy_signup_url_template"
                            type="text"
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-accent)]/40"
                            placeholder="https://app.example.com/register?email={{email}}"
                        />
                        <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                            Use <code>{{ emailPlaceholder }}</code> as a placeholder for the guest email. Leave blank to
                            let the outbound-email listener pick a default.
                        </p>
                    </div>

                    <div class="flex justify-end gap-3 border-t border-[var(--esc-panel-border)] pt-6">
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="rounded-lg bg-[var(--esc-panel-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                            {{ form.processing ? 'Saving...' : 'Save' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </EscalatedLayout>
</template>
