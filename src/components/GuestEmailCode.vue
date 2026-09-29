<script setup>
defineProps({ verification: { type: Object, required: true } });
defineEmits(['code']);
</script>

<template>
    <div class="guest-email-code space-y-2" aria-live="polite">
        <p v-if="verification.state.message" class="text-sm">{{ verification.state.message }}</p>
        <p v-if="verification.state.error" class="text-sm text-red-600" role="alert">{{ verification.state.error }}</p>
        <label v-if="verification.state.id" class="block text-sm">
            Email verification code
            <input
                :value="verification.state.code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="8"
                class="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-gray-900"
                @input="$emit('code', $event.target.value)"
            />
        </label>
        <button
            v-if="verification.state.id"
            type="button"
            class="text-sm underline"
            :disabled="verification.state.pending"
            @click="verification.send()"
        >
            Send a new code
        </button>
    </div>
</template>

<style scoped>
.guest-email-code {
    margin: 12px 0;
    font-size: 14px;
}
.guest-email-code label,
.guest-email-code input {
    display: block;
}
.guest-email-code input {
    box-sizing: border-box;
    width: 100%;
    margin-top: 6px;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    color: #111827;
    background: #fff;
}
.guest-email-code button {
    margin-top: 8px;
    cursor: pointer;
    text-decoration: underline;
}
</style>
