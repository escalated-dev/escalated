import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearToasts, toast, useAgentToasts } from '../../src/composables/useAgentToasts';

beforeEach(() => {
    vi.useFakeTimers();
    clearToasts();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useAgentToasts', () => {
    it('queues a toast and drops it after a few seconds', () => {
        const { toasts } = useAgentToasts();
        toast('Status set to Resolved');
        expect(toasts.value.map((t) => [t.message, t.tone])).toEqual([['Status set to Resolved', 'success']]);
        vi.advanceTimersByTime(4000);
        expect(toasts.value).toEqual([]);
    });

    it('keeps errors until they are dismissed', () => {
        const { toasts, dismiss } = useAgentToasts();
        toast('Could not save', 'error');
        vi.advanceTimersByTime(20000);
        expect(toasts.value).toHaveLength(1);
        dismiss(toasts.value[0].id);
        expect(toasts.value).toEqual([]);
    });

    it('shows at most three at once and ignores empty messages', () => {
        const { toasts } = useAgentToasts();
        toast('');
        ['a', 'b', 'c', 'd'].forEach((m) => toast(m));
        expect(toasts.value.map((t) => t.message)).toEqual(['b', 'c', 'd']);
    });

    it('does not stack the same message twice in a row', () => {
        const { toasts } = useAgentToasts();
        toast('Link copied');
        toast('Link copied');
        expect(toasts.value).toHaveLength(1);
    });
});
