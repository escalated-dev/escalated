/**
 * Reply and note bodies arrive in two formats: HTML from the rich composer,
 * and plain text from email, the API and the widget. Both go through
 * sanitizeHtml unchanged; a plain-text body has no tags to carry its line
 * breaks, so it is rendered with `white-space: pre-line` instead.
 */
export function isPlainText(body) {
    return !/<[a-z][\s\S]*>/i.test(body || '');
}

/** The class that keeps a plain-text body's line breaks (none for HTML). */
export function bodyFormatClass(body) {
    return isPlainText(body) ? 'whitespace-pre-line' : '';
}
