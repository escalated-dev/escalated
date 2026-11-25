/**
 * Reply and note bodies arrive in two formats: HTML from the rich composer,
 * and plain text from email, the API and the widget. HTML is sanitised and
 * rendered as markup; plain text is rendered as text (escaped by Vue, never
 * through v-html) with `white-space: pre-line` for its line breaks. See
 * MessageBody.vue.
 */
// Tags the composer and email clients actually produce. Matching any
// `<word...>` would count a quoted address ("Bob <bob@example.com> wrote:")
// as markup and drop the email's line breaks.
const HTML_TAG =
    /<\/?(?:p|br|div|span|a|strong|b|em|i|u|s|ul|ol|li|blockquote|pre|code|h[1-6]|img|table|thead|tbody|tfoot|tr|td|th|hr)(?=[\s/>])[^>]*>/i;

export function isPlainText(body) {
    return !HTML_TAG.test(body || '');
}
