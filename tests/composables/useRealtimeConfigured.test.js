import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { EscalatedPlugin } from '../../src/plugin.js';
import {
    configureRealtime,
    DEFAULT_POLL_INTERVAL,
    resolveEcho,
    useRealtime,
} from '../../src/composables/useRealtime.js';

/**
 * Apps that keep Echo in a module (not on window.Echo) pass it to the plugin
 * as `echo`; `pollInterval` sets how often screens reload without Echo.
 */
function realtimeApi(plugin = null) {
    let api;
    mount(
        {
            template: '<div />',
            setup() {
                api = useRealtime();
                return {};
            },
        },
        plugin ? { global: { plugins: [[EscalatedPlugin, plugin]] } } : {},
    );
    return api;
}

function mockEcho() {
    const channel = { listen: vi.fn().mockReturnThis(), stopListening: vi.fn().mockReturnThis() };
    return { private: vi.fn(() => channel), leave: vi.fn(), channel };
}

afterEach(() => {
    configureRealtime({ echo: null, pollInterval: DEFAULT_POLL_INTERVAL });
    delete window.Echo;
});

describe('useRealtime with a configured Echo', () => {
    it('uses the Echo instance given to the plugin when window.Echo is not set', () => {
        const echo = mockEcho();
        const api = realtimeApi({ echo });

        expect(api.echoAvailable.value).toBe(true);
        api.listen('escalated.tickets', '.ticket.created', () => {});
        expect(echo.private).toHaveBeenCalledWith('escalated.tickets');
    });

    it('prefers the configured instance over window.Echo', () => {
        const configured = mockEcho();
        window.Echo = mockEcho();
        configureRealtime({ echo: configured });

        expect(resolveEcho()).toBe(configured);
    });

    it('still finds window.Echo without the option', () => {
        window.Echo = mockEcho();

        expect(realtimeApi().echoAvailable.value).toBe(true);
    });

    it('reports no Echo and the default poll interval when there is none', () => {
        const api = realtimeApi();

        expect(api.echoAvailable.value).toBe(false);
        expect(api.pollInterval).toBe(30000);
    });

    it('takes pollInterval from the plugin, 0 to turn polling off, with a 5 second floor', () => {
        expect(realtimeApi({ pollInterval: 0 }).pollInterval).toBe(0);
        expect(realtimeApi({ pollInterval: 15000 }).pollInterval).toBe(15000);
        expect(realtimeApi({ pollInterval: 100 }).pollInterval).toBe(5000);
    });
});
