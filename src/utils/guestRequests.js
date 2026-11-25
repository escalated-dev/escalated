import { csrfHeaders } from './http';

/** Never forward the embedding site's CSRF token to another origin. */
export function guestCsrfHeaders(url) {
    if (typeof window === 'undefined') return {};
    return csrfHeaders(new URL(url, window.location.href).href);
}

export async function guestRequest(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...guestCsrfHeaders(url) },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.errors ? Object.values(data.errors).flat().join(' ') : data.message || 'Request failed.');
    return data;
}
