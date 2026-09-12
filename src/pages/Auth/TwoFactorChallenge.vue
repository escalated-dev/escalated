<script setup>
import { useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

/**
 * The post-login two-factor challenge.
 *
 * A backend renders this after authenticating a password but before letting
 * someone into the panel, so it deliberately does not use EscalatedLayout —
 * that layout is the signed-in chrome, and at this point the sign-in is not
 * finished. Nothing here should suggest access that has not been granted yet.
 *
 * Both a TOTP code and a recovery code post to the same endpoint; the backend
 * reads whichever field arrived.
 */
const props = defineProps({
    // The route to post to. A host mounts Escalated under its own prefix, and
    // this page is reached before any layout has resolved one.
    action: { type: String, default: '' },
    error: { type: String, default: '' },
});

const useRecoveryCode = ref(false);

const form = useForm({
    code: '',
    recovery_code: '',
});

const endpoint = computed(() => props.action || route('escalated.two-factor.verify'));

function submit() {
    // Only the field in use is sent, so a blank one cannot be mistaken for an
    // attempt with an empty code.
    form.transform((data) =>
        useRecoveryCode.value ? { recovery_code: data.recovery_code } : { code: data.code },
    ).post(endpoint.value);
}

function toggleMode() {
    useRecoveryCode.value = !useRecoveryCode.value;
    form.clearErrors();
    form.code = '';
    form.recovery_code = '';
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-[var(--esc-panel-bg)] px-4">
        <div class="w-full max-w-sm">
            <h1 class="text-lg font-semibold text-[var(--esc-panel-text-secondary)]">Two-factor authentication</h1>
            <p class="mt-1 text-sm text-[var(--esc-panel-text-muted)]">
                {{
                    useRecoveryCode
                        ? 'Enter one of the recovery codes you saved when you set this up.'
                        : 'Enter the six-digit code from your authenticator app.'
                }}
            </p>

            <form
                class="mt-6 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5"
                @submit.prevent="submit"
            >
                <div v-if="!useRecoveryCode">
                    <label class="block text-xs font-medium text-[var(--esc-panel-text-muted)]" for="totp-code">
                        Authentication code
                    </label>
                    <input
                        id="totp-code"
                        v-model="form.code"
                        type="text"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        maxlength="6"
                        autofocus
                        class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-center text-lg tracking-[0.4em] text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                    />
                </div>

                <div v-else>
                    <label class="block text-xs font-medium text-[var(--esc-panel-text-muted)]" for="recovery-code">
                        Recovery code
                    </label>
                    <input
                        id="recovery-code"
                        v-model="form.recovery_code"
                        type="text"
                        autocomplete="off"
                        autofocus
                        class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-bg)] px-3 py-2 text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                    />
                    <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">Each recovery code works once.</p>
                </div>

                <p v-if="error || form.errors.code || form.errors.recovery_code" class="mt-2 text-xs text-red-400">
                    {{ error || form.errors.code || form.errors.recovery_code }}
                </p>

                <button
                    type="submit"
                    :disabled="form.processing"
                    class="mt-4 w-full rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    Verify
                </button>

                <button
                    type="button"
                    class="mt-3 w-full text-xs text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-text-secondary)]"
                    @click="toggleMode"
                >
                    {{ useRecoveryCode ? 'Use an authenticator code instead' : 'Use a recovery code instead' }}
                </button>
            </form>
        </div>
    </div>
</template>
