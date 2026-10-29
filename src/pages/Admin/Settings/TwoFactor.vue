<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import TwoFactorSetup from '../../../components/TwoFactorSetup.vue';
import { router, usePage } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { readFlash } from '../../../utils/flash';
import { usePermissions } from '../../../composables/usePermissions';

const props = defineProps({
    enabled: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
    // Whether every staff user must enrol (the `two_factor_required` setting).
    // A backend that does not send it gets no toggle.
    required: { type: Boolean, default: null },
});

const page = usePage();
const showSetup = ref(false);
const startingSetup = ref(false);
const flash = computed(() => readFlash(page));
const setupData = computed(() => flash.value.two_factor_setup);
const confirmedData = computed(() => flash.value.two_factor_confirmed);
const copyError = ref('');
const { hasPermission } = usePermissions();
const savingRequired = ref(false);

// Saving the setting needs the admin settings route, so only admins who may
// manage settings see the switch. Everyone else just sees whether it is on.
const canChangeRequired = computed(
    () =>
        typeof props.required === 'boolean' &&
        page.props.escalated?.is_admin === true &&
        hasPermission('settings.manage'),
);

function toggleRequired() {
    if (savingRequired.value) return;
    savingRequired.value = true;
    router.post(
        route('escalated.admin.settings.update'),
        { two_factor_required: !props.required },
        {
            preserveScroll: true,
            onFinish: () => {
                savingRequired.value = false;
            },
        },
    );
}

watch(setupData, (data) => (showSetup.value = Boolean(data)), { immediate: true });
watch(confirmedData, () => (copyError.value = ''));

function startSetup() {
    if (startingSetup.value) return;
    startingSetup.value = true;
    router.post(
        route('escalated.admin.two-factor.setup'),
        {},
        {
            preserveScroll: true,
            onSuccess: () => {
                showSetup.value = Boolean(setupData.value);
            },
            onFinish: () => {
                startingSetup.value = false;
            },
        },
    );
}

function confirmCode(code) {
    router.post(
        route('escalated.admin.two-factor.confirm'),
        { code },
        {
            preserveScroll: true,
        },
    );
}

function disable() {
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
        router.post(
            route('escalated.admin.two-factor.disable'),
            {},
            {
                preserveScroll: true,
            },
        );
    }
}

async function copyRecoveryCodes() {
    const codes = confirmedData.value?.recovery_codes;
    if (!codes?.length) return;
    copyError.value = '';
    try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(codes.join('\n'));
    } catch {
        copyError.value = 'Could not copy recovery codes. Select and copy the codes below.';
    }
}
</script>

<template>
    <EscalatedLayout title="Two-Factor Authentication">
        <div class="mx-auto max-w-2xl space-y-6">
            <!-- Status -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-4 text-sm font-semibold text-[var(--esc-panel-text)]">Two-Factor Authentication</h3>
                <p class="text-sm text-[var(--esc-panel-text-tertiary)]">
                    Add an extra layer of security by requiring a time-based one-time password (TOTP) in addition to
                    your password when signing in.
                </p>
                <div class="mt-4">
                    <div v-if="enabled" class="flex items-center gap-3">
                        <span
                            class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                        >
                            Enabled
                        </span>
                        <button
                            type="button"
                            class="rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                            @click="disable"
                        >
                            Disable 2FA
                        </button>
                    </div>
                    <div v-else-if="!showSetup">
                        <span
                            class="mb-3 inline-flex items-center rounded-full bg-neutral-700/50 px-3 py-1 text-xs font-medium text-[var(--esc-panel-text-tertiary)]"
                        >
                            Not Enabled
                        </span>
                        <div class="mt-3">
                            <button
                                type="button"
                                :disabled="startingSetup"
                                :aria-busy="startingSetup"
                                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
                                @click="startSetup"
                            >
                                Set Up Two-Factor Authentication
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Require for all staff -->
            <div
                v-if="required !== null"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 id="two-factor-required-label" class="text-sm font-semibold text-[var(--esc-panel-text)]">
                            Require for all staff
                        </h3>
                        <p class="mt-2 text-sm text-[var(--esc-panel-text-tertiary)]">
                            <template v-if="required">
                                Two-factor authentication is required for all staff. Anyone who has not enrolled is sent
                                here before they can use anything else.
                            </template>
                            <template v-else>
                                Staff may choose whether to enrol. Turn this on to make every staff member enrol before
                                they can use anything else.
                            </template>
                        </p>
                    </div>
                    <button
                        v-if="canChangeRequired"
                        type="button"
                        role="switch"
                        :aria-checked="required ? 'true' : 'false'"
                        aria-labelledby="two-factor-required-label"
                        :disabled="savingRequired"
                        class="inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        :class="required ? 'bg-indigo-600' : 'bg-gray-300'"
                        @click="toggleRequired"
                    >
                        <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                            :class="required ? 'translate-x-6' : 'translate-x-1'"
                        />
                    </button>
                </div>
            </div>

            <!-- Setup Wizard -->
            <div
                v-if="showSetup && setupData && !enabled"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <TwoFactorSetup :qr-uri="setupData.qr_uri" @confirm="confirmCode" @cancel="showSetup = false" />
            </div>

            <div
                v-if="confirmedData?.recovery_codes?.length"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 class="text-sm font-semibold text-[var(--esc-panel-text)]">Recovery Codes</h3>
                        <p class="mt-2 text-sm text-[var(--esc-panel-text-tertiary)]">
                            Save these codes now. Each one can be used once if you lose access to your authenticator.
                        </p>
                    </div>
                    <button
                        type="button"
                        class="rounded-lg border border-[var(--esc-panel-border)] px-4 py-2 text-sm text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-surface-alt)]"
                        @click="copyRecoveryCodes"
                    >
                        Copy Codes
                    </button>
                </div>
                <p v-if="copyError" role="alert" class="mt-3 text-sm text-rose-400">{{ copyError }}</p>
                <div class="mt-4 grid gap-2 md:grid-cols-2">
                    <code
                        v-for="code in confirmedData.recovery_codes"
                        :key="code"
                        class="rounded-lg bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-center text-sm font-mono text-[var(--esc-panel-text-secondary)]"
                    >
                        {{ code }}
                    </code>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
