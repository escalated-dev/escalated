<script setup>
import { computed, inject, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import { useI18n } from '../../composables/useI18n';

const props = defineProps({
    client_name: { type: String, default: '' },
    extension_id: { type: String, default: '' },
    origin_host: { type: String, default: '' },
    approve_url: { type: String, required: true },
    deny_url: { type: String, required: true },
    /** The original query (redirect_uri, state, code_challenge, ...), posted back unchanged. */
    params: { type: Object, default: () => ({}) },
});

const { t } = useI18n();
const dark = inject(
    'esc-dark',
    computed(() => true),
);

const submitting = ref(false);
const name = computed(() => props.client_name || t('browser_extensions.unnamed_client'));

// Never submits on its own: only a click on a button gets here. Inertia sends
// the session's CSRF token with the POST.
function submit(url) {
    if (submitting.value) return;
    submitting.value = true;
    router.post(url, { ...props.params }, { onFinish: () => (submitting.value = false) });
}
</script>

<template>
    <EscalatedLayout :title="t('browser_extensions.connect_title')">
        <div class="mx-auto max-w-xl space-y-5 py-6">
            <div>
                <h2 :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'" class="text-lg font-semibold">
                    {{ t('browser_extensions.connect_title') }}
                </h2>
                <p :class="dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500'" class="mt-1 text-sm">
                    {{ t('browser_extensions.connect_intro', { name }) }}
                </p>
            </div>

            <dl
                :class="
                    dark
                        ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)]'
                        : 'border-gray-200 bg-white'
                "
                class="space-y-4 rounded-lg border p-5"
            >
                <div>
                    <dt
                        :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                        class="text-xs font-medium"
                    >
                        {{ t('browser_extensions.extension_id') }}
                    </dt>
                    <dd
                        data-testid="extension-id"
                        :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'"
                        class="mt-1 break-all font-mono text-base font-semibold tracking-wide"
                    >
                        {{ extension_id }}
                    </dd>
                </div>
                <div>
                    <dt
                        :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                        class="text-xs font-medium"
                    >
                        {{ t('browser_extensions.returns_to') }}
                    </dt>
                    <dd
                        :class="dark ? 'text-[var(--esc-panel-text-secondary)]' : 'text-gray-700'"
                        class="mt-1 break-all font-mono text-sm"
                    >
                        {{ origin_host }}
                    </dd>
                </div>
            </dl>

            <p
                :class="
                    dark
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                        : 'border-amber-300 bg-amber-50 text-amber-800'
                "
                class="rounded-lg border p-4 text-sm"
            >
                {{ t('browser_extensions.approve_notice') }}
            </p>

            <div class="flex items-center gap-3">
                <button
                    type="button"
                    :disabled="submitting"
                    :class="
                        dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                    "
                    class="rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] disabled:opacity-60"
                    @click="submit(approve_url)"
                >
                    {{ t('browser_extensions.approve') }}
                </button>
                <button
                    type="button"
                    :disabled="submitting"
                    :class="
                        dark
                            ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-active)]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    "
                    class="rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] disabled:opacity-60"
                    @click="submit(deny_url)"
                >
                    {{ t('browser_extensions.deny') }}
                </button>
            </div>
        </div>
    </EscalatedLayout>
</template>
