/**
 * Whether a plugin badge (plugin contract, "Badges": a number, a string or
 * null) has anything to show. null, undefined, an empty string and 0 do not,
 * so a plugin with nothing to report leaves no pill behind.
 */
export function hasPluginBadge(value) {
    if (value === null || value === undefined || value === 0) return false;
    return String(value).trim() !== '';
}
