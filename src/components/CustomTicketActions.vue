<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';

/**
 * Renders host-application defined action buttons on the agent ticket screen.
 *
 * Each action is provided by the backend's ticket action registry and exposed
 * on the ticket show props as `customActions`. Clicking a button (after an
 * optional confirmation) POSTs to the action's `url`, which dispatches the
 * backend `TicketCustomActionTriggered` event so the host app can handle it.
 *
 * @typedef {Object} CustomAction
 * @property {string} key - Unique identifier for the action.
 * @property {string} label - Pre-localized button label from the backend.
 * @property {string} variant - Button style: 'primary' | 'secondary' | 'danger'.
 * @property {string|null} confirmation - Optional pre-localized confirmation prompt.
 * @property {boolean} disabled - Whether the button is non-interactive.
 * @property {Object} metadata - Extra data from the action (e.g. `icon`).
 * @property {string} url - Endpoint the action POSTs to.
 * @property {string} method - HTTP method, currently always 'post'.
 */

defineProps({
    actions: { type: Array, default: () => [] },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

// Key of the action currently submitting, so we only disable the clicked button.
const processingKey = ref(null);

function variantClasses(variant) {
    switch (variant) {
        case 'primary':
            return 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-black/20 hover:from-cyan-400 hover:to-violet-400';
        case 'danger':
            return escDark.value
                ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/25'
                : 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100';
        case 'secondary':
        default:
            return escDark.value
                ? 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)]'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
    }
}

function trigger(action) {
    if (action.disabled || processingKey.value || !action.url) return;
    if (action.confirmation && !window.confirm(action.confirmation)) return;

    processingKey.value = action.key;
    router.post(
        action.url,
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                processingKey.value = null;
            },
        },
    );
}
</script>

<template>
    <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        :disabled="action.disabled || processingKey === action.key"
        :data-action-key="action.key"
        :class="[
            'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            variantClasses(action.variant),
            (action.disabled || processingKey === action.key) && 'cursor-not-allowed opacity-50',
        ]"
        @click="trigger(action)"
    >
        <svg
            v-if="action.metadata && action.metadata.icon"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
        </svg>
        <span>{{ action.label }}</span>
    </button>
</template>
