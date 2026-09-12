<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, Link } from '@inertiajs/vue3';
import { computed } from 'vue';

/**
 * What happens to a ticket raised by someone who is not signed in.
 *
 * The three modes are the guest policy: leave it unattached, attach it to a
 * standing guest account, or ask the person to sign up before it is accepted.
 * Each backend stores these as three settings, and the second and third each
 * need one value alongside the mode.
 */
const props = defineProps({
    settings: { type: Object, default: () => ({}) },
});

const MODES = [
    {
        value: 'unassigned',
        label: 'Leave unattached',
        description: 'The ticket is stored with the guest name and email and no user behind it.',
    },
    {
        value: 'guest_user',
        label: 'Attach to a guest account',
        description: 'Every guest ticket is owned by one standing account, so agents see a consistent requester.',
    },
    {
        value: 'prompt_signup',
        label: 'Ask the guest to sign up',
        description: 'The guest is sent to your sign-up page before the ticket is accepted.',
    },
];

const form = useForm({
    guest_policy_mode: props.settings?.guest_policy_mode ?? 'unassigned',
    guest_policy_user_id: props.settings?.guest_policy_user_id ?? '',
    guest_policy_signup_url_template: props.settings?.guest_policy_signup_url_template ?? '',
});

const needsUserId = computed(() => form.guest_policy_mode === 'guest_user');
const needsSignupUrl = computed(() => form.guest_policy_mode === 'prompt_signup');

function submit() {
    form.post(route('escalated.admin.settings.public-tickets.update'));
}
</script>

<template>
    <EscalatedLayout title="Public Tickets">
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
                <h2 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Public Tickets</h2>
                <p class="mt-1 text-sm text-[var(--esc-panel-text-muted)]">
                    How a ticket raised by someone who is not signed in is recorded.
                </p>

                <form class="mt-6 space-y-6" @submit.prevent="submit">
                    <fieldset class="space-y-3">
                        <legend class="mb-1.5 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                            Guest policy
                        </legend>

                        <label
                            v-for="mode in MODES"
                            :key="mode.value"
                            class="flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors"
                            :class="
                                form.guest_policy_mode === mode.value
                                    ? 'border-[var(--esc-panel-accent)]/40 bg-[var(--esc-panel-hover)]'
                                    : 'border-[var(--esc-panel-border)] hover:bg-[var(--esc-panel-hover)]'
                            "
                        >
                            <input
                                v-model="form.guest_policy_mode"
                                type="radio"
                                name="guest_policy_mode"
                                :value="mode.value"
                                class="mt-1"
                            />
                            <span>
                                <span class="block text-sm text-[var(--esc-panel-text-secondary)]">
                                    {{ mode.label }}
                                </span>
                                <span class="block text-xs text-[var(--esc-panel-text-muted)]">
                                    {{ mode.description }}
                                </span>
                            </span>
                        </label>

                        <p v-if="form.errors.guest_policy_mode" class="text-xs text-red-400">
                            {{ form.errors.guest_policy_mode }}
                        </p>
                    </fieldset>

                    <div v-if="needsUserId">
                        <label
                            class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            for="guest-user-id"
                        >
                            Guest account user ID
                        </label>
                        <input
                            id="guest-user-id"
                            v-model="form.guest_policy_user_id"
                            type="number"
                            min="1"
                            required
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-accent)]/40 focus:outline-none"
                        />
                        <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                            The id of an existing user in your application. Every guest ticket is attached to it.
                        </p>
                        <p v-if="form.errors.guest_policy_user_id" class="mt-1 text-xs text-red-400">
                            {{ form.errors.guest_policy_user_id }}
                        </p>
                    </div>

                    <div v-if="needsSignupUrl">
                        <label
                            class="mb-1.5 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            for="signup-url"
                        >
                            Sign-up URL
                        </label>
                        <input
                            id="signup-url"
                            v-model="form.guest_policy_signup_url_template"
                            type="text"
                            maxlength="500"
                            placeholder="/register?email={email}"
                            class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] px-3 py-2.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-accent)]/40 focus:outline-none"
                        />
                        <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                            <code>{email}</code> is replaced with the address the guest entered.
                        </p>
                        <p v-if="form.errors.guest_policy_signup_url_template" class="mt-1 text-xs text-red-400">
                            {{ form.errors.guest_policy_signup_url_template }}
                        </p>
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                    >
                        Save settings
                    </button>
                </form>
            </div>
        </div>
    </EscalatedLayout>
</template>
