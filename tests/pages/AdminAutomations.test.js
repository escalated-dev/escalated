import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Index from '../../src/pages/Admin/Automations/Index.vue';
import Form from '../../src/pages/Admin/Automations/Form.vue';

/**
 * Automations are the time-based half of the admin automation surface, and
 * until now they had no screen at all — six backends rendered
 * `Escalated/Admin/Automations/Index` into a page component that did not
 * exist, which Inertia resolves to nothing rather than to an error.
 *
 * What is worth pinning is the vocabulary. Every field, operator and action
 * offered here is one the backend runner actually evaluates; anything else
 * would save cleanly and then silently never match a ticket.
 */
const mockForm = vi.hoisted(() => ({
    name: '',
    conditions: [],
    actions: [],
    active: true,
    processing: false,
    errors: {},
    post: vi.fn(),
    put: vi.fn(),
}));

// vi.mock is hoisted above every const in the file, so anything its factory
// closes over has to be hoisted with it.
const routerMock = vi.hoisted(() => ({ delete: vi.fn(), put: vi.fn(), post: vi.fn() }));

vi.mock('@inertiajs/vue3', async () => {
    // reactive() proxies the same object mockForm names, so the component
    // re-renders when the form changes and the assertions below still read the
    // state through the outer const. Without it the DOM never updates and a
    // button that should have become enabled stays disabled.
    const { reactive } = await import('vue');
    const form = reactive(mockForm);

    return {
        useForm: vi.fn((data) => {
            Object.assign(form, data);
            return form;
        }),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support', is_admin: true } } })),
        router: routerMock,
        Link: { template: '<a><slot /></a>' },
    };
});

vi.stubGlobal(
    'route',
    vi.fn(() => '/mocked-route'),
);

const stubs = { EscalatedLayout: { template: '<div><slot /></div>' } };

// route() is called from the templates here, where Vue resolves it on the
// component instance rather than in global scope -- stubGlobal alone does not
// reach it.
const mocks = { route: (name, param) => `/${name}${param ? `/${param}` : ''}` };

const mountOptions = { global: { stubs, mocks } };

const automations = [
    {
        id: 1,
        name: 'Escalate stale tickets',
        active: true,
        conditions: [{ field: 'hours_since_updated', operator: '>', value: 24 }],
        actions: [{ type: 'change_priority', value: 'high' }],
    },
    {
        id: 2,
        name: 'Close abandoned tickets',
        active: false,
        conditions: [{ field: 'status', value: 'waiting' }],
        actions: [{ type: 'change_status', value: 'closed' }],
    },
];

beforeEach(() => {
    vi.clearAllMocks();
    mockForm.conditions = [];
    mockForm.actions = [];
});

describe('Admin/Automations/Index', () => {
    it('lists every automation with its name', () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });

        expect(wrapper.text()).toContain('Escalate stale tickets');
        expect(wrapper.text()).toContain('Close abandoned tickets');
    });

    it('reads a time condition back in words rather than in field names', () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });

        // `hours_since_updated > 24` is how it is stored; an admin should not
        // have to read it that way.
        expect(wrapper.text()).toContain('Hours since updated > 24');
        expect(wrapper.text()).not.toContain('hours_since_updated');
    });

    it('reads a non-time condition as a plain statement', () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });

        expect(wrapper.text()).toContain('Status is waiting');
    });

    it('names each action and its value', () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });

        expect(wrapper.text()).toContain('Change priority: high');
        expect(wrapper.text()).toContain('Change status: closed');
    });

    it('shows active and paused differently', () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });

        expect(wrapper.text()).toContain('Active');
        expect(wrapper.text()).toContain('Paused');
    });

    it('invites the first automation when there are none', () => {
        const wrapper = mount(Index, { props: { automations: [] }, ...mountOptions });

        expect(wrapper.text()).toContain('No automations yet');
    });

    it('survives an automation with no conditions or actions', () => {
        // A row half-written by an API client should render, not throw.
        const wrapper = mount(Index, {
            props: { automations: [{ id: 3, name: 'Empty', active: true }] },
            ...mountOptions,
        });

        expect(wrapper.text()).toContain('Empty');
    });

    it('asks before deleting', async () => {
        vi.stubGlobal(
            'confirm',
            vi.fn(() => false),
        );

        const wrapper = mount(Index, { props: { automations }, ...mountOptions });
        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Delete')
            .trigger('click');

        expect(routerMock.delete).not.toHaveBeenCalled();
    });

    it('deletes once confirmed', async () => {
        vi.stubGlobal(
            'confirm',
            vi.fn(() => true),
        );

        const wrapper = mount(Index, { props: { automations }, ...mountOptions });
        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Delete')
            .trigger('click');

        expect(routerMock.delete).toHaveBeenCalled();
    });

    it('sends the whole automation when toggling active, not just the flag', async () => {
        const wrapper = mount(Index, { props: { automations }, ...mountOptions });
        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Active')
            .trigger('click');

        // The backend's update is a full replace: sending the flag alone would
        // wipe the conditions and actions.
        const [, payload] = routerMock.put.mock.calls[0];
        expect(payload).toMatchObject({
            name: 'Escalate stale tickets',
            active: false,
            conditions: automations[0].conditions,
            actions: automations[0].actions,
        });
    });
});

describe('Admin/Automations/Form', () => {
    it('starts a new automation with one condition and one action', () => {
        mount(Form, { props: { automation: null }, ...mountOptions });

        // The backend requires at least one of each, so an empty form could
        // only ever be rejected.
        expect(mockForm.conditions).toHaveLength(1);
        expect(mockForm.actions).toHaveLength(1);
    });

    it('loads an existing automation into the form', () => {
        mount(Form, { props: { automation: automations[0] }, ...mountOptions });

        expect(mockForm.name).toBe('Escalate stale tickets');
        expect(mockForm.conditions[0]).toMatchObject({ field: 'hours_since_updated', operator: '>', value: 24 });
    });

    it('offers only fields the runner evaluates', () => {
        const wrapper = mount(Form, { props: { automation: null }, ...mountOptions });
        const values = wrapper
            .find('select')
            .findAll('option')
            .map((o) => o.attributes('value'));

        expect(values).toEqual([
            'hours_since_created',
            'hours_since_updated',
            'hours_since_assigned',
            'status',
            'priority',
            'assigned',
            'ticket_type',
            'subject_contains',
        ]);
    });

    it('offers only actions the runner executes', () => {
        const wrapper = mount(Form, { props: { automation: null }, ...mountOptions });
        const selects = wrapper.findAll('select');
        const actionSelect = selects[selects.length - 1];

        expect(actionSelect.findAll('option').map((o) => o.attributes('value'))).toEqual([
            'change_status',
            'change_priority',
            'assign',
            'add_tag',
            'set_ticket_type',
            'add_note',
        ]);
    });

    it('adds and removes conditions', async () => {
        const wrapper = mount(Form, { props: { automation: null }, ...mountOptions });

        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Add condition')
            .trigger('click');
        expect(mockForm.conditions).toHaveLength(2);

        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Remove')
            .trigger('click');
        expect(mockForm.conditions).toHaveLength(1);
    });

    it('will not let the last condition be removed', () => {
        const wrapper = mount(Form, { props: { automation: null }, ...mountOptions });
        const remove = wrapper.findAll('button').filter((b) => b.text() === 'Remove');

        expect(remove[0].attributes('disabled')).toBeDefined();
    });

    it('posts a new automation and puts an existing one', async () => {
        const creating = mount(Form, { props: { automation: null }, ...mountOptions });
        await creating.find('form').trigger('submit');
        expect(mockForm.post).toHaveBeenCalled();

        const editing = mount(Form, { props: { automation: automations[0] }, ...mountOptions });
        await editing.find('form').trigger('submit');
        expect(mockForm.put).toHaveBeenCalled();
    });
});
