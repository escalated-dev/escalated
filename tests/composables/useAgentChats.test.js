import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { chatRoute, normaliseChat, useAgentChats } from '../../src/composables/useAgentChats';

const known = (names) => (name, params) => {
    if (!names.includes(name)) throw new Error(`no route ${name}`);
    return params === undefined ? `/${name}` : `/${name}/${params}`;
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('chatRoute', () => {
    it('prefers the agent route', () => {
        vi.stubGlobal('route', known(['escalated.agent.chat.end', 'escalated.admin.chat.end']));
        expect(chatRoute('end', 42, { isAdmin: true })).toBe('/escalated.agent.chat.end/42');
    });

    it('falls back to the admin route only for admins', () => {
        vi.stubGlobal('route', known(['escalated.admin.chat.end']));
        expect(chatRoute('end', 42, { isAdmin: true })).toBe('/escalated.admin.chat.end/42');
        expect(chatRoute('end', 42)).toBe('');
    });

    it("answers '' without a route() helper or for a shim's '#'", () => {
        expect(chatRoute('end', 42)).toBe('');
        vi.stubGlobal('route', () => '#');
        expect(chatRoute('end', 42, { isAdmin: true })).toBe('');
    });
});

describe('normaliseChat', () => {
    it('reads a chat session with its ticket (the admin routes)', () => {
        const chat = normaliseChat({
            id: 5,
            started_at: '2026-11-25T10:00:00Z',
            ticket: { id: 12, reference: 'ESC-00012', subject: 'Help', guest_name: 'Vera', description: 'Hi' },
        });
        expect(chat).toMatchObject({
            id: 5,
            ticket_id: 12,
            ticket_reference: 'ESC-00012',
            customer_name: 'Vera',
            first_message: 'Hi',
            created_at: '2026-11-25T10:00:00Z',
        });
    });

    it('keeps the summary escalated-laravel shares', () => {
        const summary = { id: 5, ticket_reference: 'ESC-00012', customer_name: 'Vera', last_message: 'Thanks' };
        expect(normaliseChat(summary)).toMatchObject(summary);
    });
});

describe('useAgentChats', () => {
    let fetchMock;
    beforeEach(() => {
        fetchMock = vi.fn(async (url) => ({
            ok: true,
            json: async () => ({
                sessions: String(url).includes('queue') ? [{ id: 2, ticket_reference: 'ESC-2' }] : [{ id: 1 }],
            }),
        }));
        vi.stubGlobal('fetch', fetchMock);
    });

    it('starts from the shared lists and follows them on the next visit', async () => {
        const shared = ref({ active_chats: [{ id: 1 }], chat_queue: [] });
        const { activeChats, queue } = useAgentChats({ shared: () => shared.value });
        expect(activeChats.value.map((c) => c.id)).toEqual([1]);
        expect(queue.value).toEqual([]);

        shared.value = { active_chats: [], chat_queue: [{ id: 3 }] };
        await nextTick();
        expect(activeChats.value).toEqual([]);
        expect(queue.value.map((c) => c.id)).toEqual([3]);
    });

    it('refreshes from the chat list routes', async () => {
        vi.stubGlobal('route', known(['escalated.agent.chat.active', 'escalated.agent.chat.queue']));
        const { activeChats, queue, refresh } = useAgentChats({ shared: () => ({}) });
        await refresh();

        expect(activeChats.value.map((c) => c.id)).toEqual([1]);
        expect(queue.value.map((c) => c.id)).toEqual([2]);
    });

    it('keeps the shared lists on a host without the routes', async () => {
        const { activeChats, refresh } = useAgentChats({ shared: () => ({ active_chats: [{ id: 8 }] }) });
        await refresh();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(activeChats.value.map((c) => c.id)).toEqual([8]);
    });

    it('accepts a chat and takes it off the queue', async () => {
        vi.stubGlobal('route', known(['escalated.agent.chat.accept']));
        const { queue, accept } = useAgentChats({ shared: () => ({ chat_queue: [{ id: 4 }] }) });

        expect(await accept({ id: 4 })).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            '/escalated.agent.chat.accept/4',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(queue.value).toEqual([]);
    });
});
