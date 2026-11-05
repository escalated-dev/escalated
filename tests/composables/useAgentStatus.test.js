import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AGENT_STATUSES,
    STATUS_STORAGE_KEY,
    resetAgentStatus,
    useAgentStatus,
} from '../../src/composables/useAgentStatus';

beforeEach(() => {
    window.localStorage.clear();
    resetAgentStatus();
    vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve({ ok: true })),
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
    delete window.route;
});

describe('useAgentStatus', () => {
    it('offers online, away and offline and starts online', () => {
        expect(AGENT_STATUSES).toEqual(['online', 'away', 'offline']);
        expect(useAgentStatus().status.value).toBe('online');
    });

    it('takes the status the backend shares', () => {
        expect(useAgentStatus({ initial: 'away' }).status.value).toBe('away');
    });

    it('ignores a value it does not know', () => {
        expect(useAgentStatus({ initial: 'busy' }).status.value).toBe('online');
    });

    it('remembers a choice in this browser when the backend shares none', () => {
        useAgentStatus().setStatus('away');
        expect(window.localStorage.getItem(STATUS_STORAGE_KEY)).toBe('away');
        resetAgentStatus();
        expect(useAgentStatus().status.value).toBe('away');
    });

    it('lets the backend value win over the remembered one', () => {
        window.localStorage.setItem(STATUS_STORAGE_KEY, 'offline');
        expect(useAgentStatus({ initial: 'online' }).status.value).toBe('online');
    });

    it('shares one status between every caller', () => {
        const a = useAgentStatus();
        const b = useAgentStatus();
        a.setStatus('offline');
        expect(b.status.value).toBe('offline');
    });

    it('posts the change to the admin chat route on a host that only has that one', () => {
        window.route = vi.fn((name) => {
            if (name !== 'escalated.admin.chat.status') throw new Error('no route');
            return '/support/admin/chat/status';
        });
        useAgentStatus().setStatus('away');
        expect(window.route).toHaveBeenCalledWith('escalated.admin.chat.status');
        expect(fetch).toHaveBeenCalledWith(
            '/support/admin/chat/status',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ status: 'away' }) }),
        );
    });

    it('posts to the agent status route when the host has it, before the admin chat route', () => {
        window.route = vi.fn((name) => (name === 'escalated.agent.status' ? '/support/agent/status' : '/x'));
        useAgentStatus().setStatus('offline');
        expect(window.route).toHaveBeenCalledWith('escalated.agent.status');
        expect(window.route).not.toHaveBeenCalledWith('escalated.admin.chat.status');
        expect(fetch).toHaveBeenCalledWith(
            '/support/agent/status',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ status: 'offline' }) }),
        );
    });

    it('falls back to the admin chat route when the agent route is missing', () => {
        window.route = vi.fn((name) => {
            if (name === 'escalated.agent.status') throw new Error('no route');
            return '/support/admin/chat/status';
        });
        useAgentStatus().setStatus('away');
        expect(fetch).toHaveBeenCalledWith('/support/admin/chat/status', expect.anything());
    });

    it('treats a "#" from a route shim as no route', () => {
        window.route = vi.fn((name) => (name === 'escalated.agent.status' ? '#' : '/support/admin/chat/status'));
        useAgentStatus().setStatus('away');
        expect(fetch).toHaveBeenCalledWith('/support/admin/chat/status', expect.anything());
    });

    it('takes the status the backend answers with', async () => {
        window.route = vi.fn(() => '/support/agent/status');
        fetch.mockImplementation(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ agent_status: 'offline' }) }),
        );
        const { status, setStatus } = useAgentStatus();
        setStatus('away');
        expect(status.value).toBe('away');
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(status.value).toBe('offline');
    });

    it('goes back to the previous status when the backend refuses the change', async () => {
        window.route = vi.fn(() => '/support/agent/status');
        fetch.mockImplementation(() => Promise.resolve({ ok: false, status: 422, json: () => Promise.resolve({}) }));
        const { status, setStatus } = useAgentStatus({ initial: 'online' });
        setStatus('away');
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(status.value).toBe('online');
        expect(window.localStorage.getItem(STATUS_STORAGE_KEY)).toBe('online');
    });

    it('offers only the values the backend accepts, in its order', () => {
        const { statuses } = useAgentStatus({ allowed: ['online', 'offline', 'busy'] });
        expect(statuses.value).toEqual(['online', 'offline']);
    });

    it('offers every status when the backend names none', () => {
        expect(useAgentStatus({ allowed: null }).statuses.value).toEqual(AGENT_STATUSES);
        resetAgentStatus();
        expect(useAgentStatus({ allowed: ['busy'] }).statuses.value).toEqual(AGENT_STATUSES);
    });

    it('stays client-side when the host has no status route', () => {
        window.route = vi.fn(() => {
            throw new Error('no route');
        });
        useAgentStatus().setStatus('away');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('does nothing for an unknown status', () => {
        const { status, setStatus } = useAgentStatus();
        setStatus('busy');
        expect(status.value).toBe('online');
        expect(fetch).not.toHaveBeenCalled();
    });
});
