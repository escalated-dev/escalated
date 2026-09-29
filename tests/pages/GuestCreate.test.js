import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { router } from '@inertiajs/core';
import Create from '../../src/pages/Guest/Create.vue';

const state = vi.hoisted(() => ({ page: null }));
vi.mock('@inertiajs/vue3', async (original) => ({
    ...(await original()),
    usePage: () => state.page,
}));

let wrapper;
beforeEach(() => {
    state.page = reactive({ props: { escalated: { broadcasting: { channel_prefix: 'merchant-a' } } } });
    vi.stubGlobal('route', (name, token = '') => `/${name}/${token}`);
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
            ok: true,
            json: async () => ({ verification_id: 'challenge' }),
        })),
    );
});
afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function setup(props = {}) {
    wrapper = mount(Create, {
        props: {
            departments: [],
            priorities: ['medium'],
            verification_url: '/verify',
            lookup_url: '/lookup',
            ...props,
        },
        global: {
            stubs: { EscalatedLayout: { template: '<main><slot /></main>' }, FileDropzone: true },
            mocks: { route: globalThis.route },
        },
    });
}

describe('verified browser guest form', () => {
    it('posts the completed ticket with proof through the real Inertia form', async () => {
        const post = vi.spyOn(router, 'post').mockImplementation(() => {});
        setup();
        const form = wrapper.findAll('form')[0];
        const inputs = form.findAll('input');
        await inputs[0].setValue('Recipient');
        await inputs[1].setValue('guest@example.com');
        await inputs[2].setValue('Parcel');
        await form.find('textarea').setValue('Where is my parcel?');
        await form.trigger('submit');
        await flushPromises();
        expect(post).not.toHaveBeenCalled();
        await form.find('input[autocomplete="one-time-code"]').setValue('12345678');
        await form.trigger('submit');
        await flushPromises();
        expect(post.mock.calls[0][1]).toMatchObject({
            guest_name: 'Recipient',
            guest_email: 'guest@example.com',
            subject: 'Parcel',
            verification_id: 'challenge',
            verification_code: '12345678',
        });
    });

    it('clears proof and draft when the backend tenant namespace changes at the same URL', async () => {
        setup();
        const form = wrapper.findAll('form')[0];
        await form.find('input[type="email"]').setValue('guest@example.com');
        await form.trigger('submit');
        await flushPromises();
        expect(form.find('input[autocomplete="one-time-code"]').exists()).toBe(true);
        state.page.props.escalated.broadcasting.channel_prefix = 'merchant-b';
        await nextTick();
        expect(form.find('input[type="email"]').element.value).toBe('');
        expect(form.find('input[autocomplete="one-time-code"]').exists()).toBe(false);
    });

    it('discards private lookup results when the tenant changes during the request', async () => {
        setup();
        const form = wrapper.findAll('form')[1];
        await form.find('input[type="email"]').setValue('guest@example.com');
        await form.find('input[type="text"]').setValue('TRACK-1');
        await form.trigger('submit');
        await flushPromises();
        await form.find('input[autocomplete="one-time-code"]').setValue('12345678');
        let finish;
        fetch.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        await form.trigger('submit');
        await flushPromises();
        state.page.props.escalated.broadcasting.channel_prefix = 'merchant-b';
        finish({
            ok: true,
            json: async () => ({
                data: [{ reference: 'PRIVATE', subject: 'Private parcel', guest_access_token: 'old-grant' }],
            }),
        });
        await flushPromises();
        expect(wrapper.text()).not.toContain('Private parcel');
        expect(form.find('input[type="email"]').element.value).toBe('');
    });
});
