import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../../src/composables/useChat';

/* global globalThis */

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock document.querySelector for CSRF token
Object.defineProperty(globalThis, 'document', {
    value: {
        querySelector: vi.fn(() => ({ content: 'test-csrf-token' })),
    },
    writable: true,
    configurable: true,
});

// Mock window.Echo as unavailable (default)
Object.defineProperty(globalThis, 'window', {
    value: { Echo: undefined },
    writable: true,
    configurable: true,
});

// We need to mock onUnmounted since we're calling outside component context
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        onUnmounted: vi.fn(),
    };
});

beforeEach(() => {
    mockFetch.mockReset();
});

describe('useChat', () => {
    describe('startChat', () => {
        it('sends POST to start endpoint with correct data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 123, status: 'waiting' }),
            });

            const { startChat } = useChat();
            const result = await startChat({ name: 'Alice', email: 'alice@example.com' });

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/start',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
                }),
            );
            expect(result.id).toBe(123);
        });

        it('throws on error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Chat unavailable' }),
            });

            const { startChat } = useChat();
            await expect(startChat({})).rejects.toEqual(expect.objectContaining({ status: undefined }));
        });
    });

    describe('sendMessage', () => {
        it('sends message to correct endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, body: 'Hello' }),
            });

            const { sendMessage } = useChat();
            await sendMessage(123, { body: 'Hello' });

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/123/messages',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ body: 'Hello' }),
                }),
            );
        });
    });

    describe('endChat', () => {
        it('sends POST to end endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ status: 'ended' }),
            });

            const { endChat } = useChat();
            const result = await endChat(123);

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/123/end',
                expect.objectContaining({ method: 'POST' }),
            );
            expect(result.status).toBe('ended');
        });
    });

    describe('rateChat', () => {
        it('sends rating with comment', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const { rateChat } = useChat();
            await rateChat(123, 5, 'Great service');

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/123/rate',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ rating: 5, comment: 'Great service' }),
                }),
            );
        });
    });

    describe('checkAvailability', () => {
        it('checks availability without department', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ available: true }),
            });

            const { checkAvailability } = useChat();
            const result = await checkAvailability();

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/availability',
                expect.objectContaining({ method: 'GET' }),
            );
            expect(result.available).toBe(true);
        });

        it('checks availability with department', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ available: false }),
            });

            const { checkAvailability } = useChat();
            await checkAvailability(5);

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/availability?department_id=5',
                expect.anything(),
            );
        });
    });

    describe('subscribeToChat', () => {
        it('returns noop when Echo is not available', () => {
            const { subscribeToChat } = useChat();
            const unsub = subscribeToChat(123, {
                onMessage: vi.fn(),
            });
            expect(typeof unsub).toBe('function');
            // Should not throw when called
            unsub();
        });
    });

    describe('sendTyping', () => {
        it('sends typing indicator', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            const { sendTyping } = useChat();
            await sendTyping(123);

            expect(mockFetch).toHaveBeenCalledWith(
                '/support/widget/chat/123/typing',
                expect.objectContaining({ method: 'POST' }),
            );
        });
    });
});
