/**
 * Replace @{Name} patterns in text with styled mention badges.
 *
 * @param {string} html - The HTML or text content
 * @param {boolean} dark - Whether dark mode is active
 * @returns {string} HTML with mentions wrapped in styled spans
 */
export function highlightMentions(html, dark = false) {
    if (!html) return '';

    const pillClass = dark
        ? 'inline-flex items-center rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/20'
        : 'inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200';

    // Replace @{Name} with styled pill
    return html.replace(/@\{([^}]+)\}/g, `<span class="${pillClass}">@$1</span>`);
}
