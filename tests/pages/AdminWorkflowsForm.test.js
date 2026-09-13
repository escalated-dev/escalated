import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Form from '../../src/pages/Admin/Workflows/Form.vue';

/**
 * The workflow form.
 *
 * Backends pass the workflow alongside the trigger events they fire, the
 * operators and the action types they execute. The builder offers exactly
 * those lists (see workflow-admin-contract.md), so Form hands them on.
 *
 * They have to be declared under the names that actually arrive. Vue folds
 * kebab-case into camelCase and nothing else, so `triggerEvents` never matched
 * the `trigger_events` every backend sends, and an undeclared prop falls
 * through onto the root element as an attribute.
 */
vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((data) => ({ ...data, errors: {}, processing: false, post: vi.fn(), put: vi.fn() })),
    usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support' } } })),
    router: { post: vi.fn(), visit: vi.fn() },
    Link: { template: '<a><slot /></a>' },
}));

vi.mock('../../src/pages/Admin/Workflows/Builder.vue', () => ({
    default: {
        name: 'Builder',
        props: ['workflow', 'triggerEvents', 'actionTypes', 'operators'],
        template: '<div class="builder" />',
    },
}));

const mountOptions = { global: { mocks: { route: (name) => `/${name}` } } };

const backendProps = {
    workflow: { id: 1, name: 'Escalate on breach' },
    trigger_events: ['ticket.created'],
    operators: { eq: 'is' },
    action_types: ['assign'],
};

describe('Admin/Workflows/Form', () => {
    it('hands the lists the backend sends to the builder', () => {
        const builder = mount(Form, { props: backendProps, ...mountOptions }).findComponent({ name: 'Builder' });

        expect(builder.props('triggerEvents')).toEqual(backendProps.trigger_events);
        expect(builder.props('actionTypes')).toEqual(backendProps.action_types);
        expect(builder.props('operators')).toEqual(backendProps.operators);
    });

    it('keeps them off the builder root as attributes', () => {
        const builder = mount(Form, { props: backendProps, ...mountOptions }).find('.builder');

        expect(builder.attributes('trigger_events')).toBeUndefined();
        expect(builder.attributes('operators')).toBeUndefined();
        expect(builder.attributes('action_types')).toBeUndefined();
    });

    it('still hands the workflow to the builder', () => {
        const wrapper = mount(Form, { props: backendProps, ...mountOptions });

        expect(wrapper.findComponent({ name: 'Builder' }).props('workflow')).toEqual(backendProps.workflow);
    });

    it('renders for a new workflow, which has none of them', () => {
        const wrapper = mount(Form, { props: {}, ...mountOptions });

        expect(wrapper.find('.builder').exists()).toBe(true);
    });
});
