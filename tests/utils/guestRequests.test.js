import { afterEach, describe, expect, it } from 'vitest';
import { guestCsrfHeaders } from '../../src/utils/guestRequests';

afterEach(() => {
    document.querySelector('meta[name="csrf-token"]')?.remove();
});

describe('guest form CSRF headers', () => {
    it('sends the page token only to the same origin', () => {
        const meta = document.createElement('meta');
        meta.name = 'csrf-token';
        meta.content = 'private-host-token';
        document.head.append(meta);
        expect(guestCsrfHeaders('/support/guest/verification')).toEqual({ 'X-CSRF-TOKEN': 'private-host-token' });
        expect(guestCsrfHeaders('https://another-origin.example/verification')).toEqual({});
    });
});
