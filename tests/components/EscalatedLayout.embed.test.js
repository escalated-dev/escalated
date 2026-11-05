import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';

/**
 * Embedding the admin in the host's own admin panel (ADR 2026-11-05) is
 * optional. These tests pin both halves: with only the existing `layout`
 * option nothing changes, and with `layoutScope` / the server's embed flag
 * admin pages render chrome-free inside the host layout.
 */
const usePage = vi.fn();
const startFrameBridge = vi.fn(() => () => {});

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    router: { visit: vi.fn(), on: () => () => {} },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

vi.mock('../../src/embed/frameBridge', () => ({
    startFrameBridge: (...args) => startFrameBridge(...args),
}));

const HostLayout = defineComponent({
    name: 'HostLayout',
    setup(_, { slots }) {
        return () =>
            h('div', { 'data-testid': 'host-layout' }, [
                h('aside', { 'data-testid': 'host-sidebar' }, 'Host menu'),
                h('header', { 'data-testid': 'host-header' }, slots.header?.()),
                h('main', { 'data-testid': 'host-main' }, slots.default?.()),
            ]);
    },
});

const OtherLayout = defineComponent({
    name: 'OtherLayout',
    setup(_, { slots }) {
        return () => h('div', { 'data-testid': 'other-layout' }, [slots.header?.(), slots.default?.()]);
    },
});

const AgentShellStub = {
    name: 'AgentShell',
    props: ['title', 'fullBleed'],
    template: '<div data-testid="esc-agent-shell"><slot /></div>',
};

function render(url, { escalated = {}, provide = {} } = {}) {
    usePage.mockReturnValue({
        url,
        props: {
            auth: { user: { id: 1, name: 'Admin User' } },
            escalated: { prefix: 'support', is_admin: true, is_agent: true, show_powered_by: false, ...escalated },
        },
    });

    return mount(EscalatedLayout, {
        props: { title: 'Tickets' },
        slots: { default: '<p data-testid="page-content">Page body</p>' },
        global: {
            provide,
            stubs: { AgentShell: AgentShellStub },
            mocks: { $t: (key) => key },
        },
    });
}

describe('EscalatedLayout: default behaviour is unchanged', () => {
    beforeEach(() => {
        usePage.mockReset();
        startFrameBridge.mockClear();
    });

    it('renders the standalone admin sidebar when no host layout is given', () => {
        const wrapper = render('/support/admin/tickets');
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-embedded-admin"]').exists()).toBe(false);
    });

    it('keeps the Escalated sidebar on admin pages when only `layout` is set', () => {
        const wrapper = render('/support/admin/tickets', { provide: { 'escalated-layout': HostLayout } });
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
    });

    it('keeps AgentShell on agent pages when only `layout` is set', () => {
        const wrapper = render('/support/agent/tickets', { provide: { 'escalated-layout': HostLayout } });
        expect(wrapper.find('[data-testid="esc-agent-shell"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
    });

    it('wraps customer pages in the host layout, as before', () => {
        const wrapper = render('/support', { provide: { 'escalated-layout': HostLayout } });
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="host-header"]').text()).toContain('My Tickets');
    });

    it('ignores an embed prop that says the page is not embedded', () => {
        const wrapper = render('/support/admin/tickets', {
            escalated: { embed: { enabled: false, mode: 'layout' }, navigation: [] },
        });
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(true);
        expect(startFrameBridge).not.toHaveBeenCalled();
    });
});

describe('EscalatedLayout: layoutScope opt-in', () => {
    beforeEach(() => usePage.mockReset());

    it('renders admin pages chrome-free inside the host layout', () => {
        const wrapper = render('/support/admin/tickets', {
            provide: { 'escalated-layout': HostLayout, 'escalated-layout-scope': ['customer', 'admin'] },
        });

        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(false);
        expect(wrapper.text()).not.toContain('Back to App');
        expect(wrapper.find('[data-testid="host-header"]').text()).toBe('Tickets');
        const embedded = wrapper.find('[data-testid="host-main"] [data-testid="esc-embedded-admin"]');
        expect(embedded.exists()).toBe(true);
        expect(embedded.find('[data-testid="page-content"]').exists()).toBe(true);
    });

    it('does not move customer pages out of the host layout when the scope omits them', () => {
        const wrapper = render('/support', {
            provide: { 'escalated-layout': HostLayout, 'escalated-layout-scope': ['admin'] },
        });
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="page-content"]').exists()).toBe(true);
    });

    it('wraps the agent workspace in the host layout when the scope lists agent', () => {
        const wrapper = render('/support/agent/tickets', {
            provide: { 'escalated-layout': HostLayout, 'escalated-layout-scope': ['agent'] },
        });
        expect(wrapper.find('[data-testid="host-main"] [data-testid="esc-agent-shell"]').exists()).toBe(true);
    });
});

describe('EscalatedLayout: server-side embed flag', () => {
    beforeEach(() => {
        usePage.mockReset();
        startFrameBridge.mockClear();
    });

    const embed = (extra = {}) => ({
        embed: {
            enabled: true,
            mode: 'layout',
            layout: null,
            base_url: '/backoffice/helpdesk',
            allowed_origins: [],
            ...extra,
        },
        navigation: [],
    });

    it('renders admin pages chrome-free under a host prefix that has no /admin in it', () => {
        const wrapper = render('/backoffice/helpdesk/tickets', { escalated: embed() });
        expect(wrapper.find('[data-testid="esc-embedded-admin"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="esc-admin-sidebar"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-embedded-title"]').text()).toBe('Tickets');
    });

    it('does not borrow the customer `layout` unless the scope lists admin', () => {
        const wrapper = render('/backoffice/helpdesk/tickets', {
            escalated: embed(),
            provide: { 'escalated-layout': HostLayout },
        });
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-embedded-admin"]').exists()).toBe(true);
    });

    it('uses the named layout the server asks for', () => {
        const wrapper = render('/backoffice/helpdesk/tickets', {
            escalated: embed({ layout: 'Layouts/AdminLayout' }),
            provide: { 'escalated-layout': HostLayout, 'escalated-layouts': { 'Layouts/AdminLayout': OtherLayout } },
        });
        expect(wrapper.find('[data-testid="other-layout"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
    });

    it('starts the iframe bridge in iframe mode and renders no host layout', () => {
        const wrapper = render('/backoffice/helpdesk/tickets', {
            escalated: embed({ mode: 'iframe', allowed_origins: ['https://admin.example.com'] }),
            provide: { 'escalated-layout': HostLayout, 'escalated-layout-scope': ['admin'] },
        });
        expect(wrapper.find('[data-testid="host-layout"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="esc-embedded-admin"]').attributes('data-esc-embed-mode')).toBe('iframe');
        expect(startFrameBridge).toHaveBeenCalledTimes(1);
        expect(startFrameBridge.mock.calls[0][0]).toMatchObject({
            allowedOrigins: ['https://admin.example.com'],
            baseUrl: '/backoffice/helpdesk',
        });
    });

    it('does not start the bridge in layout mode', () => {
        render('/backoffice/helpdesk/tickets', { escalated: embed() });
        expect(startFrameBridge).not.toHaveBeenCalled();
    });
});
