<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import { computed, resolveComponent } from 'vue';

/**
 * A full page registered by a plugin.
 *
 * A plugin declares a route on the backend and a component on the frontend;
 * the backend renders this page with the component's name, and this is where
 * the two meet. `defineEscalatedPlugin` registers those components globally on
 * the app, so the name is resolved from the global registry rather than
 * imported.
 *
 * Two backends render `Escalated/Plugin/Page`, and there was no component
 * behind the name — so every plugin page was blank, whether or not the plugin
 * had registered its component correctly. A plugin that has not been installed
 * on the frontend now says so instead.
 */
const props = defineProps({
    plugin: { type: String, default: '' },
    component: { type: String, default: '' },
    layout: { type: String, default: 'admin' },
    props: { type: Object, default: () => ({}) },
});

const resolved = computed(() => {
    if (!props.component) {
        return null;
    }

    const found = resolveComponent(props.component);

    // resolveComponent hands back the name as a string when nothing is
    // registered under it, which would render as a literal <ComponentName>
    // element rather than as anything useful.
    return typeof found === 'string' ? null : found;
});

const title = computed(() => props.component || props.plugin || 'Plugin');
</script>

<template>
    <EscalatedLayout :title="title">
        <component :is="resolved" v-if="resolved" v-bind="props.props" />

        <div
            v-else
            class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6 text-center"
        >
            <p class="text-sm text-[var(--esc-panel-text-secondary)]">
                The <strong>{{ plugin || 'plugin' }}</strong> plugin registered a page here, but no component named
                <code class="rounded bg-[var(--esc-panel-hover)] px-1">{{ component || '(unnamed)' }}</code> is
                available.
            </p>
            <p class="mt-2 text-xs text-[var(--esc-panel-text-muted)]">
                Register it on the frontend with <code>defineEscalatedPlugin</code> — the backend route exists, so only
                the component is missing.
            </p>
        </div>
    </EscalatedLayout>
</template>
