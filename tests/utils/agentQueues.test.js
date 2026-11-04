import { describe, it, expect } from 'vitest';
import { activeQueueKey } from '../../src/utils/agentQueues';

const views = [
    { id: 'urgent', name: 'Urgent', filters: { priority: 'urgent' } },
    { id: 12, name: 'Billing escalations', filters: { department_id: 4, status: 'escalated' } },
];
const at = (query) => activeQueueKey({ url: `/support/agent/tickets${query}`, userId: 7, views });

describe('activeQueueKey', () => {
    it('reads the workspace queues and views off the query string', () => {
        expect(at('?assigned_to=7')).toBe('mine');
        expect(at('?unassigned=1')).toBe('unassigned');
        expect(at('')).toBe('all');
        expect(at('?priority=urgent')).toBe('view:urgent');
        expect(at('?status=escalated&department_id=4')).toBe('view:12');
        expect(at('?live_chat=1')).toBe('live');
    });

    it('stays on the queue while the agent searches, filters or pages within it', () => {
        expect(at('?assigned_to=7&search=refund')).toBe('mine');
        expect(at('?assigned_to=7&priority=urgent&page=2')).toBe('mine');
        expect(at('?unassigned=1&status=open')).toBe('unassigned');
        expect(at('?priority=urgent&search=sso')).toBe('view:urgent');
        expect(at('?search=refund')).toBe('all');
    });

    it('prefers the backend queue prop', () => {
        expect(activeQueueKey({ url: '/x?assigned_to=7', userId: 7, queue: { key: 'escalations' } })).toBe(
            'escalations',
        );
    });
});
