import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ApiTokens from '../../src/pages/Admin/ApiTokens/Index.vue';
import TwoFactor from '../../src/pages/Admin/Settings/TwoFactor.vue';

const state = vi.hoisted(() => ({ page: null, form: null, post: vi.fn() }));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');
    state.page = reactive({ props: {} });
    state.form = reactive({ post: vi.fn(), reset: vi.fn() });
    return {
        usePage: () => state.page,
        useForm: (data) => Object.assign(state.form, data),
        router: { post: state.post },
        Link: { template: '<a><slot /></a>' },
    };
});

let wrapper;
let errors;
const uri = 'otpauth://totp/Fixture?secret=JBSWY3DPEHPK3PXP&issuer=Fixture';
const codes = ['fixture-recovery-1', 'fixture-recovery-2'];

function render(component, props = {}) {
    wrapper = mount(component, {
        props,
        global: {
            stubs: { EscalatedLayout: { template: '<main><slot /></main>' } },
            mocks: { route: (name) => `/${name}` },
            config: { errorHandler: (error) => errors.push(error) },
        },
    });
    return wrapper;
}

function button(text) {
    const matches = wrapper.findAll('button').filter((entry) => entry.text() === text);
    expect(matches.length, `button: ${text}`).toBeGreaterThan(0);
    return matches.at(-1);
}

async function createToken(page) {
    await button('Create Token').trigger('click');
    state.form.name = 'Fixture token';
    state.form.user_id = '1';
    await nextTick();
    await button('Create Token').trigger('click');
    const [, options] = state.form.post.mock.lastCall;
    options.onSuccess(page);
    await nextTick();
}

beforeEach(() => {
    vi.clearAllMocks();
    state.page.props = { escalated: { prefix: 'support' }, errors: {} };
    delete state.page.flash;
    errors = [];
    vi.stubGlobal('route', (name) => `/${name}`);
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue() } });
});

afterEach(() => {
    wrapper?.unmount();
    vi.unstubAllGlobals();
});

describe('API token flash contracts', () => {
    for (const shape of ['legacy', 'top-level', 'both']) {
        it(`shows the token returned through ${shape} flash`, async () => {
            render(ApiTokens, { tokens: [], users: [], api_enabled: true });
            const page = { props: {} };
            if (shape !== 'top-level') page.props.flash = { plain_text_token: 'legacy-token' };
            if (shape !== 'legacy') page.flash = { plain_text_token: 'current-token' };
            await createToken(page);
            expect(wrapper.text()).toContain(shape === 'legacy' ? 'legacy-token' : 'current-token');
            if (shape === 'both') expect(wrapper.text()).not.toContain('legacy-token');
            expect(state.form.post.mock.lastCall[0]).toBe('/support/admin/api-tokens');
            expect(state.form.reset).toHaveBeenCalled();
        });
    }

    it('preserves shared flash when the adapter supplies an empty top-level map', async () => {
        render(ApiTokens, { tokens: [], users: [], api_enabled: true });
        await createToken({ props: { flash: { plain_text_token: 'shared-token' } }, flash: {} });
        expect(wrapper.text()).toContain('shared-token');
    });

    it('clears a previous token when a later success has no token or explicitly clears it', async () => {
        render(ApiTokens, { tokens: [], users: [], api_enabled: true });
        await createToken({ props: { flash: { plain_text_token: 'previous-token' } } });
        expect(wrapper.text()).toContain('previous-token');
        await createToken({ props: {}, flash: {} });
        expect(wrapper.text()).not.toContain('previous-token');
        await createToken({ props: { flash: { plain_text_token: 'stale-token' } }, flash: { plain_text_token: null } });
        expect(wrapper.text()).not.toContain('stale-token');
    });

    it('dismisses the displayed token', async () => {
        render(ApiTokens, { tokens: [], users: [], api_enabled: true });
        await createToken({ props: { flash: { plain_text_token: 'single-view-token' } } });
        await button('Dismiss').trigger('click');
        expect(wrapper.text()).not.toContain('single-view-token');
    });
});

describe('two-factor flash contracts', () => {
    for (const shape of ['legacy', 'top-level']) {
        it(`shows setup and recovery data from ${shape} flash`, async () => {
            const flash = { two_factor_setup: { qr_uri: uri } };
            if (shape === 'legacy') state.page.props.flash = flash;
            else state.page.flash = flash;
            render(TwoFactor);
            expect(wrapper.text()).toContain(uri);
            if (shape === 'legacy') state.page.props.flash = { two_factor_confirmed: { recovery_codes: codes } };
            else state.page.flash = { two_factor_confirmed: { recovery_codes: codes } };
            await wrapper.setProps({ enabled: true });
            expect(wrapper.text()).toContain(codes[0]);
            expect(wrapper.text()).not.toContain(uri);
        });
    }

    it('reacts to top-level flash arriving after the setup request', async () => {
        state.page.flash = {};
        render(TwoFactor);
        await button('Set Up Two-Factor Authentication').trigger('click');
        state.page.flash = { two_factor_setup: { qr_uri: uri } };
        state.post.mock.lastCall[2].onSuccess();
        await nextTick();
        expect(wrapper.text()).toContain(uri);
        state.page.flash = {};
        await nextTick();
        expect(wrapper.text()).not.toContain(uri);
        expect(wrapper.text()).toContain('Set Up Two-Factor Authentication');
    });

    it('cancels setup and allows another attempt without showing the old URI', async () => {
        state.page.props.flash = { two_factor_setup: { qr_uri: uri } };
        render(TwoFactor);
        await button('Next: Verify Code').trigger('click');
        await button('Cancel').trigger('click');
        expect(wrapper.text()).not.toContain(uri);
        expect(wrapper.text()).toContain('Set Up Two-Factor Authentication');
        await button('Set Up Two-Factor Authentication').trigger('click');
        expect(state.post).toHaveBeenCalledOnce();
    });

    it('copies the displayed recovery codes without a template runtime error', async () => {
        state.page.props.flash = { two_factor_confirmed: { recovery_codes: codes } };
        render(TwoFactor, { enabled: true });
        await button('Copy Codes').trigger('click');
        await flushPromises();
        expect(errors).toEqual([]);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(codes.join('\n'));
    });

    it('keeps recovery codes readable when the clipboard is unavailable or rejected', async () => {
        state.page.flash = { two_factor_confirmed: { recovery_codes: codes } };
        render(TwoFactor, { enabled: true });
        navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Permission denied'));
        await button('Copy Codes').trigger('click');
        await flushPromises();
        expect(wrapper.get('[role="alert"]').text()).toContain('Select and copy the codes below');
        expect(wrapper.text()).toContain(codes[0]);
        navigator.clipboard = undefined;
        await button('Copy Codes').trigger('click');
        await flushPromises();
        expect(errors).toEqual([]);
        expect(wrapper.text()).toContain(codes[1]);
    });

    it('sends one setup request at a time and permits retry after it finishes', async () => {
        render(TwoFactor);
        await button('Set Up Two-Factor Authentication').trigger('click');
        await button('Set Up Two-Factor Authentication').trigger('click');
        expect(state.post).toHaveBeenCalledOnce();
        state.post.mock.lastCall[2].onFinish();
        await nextTick();
        await button('Set Up Two-Factor Authentication').trigger('click');
        expect(state.post).toHaveBeenCalledTimes(2);
    });

    it('keeps setup available when a response does not contain setup data', async () => {
        render(TwoFactor);
        await button('Set Up Two-Factor Authentication').trigger('click');
        state.post.mock.lastCall[2].onSuccess();
        await nextTick();
        expect(wrapper.text()).toContain('Set Up Two-Factor Authentication');
    });

    it('lets explicit top-level null clear legacy setup and recovery data', () => {
        state.page.props.flash = { two_factor_setup: { qr_uri: uri }, two_factor_confirmed: { recovery_codes: codes } };
        state.page.flash = { two_factor_setup: null, two_factor_confirmed: null };
        render(TwoFactor);
        expect(wrapper.text()).not.toContain(uri);
        expect(wrapper.text()).not.toContain(codes[0]);
    });
});
