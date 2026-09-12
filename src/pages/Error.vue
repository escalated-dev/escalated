<script setup>
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';

/**
 * The refusal and not-found screen.
 *
 * Backends render this instead of an HTML error page so a 403 or a 404 inside
 * the panel stays inside the panel. It deliberately does not use
 * EscalatedLayout: the most common reason to arrive here is that the viewer was
 * refused, and the layout's navigation is a list of places they may equally not
 * be allowed to go. Rendering it would offer a menu that mostly leads back
 * here.
 *
 * The message comes from the backend, already translated. The headings below
 * are the fallback for a status arriving with no message at all.
 */
const props = defineProps({
    status: { type: [Number, String], default: 500 },
    message: { type: String, default: '' },

    // Where "back" goes. A host mounts Escalated under its own prefix, and this
    // page is reached without a layout to resolve one.
    home: { type: String, default: '' },
});

const code = computed(() => String(props.status));

const title = computed(
    () =>
        ({
            403: 'Not allowed',
            404: 'Not found',
            419: 'Session expired',
            429: 'Too many requests',
            500: 'Something went wrong',
            503: 'Temporarily unavailable',
        })[code.value] || 'Something went wrong',
);

const explanation = computed(
    () =>
        ({
            403: 'Your account does not have access to this.',
            404: 'That page does not exist, or it has been removed.',
            419: 'Your session expired. Sign in again to continue.',
            429: 'Too many requests in a short space of time. Wait a moment and try again.',
            503: 'The service is down for maintenance. Try again shortly.',
        })[code.value] || 'The request could not be completed.',
);
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-[var(--esc-panel-bg)] px-4">
        <div class="w-full max-w-md text-center">
            <p class="font-mono text-sm tracking-widest text-[var(--esc-panel-text-muted)]">{{ code }}</p>
            <h1 class="mt-2 text-xl font-semibold text-[var(--esc-panel-text-secondary)]">{{ title }}</h1>
            <p class="mt-3 text-sm text-[var(--esc-panel-text-muted)]">{{ message || explanation }}</p>

            <Link
                v-if="home"
                :href="home"
                class="mt-6 inline-block rounded-lg border border-[var(--esc-panel-border)] px-4 py-2 text-sm text-[var(--esc-panel-text-tertiary)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
            >
                Back to the panel
            </Link>
        </div>
    </div>
</template>
