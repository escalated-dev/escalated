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
                <label class="block text-sm font-medium text-neutral-300">URL</label>
                <input
                    v-model="form.url"
                    type="url"
                    required
                    placeholder="https://example.com/webhook"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <p v-if="form.errors.url" class="mt-1 text-xs text-rose-400">{{ form.errors.url }}</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Secret (for HMAC signing)</label>
                <input
                    v-model="form.secret"
                    type="text"
                    placeholder="Optional secret key"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
            </div>

            <div>
                <label class="mb-2 block text-sm font-medium text-neutral-300">Events</label>
                <div class="grid grid-cols-2 gap-2">
                    <label
                        v-for="event in availableEvents"
                        :key="event"
                        class="flex items-center gap-2 text-sm text-neutral-300"
                    >
                        <input
                            type="checkbox"
                            :checked="form.events.includes(event)"
                            class="rounded border-white/10 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20"
                            @change="toggleEvent(event)"
                        />
                        {{ event }}
                    </label>
                </div>
                <p v-if="form.errors.events" class="mt-1 text-xs text-rose-400">{{ form.errors.events }}</p>
            </div>

            <div>
                <label class="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                        v-model="form.active"
                        type="checkbox"
                        class="rounded border-white/10 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/20"
                    />
                    Active
                </label>
            </div>

            <div class="flex gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ webhook ? 'Update' : 'Create' }}
                </button>
                <a
                    :href="route('escalated.admin.webhooks.index')"
                    class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
                >
                    Cancel
                </a>
            </div>
        </form>
    </EscalatedLayout>
</template>
