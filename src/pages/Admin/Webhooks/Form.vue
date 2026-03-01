<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    webhook: { type: Object, default: null },
    availableEvents: { type: Array, default: () => [] },
});

const form = useForm({
    url: props.webhook?.url || '',
    events: props.webhook?.events || [],
    secret: props.webhook?.secret || '',
    active: props.webhook?.active ?? true,
});

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
                <input
                    v-model="form.secret"
                    type="text"
                    placeholder="Optional secret key"
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
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
