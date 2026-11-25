/**
 * Reply and note bodies arrive in two formats: HTML from the rich composer,
 * and plain text from email, the API and the widget. Both go through
 * sanitizeHtml unchanged; a plain-text body has no tags to carry its line
 * breaks, so it is rendered with `white-space: pre-line` instead.
 */
// Tags the composer and email clients actually produce. Matching any
// `<word...>` would count a quoted address ("Bob <bob@example.com> wrote:")
// as markup and drop the email's line breaks.
const HTML_TAG =
    /<\/?(?:p|br|div|span|a|strong|b|em|i|u|s|ul|ol|li|blockquote|pre|code|h[1-6]|img|table|thead|tbody|tfoot|tr|td|th|hr)(?=[\s/>])[^>]*>/i;

export function isPlainText(body) {
    return !HTML_TAG.test(body || '');
}

/** The class that keeps a plain-text body's line breaks (none for HTML). */
export function bodyFormatClass(body) {
    return isPlainText(body) ? 'whitespace-pre-line' : '';
}
