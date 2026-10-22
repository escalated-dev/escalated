<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    webhook: { type: Object, default: null },
    availableEvents: { type: Array, default: () => [] },
});

// Backends that keep the signing secret server-side send `has_secret`
// instead of the secret. Then a blank secret keeps the stored one and
// `clear_secret` removes it. Backends that still send `secret` get the field
// filled in and posted back as before.
const secretHidden = computed(() => Boolean(props.webhook) && Object.hasOwn(props.webhook, 'has_secret'));
const hasStoredSecret = computed(() => secretHidden.value && Boolean(props.webhook.has_secret));

const form = useForm({
    url: props.webhook?.url || '',
    events: props.webhook?.events || [],
    secret: secretHidden.value ? '' : props.webhook?.secret || '',
    active: props.webhook?.active ?? true,
    ...(secretHidden.value ? { clear_secret: false } : {}),
});

function removeSecret() {
    form.secret = '';
    form.clear_secret = true;
}

function keepSecret() {
    form.clear_secret = false;
}

function toggleEvent(event) {
    const idx = form.events.indexOf(event);
    if (idx >= 0) {
        form.events.splice(idx, 1);
    } else {
        form.events.push(event);
    }
}

function submit() {
    if (props.webhook) {
        form.put(route('escalated.admin.webhooks.update', props.webhook.id));
    } else {
        form.post(route('escalated.admin.webhooks.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="webhook ? 'Edit Webhook' : 'Create Webhook'">
        <form class="max-w-lg space-y-4" @submit.prevent="submit">
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">URL</label>
                <input
                    v-model="form.url"
                    type="url"
                    required
                    placeholder="https://example.com/webhook"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <p v-if="form.errors.url" class="mt-1 text-xs text-rose-400">{{ form.errors.url }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                    >Secret (for HMAC signing)</label
                >
                <template v-if="hasStoredSecret && form.clear_secret">
                    <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                        The secret will be removed when you save.
                        <button
                            type="button"
                            data-testid="webhook-keep-secret"
                            class="ml-1 font-medium text-[var(--esc-panel-text-secondary)] underline"
                            @click="keepSecret"
                        >
                            Keep secret
                        </button>
                    </p>
                </template>
                <template v-else>
                    <input
                        v-model="form.secret"
                        data-testid="webhook-secret"
                        type="text"
                        autocomplete="off"
                        :placeholder="hasStoredSecret ? 'Enter a new secret to replace it' : 'Optional secret key'"
                        class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                    />
                    <p v-if="hasStoredSecret" class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                        A secret is set. Leave blank to keep it.
                        <button
                            type="button"
                            data-testid="webhook-remove-secret"
                            class="ml-1 font-medium text-rose-400 underline"
                            @click="removeSecret"
                        >
                            Remove secret
                        </button>
                    </p>
                </template>
                <p v-if="form.errors.secret" class="mt-1 text-xs text-rose-400">{{ form.errors.secret }}</p>
            </div>

            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Events</label>
                <div class="grid grid-cols-2 gap-2">
                    <label
                        v-for="event in availableEvents"
                        :key="event"
                        class="flex items-center gap-2 text-sm text-[var(--esc-panel-text-secondary)]"
                    >
                        <input
                            type="checkbox"
                            :checked="form.events.includes(event)"
                            class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-cyan-500 focus:ring-cyan-500/20"
                            @change="toggleEvent(event)"
                        />
                        {{ event }}
                    </label>
                </div>
                <p v-if="form.errors.events" class="mt-1 text-xs text-rose-400">{{ form.errors.events }}</p>
            </div>

            <div>
                <label class="flex items-center gap-2 text-sm text-[var(--esc-panel-text-secondary)]">
                    <input
                        v-model="form.active"
                        type="checkbox"
                        class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-cyan-500 focus:ring-cyan-500/20"
                    />
                    Active
                </label>
            </div>

            <div class="flex gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ webhook ? 'Update' : 'Create' }}
                </button>
                <a
                    :href="route('escalated.admin.webhooks.index')"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                >
                    Cancel
                </a>
            </div>
        </form>
    </EscalatedLayout>
</template>
