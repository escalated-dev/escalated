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

    it('posts the change when the host has a status route', () => {
        window.route = vi.fn(() => '/support/admin/chat/status');
        useAgentStatus().setStatus('away');
        expect(window.route).toHaveBeenCalledWith('escalated.admin.chat.status');
        expect(fetch).toHaveBeenCalledWith(
            '/support/admin/chat/status',
            expect.objectContaining({ method: 'POST', body: JSON.stringify({ status: 'away' }) }),
        );
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
