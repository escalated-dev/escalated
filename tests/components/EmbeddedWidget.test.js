import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Widget from '../../src/widget/EscalatedWidget.vue';

let wrapper;
afterEach(() => {
    wrapper?.unmount();
    vi.unstubAllGlobals();
});

async function setup(props = {}, config = {}) {
    const calls = [];
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url, options) => {
            calls.push({ url, body: options.body ? JSON.parse(options.body) : null });
            let data;
            if (url.endsWith('/config'))
                data = {
                    kb_enabled: true,
                    departments: [
                        { id: 1, name: 'Fulfillment' },
                        { id: 2, name: 'Delivery' },
                    ],
                    ...config,
                };
            else if (url.endsWith('/availability')) data = { available: true };
            else if (url.endsWith('/chat/start')) data = { id: 'chat-1', session_id: 'chat-1', status: 'waiting' };
            else data = { reference: 'ESC-1', guest_access_token: 'grant' };
            return { ok: true, json: async () => data };
        }),
    );
    wrapper = mount(Widget, { props: { baseUrl: 'https://help.example.com', ...props } });
    await flushPromises();
    return calls;
}

const tabLabels = () => wrapper.findAll('.esc-w-tab').map((tab) => tab.text());

async function submitTicket() {
    const inputs = wrapper.findAll('form input');
    if (!inputs[0].element.value) await inputs[0].setValue('Jane');
    if (!inputs[1].element.value) await inputs[1].setValue('jane@example.com');
    if (!inputs[2].element.value) await inputs[2].setValue('Late parcel');
    await wrapper.find('form textarea').setValue('Still waiting.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
}

describe('embedded widget', () => {
    it('renders inline as an always-open panel without a launcher', async () => {
        await setup({ mode: 'inline' });

        expect(wrapper.find('.esc-w-fab').exists()).toBe(false);
        const panel = wrapper.find('[data-widget-panel]');
        expect(panel.classes()).toEqual(expect.arrayContaining(['esc-w-inline', 'esc-open']));
        expect(panel.classes()).not.toContain('bottom-right');
    });

    it('can hide the launcher and open from the host page', async () => {
        await setup({ hideLauncher: true });
        expect(wrapper.find('.esc-w-fab').exists()).toBe(false);

        wrapper.vm.open('contact');
        await flushPromises();

        expect(wrapper.find('[data-widget-panel]').classes()).toContain('esc-open');
        expect(wrapper.find('.esc-w-tab.active').text()).toBe('Contact');
    });

    it('opens on load when asked', async () => {
        await setup({ openOnLoad: true });

        expect(wrapper.find('[data-widget-panel]').classes()).toContain('esc-open');
    });

    it('offers only the tabs the host lists, in that order', async () => {
        await setup({ tabs: ['chat', 'contact'] });

        expect(tabLabels()).toEqual(['Chat', 'Contact']);
        expect(wrapper.find('.esc-w-tab.active').text()).toBe('Chat');
    });

    it('hides the tab bar when one tab is offered, as a plain support form', async () => {
        await setup({ mode: 'inline', tabs: ['contact'] });

        expect(wrapper.find('.esc-w-tabs').exists()).toBe(false);
        expect(wrapper.find('form textarea').exists()).toBe(true);
    });

    it('starts on the requested tab', async () => {
        await setup({ defaultTab: 'status' });

        expect(wrapper.find('.esc-w-tab.active').text()).toBe('Check Status');
    });

    it('falls back to the first offered tab when the default is not available', async () => {
        await setup({ defaultTab: 'help' }, { kb_enabled: false });

        expect(wrapper.find('.esc-w-tab.active').text()).toBe('Contact');
    });

    it('prefills what the host knows about the visitor', async () => {
        await setup({
            defaultTab: 'contact',
            prefill: { name: 'Jane', email: 'jane@example.com', subject: 'Order A-1001' },
        });

        const inputs = wrapper.findAll('form input');
        expect(inputs[0].element.value).toBe('Jane');
        expect(inputs[1].element.value).toBe('jane@example.com');
        expect(inputs[2].element.value).toBe('Order A-1001');
    });

    it('identify() fills empty fields without overwriting what the visitor typed', async () => {
        await setup({ defaultTab: 'contact' });
        const inputs = wrapper.findAll('form input');
        await inputs[0].setValue('Typed Name');

        wrapper.vm.identify({ name: 'Jane', email: 'jane@example.com' });
        await flushPromises();

        expect(inputs[0].element.value).toBe('Typed Name');
        expect(inputs[1].element.value).toBe('jane@example.com');
    });

    it('locks the department: no choice shown, and the ticket is sent to it', async () => {
        const calls = await setup({ defaultTab: 'contact', department: 2, lockDepartment: true });

        expect(wrapper.find('select').exists()).toBe(false);
        await submitTicket();

        expect(calls.find((call) => call.url.endsWith('/tickets')).body.department_id).toBe(2);
    });

    it('preselects an unlocked department and still lets the visitor change it', async () => {
        await setup({ defaultTab: 'contact', department: 1 });

        expect(wrapper.find('select').element.value).toBe('1');
    });

    it('sends host parameters and the page to a backend that accepts them', async () => {
        const calls = await setup(
            {
                defaultTab: 'contact',
                metadata: { order_number: 'A-1001' },
                metadataProvider: () => ({ cart_total: 42 }),
            },
            { accepts_metadata: true },
        );
        wrapper.vm.setMetadata({ plan: 'pro' });

        await submitTicket();

        expect(calls.find((call) => call.url.endsWith('/tickets')).body.metadata).toEqual({
            order_number: 'A-1001',
            plan: 'pro',
            cart_total: 42,
            page_url: window.location.origin + window.location.pathname,
        });
    });

    it('sends host parameters when a live chat starts', async () => {
        const calls = await setup(
            { defaultTab: 'chat', metadata: { order_number: 'A-1001' } },
            { accepts_metadata: true },
        );
        const inputs = wrapper.findAll('form input');
        await inputs[0].setValue('Jane');
        await inputs[1].setValue('jane@example.com');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(calls.find((call) => call.url.endsWith('/chat/start')).body.metadata).toMatchObject({
            order_number: 'A-1001',
        });
    });

    it('never sends metadata to a backend that does not advertise support', async () => {
        const calls = await setup({ defaultTab: 'contact', metadata: { order_number: 'A-1001' } });

        await submitTicket();

        expect(calls.find((call) => call.url.endsWith('/tickets')).body).not.toHaveProperty('metadata');
    });

    it('survives a metadata function that throws', async () => {
        const calls = await setup(
            {
                defaultTab: 'contact',
                metadataProvider: () => {
                    throw new Error('host bug');
                },
            },
            { accepts_metadata: true },
        );

        await submitTicket();

        expect(calls.find((call) => call.url.endsWith('/tickets')).body.metadata).toHaveProperty('page_url');
    });

    it('uses the host title and greeting', async () => {
        await setup({ title: 'Acme Help', greeting: 'Questions about your order?' });

        expect(wrapper.find('.esc-w-header h2').text()).toBe('Acme Help');
        expect(wrapper.find('.esc-w-header p').text()).toBe('Questions about your order?');
    });
});
