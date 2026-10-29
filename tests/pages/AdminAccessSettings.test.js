import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SsoSettings from '../../src/pages/Admin/Settings/SsoSettings.vue';
import TwoFactor from '../../src/pages/Admin/Settings/TwoFactor.vue';

/**
 * SSO and two-factor admin pages (ADR 2026-10-29 configurable access features).
 *
 * - `Admin/Settings/SsoSettings` receives read-only `endpoints {login,
 *   sp_entity_id, metadata, acs, oauth_redirect, jwt_callback}` for the admin
 *   to give the identity provider.
 * - `Admin/Settings/TwoFactor` receives `required`; an admin can switch the
 *   `two_factor_required` setting from there, saved through
 *   `escalated.admin.settings.update`.
 */
const state = vi.hoisted(() => ({ page: null, post: vi.fn() }));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');
    state.page = reactive({ props: {} });
    return {
        usePage: () => state.page,
        useForm: (data) => reactive({ ...data, errors: {}, processing: false, post: vi.fn() }),
        router: { post: state.post },
        Link: { template: '<a><slot /></a>' },
    };
});

vi.stubGlobal(
    'route',
    vi.fn((name) => `/${name}`),
);

const mountOptions = {
    global: {
        stubs: { EscalatedLayout: { template: '<main><slot /></main>' } },
        mocks: { route: (name) => `/${name}` },
    },
};

const endpoints = {
    login: 'https://help.example.test/support/sso/login',
    sp_entity_id: 'https://help.example.test/support/sso/saml/metadata',
    metadata: 'https://help.example.test/support/sso/saml/metadata',
    acs: 'https://help.example.test/support/sso/saml/acs',
    oauth_redirect: 'https://help.example.test/support/sso/oauth/callback',
    jwt_callback: 'https://help.example.test/support/sso/jwt/callback',
};

describe('Admin/Settings/SsoSettings endpoints', () => {
    it('shows every endpoint the backend sends, read-only', () => {
        const wrapper = mount(SsoSettings, {
            props: { settings: { sso_provider: 'saml' }, endpoints },
            ...mountOptions,
        });

        const section = wrapper.find('[data-testid="sso-endpoints"]');
        expect(section.exists()).toBe(true);
        const values = section.findAll('input').map((input) => input.element.value);
        expect(values).toEqual([
            endpoints.login,
            endpoints.sp_entity_id,
            endpoints.metadata,
            endpoints.acs,
            endpoints.oauth_redirect,
            endpoints.jwt_callback,
        ]);
        for (const input of section.findAll('input')) {
            expect(input.attributes('readonly')).toBeDefined();
        }
        expect(section.text()).toContain('Assertion Consumer Service (ACS) URL');
        expect(section.text()).toContain('SP entity ID');
        expect(section.text()).toContain('OAuth redirect URI');
    });

    it('labels each field and skips endpoints the backend leaves out', () => {
        const wrapper = mount(SsoSettings, {
            props: { settings: { sso_provider: 'jwt' }, endpoints: { jwt_callback: endpoints.jwt_callback } },
            ...mountOptions,
        });

        const inputs = wrapper.findAll('[data-testid="sso-endpoints"] input');
        expect(inputs).toHaveLength(1);
        expect(inputs[0].element.value).toBe(endpoints.jwt_callback);
        expect(wrapper.find('[data-testid="sso-endpoints"]').text()).toContain('JWT callback URL');
    });

    it('shows no endpoints section for a backend that does not send them', () => {
        const wrapper = mount(SsoSettings, { props: { settings: { sso_provider: 'saml' } }, ...mountOptions });

        expect(wrapper.find('[data-testid="sso-endpoints"]').exists()).toBe(false);
    });
});

describe('Admin/Settings/TwoFactor require toggle', () => {
    beforeEach(() => {
        state.post.mockClear();
        state.page.props = { escalated: { is_admin: true, permissions: ['*'] } };
    });

    function requireSwitch(wrapper) {
        return wrapper.find('button[role="switch"]');
    }

    it('lets an admin require two-factor for all staff', async () => {
        const wrapper = mount(TwoFactor, { props: { required: false }, ...mountOptions });

        const toggle = requireSwitch(wrapper);
        expect(toggle.exists()).toBe(true);
        expect(toggle.attributes('aria-checked')).toBe('false');

        await toggle.trigger('click');

        expect(state.post).toHaveBeenCalledOnce();
        const [url, payload, options] = state.post.mock.calls[0];
        expect(url).toBe('/escalated.admin.settings.update');
        expect(payload).toEqual({ two_factor_required: true });
        expect(options.preserveScroll).toBe(true);
    });

    it('lets an admin stop requiring it', async () => {
        const wrapper = mount(TwoFactor, { props: { required: true }, ...mountOptions });

        expect(requireSwitch(wrapper).attributes('aria-checked')).toBe('true');
        await requireSwitch(wrapper).trigger('click');

        expect(state.post.mock.calls[0][1]).toEqual({ two_factor_required: false });
    });

    it('tells staff when two-factor is required, without the toggle', () => {
        state.page.props = { escalated: { is_admin: false, is_agent: true, permissions: ['*'] } };
        const wrapper = mount(TwoFactor, { props: { required: true }, ...mountOptions });

        expect(requireSwitch(wrapper).exists()).toBe(false);
        expect(wrapper.text()).toContain('required for all staff');
    });

    it('hides the toggle from an admin without settings.manage while roles are enforced', () => {
        state.page.props = { escalated: { is_admin: true, permissions: ['ticket.view'] } };
        const wrapper = mount(TwoFactor, { props: { required: false }, ...mountOptions });

        expect(requireSwitch(wrapper).exists()).toBe(false);
    });

    it('shows no toggle for a backend that does not send `required`', () => {
        const wrapper = mount(TwoFactor, { props: {}, ...mountOptions });

        expect(requireSwitch(wrapper).exists()).toBe(false);
        expect(wrapper.text()).not.toContain('required for all staff');
    });
});
