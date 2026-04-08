import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useRealtime } from '../../src/composables/useRealtime.js';

/**
 * Helper: mount a tiny wrapper component that calls useRealtime and
 * exposes the returned API via the component's setupState.
 */
function mountWithRealtime() {
    let api;
    const wrapper = mount({
        template: '<div>test</div>',
        setup() {
            api = useRealtime();
            return { api };
        },
    });
    return { wrapper, api };
}

/**
 * Create a mock Echo channel with chainable listen/stopListening methods.
 */
function createMockChannel() {
    const channel = {
        listen: vi.fn().mockReturnThis(),
        stopListening: vi.fn().mockReturnThis(),
        here: vi.fn().mockReturnThis(),
        joining: vi.fn().mockReturnThis(),
        leaving: vi.fn().mockReturnThis(),
    };
    return channel;
}

describe('useRealtime', () => {
    let originalEcho;

    beforeEach(() => {
        originalEcho = window.Echo;
    });

    afterEach(() => {
        if (originalEcho === undefined) {
            delete window.Echo;
        } else {
            window.Echo = originalEcho;
        }
    });

    // ----------------------------------------------------------------
    // No-op when Echo is undefined
    // ----------------------------------------------------------------
    describe('when window.Echo is undefined', () => {
        beforeEach(() => {
            delete window.Echo;
        });

        it('returns echoAvailable as false', () => {
            const { wrapper, api } = mountWithRealtime();
            expect(api.echoAvailable.value).toBe(false);
            wrapper.unmount();
        });

        it('listen() returns a no-op function', () => {
            const { wrapper, api } = mountWithRealtime();
            const unsub = api.listen('channel', 'event', vi.fn());
            expect(typeof unsub).toBe('function');
            // Should not throw
            unsub();
            wrapper.unmount();
        });

        it('subscribeToTicket() returns a no-op function', () => {
            const { wrapper, api } = mountWithRealtime();
            const unsub = api.subscribeToTicket(123, { onReplyCreated: vi.fn() });
            expect(typeof unsub).toBe('function');
            unsub();
            wrapper.unmount();
        });

        it('subscribeToTickets() returns a no-op function', () => {
            const { wrapper, api } = mountWithRealtime();
            const unsub = api.subscribeToTickets({ onTicketCreated: vi.fn() });
            expect(typeof unsub).toBe('function');
            unsub();
            wrapper.unmount();
        });

        it('subscribeToAgent() returns a no-op function', () => {
            const { wrapper, api } = mountWithRealtime();
            const unsub = api.subscribeToAgent(5, { onTicketAssigned: vi.fn() });
            expect(typeof unsub).toBe('function');
            unsub();
            wrapper.unmount();
        });

        it('joinTicketPresence() returns null', () => {
            const { wrapper, api } = mountWithRealtime();
            const result = api.joinTicketPresence(123);
            expect(result).toBeNull();
            wrapper.unmount();
        });
    });

    // ----------------------------------------------------------------
    // Echo.private called when Echo is available
    // ----------------------------------------------------------------
    describe('when window.Echo is available', () => {
        let mockChannel;

        beforeEach(() => {
            mockChannel = createMockChannel();
            window.Echo = {
                private: vi.fn(() => mockChannel),
                join: vi.fn(() => mockChannel),
                leave: vi.fn(),
            };
        });

        it('returns echoAvailable as true', () => {
            const { wrapper, api } = mountWithRealtime();
            expect(api.echoAvailable.value).toBe(true);
            wrapper.unmount();
        });

        it('listen() calls Echo.private with the channel name', () => {
            const { wrapper, api } = mountWithRealtime();
            const cb = vi.fn();
            api.listen('my-channel', '.my-event', cb);

            expect(window.Echo.private).toHaveBeenCalledWith('my-channel');
            expect(mockChannel.listen).toHaveBeenCalledWith('.my-event', cb);
            wrapper.unmount();
        });
    });

    // ----------------------------------------------------------------
    // Correct channel names
    // ----------------------------------------------------------------
    describe('subscribes to correct channel names', () => {
        let mockChannel;

        beforeEach(() => {
            mockChannel = createMockChannel();
            window.Echo = {
                private: vi.fn(() => mockChannel),
                join: vi.fn(() => mockChannel),
                leave: vi.fn(),
            };
        });

        it('subscribeToTicket subscribes to "escalated.tickets.{id}"', () => {
            const { wrapper, api } = mountWithRealtime();
            api.subscribeToTicket(42, { onReplyCreated: vi.fn() });

            expect(window.Echo.private).toHaveBeenCalledWith('escalated.tickets.42');
            wrapper.unmount();
        });

        it('subscribeToTicket registers all provided event handlers', () => {
            const { wrapper, api } = mountWithRealtime();
            const handlers = {
                onReplyCreated: vi.fn(),
                onTicketUpdated: vi.fn(),
                onStatusChanged: vi.fn(),
                onTicketAssigned: vi.fn(),
                onTicketEscalated: vi.fn(),
            };
            api.subscribeToTicket(1, handlers);

            expect(mockChannel.listen).toHaveBeenCalledWith('.reply.created', handlers.onReplyCreated);
            expect(mockChannel.listen).toHaveBeenCalledWith('.ticket.updated', handlers.onTicketUpdated);
            expect(mockChannel.listen).toHaveBeenCalledWith('.ticket.status_changed', handlers.onStatusChanged);
            expect(mockChannel.listen).toHaveBeenCalledWith('.ticket.assigned', handlers.onTicketAssigned);
            expect(mockChannel.listen).toHaveBeenCalledWith('.ticket.escalated', handlers.onTicketEscalated);
            wrapper.unmount();
        });

        it('subscribeToTickets subscribes to "escalated.tickets"', () => {
            const { wrapper, api } = mountWithRealtime();
            api.subscribeToTickets({ onTicketCreated: vi.fn() });

            expect(window.Echo.private).toHaveBeenCalledWith('escalated.tickets');
            wrapper.unmount();
        });

        it('subscribeToAgent subscribes to "escalated.agents.{id}"', () => {
            const { wrapper, api } = mountWithRealtime();
            api.subscribeToAgent(7, { onTicketAssigned: vi.fn() });

            expect(window.Echo.private).toHaveBeenCalledWith('escalated.agents.7');
            wrapper.unmount();
        });
    });

    // ----------------------------------------------------------------
    // Cleanup on unmount
    // ----------------------------------------------------------------
    describe('cleanup on unmount', () => {
        let mockChannel;

        beforeEach(() => {
            mockChannel = createMockChannel();
            window.Echo = {
                private: vi.fn(() => mockChannel),
                join: vi.fn(() => mockChannel),
                leave: vi.fn(),
            };
        });

        it('calls Echo.leave for all subscribed channels on unmount', () => {
            const { wrapper, api } = mountWithRealtime();
            api.subscribeToTicket(1, { onReplyCreated: vi.fn() });
            api.subscribeToTickets({ onTicketCreated: vi.fn() });
            api.subscribeToAgent(5, { onTicketAssigned: vi.fn() });

            wrapper.unmount();

            // Should have called leave for each channel
            expect(window.Echo.leave).toHaveBeenCalledWith('escalated.tickets.1');
            expect(window.Echo.leave).toHaveBeenCalledWith('escalated.tickets');
            expect(window.Echo.leave).toHaveBeenCalledWith('escalated.agents.5');
        });

        it('calls stopListening for registered event handlers on unmount', () => {
            const { wrapper, api } = mountWithRealtime();
            const handler = vi.fn();
            api.listen('test-channel', '.test-event', handler);

            wrapper.unmount();

            expect(mockChannel.stopListening).toHaveBeenCalledWith('.test-event', handler);
            expect(window.Echo.leave).toHaveBeenCalledWith('test-channel');
        });

        it('manual unsubscribe also cleans up', () => {
            const { wrapper, api } = mountWithRealtime();
            const handler = vi.fn();
            const unsub = api.listen('test-channel', '.test-event', handler);

            unsub();

            expect(mockChannel.stopListening).toHaveBeenCalledWith('.test-event', handler);
            expect(window.Echo.leave).toHaveBeenCalledWith('test-channel');
            wrapper.unmount();
        });
    });
});
