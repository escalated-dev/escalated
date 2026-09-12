<script setup>
import Builder from './Builder.vue';

/**
 * The workflow editor, under the name the backends render.
 *
 * Builder.vue is the editor itself and takes exactly these props. Several
 * backends render `Escalated/Admin/Workflows/Form` for both create and edit,
 * and a page name with no component behind it is not an error in Inertia --
 * the panel simply comes up blank. This is that name.
 */
defineProps({
    workflow: { type: Object, default: null },

    // Passed by the backends alongside the workflow. Builder derives its own
    // trigger list, so this is accepted rather than forwarded; declaring it
    // keeps it out of the fallthrough attributes.
    triggerEvents: { type: [Array, Object], default: null },
});
</script>

<template>
    <Builder :workflow="workflow" />
</template>
