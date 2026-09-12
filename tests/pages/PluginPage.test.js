import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Page from '../../src/pages/Plugin/Page.vue';

/**
 * A full page registered by a plugin.
 *
 * The backend declares the route and renders this page with a component name;
 * `defineEscalatedPlugin` registers that component globally. Two backends
 * render `Escalated/Plugin/Page` and there was no component behind the name, so
 * every plugin page was blank — and blank the same way whether the plugin was
 * installed or not, which is the part worth fixing.
 */
vi.mock('@inertiajs/vue3', () => ({
    usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support', is_admin: true } } })),
    Link: { template: '<a><slot /></a>' },
    router: { post: vi.fn() },
}));

const BillingPanel = {
    props: { invoiceId: { type: Number, default: null } },
    template: '<div class="billing-panel">Invoice {{ invoiceId }}</div>',
};

function mountPage(props, components = {}) {
    return mount(Page, {
        props,
        global: {
            stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
            mocks: { route: (name) => `/${name}` },
            components,
        },
    });
}

describe('Plugin/Page', () => {
    it('renders the component the plugin registered', () => {
        const wrapper = mountPage(
            { plugin: 'billing', component: 'BillingPanel', props: { invoiceId: 42 } },
            { BillingPanel },
        );

        expect(wrapper.find('.billing-panel').exists()).toBe(true);
    });

    it('passes the backend props through to it', () => {
        const wrapper = mountPage(
            { plugin: 'billing', component: 'BillingPanel', props: { invoiceId: 42 } },
            { BillingPanel },
        );

        expect(wrapper.text()).toContain('Invoice 42');
    });

    it('says which component is missing rather than rendering nothing', () => {
        // The backend route exists either way, so a plugin installed on the
        // server but not on the frontend used to look identical to a broken
        // page.
        const wrapper = mountPage({ plugin: 'billing', component: 'BillingPanel', props: {} });

        expect(wrapper.text()).toContain('billing');
        expect(wrapper.text()).toContain('BillingPanel');
        expect(wrapper.find('.billing-panel').exists()).toBe(false);
    });

    it('does not render an unregistered name as a literal element', () => {
        // resolveComponent returns the name as a string when nothing matches,
        // which would put <BillingPanel> in the DOM as an unknown element.
        const wrapper = mountPage({ plugin: 'billing', component: 'BillingPanel', props: {} });

        expect(wrapper.html()).not.toContain('<BillingPanel');
    });

    it('copes with no component name at all', () => {
        const wrapper = mountPage({ plugin: 'billing', component: '', props: {} });

        expect(wrapper.text()).toContain('(unnamed)');
    });

    it('copes with no props', () => {
        const wrapper = mountPage({ plugin: 'billing', component: 'BillingPanel' }, { BillingPanel });

        expect(wrapper.find('.billing-panel').exists()).toBe(true);
    });
});
