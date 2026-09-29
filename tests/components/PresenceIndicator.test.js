import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PresenceIndicator from '../../src/components/PresenceIndicator.vue';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete window.Echo;
});

const props = { ticketReference: 'ESC-1', ticketId: 1, routePrefix: 'escalated.agent' };

describe('presence account navigation', () => {
    it('leaves only the previous presence channel and ignores old socket callbacks', async () => {
        const channels = new Map();
        window.Echo = {
            join: vi.fn((name) => {
                const callbacks = {};
                const channel = {};
                for (const event of ['here', 'joining', 'leaving'])
                    channel[event] = (callback) => {
                        callbacks[event] = callback;
                        return channel;
                    };
                channels.set(name, callbacks);
                return channel;
            }),
            leaveChannel: vi.fn(),
        };
        const wrapper = mount(PresenceIndicator, { props: { ...props, channelPrefix: 'escalated.tenants.a' } });
        const old = channels.get('escalated.tenants.a.tickets.1');
        old.here([{ id: 1, name: 'Alice' }]);
        await flushPromises();
        expect(wrapper.find('[aria-label="Alice"]').exists()).toBe(true);
        await wrapper.setProps({ channelPrefix: 'escalated.tenants.b' });
        old.joining({ id: 2, name: 'Stale' });
        channels.get('escalated.tenants.b.tickets.1').here([{ id: 3, name: 'Bob' }]);
        await flushPromises();
        expect(window.Echo.leaveChannel).toHaveBeenCalledWith('presence-escalated.tenants.a.tickets.1');
        expect(wrapper.find('[aria-label="Bob"]').exists()).toBe(true);
        expect(wrapper.find('[aria-label="Alice"]').exists()).toBe(false);
        expect(wrapper.find('[aria-label="Stale"]').exists()).toBe(false);
        wrapper.unmount();
    });

    it('aborts polling and discards a delayed response from the previous account', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('route', () => '/presence');
        let finishOld;
        const fetch = vi
            .fn()
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finishOld = resolve;
                    }),
            )
            .mockResolvedValue({ ok: true, json: async () => ({ viewers: [{ id: 2, name: 'Bob' }] }) });
        vi.stubGlobal('fetch', fetch);
        const wrapper = mount(PresenceIndicator, { props: { ...props, channelPrefix: 'escalated.tenants.a' } });
        const signal = fetch.mock.calls[0][1].signal;
        await wrapper.setProps({ channelPrefix: 'escalated.tenants.b' });
        await flushPromises();
        expect(signal.aborted).toBe(true);
        finishOld({ ok: true, json: async () => ({ viewers: [{ id: 1, name: 'Alice' }] }) });
        await flushPromises();
        expect(wrapper.find('[aria-label="Bob"]').exists()).toBe(true);
        expect(wrapper.find('[aria-label="Alice"]').exists()).toBe(false);
        wrapper.unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});
