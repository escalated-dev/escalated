import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import Builder from '../../src/pages/Admin/Workflows/Builder.vue';

// Stub Inertia. transform() records the callback the builder hands it, so a
// test can run it against the form and see the body that would be sent.
const formInstance = {};

function resetForm() {
    for (const key of Object.keys(formInstance)) delete formInstance[key];
    Object.assign(formInstance, {
        processing: false,
        errors: {},
        post: vi.fn(),
        put: vi.fn(),
        transform: vi.fn((callback) => {
            formInstance.transformer = callback;
            return formInstance;
        }),
    });
}

resetForm();

vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((defaults) => {
        Object.assign(formInstance, defaults);
        return formInstance;
    }),
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href'],
    },
}));

vi.stubGlobal(
    'route',
    vi.fn((...args) => `/mocked/${args.join('/')}`),
);

function mountBuilder(props = {}) {
    return mount(Builder, {
        props,
        global: {
            provide: {
                'esc-dark': computed(() => true),
            },
            mocks: {
                route: vi.fn((...args) => `/mocked/${args.join('/')}`),
            },
            stubs: {
                EscalatedLayout: {
                    template: '<div><slot /></div>',
                    props: ['title'],
                },
                WorkflowTriggerSelector: true,
                WorkflowConditionBuilder: true,
                WorkflowActionList: true,
            },
        },
    });
}

function sentBody() {
    expect(formInstance.transform).toHaveBeenCalled();
    const { post, put, transform, transformer, processing, errors, ...data } = formInstance;
    return transformer(data);
}

describe('WorkflowBuilder', () => {
    beforeEach(() => resetForm());

    it('renders the workflow name input', () => {
        const wrapper = mountBuilder();
        expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    });

    it('renders the description textarea', () => {
        const wrapper = mountBuilder();
        expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('renders all three steps', () => {
        const wrapper = mountBuilder();
        expect(wrapper.text()).toContain('Trigger Event');
        expect(wrapper.text()).toContain('Conditions');
        expect(wrapper.text()).toContain('Actions');
    });

    it('shows step descriptions', () => {
        const wrapper = mountBuilder();
        expect(wrapper.text()).toContain('When this happens...');
        expect(wrapper.text()).toContain('Only if these conditions are met...');
        expect(wrapper.text()).toContain('Then do this...');
    });

    it('shows conditions as optional', () => {
        expect(mountBuilder().text()).toContain('optional');
    });

    it('shows Create Workflow button for new workflow', () => {
        expect(mountBuilder().text()).toContain('Create Workflow');
    });

    it('shows Update Workflow button when editing', () => {
        const wrapper = mountBuilder({
            workflow: { id: 1, name: 'Test', trigger_event: 'ticket.created', actions: [] },
        });
        expect(wrapper.text()).toContain('Update Workflow');
    });

    it('shows Cancel button', () => {
        expect(mountBuilder().text()).toContain('Cancel');
    });

    it('renders active checkbox', () => {
        expect(mountBuilder().find('input[type="checkbox"]').exists()).toBe(true);
    });

    it('hands the trigger list the backend sent to the trigger selector', () => {
        const triggerEvents = [{ value: 'ticket.replied', label: 'Ticket replied' }];
        const wrapper = mountBuilder({ triggerEvents });

        expect(wrapper.findComponent({ name: 'WorkflowTriggerSelector' }).props('options')).toEqual(triggerEvents);
    });

    describe('what it sends', () => {
        it('posts a new workflow in the contract shape', async () => {
            const wrapper = mountBuilder();
            formInstance.name = 'Route refunds';
            formInstance.trigger_event = 'ticket.created';
            formInstance.conditions = {
                match: 'all',
                conditions: [{ field: 'subject', operator: 'contains', value: 'refund' }],
            };
            formInstance.actions = [{ type: 'change_priority', value: 'high' }];

            await wrapper.find('form').trigger('submit');

            expect(formInstance.post).toHaveBeenCalledWith('/mocked/escalated.admin.workflows.store');
            expect(sentBody()).toEqual({
                name: 'Route refunds',
                description: null,
                trigger_event: 'ticket.created',
                conditions: { all: [{ field: 'subject', operator: 'contains', value: 'refund' }] },
                actions: [{ type: 'change_priority', value: 'high' }],
                is_active: true,
            });
        });

        it('puts an edited workflow to its update route', async () => {
            const wrapper = mountBuilder({
                workflow: {
                    id: 7,
                    name: 'Existing',
                    trigger_event: 'reply.created',
                    conditions: { any: [] },
                    actions: [{ type: 'add_tag', value: 'replied' }],
                    is_active: true,
                },
            });

            await wrapper.find('form').trigger('submit');

            expect(formInstance.put).toHaveBeenCalledWith('/mocked/escalated.admin.workflows.update/7');
            expect(sentBody()).toMatchObject({ trigger_event: 'reply.created', conditions: { any: [] } });
        });

        it('edits a workflow Laravel stored in its older shape and sends it back canonical', async () => {
            const rule = { field: 'priority', operator: 'equals', value: 'urgent' };
            const wrapper = mountBuilder({
                workflow: {
                    id: 3,
                    name: 'Legacy',
                    trigger_event: 'ticket.created',
                    trigger: 'ticket.created',
                    conditions: { match: 'any', rules: [rule] },
                    actions: [{ type: 'add_internal_note', value: 'Urgent ticket' }],
                    is_active: false,
                },
            });

            expect(formInstance.conditions).toEqual({ match: 'any', conditions: [rule] });
            expect(formInstance.is_active).toBe(false);

            await wrapper.find('form').trigger('submit');

            expect(sentBody()).toMatchObject({
                trigger_event: 'ticket.created',
                conditions: { any: [rule] },
                actions: [{ type: 'add_internal_note', value: 'Urgent ticket' }],
                is_active: false,
            });
        });

        it('reads a trigger sent only as the trigger alias', () => {
            mountBuilder({ workflow: { id: 4, name: 'Alias only', trigger: 'ticket.assigned', actions: [] } });

            expect(formInstance.trigger_event).toBe('ticket.assigned');
        });
    });
});
