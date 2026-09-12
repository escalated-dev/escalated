import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PublicTickets from '../../src/pages/Admin/Settings/PublicTickets.vue';

/**
 * What happens to a ticket raised by someone who is not signed in.
 *
 * Five backends render `Escalated/Admin/Settings/PublicTickets` and there was
 * no component behind the name, so the screen came up blank rather than
 * erroring. The behaviour worth pinning is that each mode asks for exactly the
 * value the backend requires for it — a mode saved without its companion value
 * is rejected server-side, and the field has to be on screen to be filled in.
 */
const mockForm = vi.hoisted(() => ({
    guest_policy_mode: 'unassigned',
    guest_policy_user_id: '',
    guest_policy_signup_url_template: '',
    processing: false,
    errors: {},
    post: vi.fn(),
}));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');
    const form = reactive(mockForm);

    return {
        useForm: vi.fn((data) => {
            Object.assign(form, data);
            return form;
        }),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support', is_admin: true } } })),
        router: { post: vi.fn() },
        Link: { template: '<a><slot /></a>' },
    };
});

// route() is reached two different ways: from a template Vue resolves it on the
// component instance, and from <script setup> it is a plain global. Both need
// providing or the submit path throws while the markup renders fine.
vi.stubGlobal(
    'route',
    vi.fn((name) => `/${name}`),
);

const mountOptions = {
    global: {
        stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
        mocks: { route: (name) => `/${name}` },
    },
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Admin/Settings/PublicTickets', () => {
    it('offers the three guest policy modes the backends accept', () => {
        const wrapper = mount(PublicTickets, { props: { settings: {} }, ...mountOptions });
        const values = wrapper.findAll('input[type="radio"]').map((r) => r.attributes('value'));

        expect(values).toEqual(['unassigned', 'guest_user', 'prompt_signup']);
    });

    it('loads the saved mode', () => {
        mount(PublicTickets, { props: { settings: { guest_policy_mode: 'prompt_signup' } }, ...mountOptions });

        expect(mockForm.guest_policy_mode).toBe('prompt_signup');
    });

    it('asks for nothing else when guests are left unattached', () => {
        const wrapper = mount(PublicTickets, {
            props: { settings: { guest_policy_mode: 'unassigned' } },
            ...mountOptions,
        });

        expect(wrapper.find('#guest-user-id').exists()).toBe(false);
        expect(wrapper.find('#signup-url').exists()).toBe(false);
    });

    it('asks for the account id when guest tickets are attached to one', () => {
        const wrapper = mount(PublicTickets, {
            props: { settings: { guest_policy_mode: 'guest_user' } },
            ...mountOptions,
        });

        // The backend requires it for this mode and rejects the save without
        // it, so the field has to be here to be filled in.
        expect(wrapper.find('#guest-user-id').exists()).toBe(true);
        expect(wrapper.find('#signup-url').exists()).toBe(false);
    });

    it('asks for the sign-up URL when guests are asked to register', () => {
        const wrapper = mount(PublicTickets, {
            props: { settings: { guest_policy_mode: 'prompt_signup' } },
            ...mountOptions,
        });

        expect(wrapper.find('#signup-url').exists()).toBe(true);
        expect(wrapper.find('#guest-user-id').exists()).toBe(false);
    });

    it('follows the mode as it changes rather than only on load', async () => {
        const wrapper = mount(PublicTickets, {
            props: { settings: { guest_policy_mode: 'unassigned' } },
            ...mountOptions,
        });

        await wrapper.findAll('input[type="radio"]')[1].setValue();

        expect(wrapper.find('#guest-user-id').exists()).toBe(true);
    });

    it('submits the settings', async () => {
        const wrapper = mount(PublicTickets, { props: { settings: {} }, ...mountOptions });
        await wrapper.find('form').trigger('submit');

        expect(mockForm.post).toHaveBeenCalled();
    });

    it('renders with no settings at all', () => {
        // A host that has never saved these gets an empty object, not nulls.
        const wrapper = mount(PublicTickets, { props: {}, ...mountOptions });

        expect(wrapper.text()).toContain('Guest policy');
    });
});
