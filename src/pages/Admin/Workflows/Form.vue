<script setup>
import Builder from './Builder.vue';

/**
 * The workflow editor, under the name the backends render.
 *
 * Builder.vue is the editor itself. Several backends render
 * `Escalated/Admin/Workflows/Form` for both create and edit, and a page name
 * with no component behind it is not an error in Inertia -- the panel simply
 * comes up blank. This is that name.
 */
defineProps({
    workflow: { type: Object, default: null },

    // What the backend fires, evaluates and executes, passed alongside the
    // workflow (escalated-developer-context domain-model/workflow-admin-contract.md).
    // The builder offers exactly these, so they are handed on.
    //
    // Declared in snake_case because that is what arrives. Vue folds
    // kebab-case into camelCase and nothing else, so a `triggerEvents`
    // declaration never matched the `trigger_events` the backends send -- it
    // landed on Builder's root element as an attribute.
    trigger_events: { type: [Array, Object], default: null },
    operators: { type: [Array, Object], default: null },
    action_types: { type: [Array, Object], default: null },
});
</script>

<template>
    <Builder
        :workflow="workflow"
        :trigger-events="trigger_events"
        :action-types="action_types"
        :operators="operators"
    />
</template>
