import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { useRealtime } from '../../src/composables/useRealtime.js';

/**
 * Helper: mount a tiny wrapper component that calls useRealtime and
 * exposes the returned API via the component's setupState.
 */
function mountWithRealtime(options = {}) {
    let api;
    const wrapper = mount({
        template: '<div>test</div>',
        setup() {
            api = useRealtime(options);
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

            for (const [event, handler] of Object.entries({
                '.reply.created': handlers.onReplyCreated,
                '.ticket.updated': handlers.onTicketUpdated,
                '.ticket.status_changed': handlers.onStatusChanged,
                '.ticket.assigned': handlers.onTicketAssigned,
                '.ticket.escalated': handlers.onTicketEscalated,
            })) {
                const callback = mockChannel.listen.mock.calls.find(([name]) => name === event)[1];
                callback({ ticket_id: 1 });
                expect(handler).toHaveBeenCalledWith({ ticket_id: 1 });
            }
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

describe('tenant subscription lifecycle', () => {
    it('leaves the previous namespace and ignores queued callbacks after an account switch', () => {
        const channels = new Map();
        window.Echo = {
            private: vi.fn((name) => {
                const channel = createMockChannel();
                channels.set(name, channel);
                return channel;
            }),
            leave: vi.fn(),
        };
        const prefix = ref('escalated.tenants.a');
        const { wrapper, api } = mountWithRealtime({ channelPrefix: prefix });
        const received = vi.fn();
        const stop = api.subscribeToTicket(42, { onReplyCreated: received });
        const oldCallback = channels.get('escalated.tenants.a.tickets.42').listen.mock.calls[0][1];
        oldCallback('a');
        prefix.value = 'escalated.tenants.b';
        expect(window.Echo.leave).toHaveBeenCalledWith('escalated.tenants.a.tickets.42');
        oldCallback('stale');
        channels.get('escalated.tenants.b.tickets.42').listen.mock.calls[0][1]('b');
        expect(received.mock.calls).toEqual([['a'], ['b']]);
        stop();
        prefix.value = 'escalated.tenants.c';
        expect(window.Echo.private).toHaveBeenCalledTimes(2);
        wrapper.unmount();
        delete window.Echo;
    });

    it('keeps shared channels connected until their last subscriber leaves', () => {
        window.Echo = { private: vi.fn(() => createMockChannel()), leave: vi.fn() };
        const first = mountWithRealtime();
        const second = mountWithRealtime();
        first.api.subscribeToTicket(42);
        second.api.subscribeToTicket(42);
        first.wrapper.unmount();
        expect(window.Echo.leave).not.toHaveBeenCalled();
        second.wrapper.unmount();
        expect(window.Echo.leave).toHaveBeenCalledExactlyOnceWith('escalated.tickets.42');
        delete window.Echo;
    });
});
