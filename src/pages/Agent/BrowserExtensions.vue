<script setup>
import { computed, inject, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import { useI18n } from '../../composables/useI18n';
import { relativeTime, shortDate } from '../../utils/relativeTime';

const props = defineProps({
    /** `{id, name, extension_id, created_at, last_used_at, expires_at}` */
    tokens: { type: Array, default: () => [] },
    /** Contains `__ID__`, replaced with the token's id. */
    revoke_url_template: { type: String, default: '' },
});

const { t, locale } = useI18n();
const dark = inject(
    'esc-dark',
    computed(() => true),
);

const confirmingId = ref(null);

function revoke(id) {
    router.delete(props.revoke_url_template.replace('__ID__', encodeURIComponent(id)), {
        preserveScroll: true,
        onFinish: () => {
            if (confirmingId.value === id) confirmingId.value = null;
        },
    });
}

const mutedText = computed(() => (dark.value ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500'));
const buttonBase =
    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]';
</script>

<template>
    <EscalatedLayout :title="t('browser_extensions.title')">
        <div class="space-y-6">
            <div>
                <h2 :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'" class="text-lg font-semibold">
                    {{ t('browser_extensions.title') }}
                </h2>
                <p :class="mutedText" class="mt-1 text-sm">{{ t('browser_extensions.intro') }}</p>
            </div>

            <p
                v-if="!tokens.length"
                :class="
                    dark
                        ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-text-muted)]'
                        : 'border-gray-200 bg-white text-gray-500'
                "
                class="rounded-lg border p-6 text-center text-sm"
            >
                {{ t('browser_extensions.empty') }}
            </p>

            <ul v-else class="space-y-3">
                <li
                    v-for="token in tokens"
                    :key="token.id"
                    data-testid="extension-row"
                    :class="
                        dark
                            ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)]'
                            : 'border-gray-200 bg-white'
                    "
                    class="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4"
                >
                    <div class="min-w-0 space-y-1">
                        <p
                            :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'"
                            class="break-words text-sm font-semibold"
                        >
                            {{ token.name }}
                        </p>
                        <p
                            :class="dark ? 'text-[var(--esc-panel-text-secondary)]' : 'text-gray-700'"
                            class="break-all font-mono text-xs"
                        >
                            {{ token.extension_id }}
                        </p>
                        <p :class="mutedText" class="text-xs">
                            {{ t('browser_extensions.connected', { date: shortDate(token.created_at, locale) }) }}
                            <span aria-hidden="true">&middot;</span>
                            <template v-if="token.last_used_at">
                                {{
                                    t('browser_extensions.last_used', {
                                        time: relativeTime(token.last_used_at, locale),
                                    })
                                }}
                            </template>
                            <template v-else>{{ t('browser_extensions.never_used') }}</template>
                            <template v-if="token.expires_at">
                                <span aria-hidden="true">&middot;</span>
                                {{ t('browser_extensions.expires', { date: shortDate(token.expires_at, locale) }) }}
                            </template>
                        </p>
                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                        <template v-if="confirmingId === token.id">
                            <span :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'" class="text-sm">
                                {{ t('browser_extensions.revoke_confirm') }}
                            </span>
                            <button
                                type="button"
                                :class="[
                                    buttonBase,
                                    dark
                                        ? 'bg-rose-500 text-white hover:bg-rose-400'
                                        : 'bg-rose-600 text-white hover:bg-rose-700',
                                ]"
                                @click="revoke(token.id)"
                            >
                                {{ t('browser_extensions.revoke_yes') }}
                            </button>
                            <button
                                type="button"
                                :class="[
                                    buttonBase,
                                    dark
                                        ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-active)]'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                                ]"
                                @click="confirmingId = null"
                            >
                                {{ t('browser_extensions.cancel') }}
                            </button>
                        </template>
                        <button
                            v-else
                            type="button"
                            :class="[
                                buttonBase,
                                dark
                                    ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-active)]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                            ]"
                            @click="confirmingId = token.id"
                        >
                            {{ t('browser_extensions.revoke') }}
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </EscalatedLayout>
</template>
