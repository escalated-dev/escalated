/**
 * Small helpers for the agent panel's optional backend features (ADR
 * 2026-11-05-agent-panel-data): resolving a named route the host may not
 * define, and JSON requests to it.
 */

import { requestHeaders, xsrfCookie } from './http';

/**
 * The URL of a named route, or '' when the host has no such route. Ziggy
 * throws for an unknown name; the non-Laravel shims return '#'.
 */
export function routeOr(name, params) {
    const route = typeof window !== 'undefined' ? window.route : undefined;
    if (typeof route !== 'function') return '';
    try {
        const url = params === undefined ? route(name) : route(name, params);
        return typeof url === 'string' && url !== '#' ? url : '';
    } catch {
        return '';
    }
}

function headers(withBody) {
    const list = requestHeaders({ json: withBody });
    // These requests have always sent the cookie as well when both exist;
    // keep doing so for backends that read only X-XSRF-TOKEN.
    const xsrf = xsrfCookie();
    if (xsrf) list['X-XSRF-TOKEN'] = xsrf;
    return list;
}

/** Thrown for a non-2xx answer; `status` is the HTTP status. */
export class RequestError extends Error {
    constructor(status) {
        super(`Request failed with status ${status}`);
        this.status = status;
    }
}

/**
 * A JSON request. Resolves with the parsed answer (or null for an empty one)
 * and rejects with a RequestError for a non-2xx status.
 */
export async function requestJson(url, { method = 'GET', body, params } = {}) {
    let target = url;
    if (params) {
        const query = new window.URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
        ).toString();
        if (query) target += (target.includes('?') ? '&' : '?') + query;
    }
    const response = await fetch(target, {
        method,
        credentials: 'same-origin',
        headers: headers(body !== undefined),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response || response.ok === false) throw new RequestError(response?.status ?? 0);
    if (typeof response.json !== 'function') return null;
    try {
        return await response.json();
    } catch {
        return null;
    }
}
