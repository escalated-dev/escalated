import { describe, it, expect } from 'vitest';
import { activeQueueKey, queueHeading, queueLinkFilters, viewLinkFilters } from '../../src/utils/agentQueues';

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

describe('rail links', () => {
    it('add open=1 to the workspace queues when the counts are of open tickets', () => {
        expect(queueLinkFilters({ assigned_to: 7 }, true)).toEqual({ assigned_to: 7, open: 1 });
        expect(queueLinkFilters({}, true)).toEqual({ open: 1 });
        expect(queueLinkFilters({ unassigned: 1 }, false)).toEqual({ unassigned: 1 });
    });

    it('open a view by id, over open tickets unless the view names a status or open itself', () => {
        expect(viewLinkFilters({ id: 'urgent', filters: { priority: 'urgent' } })).toEqual({ view: 'urgent', open: 1 });
        expect(viewLinkFilters({ id: 'urgent', filters: { priority: 'urgent', open: 1 } })).toEqual({
            view: 'urgent',
        });
        expect(viewLinkFilters({ id: 4, filters: { status: 'waiting_on_customer' } })).toEqual({ view: 4 });
    });

    it('reads a view id off the query string', () => {
        expect(at('?view=12')).toBe('view:12');
        expect(at('?view=12&open=1&search=x')).toBe('view:12');
        expect(at('?assigned_to=7&open=1')).toBe('mine');
        expect(at('?open=1')).toBe('all');
    });
});

describe('queueHeading', () => {
    const t = (key, r = {}) =>
        ({
            'agent_panel.inbox.title_mine': 'My inbox',
            'agent_panel.inbox.subtitle_mine_other': ':count tickets assigned to you',
            'agent_panel.inbox.subtitle_open_mine_other': ':count open tickets assigned to you',
            'agent_panel.inbox.subtitle_open_other': ':count open tickets',
        })[key]?.replace(':count', r.count) ?? key;

    it('says open when the list is limited to open tickets', () => {
        expect(queueHeading({ key: 'mine', total: 24, open: true, t }).subtitle).toBe('24 open tickets assigned to you');
        expect(queueHeading({ key: 'mine', total: 24, t }).subtitle).toBe('24 tickets assigned to you');
        expect(queueHeading({ key: 'view:x', total: 3, open: true, t }).subtitle).toBe('3 open tickets');
    });
});

