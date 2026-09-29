import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Widget from '../../src/widget/EscalatedWidget.vue';

let wrapper;
afterEach(() => {
    wrapper?.unmount();
    vi.unstubAllGlobals();
});

async function setup() {
    const calls = [];
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url, options) => {
            calls.push({ url, options, body: options.body ? JSON.parse(options.body) : null });
            let data;
            if (url.endsWith('/config'))
                data = { guest_verification_required: true, kb_enabled: false, departments: [] };
            else if (url.endsWith('/availability')) data = { available: true };
            else if (url.endsWith('/verification')) data = { verification_id: 'challenge', expires_in: 600 };
            else if (url.endsWith('/lookup'))
                data = { data: [{ reference: 'ESC-1', subject: 'Parcel', guest_access_token: 'sealed-token' }] };
            else if (url.endsWith('/tickets/ESC-1'))
                data = { reference: 'ESC-1', subject: 'Parcel', status: 'open', status_label: 'Open', replies: [] };
            else if (url.endsWith('/chat/start'))
                data = { id: 'sealed-chat-token', session_id: 'sealed-chat-token', status: 'waiting' };
            else data = { reference: 'ESC-1', guest_access_token: 'sealed-token' };
            return { ok: true, json: async () => data };
        }),
    );
    wrapper = mount(Widget);
    await flushPromises();
    await wrapper.find('.esc-w-fab').trigger('click');
    return calls;
}

async function tab(text) {
    await wrapper
        .findAll('.esc-w-tab')
        .find((button) => button.text().includes(text))
        .trigger('click');
}

describe('verified guest widget', () => {
    it('requests a code before creating a ticket and submits proof with the form', async () => {
        const calls = await setup();
        await tab('Contact');
        const inputs = wrapper.findAll('form input');
        await inputs[0].setValue('Guest');
        await inputs[1].setValue('guest@example.com');
        await inputs[2].setValue('Parcel');
        await wrapper.find('form textarea').setValue('Details');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.some((call) => call.url.endsWith('/tickets'))).toBe(false);
        expect(calls.find((call) => call.url.endsWith('/verification')).body).toEqual({
            email: 'guest@example.com',
            purpose: 'ticket',
        });
        await wrapper.find('input[autocomplete="one-time-code"]').setValue('12345678');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.find((call) => call.url.endsWith('/tickets')).body).toMatchObject({
            verification_id: 'challenge',
            verification_code: '12345678',
            email: 'guest@example.com',
        });
        expect(wrapper.text()).toContain('Ticket Submitted');
    });

    it('uses verified tracking lookup and a bearer header to read status', async () => {
        const calls = await setup();
        await tab('Status');
        await wrapper.find('input[type="email"]').setValue('guest@example.com');
        await wrapper.find('input[type="text"]').setValue('TRACK-1');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.some((call) => call.url.includes('/tickets/'))).toBe(false);
        await wrapper.find('input[autocomplete="one-time-code"]').setValue('12345678');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.find((call) => call.url.endsWith('/lookup')).body).toMatchObject({
            reference: 'TRACK-1',
            verification_code: '12345678',
        });
        const read = calls.find((call) => call.url.endsWith('/tickets/ESC-1'));
        expect(read.options.headers.Authorization).toBe('Bearer sealed-token');
        expect(read.url).not.toContain('email=');
        expect(wrapper.text()).toContain('Parcel');
    });

    it('requires the chat-specific email code before starting a chat', async () => {
        const calls = await setup();
        await tab('Chat');
        await wrapper.find('input[type="text"]').setValue('Guest');
        await wrapper.find('input[type="email"]').setValue('guest@example.com');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.some((call) => call.url.endsWith('/chat/start'))).toBe(false);
        expect(calls.find((call) => call.url.endsWith('/verification')).body.purpose).toBe('chat');
        await wrapper.find('input[autocomplete="one-time-code"]').setValue('12345678');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(calls.find((call) => call.url.endsWith('/chat/start')).body.verification_code).toBe('12345678');
    });

    it('discards a private lookup response after the form email changes', async () => {
        const calls = await setup();
        await tab('Status');
        await wrapper.find('input[type="email"]').setValue('guest@example.com');
        await wrapper.find('input[type="text"]').setValue('TRACK-1');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        await wrapper.find('input[autocomplete="one-time-code"]').setValue('12345678');
        let finish;
        fetch.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        await wrapper.find('input[type="email"]').setValue('other@example.com');
        finish({
            ok: true,
            json: async () => ({
                data: [{ reference: 'ESC-PRIVATE', subject: 'Private parcel', guest_access_token: 'old-token' }],
            }),
        });
        await flushPromises();
        expect(calls.some((call) => call.url.includes('ESC-PRIVATE'))).toBe(false);
        expect(wrapper.text()).not.toContain('Private parcel');
    });

    it('discards a successful ticket response after the widget destination changes', async () => {
        await setup();
        await tab('Contact');
        const inputs = wrapper.findAll('form input');
        await inputs[0].setValue('Guest');
        await inputs[1].setValue('guest@example.com');
        await inputs[2].setValue('Parcel');
        await wrapper.find('form textarea').setValue('Details');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        await wrapper.find('input[autocomplete="one-time-code"]').setValue('12345678');
        let finish;
        fetch.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        await wrapper.setProps({ widgetPath: '/another-merchant/widget' });
        finish({ ok: true, json: async () => ({ reference: 'ESC-PRIVATE', guest_access_token: 'old-token' }) });
        await flushPromises();
        expect(wrapper.text()).not.toContain('ESC-PRIVATE');
        expect(wrapper.text()).not.toContain('Ticket Submitted');
        expect(wrapper.find('input[type="email"]').element.value).toBe('');
    });
});
