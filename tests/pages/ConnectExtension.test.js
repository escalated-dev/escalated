import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ConnectExtension from '../../src/pages/Agent/ConnectExtension.vue';

const router = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@inertiajs/vue3', () => ({
    router,
    usePage: () => ({ url: '/support/agent/connect-extension', props: { escalated: { prefix: 'support' } } }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

const props = {
    client_name: 'Escalated for Chrome',
    extension_id: 'abcdefghijklmnopabcdefghijklmnop',
    origin_host: 'abcdefghijklmnopabcdefghijklmnop.chromiumapp.org',
    approve_url: '/support/agent/connect-extension/approve',
    deny_url: '/support/agent/connect-extension/deny',
    params: {
        redirect_uri: 'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/',
        state: 'xyz',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
        client_name: 'Escalated for Chrome',
    },
};

const mountPage = (overrides = {}) =>
    mount(ConnectExtension, {
        props: { ...props, ...overrides },
        global: { stubs: { EscalatedLayout: { template: '<div><slot /></div>' } } },
    });

const button = (wrapper, label) => wrapper.findAll('button').find((b) => b.text() === label);

beforeEach(() => vi.clearAllMocks());

describe('Agent/ConnectExtension', () => {
    it('shows the title, the client name and the extension ID prominently', () => {
        const wrapper = mountPage();
        expect(wrapper.text()).toContain('Connect browser extension');
        expect(wrapper.text()).toContain('Escalated for Chrome');
        expect(wrapper.get('[data-testid="extension-id"]').text()).toBe(props.extension_id);
        expect(wrapper.text()).toContain(props.origin_host);
    });

    it('tells the agent what approving allows', () => {
        expect(mountPage().text()).toContain('read and answer tickets as you until you revoke it');
    });

    it('escapes a hostile client name rather than rendering it as markup', () => {
        const wrapper = mountPage({ client_name: '<img src=x onerror=alert(1)>' });
        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('<img src=x onerror=alert(1)>');
    });

    it('does nothing until a button is clicked', () => {
        mountPage();
        expect(router.post).not.toHaveBeenCalled();
    });

    it('posts the original parameters to approve_url on Approve', async () => {
        const wrapper = mountPage();
        await button(wrapper, 'Approve').trigger('click');
        expect(router.post).toHaveBeenCalledTimes(1);
        expect(router.post.mock.calls[0][0]).toBe(props.approve_url);
        expect(router.post.mock.calls[0][1]).toEqual(props.params);
    });

    it('posts the original parameters to deny_url on Deny', async () => {
        const wrapper = mountPage();
        await button(wrapper, 'Deny').trigger('click');
        expect(router.post).toHaveBeenCalledTimes(1);
        expect(router.post.mock.calls[0][0]).toBe(props.deny_url);
        expect(router.post.mock.calls[0][1]).toEqual(props.params);
    });

    it('does not submit twice while a request is in flight', async () => {
        const wrapper = mountPage();
        await button(wrapper, 'Approve').trigger('click');
        await button(wrapper, 'Approve').trigger('click');
        expect(router.post).toHaveBeenCalledTimes(1);
    });
});
