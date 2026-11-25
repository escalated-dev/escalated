<script setup>
import { computed } from 'vue';
import { isPlainText } from '../utils/messageBody';
import { sanitizeHtml } from '../utils/sanitizeHtml';

/**
 * A reply or note body in either of its two formats.
 *
 * HTML (it contains real HTML tags) is rendered through `render`, which
 * sanitises it, exactly as before. Plain text never goes near v-html: Vue
 * interpolation escapes it, so `Bob <bob@example.com> wrote:` and a literal
 * `<script>` show as written, and `white-space: pre-line` keeps its line
 * breaks. Classes and attributes fall through to the element.
 */
const props = defineProps({
    body: { type: String, default: '' },
    /** Turns an HTML body into safe markup. Defaults to sanitizeHtml. */
    render: { type: Function, default: sanitizeHtml },
});

const plain = computed(() => isPlainText(props.body));
</script>

<template>
    <div v-if="plain" class="whitespace-pre-line" data-body-format="text">{{ body || '' }}</div>
    <div v-else data-body-format="html" v-html="render(body)"></div>
</template>
