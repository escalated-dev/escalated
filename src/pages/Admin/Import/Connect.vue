<script setup>
import { router } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    platform: String,
    display_name: String,
    credential_fields: { type: Array, default: () => [] },
});

const credentials = ref({});
const testing = ref(false);
const testResult = ref(null);

props.credential_fields.forEach((f) => {
    credentials.value[f.name] = '';
});

async function testConnection() {
    testing.value = true;
    testResult.value = null;

    try {
        const response = await fetch(route('escalated.admin.import.test-connection', props.platform), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify({ credentials: credentials.value }),
        });

        const data = await response.json();
        testResult.value = data.success ? 'success' : data.error || 'Connection failed';
    } catch (e) {
        testResult.value = 'Connection failed: ' + e.message;
    } finally {
        testing.value = false;
    }
}

function proceed() {
    // Credentials already stored server-side after successful test connection
    router.get(route('escalated.admin.import.mapping', props.platform));
}
</script>

<template>
    <div class="mx-auto max-w-lg space-y-6">
        <div>
            <h2 class="text-lg font-semibold text-[var(--esc-panel-text)]">Connect to {{ display_name }}</h2>
            <p class="mt-1 text-sm text-[var(--esc-panel-text-secondary)]">
                Enter your {{ display_name }} credentials to connect.
            </p>
        </div>

        <div class="space-y-4 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
            <div v-for="field in credential_fields" :key="field.name">
                <label class="mb-1 block text-sm font-medium text-[var(--esc-panel-text)]">{{ field.label }}</label>
                <input
                    v-model="credentials[field.name]"
                    :type="field.type || 'text'"
                    :placeholder="field.help || ''"
                    class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <p v-if="field.help" class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">{{ field.help }}</p>
            </div>
        </div>

        <!-- Test connection -->
        <div class="flex items-center gap-4">
            <button
                :disabled="testing"
                class="rounded-lg border border-[var(--esc-panel-border)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-hover)]"
                @click="testConnection"
            >
                {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>

            <span v-if="testResult === 'success'" class="text-sm text-green-400">Connected successfully</span>
            <span v-else-if="testResult" class="text-sm text-red-400">{{ testResult }}</span>
        </div>

        <!-- Proceed -->
        <div class="flex justify-end">
            <button
                :disabled="testResult !== 'success'"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
                @click="proceed"
            >
                Next: Configure Mappings
            </button>
        </div>
    </div>
</template>
