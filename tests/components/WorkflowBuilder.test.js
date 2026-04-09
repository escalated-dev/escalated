import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import Builder from '../../src/pages/Admin/Workflows/Builder.vue';

// Stub Inertia
const formInstance = {
    name: '',
    description: '',
    trigger: '',
    conditions: { match: 'all', conditions: [] },
    actions: [],
    active: true,
    processing: false,
    errors: {},
    post: vi.fn(),
    put: vi.fn(),
};

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

function mountBuilder(workflow = null) {
    return mount(Builder, {
        props: workflow ? { workflow } : {},
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

describe('WorkflowBuilder', () => {
    it('renders the workflow name input', () => {
        const wrapper = mountBuilder();
        const nameInput = wrapper.find('input[type="text"]');
        expect(nameInput.exists()).toBe(true);
    });

    it('renders the description textarea', () => {
        const wrapper = mountBuilder();
        const textarea = wrapper.find('textarea');
        expect(textarea.exists()).toBe(true);
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
        const wrapper = mountBuilder();
        expect(wrapper.text()).toContain('optional');
    });

    it('shows Create Workflow button for new workflow', () => {
        const wrapper = mountBuilder();
        expect(wrapper.text()).toContain('Create Workflow');
    });

    it('shows Update Workflow button when editing', () => {
        const wrapper = mountBuilder({
            id: 1,
            name: 'Test',
            description: '',
            trigger: 'ticket_created',
            conditions: { match: 'all', conditions: [] },
            actions: [{ type: 'change_status', config: { status: 'open' } }],
            active: true,
        });
        expect(wrapper.text()).toContain('Update Workflow');
    });

    it('shows Cancel button', () => {
        const wrapper = mountBuilder();
        expect(wrapper.text()).toContain('Cancel');
    });

    it('renders active checkbox', () => {
        const wrapper = mountBuilder();
        const checkbox = wrapper.find('input[type="checkbox"]');
        expect(checkbox.exists()).toBe(true);
    });

    it('calls form.post on submit for new workflow', async () => {
        const wrapper = mountBuilder();
        // Set valid data
        formInstance.name = 'Test Workflow';
        formInstance.trigger = 'ticket_created';
        formInstance.actions = [{ type: 'change_status', config: {} }];
        await wrapper.find('form').trigger('submit');
        expect(formInstance.post).toHaveBeenCalled();
    });

    it('calls form.put on submit for existing workflow', async () => {
        const wrapper = mountBuilder({
            id: 1,
            name: 'Test',
            description: '',
            trigger: 'ticket_created',
            conditions: { match: 'all', conditions: [] },
            actions: [{ type: 'change_status', config: {} }],
            active: true,
        });
        formInstance.name = 'Test';
        formInstance.trigger = 'ticket_created';
        formInstance.actions = [{ type: 'change_status', config: {} }];
        await wrapper.find('form').trigger('submit');
        expect(formInstance.put).toHaveBeenCalled();
    });
});
