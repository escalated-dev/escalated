/**
 * Headers for the package's own fetch() calls to the host backend.
 *
 * Hosts carry the CSRF token in one of two places: a `csrf-token` meta tag,
 * or (Laravel's default for SPAs, and what Inertia's own requests rely on)
 * an `XSRF-TOKEN` cookie. Reading only the meta tag meant every write from a
 * host without it was rejected with a 419. The meta tag wins when present,
 * sent as X-CSRF-TOKEN; otherwise the cookie is sent, URL-decoded, as
 * X-XSRF-TOKEN. A token is never sent to another origin.
 */

function sameOrigin(url) {
    if (!url || typeof window === 'undefined') return true;
    try {
        return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
        return false;
    }
}

/** The CSRF meta tag's token, or ''. */
export function csrfMetaToken() {
    if (typeof document === 'undefined') return '';
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

/** The URL-decoded XSRF-TOKEN cookie, or ''. */
export function xsrfCookie() {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    if (!match) return '';
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return '';
    }
}

/**
 * `{ 'X-CSRF-TOKEN': meta }`, else `{ 'X-XSRF-TOKEN': cookie }`, else `{}`.
 * Pass the request URL to drop the token for a cross-origin request.
 */
export function csrfHeaders(url) {
    if (!sameOrigin(url)) return {};
    const token = csrfMetaToken();
    if (token) return { 'X-CSRF-TOKEN': token };
    const cookie = xsrfCookie();
    return cookie ? { 'X-XSRF-TOKEN': cookie } : {};
}

/**
 * The headers for a JSON request to the host: Accept, X-Requested-With, the
 * CSRF token and, with `json`, Content-Type.
 */
export function requestHeaders({ json = false, url } = {}) {
    const headers = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...csrfHeaders(url),
    };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
}
