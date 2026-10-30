<script setup>
import { computed } from 'vue';
import { hasPluginBadge } from '../utils/pluginBadge';

/**
 * A plugin's live count or short label on a menu item or dashboard widget
 * (plugin contract, "Badges"). Shows numbers and strings; null, undefined,
 * an empty string and 0 show nothing (see hasPluginBadge).
 */
const props = defineProps({
    // A number or a string; null, undefined, '' and 0 render nothing.
    value: { type: null, default: null },
    // Read out before the value when the badge has no visible text beside it.
    label: { type: String, default: '' },
});

const visible = computed(() => hasPluginBadge(props.value));
</script>

<template>
    <span
        v-if="visible"
        data-plugin-badge
        class="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--esc-panel-accent)]/20 px-1.5 text-[10px] font-semibold text-[var(--esc-panel-accent)]"
    >
        <span v-if="label" class="sr-only">{{ label }}: </span>{{ value }}
    </span>
</template>
