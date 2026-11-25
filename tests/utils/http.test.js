import { describe, it, expect, afterEach } from 'vitest';
import { csrfHeaders, requestHeaders, xsrfCookie } from '../../src/utils/http';

afterEach(() => {
    document.head.innerHTML = '';
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('csrfHeaders', () => {
    it('sends the meta tag token as X-CSRF-TOKEN when the page has one', () => {
        document.head.innerHTML = '<meta name="csrf-token" content="meta-tok">';
        document.cookie = 'XSRF-TOKEN=cookie-tok';
        expect(csrfHeaders()).toEqual({ 'X-CSRF-TOKEN': 'meta-tok' });
    });

    it('falls back to the URL-decoded XSRF-TOKEN cookie as X-XSRF-TOKEN', () => {
        document.cookie = 'XSRF-TOKEN=eyJpdiI6%3D%3D';
        expect(csrfHeaders()).toEqual({ 'X-XSRF-TOKEN': 'eyJpdiI6==' });
        expect(xsrfCookie()).toBe('eyJpdiI6==');
    });

    it('sends nothing when there is no token, or to another origin', () => {
        expect(csrfHeaders()).toEqual({});
        document.head.innerHTML = '<meta name="csrf-token" content="meta-tok">';
        expect(csrfHeaders('https://elsewhere.example/api')).toEqual({});
        expect(csrfHeaders('/support/x')).toEqual({ 'X-CSRF-TOKEN': 'meta-tok' });
    });
});

describe('requestHeaders', () => {
    it('marks the request as XHR and adds Content-Type for JSON bodies', () => {
        document.cookie = 'XSRF-TOKEN=c';
        expect(requestHeaders({ json: true })).toEqual({
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': 'c',
        });
        expect(requestHeaders()['Content-Type']).toBeUndefined();
    });
});
