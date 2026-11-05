/**
 * The iframe embed protocol, v1 (ADR 2026-11-05-embeddable-admin).
 *
 * Escalated, inside the frame, sends `{ source: 'escalated', version: 1, type }`:
 *   ready    { url, route, title }   after the first page mounts
 *   resize   { height }              whenever the content height changes
 *   navigate { url, route, title }   after every Inertia navigation
 *
 * The host page sends `{ source: 'escalated-host', version: 1, type }`:
 *   theme    { mode: 'light' | 'dark', tokens? }  re-theme the panel
 *   navigate { url }                               visit a path under the embed base URL
 *
 * Neither side ever posts to '*' or accepts a message from an origin that is
 * not on its allow-list.
 */
export const PROTOCOL_VERSION = 1;
export const FRAME_SOURCE = 'escalated';
export const HOST_SOURCE = 'escalated-host';

/** `path` without trailing slashes (a loop, not a regex, so input cannot make it slow). */
export function trimTrailingSlashes(path) {
    let end = path.length;
    while (end > 0 && path[end - 1] === '/') end -= 1;
    return path.slice(0, end);
}

/** A normalised origin (`scheme://host[:port]`), or null for anything that is not one. */
export function toOrigin(value) {
    if (typeof value !== 'string' || value === '' || value === '*' || value === 'null') return null;
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        return url.origin;
    } catch {
        return null;
    }
}

/** The allow-list as normalised origins; wildcards and junk are dropped. */
export function normaliseOrigins(list) {
    if (!Array.isArray(list)) return [];
    const origins = [];
    for (const entry of list) {
        const origin = toOrigin(entry);
        if (origin && !origins.includes(origin)) origins.push(origin);
    }
    return origins;
}

/** Whether a message payload is a v1 message from the given side. */
export function isProtocolMessage(data, source) {
    return (
        !!data &&
        typeof data === 'object' &&
        data.source === source &&
        data.version === PROTOCOL_VERSION &&
        typeof data.type === 'string'
    );
}

/**
 * Whether `url` is a same-origin path at or below `base` (both absolute
 * paths). Rejects schemes, protocol-relative URLs and backslashes, so a host
 * message can never send the frame somewhere else.
 */
export function isPathUnder(url, base) {
    if (typeof url !== 'string' || typeof base !== 'string') return false;
    if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\')) return false;
    const root = trimTrailingSlashes(base) || '/';
    const path = url.split(/[?#]/)[0];
    if (path.split('/').includes('..')) return false;
    if (root === '/') return true;
    return path === root || path.startsWith(`${root}/`);
}
