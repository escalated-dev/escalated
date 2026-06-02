<template>
    <TemplateShow :template="emptyTemplate" :themes="themes" :is-new="true" />
</template>

<script setup>
import TemplateShow from './Show.vue';

defineProps({ themes: { type: Array, required: true } });

const emptyTemplate = { id: null, name: '', theme: 'default', subject_template: '', body_markdown: '' };
</script>
