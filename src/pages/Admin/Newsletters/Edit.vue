<template>
    <Compose v-bind="composeProps" />
</template>

<script setup>
import { computed } from 'vue';
import Compose from './Compose.vue';

const props = defineProps({
    newsletter: { type: Object, required: true },
    lists: { type: Array, required: true },
    templates: { type: Array, required: true },
    themes: { type: Array, required: true },
    mailConfigured: { type: Boolean, required: true },
    canSend: { type: Boolean, required: true },
});

const composeProps = computed(() => ({
    ...props,
    defaultFromEmail: props.newsletter.from_email,
    defaultReplyTo: props.newsletter.reply_to,
    defaultTheme: props.newsletter.theme,
}));
</script>
