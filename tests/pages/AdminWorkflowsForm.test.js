import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Form from '../../src/pages/Admin/Workflows/Form.vue';

/**
 * The workflow form.
 *
 * Backends pass the workflow alongside a trigger-event list, an operator list
 * and an action-type list. The builder derives all three itself, so they are
 * declared here to be swallowed rather than forwarded -- an undeclared prop
 * falls through onto the root element as an attribute.
 *
 * They have to be declared under the names that actually arrive. Vue folds
 * kebab-case into camelCase and nothing else, so `triggerEvents` never matched
 * the `trigger_events` every backend sends.
 */
vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((data) => ({ ...data, errors: {}, processing: false, post: vi.fn(), put: vi.fn() })),
    usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support' } } })),
    router: { post: vi.fn(), visit: vi.fn() },
    Link: { template: '<a><slot /></a>' },
}));

vi.mock('../../src/pages/Admin/Workflows/Builder.vue', () => ({
    default: { name: 'Builder', props: ['workflow'], template: '<div class="builder" />' },
}));

const mountOptions = { global: { mocks: { route: (name) => `/${name}` } } };

const backendProps = {
    workflow: { id: 1, name: 'Escalate on breach' },
    trigger_events: ['ticket.created'],
    operators: { eq: 'is' },
    action_types: ['assign'],
};

describe('Admin/Workflows/Form', () => {
    it('swallows the lists the backends send alongside the workflow', () => {
        // Undeclared, they land on the builder's root element as attributes.
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
