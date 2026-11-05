import { describe, it, expect, vi, afterEach } from 'vitest';
import { RequestError, requestJson, routeOr } from '../../src/utils/agentApi';

afterEach(() => {
    vi.unstubAllGlobals();
    delete window.route;
    document.head.innerHTML = '';
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('routeOr', () => {
    it('returns the URL of a route the host has', () => {
        window.route = vi.fn(() => '/support/agent/status');
        expect(routeOr('escalated.agent.status')).toBe('/support/agent/status');
        expect(window.route).toHaveBeenCalledWith('escalated.agent.status');
    });

    it('passes params through', () => {
        window.route = vi.fn((name, params) => `/t/${params}`);
        expect(routeOr('escalated.agent.tickets.read', 'ESC-1')).toBe('/t/ESC-1');
    });

    it("returns '' for an unknown route, a '#' shim or no route helper", () => {
        expect(routeOr('x')).toBe('');
        window.route = vi.fn(() => {
            throw new Error('no route');
        });
        expect(routeOr('x')).toBe('');
        window.route = vi.fn(() => '#');
        expect(routeOr('x')).toBe('');
    });
});

describe('requestJson', () => {
    it('sends JSON with the CSRF token and parses the answer', async () => {
        document.head.innerHTML = '<meta name="csrf-token" content="tok">';
        document.cookie = 'XSRF-TOKEN=x%3Dy';
        const fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ a: 1 }) }));
        vi.stubGlobal('fetch', fetch);
        expect(await requestJson('/u', { method: 'POST', body: { b: 2 } })).toEqual({ a: 1 });
        const [, options] = fetch.mock.calls[0];
        expect(options.method).toBe('POST');
        expect(options.body).toBe('{"b":2}');
        expect(options.headers).toMatchObject({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': 'tok',
            'X-XSRF-TOKEN': 'x=y',
        });
    });

    it('adds query params, leaving out empty ones', async () => {
        const fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
        vi.stubGlobal('fetch', fetch);
        await requestJson('/kb?x=1', { params: { q: 'a b', page: 2, unread: '' } });
        expect(fetch.mock.calls[0][0]).toBe('/kb?x=1&q=a+b&page=2');
        expect(fetch.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
    });

    it('rejects with the status for a non-2xx answer', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve({ ok: false, status: 422 })),
        );
        await expect(requestJson('/u')).rejects.toMatchObject({ status: 422 });
        await expect(requestJson('/u')).rejects.toBeInstanceOf(RequestError);
    });
});
