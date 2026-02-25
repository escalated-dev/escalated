<script setup>
import { ref } from 'vue';
import TotpInput from './TotpInput.vue';

const props = defineProps({
    qrUri: { type: String, default: '' },
    recoveryCodes: { type: Array, default: () => [] },
});

const emit = defineEmits(['confirm', 'cancel']);

const step = ref(1);
const code = ref('');
const error = ref('');

function onCodeComplete(val) {
    code.value = val;
}

function confirmCode() {
    if (code.value.length !== 6) {
        error.value = 'Please enter the full 6-digit code.';
        return;
    }
    error.value = '';
    emit('confirm', code.value);
    step.value = 3;
}

function copyRecoveryCodes() {
    const text = props.recoveryCodes.join('\n');
    navigator.clipboard?.writeText(text);
}
</script>

<template>
    <div class="space-y-6">
        <!-- Step 1: QR Code -->
        <div v-if="step === 1">
            <h3 class="mb-4 text-sm font-semibold text-white">Step 1: Scan QR Code</h3>
            <p class="mb-4 text-sm text-neutral-400">
                Scan the code below with your authenticator app (Google Authenticator, Authy, etc.), or manually enter
                the setup key.
            </p>
            <div class="rounded-lg border border-white/[0.06] bg-neutral-950 p-4">
                <p class="mb-2 text-xs font-medium text-neutral-500">Setup URI (enter manually if needed):</p>
                <code class="block break-all text-xs text-cyan-400">{{ qrUri }}</code>
            </div>
            <button
                type="button"
                class="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                @click="step = 2"
            >
                Next: Verify Code
            </button>
        </div>

        <!-- Step 2: Verify TOTP -->
        <div v-if="step === 2">
            <h3 class="mb-4 text-sm font-semibold text-white">Step 2: Verify Code</h3>
            <p class="mb-4 text-sm text-neutral-400">
                Enter the 6-digit code from your authenticator app to confirm setup.
            </p>
            <TotpInput v-model="code" @complete="onCodeComplete" />
            <p v-if="error" class="mt-2 text-sm text-rose-400">{{ error }}</p>
            <div class="mt-4 flex gap-3">
                <button
                    type="button"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                    @click="confirmCode"
                >
                    Confirm & Enable 2FA
                </button>
                <button
                    type="button"
                    class="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
                    @click="emit('cancel')"
                >
                    Cancel
                </button>
            </div>
        </div>

        <!-- Step 3: Recovery Codes -->
        <div v-if="step === 3">
            <h3 class="mb-4 text-sm font-semibold text-white">Step 3: Save Recovery Codes</h3>
            <p class="mb-4 text-sm text-neutral-400">
                Save these recovery codes in a safe place. Each code can only be used once to access your account if you
                lose your authenticator device.
            </p>
            <div class="rounded-lg border border-white/[0.06] bg-neutral-950 p-4">
                <div class="grid grid-cols-2 gap-2">
                    <code
                        v-for="(rc, idx) in recoveryCodes"
                        :key="idx"
                        class="rounded bg-neutral-900 px-3 py-1.5 text-center text-sm font-mono text-neutral-200"
                    >
                        {{ rc }}
                    </code>
                </div>
            </div>
            <div class="mt-4 flex gap-3">
                <button
                    type="button"
                    class="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
                    @click="copyRecoveryCodes"
                >
                    Copy Codes
                </button>
            </div>
        </div>
    </div>
</template>
