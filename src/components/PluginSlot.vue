<script setup>
import { defineAsyncComponent, h } from 'vue';

const props = defineProps({
    slot: {
        type: String,
        required: true,
    },
    components: {
        type: Array,
        default: () => [],
    },
});

// Error fallback component rendered when a plugin component fails to load
const ErrorFallback = {
    props: ['error', 'plugin', 'component'],
    render() {
        return h('div', {
            class: 'rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-400',
        }, `Plugin "${this.plugin}" failed to load component "${this.component}"`);
    },
};

// Loading placeholder component
const LoadingFallback = {
    render() {
        return h('div', {
            class: 'animate-pulse rounded-lg bg-white/[0.03] px-3 py-2',
        }, [
            h('div', { class: 'h-4 w-24 rounded bg-white/[0.06]' }),
        ]);
    },
};

// Load plugin components dynamically from host app's plugins directory
const loadPluginComponent = (plugin, component) => {
    return defineAsyncComponent({
        loader: () => import(`../../../../plugins/escalated/${plugin}/resources/js/Components/${component}.vue`),
        loadingComponent: LoadingFallback,
        errorComponent: {
            props: ['error'],
            render() {
                return h(ErrorFallback, { error: this.error, plugin, component });
            },
        },
        delay: 100,
        timeout: 10000,
    });
};
</script>

<template>
    <template v-if="components?.length > 0">
        <component
            v-for="(pluginComp, index) in components"
            :key="`${slot}-${pluginComp.plugin}-${pluginComp.component}-${index}`"
            :is="loadPluginComponent(pluginComp.plugin, pluginComp.component)"
            v-bind="pluginComp.data || {}"
        />
    </template>
</template>
