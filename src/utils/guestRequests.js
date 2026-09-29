/** Never forward the embedding site's CSRF token to another origin. */
export function guestCsrfHeaders(url) {
    if (typeof window === 'undefined' || new URL(url, window.location.href).origin !== window.location.origin)
        return {};
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    if (token) return { 'X-CSRF-TOKEN': token };
    const cookie = document.cookie.split('; ').find((value) => value.startsWith('XSRF-TOKEN='));
    if (!cookie) return {};
    try {
        return { 'X-XSRF-TOKEN': decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) };
    } catch {
        return {};
    }
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
