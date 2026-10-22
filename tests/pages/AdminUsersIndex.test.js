import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UsersIndex from '../../src/pages/Admin/Users/Index.vue';

/**
 * A backend that has not been told how to list its host app's users sends an
 * optional `notice` string instead of rows. The page shows that text as an
 * informational message in place of "No users found." -- otherwise an admin
 * sees an empty table and assumes there are no users. The text comes from the
 * server already worded, so it is rendered as given, never translated.
 */
vi.mock('@inertiajs/vue3', () => ({
    router: { get: vi.fn(), patch: vi.fn() },
    usePage: vi.fn(() => ({ props: {} })),
}));

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
