import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import UsersIndex from '../../src/pages/Admin/Users/Index.vue';

/**
 * A backend that has not been told how to list its host app's users sends an
 * optional `notice` string instead of rows. The page shows that text as an
 * informational message in place of "No users found." -- otherwise an admin
 * sees an empty table and assumes there are no users. The text comes from the
 * server already worded, so it is rendered as given, never translated.
 */
vi.mock('@inertiajs/vue3', () => ({
    router: { get: vi.fn(), patch: vi.fn(), put: vi.fn() },
    usePage: vi.fn(() => ({ props: {} })),
}));

vi.stubGlobal(
    'route',
    vi.fn((name, param) => (param === undefined ? `/${name}` : `/${name}/${param}`)),
);

const mountOptions = {
    global: {
        stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
        mocks: { route: (name) => `/${name}` },
    },
};

const NOTICE = 'User listing is not configured. Provide a userListHook to EscalatedModule.forRoot().';

describe('Admin/Users/Index', () => {
    it('shows the server notice in place of the empty state', () => {
        const wrapper = mount(UsersIndex, {
            props: { users: { data: [], links: [] }, notice: NOTICE },
            ...mountOptions,
        });

        const status = wrapper.find('[role="status"]');
        expect(status.exists()).toBe(true);
        expect(status.text()).toContain(NOTICE);
        expect(wrapper.text()).not.toContain('No users found.');
    });

    it('renders the notice as text, not HTML', () => {
        const wrapper = mount(UsersIndex, {
            props: { users: { data: [] }, notice: '<b>Configure</b> the hook' },
            ...mountOptions,
        });

        expect(wrapper.find('[role="status"] b').exists()).toBe(false);
        expect(wrapper.find('[role="status"]').text()).toContain('<b>Configure</b> the hook');
    });

    it('keeps the notice visible alongside rows when both are sent', () => {
        const wrapper = mount(UsersIndex, {
            props: {
                users: { data: [{ id: 1, name: 'Ada', email: 'ada@example.com', is_admin: true, is_agent: true }] },
                notice: NOTICE,
            },
            ...mountOptions,
        });

        expect(wrapper.find('[role="status"]').text()).toContain(NOTICE);
        expect(wrapper.text()).toContain('ada@example.com');
    });

    it('is unchanged without a notice', () => {
        const wrapper = mount(UsersIndex, { props: { users: { data: [] } }, ...mountOptions });

        expect(wrapper.find('[role="status"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('No users found.');
    });

    it('treats an empty notice as absent', () => {
        const wrapper = mount(UsersIndex, { props: { users: { data: [] }, notice: '' }, ...mountOptions });

        expect(wrapper.find('[role="status"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('No users found.');
    });
});

/**
 * Roles & permissions (ADR 2026-10-29). While the switch is on, the backend
 * sends `roles` ([{id, name, slug}]) and each user row's `roles` (slugs). The
 * page shows a picker per user that saves the whole set with
 * `PUT escalated.admin.users.roles` and `{role_ids: [...]}`. Without the
 * `roles` prop (switch off, or a backend without roles) there is no picker.
 */
describe('Admin/Users/Index roles picker', () => {
    const roles = [
        { id: 1, name: 'Admin', slug: 'admin' },
        { id: 2, name: 'Agent', slug: 'agent' },
        { id: 3, name: 'Light Agent', slug: 'light_agent' },
    ];
    const ada = { id: 7, name: 'Ada', email: 'ada@example.com', is_admin: false, is_agent: true, roles: ['agent'] };

    beforeEach(() => router.put.mockClear());

    function mountWithRoles(user = ada) {
        return mount(UsersIndex, { props: { users: { data: [user] }, roles }, ...mountOptions });
    }

    function checkbox(wrapper, roleName) {
        return wrapper.find(`input[type="checkbox"][aria-label="${roleName}: Ada"]`);
    }

    it('shows no picker without the roles prop', () => {
        const wrapper = mount(UsersIndex, { props: { users: { data: [ada] } }, ...mountOptions });

        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);
        expect(wrapper.text()).not.toContain('Roles');
    });

    it('checks the roles the user holds', () => {
        const wrapper = mountWithRoles();

        expect(wrapper.text()).toContain('Roles');
        expect(checkbox(wrapper, 'Agent').element.checked).toBe(true);
        expect(checkbox(wrapper, 'Admin').element.checked).toBe(false);
        expect(checkbox(wrapper, 'Light Agent').element.checked).toBe(false);
    });

    it('adds a role by saving the full set of role ids', async () => {
        const wrapper = mountWithRoles();

        await checkbox(wrapper, 'Admin').setValue(true);

        expect(router.put).toHaveBeenCalledOnce();
        const [url, payload] = router.put.mock.calls[0];
        expect(url).toBe('/escalated.admin.users.roles/7');
        expect(payload).toEqual({ role_ids: [1, 2] });
    });

    it('removes a role, down to an empty set', async () => {
        const wrapper = mountWithRoles();

        await checkbox(wrapper, 'Agent').setValue(false);

        expect(router.put.mock.calls[0][1]).toEqual({ role_ids: [] });
    });

    it('treats a row without roles as holding none', async () => {
        const wrapper = mountWithRoles({ ...ada, roles: undefined });

        expect(checkbox(wrapper, 'Agent').element.checked).toBe(false);
        await checkbox(wrapper, 'Light Agent').setValue(true);
        expect(router.put.mock.calls[0][1]).toEqual({ role_ids: [3] });
    });
});
