<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import TwoFactorSetup from '../../../components/TwoFactorSetup.vue';
import { router, usePage } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    enabled: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
});

const page = usePage();
const showSetup = ref(false);
const setupData = computed(() => page.props.flash?.two_factor_setup);

function startSetup() {
    router.post(
        route('escalated.admin.two-factor.setup'),
        {},
        {
            preserveScroll: true,
            onSuccess: () => {
                showSetup.value = true;
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
</script>

<template>
    <EscalatedLayout title="Two-Factor Authentication">
        <div class="mx-auto max-w-2xl space-y-6">
            <!-- Status -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-4 text-sm font-semibold text-white">Two-Factor Authentication</h3>
                <p class="text-sm text-neutral-400">
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
                    <div v-else-if="!showSetup && !setupData">
                        <span
                            class="mb-3 inline-flex items-center rounded-full bg-neutral-700/50 px-3 py-1 text-xs font-medium text-neutral-400"
                        >
                            Not Enabled
                        </span>
                        <div class="mt-3">
                            <button
                                type="button"
                                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                                @click="startSetup"
                            >
                                Set Up Two-Factor Authentication
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Setup Wizard -->
            <div v-if="setupData && !enabled" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <TwoFactorSetup
                    :qr-uri="setupData.qr_uri"
                    :recovery-codes="setupData.recovery_codes"
                    @confirm="confirmCode"
                    @cancel="showSetup = false"
                />
            </div>
        </div>
    </EscalatedLayout>
</template>
