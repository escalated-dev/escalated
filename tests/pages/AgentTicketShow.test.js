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

    it('shows details, customer and related tabs', async () => {
        mountPage();
        const tab = (name) => wrapper.findAll('[role="tab"]').find((b) => b.text() === name);
        await tab('Details').trigger('click');
        const details = wrapper.get('[data-testid="esc-details"]').text();
        expect(details).toContain('Billing');
        expect(details).toContain('Problem');

        await tab('Customer').trigger('click');
        expect(wrapper.get('[data-testid="esc-customer"]').text()).toContain('sarah@northwind.io');
        expect(wrapper.text()).toContain('Old export issue');

        await tab('Related').trigger('click');
        expect(wrapper.get('[data-testid="esc-links"]').text()).toContain('ESC-1001');
    });

    it('moves between tabs with the arrow keys', async () => {
        mountPage();
        await wrapper.get('[role="tablist"][aria-label="Ticket sections"]').trigger('keydown', { key: 'ArrowRight' });
        expect(wrapper.findAll('[role="tab"][aria-selected="true"]').map((t) => t.text())).toContain('Details');
    });

    it('keeps the plugin slots', async () => {
        mountPage();
        let slots = wrapper.findAllComponents(PluginSlot).map((s) => s.props('slot'));
        expect(slots).toEqual(expect.arrayContaining(['ticket.show.header', 'ticket.show.actions']));
        await wrapper
            .findAll('[role="tab"]')
            .find((b) => b.text() === 'Details')
            .trigger('click');
        slots = wrapper.findAllComponents(PluginSlot).map((s) => s.props('slot'));
        expect(slots).toContain('ticket.show.sidebar');
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
        // Narrower at lg so the ticket keeps a usable width at 1024px.
        expect(list.classes()).toEqual(expect.arrayContaining(['w-[340px]', 'xl:w-[420px]']));
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

describe('Agent/TicketShow focus rings', () => {
    function unringed(root) {
        return [...root.querySelectorAll('a, button, [tabindex="0"]')]
            .filter((el) => !el.closest('[role="menu"]'))
            .filter((el) => !/focus-visible:(ring|after:ring)/.test(el.className))
            .map((el) => (el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' '));
    }

    it('gives every control on the page a visible keyboard focus ring', async () => {
        rememberInbox({
            url: '/support/agent/tickets',
            title: 'My inbox',
            tickets: {
                data: [{ id: 1042, reference: 'ESC-1042', subject: 'Unable to export CSV' }],
                current_page: 1,
                last_page: 2,
                next_page_url: '/support/agent/tickets?page=2',
            },
        });
        mountPage({}, { is_admin: true });
        expect(unringed(wrapper.element)).toEqual([]);
        for (const name of ['customer', 'related']) {
            await wrapper.get(`#esc-tab-${name}`).trigger('click');
            expect(unringed(wrapper.element)).toEqual([]);
        }
    });
});

describe('Agent/TicketShow on a phone', () => {
    it('scrolls the header away with the thread and keeps the composer docked', () => {
        mountPage();
        const pane = wrapper.get('[data-testid="esc-detail-pane"]');
        expect(pane.classes()).toContain('max-sm:overflow-y-auto');
        expect(wrapper.get('[data-testid="esc-tabpanel"]').classes()).toContain('max-sm:overflow-visible');
        expect(wrapper.get('[data-testid="esc-composer-dock"]').classes()).toEqual(
            expect.arrayContaining(['max-sm:sticky', 'max-sm:bottom-0']),
        );
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

