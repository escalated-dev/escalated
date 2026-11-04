import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TicketShow from '../../src/pages/Agent/TicketShow.vue';
import PluginSlot from '../../src/components/PluginSlot.vue';
import { forgetInbox, rememberInbox } from '../../src/utils/agentQueues';
import { clearToasts, useAgentToasts } from '../../src/composables/useAgentToasts';

const usePage = vi.fn();
const router = { post: vi.fn(), reload: vi.fn(), visit: vi.fn(), get: vi.fn() };

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    router: {
        post: (...a) => router.post(...a),
        reload: (...a) => router.reload(...a),
        visit: (...a) => router.visit(...a),
        get: (...a) => router.get(...a),
        on: (...a) => (router.on ? router.on(...a) : () => {}),
    },
    useForm: (data) => ({ ...data, post: vi.fn(), processing: false, errors: {} }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/useChat', () => ({
    useChat: () => ({ subscribeToChat: () => () => {} }),
}));

vi.mock('../../src/composables/useRealtime', () => ({
    useRealtime: () => ({ echoAvailable: { value: false }, subscribeToTicket: () => () => {} }),
}));

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

function makeTicket(overrides = {}) {
    return {
        id: 1042,
        reference: 'ESC-1042',
        subject: 'Unable to export CSV reports from dashboard',
        description: 'The weekly export fails with a server error.',
        status: 'open',
        priority: 'high',
        channel: 'email',
        assigned_to: null,
        assignee: null,
        requester: { name: 'Sarah Chen', email: 'sarah@northwind.io' },
        requester_ticket_count: 4,
        created_at: minutesAgo(60),
        department: { id: 2, name: 'Billing' },
        ticket_type: 'problem',
        tags: [
            { id: 1, name: 'Billing', color: '#f59e0b' },
            { id: 2, name: 'Export', color: '#3b82f6' },
        ],
        attachments: [{ id: 9, original_filename: 'error-export.png', size: 331776, url: '/files/9' }],
        replies: [
            {
                id: 3,
                body: 'Restarting the export service now.',
                author: { name: 'Mike Agent' },
                created_at: minutesAgo(1),
                is_internal_note: false,
            },
            {
                id: 2,
                body: 'Looks like the export job is timing out.',
                author: { name: 'Mike Agent' },
                created_at: minutesAgo(8),
                is_internal_note: true,
            },
        ],
        activities: [],
        related_tickets: [{ reference: 'ESC-0990', subject: 'Old export issue', status: 'resolved' }],
        links_as_parent: [
            { link_type: 'related', child_ticket: { reference: 'ESC-1001', subject: 'Exports time out' } },
        ],
        ...overrides,
    };
}

function pageAt(escalated = {}) {
    usePage.mockReturnValue({
        url: '/support/agent/tickets/ESC-1042',
        props: {
            auth: { user: { id: 7, name: 'Mike Agent' } },
            escalated: { prefix: 'support', is_agent: true, show_powered_by: false, ...escalated },
        },
    });
}

const route = vi.fn((name, params) => {
    const list = Array.isArray(params) ? params : [params];
    return `/${name}/${list.join('/')}`;
});

let wrapper;

function mountPage(props = {}, escalated = {}) {
    pageAt(escalated);
    vi.stubGlobal('route', route);
    wrapper = mount(TicketShow, {
        props: {
            ticket: makeTicket(),
            departments: [],
            tags: [
                { id: 1, name: 'Billing' },
                { id: 2, name: 'Export' },
                { id: 3, name: 'Bug' },
            ],
            cannedResponses: [],
            ...props,
        },
        global: {
            mocks: { route },
            stubs: { PresenceIndicator: true, KnowledgePanel: true, ChatThread: true, ChatComposer: true },
        },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    clearToasts();
    forgetInbox();
    window.localStorage.clear();
    Object.values(router).forEach((fn) => fn.mockReset());
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
});

const press = (key) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key, cancelable: true }));

describe('Agent/TicketShow without the new props', () => {
    it('shows the ticket alone with a way back to the list', () => {
        mountPage();
        expect(wrapper.find('[data-testid="esc-show-list"]').exists()).toBe(false);
        expect(wrapper.get('[data-testid="esc-back-to-list"]').text()).toBe('Back to Tickets');
        expect(wrapper.get('[data-testid="esc-subject"]').text()).toBe('Unable to export CSV reports from dashboard');
        expect(wrapper.text()).toContain('ESC-1042');
    });

    it('shows status, priority, tags and assignee in the header', () => {
        mountPage();
        expect(wrapper.get('[data-testid="esc-status"]').text()).toBe('Open');
        expect(wrapper.get('[data-testid="esc-priority"]').text()).toBe('High');
        expect(wrapper.findAll('[data-testid="esc-tag"]').map((tag) => tag.text())).toEqual(['Billing', 'Export']);
        expect(wrapper.get('[data-testid="esc-assignee"]').text()).toBe('Unassigned');
        expect(wrapper.get('[data-testid="esc-assign-me"]').text()).toBe('Assign to me');
    });

    it('changes status through the status menu', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-status"]').trigger('click');
        const resolved = wrapper.findAll('[role="menuitemradio"]').find((item) => item.text() === 'Resolved');
        await resolved.trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.status/ESC-1042',
            { status: 'resolved' },
            expect.any(Object),
        );
    });

    it('changes priority through the priority menu', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-priority"]').trigger('click');
        await wrapper
            .findAll('[role="menuitemradio"]')
            .find((item) => item.text() === 'Urgent')
            .trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.priority/ESC-1042',
            { priority: 'urgent' },
            expect.any(Object),
        );
    });

    it('removes a tag through the tags endpoint', async () => {
        mountPage();
        await wrapper.get('button[aria-label="Remove tag Billing"]').trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.tags/ESC-1042',
            { tag_ids: [2] },
            expect.any(Object),
        );
    });

    it('assigns to me from the button and with a', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-assign-me"]').trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.assign/ESC-1042',
            { agent_id: 7 },
            expect.any(Object),
        );
        router.post.mockReset();
        press('a');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.assign/ESC-1042',
            { agent_id: 7 },
            expect.any(Object),
        );
    });

    it('resolves with e and follows with f', () => {
        mountPage();
        press('e');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.status/ESC-1042',
            { status: 'resolved' },
            expect.any(Object),
        );
        press('f');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.follow/ESC-1042',
            {},
            expect.any(Object),
        );
    });

    it('switches the composer to an internal note with n', async () => {
        mountPage();
        press('n');
        await nextTick();
        await nextTick();
        expect(wrapper.get('[data-testid="esc-composer"]').attributes('data-mode')).toBe('note');
    });

    it('renders the conversation oldest first, with the note marked and attachments as file cards', () => {
        mountPage();
        const messages = wrapper.findAll('[data-testid="esc-message"]');
        expect(messages.map((m) => m.text())).toEqual([
            expect.stringContaining('The weekly export fails'),
            expect.stringContaining('Looks like the export job'),
            expect.stringContaining('Restarting the export service'),
        ]);
        expect(messages[1].attributes('data-note')).toBe('true');
        expect(messages[1].text()).toContain('Internal note');
        const card = messages[0].get('[data-testid="esc-attachment"]');
        expect(card.text()).toContain('error-export.png');
        expect(card.text()).toContain('324 KB');
        expect(card.get('a').attributes('href')).toBe('/files/9');
    });

    it('offers macros and custom actions in the overflow menu', async () => {
        mountPage({
            macros: [{ id: 4, name: 'Escalate to tier 2' }],
            customActions: [{ key: 'refund', label: 'Issue refund', url: '/refund', variant: 'danger' }],
        });
        await wrapper.get('[data-testid="esc-ticket-more"]').trigger('click');
        const items = wrapper.findAll('[role="menuitem"]');
        await items.find((item) => item.text() === 'Escalate to tier 2').trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.macro/ESC-1042',
            { macro_id: 4 },
            expect.any(Object),
        );
        await wrapper.get('[data-testid="esc-ticket-more"]').trigger('click');
        await wrapper
            .findAll('[role="menuitem"]')
            .find((item) => item.text() === 'Issue refund')
            .trigger('click');
        expect(router.post).toHaveBeenCalledWith('/refund', {}, expect.any(Object));
    });
});

describe('Agent/TicketShow for light agents', () => {
    it('allows internal notes only and no status, priority or assignment changes', () => {
        mountPage({}, { agent_type: 'light' });
        expect(wrapper.get('[data-testid="esc-status"]').element.tagName).toBe('SPAN');
        expect(wrapper.get('[data-testid="esc-priority"]').element.tagName).toBe('SPAN');
        expect(wrapper.find('[data-testid="esc-assign-me"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-composer-reply-tab"]').exists()).toBe(false);
        expect(wrapper.get('[data-testid="esc-composer"]').attributes('data-mode')).toBe('note');
        expect(wrapper.find('button[aria-label="Remove tag Billing"]').exists()).toBe(false);
    });
});

describe('Agent/TicketShow with the list and queue', () => {
    it('shows the remembered list beside the ticket with this ticket selected', () => {
        rememberInbox({
            url: '/support/agent/tickets?assigned_to=7',
            title: 'My inbox',
            subtitle: '2 tickets assigned to you',
            tickets: {
                data: [
                    { id: 1042, reference: 'ESC-1042', subject: 'Unable to export CSV', priority: 'high' },
                    { id: 1041, reference: 'ESC-1041', subject: 'SSO loop', priority: 'urgent' },
                ],
            },
        });
        mountPage({ queue: { key: 'mine', title: 'My inbox' } });
        const list = wrapper.get('[data-testid="esc-show-list"]');
        expect(list.text()).toContain('My inbox');
        // 360px up to 2xl: the rail is a drawer below xl, so the ticket keeps 664px at 1024.
        expect(list.classes()).toEqual(expect.arrayContaining(['w-[360px]', '2xl:w-[400px]']));
        const selected = list.get('a[aria-current="true"]');
        expect(selected.text()).toBe('Unable to export CSV');
        expect(wrapper.get('[data-testid="esc-back-to-list"]').classes()).toContain('lg:hidden');
        expect(wrapper.get('[data-testid="esc-back-to-list"]').attributes('href')).toBe(
            '/support/agent/tickets?assigned_to=7',
        );
    });

    it('names the queue in the back link from the queue prop', () => {
        mountPage({ queue: { key: 'unassigned', title: 'Unassigned' } });
        expect(wrapper.get('[data-testid="esc-back-to-list"]').text()).toBe('Back to Unassigned');
    });
});

describe('Agent/TicketShow live chat', () => {
    it('swaps the conversation and composer for the chat thread and chat composer', () => {
        mountPage({ ticket: makeTicket({ channel: 'chat', status: 'live', chat_session_id: 42 }) });
        expect(wrapper.find('chat-thread-stub').exists()).toBe(true);
        expect(wrapper.find('chat-composer-stub').exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-composer"]').exists()).toBe(false);
    });
});

describe('Agent/TicketShow tag picker', () => {
    async function openPicker() {
        mountPage();
        await wrapper.get('[data-testid="esc-add-tag"]').trigger('click');
        await nextTick();
        return wrapper.get('[data-testid="esc-tag-picker"]');
    }

    it('opens with the filter focused and every tag as a checkable item', async () => {
        const picker = await openPicker();
        expect(document.activeElement).toBe(picker.get('input').element);
        const items = picker.findAll('[role="menuitemcheckbox"]');
        expect(items.map((i) => i.text().replace('✓', ''))).toEqual(['Billing', 'Export', 'Bug']);
        expect(items.map((i) => i.attributes('aria-checked'))).toEqual(['true', 'true', 'false']);
    });

    it('filters as the agent types and toggles a tag through the tags endpoint', async () => {
        const picker = await openPicker();
        await picker.get('input').setValue('bu');
        const items = picker.findAll('[role="menuitemcheckbox"]');
        expect(items.map((i) => i.text())).toEqual(['Bug']);
        await items[0].trigger('click');
        expect(router.post).toHaveBeenCalledWith(
            '/escalated.agent.tickets.tags/ESC-1042',
            { tag_ids: [1, 2, 3] },
            expect.any(Object),
        );
    });

    it('closes on a click outside', async () => {
        await openPicker();
        document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect(wrapper.find('[data-testid="esc-tag-picker"]').exists()).toBe(false);
    });

    it('closes on Escape and returns focus to the add button', async () => {
        const picker = await openPicker();
        await picker.get('input').trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('[data-testid="esc-tag-picker"]').exists()).toBe(false);
        expect(document.activeElement).toBe(wrapper.get('[data-testid="esc-add-tag"]').element);
    });
});

describe('Agent/TicketShow feedback', () => {
    const { toasts } = useAgentToasts();
    const messages = () => toasts.value.map((t) => [t.tone, t.message]);
    const lastOptions = () => router.post.mock.calls.at(-1)[2];

    it('confirms a status change with a toast when the backend sends no flash', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-status"]').trigger('click');
        const resolved = wrapper.findAll('[role="menuitemradio"]').find((b) => b.text().startsWith('Resolved'));
        await resolved.trigger('click');
        lastOptions().onSuccess({ props: {} });
        expect(messages()).toEqual([['success', 'Status set to Resolved']]);
    });

    it('leaves the confirmation to the backend flash when there is one', () => {
        mountPage();
        press('a');
        lastOptions().onSuccess({ props: { flash: { success: 'Ticket assigned.' } } });
        expect(messages()).toEqual([]);
    });

    it('says what failed when an action is rejected', () => {
        mountPage();
        press('a');
        lastOptions().onError({ agent_id: 'This agent cannot take more tickets.' });
        expect(messages()).toEqual([['error', 'This agent cannot take more tickets.']]);
        lastOptions().onError({});
        expect(messages().at(-1)).toEqual(['error', 'That did not go through. Try again.']);
    });

    it('confirms a copied link and shows a check on the button', async () => {
        Object.defineProperty(window.navigator, 'clipboard', {
            value: { writeText: vi.fn(() => Promise.resolve()) },
            configurable: true,
        });
        mountPage();
        await wrapper.get('[data-testid="esc-copy-link"]').trigger('click');
        expect(messages()).toEqual([['success', 'Link copied']]);
        expect(wrapper.get('[data-testid="esc-copy-link"]').attributes('aria-label')).toBe('Link copied');
    });
});

describe('Agent/TicketShow while another ticket loads', () => {
    let listeners;
    beforeEach(() => {
        listeners = {};
        router.on = vi.fn((event, cb) => {
            listeners[event] = cb;
            return () => {};
        });
    });
    afterEach(() => {
        delete router.on;
    });
    const visit = (path) => ({ detail: { visit: { url: new URL(`http://x${path}`), method: 'get' } } });

    it('shows a skeleton in the pane until the next ticket arrives', async () => {
        mountPage();
        listeners.start(visit('/escalated.agent.tickets.show/ESC-1041'));
        await nextTick();
        const skeleton = wrapper.get('[data-testid="esc-detail-skeleton"]');
        expect(skeleton.attributes('aria-busy')).toBe('true');
        expect(wrapper.get('[data-testid="esc-detail-pane"]').isVisible()).toBe(false);
        listeners.finish({ detail: { visit: {} } });
        await nextTick();
        expect(wrapper.find('[data-testid="esc-detail-skeleton"]').exists()).toBe(false);
    });

    it('does not blank the ticket for a reload of the same ticket or another page', async () => {
        mountPage();
        listeners.start(visit('/escalated.agent.tickets.show/ESC-1042'));
        listeners.start(visit('/support/agent'));
        await nextTick();
        expect(wrapper.find('[data-testid="esc-detail-skeleton"]').exists()).toBe(false);
    });
});

describe('Agent/TicketShow workspace layout', () => {
    it('keeps the header to the reference, a two-line subject, the actions and one row of properties', () => {
        mountPage();
        const header = wrapper.get('[data-testid="esc-ticket-header"]');
        expect(header.get('[data-testid="esc-subject"]').classes()).toEqual(
            expect.arrayContaining(['text-[15px]', 'line-clamp-2']),
        );
        expect(header.get('[data-testid="esc-subject"]').attributes('title')).toBe(
            'Unable to export CSV reports from dashboard',
        );
        expect(header.find('[data-testid="esc-ticket-actions"]').exists()).toBe(true);
        expect(header.find('[data-testid="esc-ticket-properties"]').exists()).toBe(true);
        // The conversation is the only main view: no section tabs.
        expect(wrapper.find('[role="tablist"][aria-label="Ticket sections"]').exists()).toBe(false);
    });

    it('scrolls the conversation on its own, with the composer below it and outside it', () => {
        mountPage();
        const conversation = wrapper.get('[data-testid="esc-conversation"]');
        expect(conversation.classes()).toEqual(expect.arrayContaining(['overflow-y-auto', 'min-h-0', 'flex-1']));
        expect(conversation.find('[data-testid="esc-composer"]').exists()).toBe(false);
        expect(wrapper.get('[data-testid="esc-composer-dock"]').classes()).toContain('shrink-0');
        expect(wrapper.get('[data-testid="esc-detail-pane"]').classes()).not.toContain('max-sm:overflow-y-auto');
    });

    it('keeps message text to a readable measure', () => {
        mountPage();
        const column = wrapper.get('[data-testid="esc-conversation"] > div');
        expect(column.classes()).toEqual(expect.arrayContaining(['max-w-[760px]', 'mx-auto']));
    });
});

describe('Agent/TicketShow messages', () => {
    it('tells customer messages, agent replies, internal notes and system events apart', () => {
        mountPage({
            ticket: makeTicket({
                requester_type: 'App\\Models\\User',
                requester_id: 50,
                replies: [
                    {
                        id: 4,
                        body: 'Thanks, any news?',
                        author_type: 'App\\Models\\User',
                        author_id: 50,
                        author: { id: 50, name: 'Sarah Chen' },
                        created_at: minutesAgo(5),
                    },
                    {
                        id: 3,
                        body: 'Restarting the export service now.',
                        author_type: 'App\\Models\\User',
                        author_id: 7,
                        author: { id: 7, name: 'Mike Agent' },
                        created_at: minutesAgo(10),
                    },
                    {
                        id: 2,
                        body: 'Looks like the export job is timing out.',
                        author: { id: 7, name: 'Mike Agent' },
                        author_type: 'App\\Models\\User',
                        author_id: 7,
                        created_at: minutesAgo(20),
                        is_internal_note: true,
                    },
                ],
                activities: [
                    {
                        id: 1,
                        type: 'status_changed',
                        properties: { old_status: 'open', new_status: 'in_progress' },
                        causer: { name: 'Mike Agent' },
                        created_at: minutesAgo(30),
                    },
                    { id: 2, type: 'replied', causer: { name: 'Mike Agent' }, created_at: minutesAgo(10) },
                ],
            }),
        });
        const kinds = wrapper
            .findAll('[data-testid="esc-message"], [data-testid="esc-event"]')
            .map((el) => el.attributes('data-kind'));
        expect(kinds).toEqual(['customer', 'event', 'note', 'agent', 'customer']);
        const event = wrapper.get('[data-testid="esc-event"]');
        expect(event.text()).toContain('Mike Agent changed the status to In Progress');
        // Replies and notes are messages already; their activities are not repeated as events.
        expect(wrapper.findAll('[data-testid="esc-event"]')).toHaveLength(1);
        const customer = wrapper.findAll('[data-testid="esc-message"]')[0];
        expect(customer.text()).toContain('Customer');
        const note = wrapper.get('[data-kind="note"]');
        expect(note.text()).toContain('Internal note');
        expect(note.classes()).toContain('bg-[var(--esc-panel-note-bg)]');
    });

    it('treats a guest reply with no author as the customer', () => {
        mountPage({
            ticket: makeTicket({
                replies: [{ id: 5, body: 'Still broken', author: { name: 'Guest' }, created_at: minutesAgo(2) }],
            }),
        });
        expect(wrapper.findAll('[data-testid="esc-message"]').at(-1).attributes('data-kind')).toBe('customer');
    });

    it('shows attachments as compact file chips with a labelled download link', () => {
        mountPage();
        const chip = wrapper.get('[data-testid="esc-attachment"]');
        expect(chip.classes()).toContain('h-9');
        const link = chip.get('a');
        expect(link.attributes('aria-label')).toBe('Download error-export.png');
        expect(link.attributes('title')).toBe('Download error-export.png');
    });
});

describe('Agent/TicketShow actions', () => {
    it('resolves from the header and reopens a resolved ticket', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-resolve"]').trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.status/ESC-1042',
            { status: 'resolved' },
            expect.any(Object),
        );
        wrapper.unmount();
        mountPage({ ticket: makeTicket({ status: 'resolved' }) });
        expect(wrapper.find('[data-testid="esc-resolve"]').exists()).toBe(false);
        await wrapper.get('[data-testid="esc-reopen"]').trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.status/ESC-1042',
            { status: 'open' },
            expect.any(Object),
        );
    });

    it('snoozes from a menu of presets, through the agent route', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-snooze"]').trigger('click');
        const items = wrapper.findAll('[role="menu"][aria-label="Snooze"] [role="menuitem"]');
        expect(
            items.map((i) =>
                i
                    .text()
                    .split(/\s{2,}|\n/)[0]
                    .trim(),
            ),
        ).toEqual(expect.arrayContaining(['In 1 hour', 'In 4 hours']));
        const before = Date.now();
        await items[0].trigger('click');
        const [url, data] = router.post.mock.calls.at(-1);
        expect(url).toBe('/escalated.agent.tickets.snooze/ESC-1042');
        const until = new Date(data.snoozed_until).getTime();
        expect(until - before).toBeGreaterThanOrEqual(3600000 - 1000);
        expect(until - before).toBeLessThan(3600000 + 60000);
    });

    it('snoozes until a date and time the agent picks', async () => {
        mountPage();
        await wrapper.get('[data-testid="esc-snooze"]').trigger('click');
        const form = wrapper.get('[data-testid="esc-snooze-custom"]');
        const later = new Date(Date.now() + 3 * 86400000);
        later.setSeconds(0, 0);
        const pad = (n) => String(n).padStart(2, '0');
        const value = `${later.getFullYear()}-${pad(later.getMonth() + 1)}-${pad(later.getDate())}T${pad(later.getHours())}:${pad(later.getMinutes())}`;
        await form.get('input[type="datetime-local"]').setValue(value);
        await form.trigger('submit');
        const [url, data] = router.post.mock.calls.at(-1);
        expect(url).toBe('/escalated.agent.tickets.snooze/ESC-1042');
        expect(new Date(data.snoozed_until).getTime()).toBe(later.getTime());
    });

    it('says a ticket is snoozed and offers to unsnooze it', async () => {
        const until = new Date(Date.now() + 86400000).toISOString();
        mountPage({ ticket: makeTicket({ snoozed_until: until }) });
        expect(wrapper.get('[data-testid="esc-snoozed"]').text()).toContain('Snoozed until');
        await wrapper.get('[data-testid="esc-snooze"]').trigger('click');
        await wrapper
            .findAll('[role="menuitem"]')
            .find((i) => i.text() === 'Unsnooze')
            .trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.unsnooze/ESC-1042',
            {},
            expect.any(Object),
        );
    });

    it('falls back to the admin snooze route for admins, and offers no snooze without a route', () => {
        const only = (names) =>
            vi.fn((name, params) => {
                if (name.includes('snooze') && !names.includes(name)) throw new Error('no route');
                const list = Array.isArray(params) ? params : [params];
                return `/${name}/${list.join('/')}`;
            });
        const adminOnly = only(['escalated.admin.tickets.snooze', 'escalated.admin.tickets.unsnooze']);
        pageAt({ is_admin: true });
        vi.stubGlobal('route', adminOnly);
        wrapper = mount(TicketShow, {
            props: { ticket: makeTicket(), departments: [], tags: [], cannedResponses: [] },
            global: { mocks: { route: adminOnly }, stubs: { PresenceIndicator: true } },
            attachTo: document.body,
        });
        expect(wrapper.find('[data-testid="esc-snooze"]').exists()).toBe(true);
        wrapper.unmount();

        pageAt({ is_admin: false });
        vi.stubGlobal('route', adminOnly);
        wrapper = mount(TicketShow, {
            props: { ticket: makeTicket(), departments: [], tags: [], cannedResponses: [] },
            global: { mocks: { route: adminOnly }, stubs: { PresenceIndicator: true } },
            attachTo: document.body,
        });
        expect(wrapper.find('[data-testid="esc-snooze"]').exists()).toBe(false);
    });

    it('reassigns to any agent the backend lists, with a filter for long lists', async () => {
        const agents = [
            { id: 7, name: 'Mike Agent' },
            { id: 8, name: 'Ana Lopez' },
            { id: 9, name: 'Tom Baker' },
            { id: 10, name: 'Priya Patel' },
            { id: 11, name: 'Lena Fischer' },
            { id: 12, name: 'Noah Kim' },
            { id: 13, name: 'Ola Berg' },
        ];
        mountPage({ agents });
        await wrapper.get('[data-testid="esc-assignee"]').trigger('click');
        // The filter box sits beside the menu: a menu holds only its items.
        const filter = wrapper.get('[data-testid="esc-menu-filter"]');
        expect(document.activeElement).toBe(filter.element);
        expect(filter.element.closest('[role="menu"]')).toBeNull();
        await filter.setValue('ana');
        const menu = wrapper.get('[role="menu"][aria-label="Change assignee"]');
        const items = menu.findAll('[role="menuitemradio"]');
        expect(items.map((i) => i.text())).toEqual(['Ana Lopez']);
        await items[0].trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.assign/ESC-1042',
            { agent_id: 8 },
            expect.any(Object),
        );
    });

    it('keeps the assignee as plain text when the backend sends no agents', () => {
        mountPage();
        expect(wrapper.get('[data-testid="esc-assignee"]').element.tagName).toBe('SPAN');
        expect(wrapper.find('[data-testid="esc-assign-me"]').exists()).toBe(true);
    });

    it('moves the ticket to another department', async () => {
        mountPage({
            departments: [
                { id: 2, name: 'Billing' },
                { id: 3, name: 'Technical' },
            ],
        });
        await wrapper.get('[data-testid="esc-department"]').trigger('click');
        await wrapper
            .findAll('[role="menuitemradio"]')
            .find((i) => i.text() === 'Technical')
            .trigger('click');
        expect(router.post).toHaveBeenLastCalledWith(
            '/escalated.agent.tickets.department/ESC-1042',
            { department_id: 3 },
            expect.any(Object),
        );
    });

    it('marks each tag with a tag icon in its colour', () => {
        mountPage();
        const icon = wrapper.findAll('[data-testid="esc-tag"]')[0].get('svg');
        expect(icon.attributes('aria-hidden')).toBe('true');
        expect(icon.attributes('style')).toContain('color');
    });

    it('labels every icon-only header action and gives it a tooltip', () => {
        mountPage({ macros: [{ id: 4, name: 'Escalate' }] }, { is_admin: true });
        const actions = wrapper.get('[data-testid="esc-ticket-actions"]');
        for (const button of actions.findAll('button')) {
            if (button.text().trim()) continue;
            expect(button.attributes('aria-label')).toBeTruthy();
            expect(button.attributes('title')).toBeTruthy();
        }
    });
});

describe('Agent/TicketShow next and previous ticket', () => {
    function remember() {
        rememberInbox({
            url: '/support/agent/tickets?assigned_to=7',
            title: 'My inbox',
            tickets: {
                data: [
                    { id: 1043, reference: 'ESC-1043', subject: 'Before' },
                    { id: 1042, reference: 'ESC-1042', subject: 'Unable to export CSV' },
                    { id: 1041, reference: 'ESC-1041', subject: 'After' },
                ],
            },
        });
    }

    it('opens the next and previous ticket of the list, with Shift J and Shift K too', async () => {
        remember();
        mountPage();
        await wrapper.get('[data-testid="esc-next-ticket"]').trigger('click');
        expect(router.visit).toHaveBeenLastCalledWith('/escalated.agent.tickets.show/ESC-1041', expect.any(Object));
        await wrapper.get('[data-testid="esc-previous-ticket"]').trigger('click');
        expect(router.visit).toHaveBeenLastCalledWith('/escalated.agent.tickets.show/ESC-1043', expect.any(Object));
        press('J');
        expect(router.visit).toHaveBeenLastCalledWith('/escalated.agent.tickets.show/ESC-1041', expect.any(Object));
        press('K');
        expect(router.visit).toHaveBeenLastCalledWith('/escalated.agent.tickets.show/ESC-1043', expect.any(Object));
    });

    it('disables the button at the end of the list and hides both without a list', () => {
        rememberInbox({
            url: '/support/agent/tickets',
            title: 'All tickets',
            tickets: { data: [{ id: 1042, reference: 'ESC-1042', subject: 'Only one' }] },
        });
        mountPage();
        expect(wrapper.get('[data-testid="esc-next-ticket"]').attributes('disabled')).toBeDefined();
        wrapper.unmount();
        forgetInbox();
        mountPage();
        expect(wrapper.find('[data-testid="esc-next-ticket"]').exists()).toBe(false);
    });
});

describe('Agent/TicketShow customer and details panel', () => {
    async function openPanel(props = {}, escalated = {}) {
        mountPage(props, escalated);
        await wrapper.get('[data-testid="esc-context-toggle"]').trigger('click');
        return wrapper.get('[data-testid="esc-context-panel"]');
    }

    it('is closed on a narrow pane and opens over the conversation on demand', async () => {
        mountPage();
        expect(wrapper.find('[data-testid="esc-context-panel"]').exists()).toBe(false);
        const toggle = wrapper.get('[data-testid="esc-context-toggle"]');
        expect(toggle.attributes('aria-expanded')).toBe('false');
        await toggle.trigger('click');
        const panel = wrapper.get('[data-testid="esc-context-panel"]');
        expect(panel.attributes('data-overlay')).toBe('true');
        expect(toggle.attributes('aria-expanded')).toBe('true');
        await panel.trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('[data-testid="esc-context-panel"]').exists()).toBe(false);
        expect(document.activeElement).toBe(wrapper.get('[data-testid="esc-context-toggle"]').element);
    });

    it('toggles with i', async () => {
        mountPage();
        press('i');
        await nextTick();
        expect(wrapper.find('[data-testid="esc-context-panel"]').exists()).toBe(true);
        press('i');
        await nextTick();
        expect(wrapper.find('[data-testid="esc-context-panel"]').exists()).toBe(false);
    });

    it('shows the customer, their organization when sent, and their other conversations', async () => {
        const panel = await openPanel({
            ticket: makeTicket({
                requester: { name: 'Sarah Chen', email: 'sarah@northwind.io', organization: { name: 'Northwind' } },
                requester_tickets: [
                    { id: 900, reference: 'ESC-0900', subject: 'Invoice question', status: 'resolved' },
                    { id: 950, reference: 'ESC-0950', subject: 'Export slow', status: 'open' },
                ],
            }),
        });
        const customer = panel.get('[data-testid="esc-customer"]');
        expect(customer.text()).toContain('Sarah Chen');
        expect(customer.text()).toContain('4 tickets in total');
        expect(panel.get('a[href="mailto:sarah@northwind.io"]').text()).toBe('sarah@northwind.io');
        expect(panel.get('[data-testid="esc-customer-org"]').text()).toContain('Northwind');
        const others = panel.get('[data-testid="esc-customer-tickets"]');
        expect(others.findAll('a').map((a) => a.attributes('href'))).toEqual([
            '/escalated.agent.tickets.show/ESC-0900',
            '/escalated.agent.tickets.show/ESC-0950',
        ]);
    });

    it("never presents linked tickets as the customer's history", async () => {
        const panel = await openPanel();
        expect(panel.find('[data-testid="esc-customer-tickets"]').exists()).toBe(false);
        expect(panel.get('[data-testid="esc-context-conversations"]').text()).toContain(
            'No other conversations with this customer.',
        );
        expect(panel.find('[data-testid="esc-customer-org"]').exists()).toBe(false);
    });

    it('lists details and filled-in custom fields, without repeating the header', async () => {
        const panel = await openPanel({
            ticket: makeTicket({
                custom_fields: [
                    { label: 'Plan', value: 'Enterprise' },
                    { label: 'Order number', value: '' },
                ],
            }),
        });
        const details = panel.get('[data-testid="esc-details"]').text();
        expect(details).toContain('Problem');
        expect(details).not.toContain('Department');
        expect(details).toContain('Enterprise');
        expect(details).not.toContain('Order number');
        expect(details).not.toContain('High');
    });

    it('lists linked tickets and the knowledge base link under Related', async () => {
        const panel = await openPanel();
        expect(panel.get('[data-testid="esc-links"]').text()).toContain('ESC-1001');
        expect(panel.get('[data-testid="esc-kb-link"]').attributes('href')).toBe('/support/kb');
        expect(wrapper.findComponent({ name: 'KnowledgePanel' }).exists()).toBe(false);
        wrapper.unmount();
        const without = await openPanel({}, { knowledge_base_enabled: false });
        expect(without.find('[data-testid="esc-kb-link"]').exists()).toBe(false);
    });

    it('opens the ticket history from the overflow menu', async () => {
        mountPage({
            ticket: makeTicket({
                activities: [
                    {
                        id: 1,
                        type: 'priority_changed',
                        properties: { new_priority: 'high' },
                        causer: { name: 'Mike Agent' },
                        created_at: minutesAgo(30),
                    },
                ],
            }),
        });
        await wrapper.get('[data-testid="esc-ticket-more"]').trigger('click');
        await wrapper
            .findAll('[role="menuitem"]')
            .find((i) => i.text() === 'Ticket history')
            .trigger('click');
        await nextTick();
        await nextTick();
        const history = wrapper.get('[data-testid="esc-history"]');
        expect(history.isVisible()).toBe(true);
        expect(history.text()).toContain('Mike Agent changed the priority to High');
    });

    it('remembers collapsed sections', async () => {
        const panel = await openPanel();
        const header = panel.get('[data-testid="esc-context-details"] button');
        expect(header.attributes('aria-expanded')).toBe('true');
        await header.trigger('click');
        expect(header.attributes('aria-expanded')).toBe('false');
        expect(JSON.parse(window.localStorage.getItem('escalated-context-sections')).details).toBe(false);
    });

    it('keeps the plugin slots', async () => {
        mountPage();
        let slots = wrapper.findAllComponents(PluginSlot).map((s) => s.props('slot'));
        expect(slots).toEqual(expect.arrayContaining(['ticket.show.header', 'ticket.show.actions']));
        await wrapper.get('[data-testid="esc-context-toggle"]').trigger('click');
        slots = wrapper.findAllComponents(PluginSlot).map((s) => s.props('slot'));
        expect(slots).toEqual(expect.arrayContaining(['ticket.show.sidebar', 'ticket.show.context-panel']));
    });
});

describe('Agent/TicketShow focus rings', () => {
    function unringed(root) {
        return [...root.querySelectorAll('a, button, [tabindex="0"]')]
            .filter((el) => !el.closest('[role="menu"]'))
            .filter((el) => !/focus-visible:(ring|after:ring)/.test(el.className))
            .map((el) => (el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' '));
    }

    it('gives every control on the page a visible keyboard focus ring, panel included', async () => {
        rememberInbox({
            url: '/support/agent/tickets',
            title: 'My inbox',
            tickets: {
                data: [
                    { id: 1042, reference: 'ESC-1042', subject: 'Unable to export CSV' },
                    { id: 1041, reference: 'ESC-1041', subject: 'Next one' },
                ],
                current_page: 1,
                last_page: 2,
                next_page_url: '/support/agent/tickets?page=2',
            },
        });
        mountPage(
            {
                agents: [{ id: 8, name: 'Ana Lopez' }],
                departments: [{ id: 2, name: 'Billing' }],
                ticket: makeTicket({
                    requester_tickets: [{ id: 900, reference: 'ESC-0900', subject: 'Old', status: 'open' }],
                }),
            },
            { is_admin: true },
        );
        expect(unringed(wrapper.element)).toEqual([]);
        await wrapper.get('[data-testid="esc-context-toggle"]').trigger('click');
        expect(unringed(wrapper.element)).toEqual([]);
    });
});
