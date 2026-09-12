import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TwoFactorChallenge from '../../src/pages/Auth/TwoFactorChallenge.vue';

/**
 * The post-login two-factor challenge.
 *
 * A backend renders it after a password has been accepted and before anyone is
 * let into the panel. `escalated-adonis` has rendered
 * `Escalated/Auth/TwoFactorChallenge` with no component behind it, which means
 * the challenge screen was blank — and a blank challenge is not a locked door,
 * it is a dead end for anyone with 2FA enabled.
 */
const mockForm = vi.hoisted(() => ({
    code: '',
    recovery_code: '',
    processing: false,
    errors: {},
    post: vi.fn(),
    clearErrors: vi.fn(),
    transform: vi.fn(),
}));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');
    const form = reactive(mockForm);

    // transform() returns the form so the call chains, and records what it
    // would have sent.
    form.transform = vi.fn((fn) => {
        form.__transformed = fn({ code: form.code, recovery_code: form.recovery_code });

        return form;
    });

    return {
        useForm: vi.fn((data) => {
            Object.assign(form, data);
            return form;
        }),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support' } } })),
        router: { post: vi.fn() },
        Link: { template: '<a><slot /></a>' },
    };
});

vi.stubGlobal(
    'route',
    vi.fn((name) => `/${name}`),
);

const mountOptions = { global: { mocks: { route: (name) => `/${name}` } } };

beforeEach(() => {
    vi.clearAllMocks();
    mockForm.code = '';
    mockForm.recovery_code = '';
    mockForm.errors = {};
});

describe('Auth/TwoFactorChallenge', () => {
    it('asks for an authenticator code first', () => {
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });

        expect(wrapper.find('#totp-code').exists()).toBe(true);
        expect(wrapper.find('#recovery-code').exists()).toBe(false);
    });

    it('does not render the signed-in chrome', () => {
        // The sign-in is not finished at this point, so nothing here should
        // suggest access that has not been granted.
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });

        expect(wrapper.html()).not.toContain('EscalatedLayout');
        expect(wrapper.find('nav').exists()).toBe(false);
    });

    it('swaps to a recovery code on request', async () => {
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });
        await wrapper
            .findAll('button')
            .find((b) => b.text().includes('recovery code'))
            .trigger('click');

        expect(wrapper.find('#recovery-code').exists()).toBe(true);
        expect(wrapper.find('#totp-code').exists()).toBe(false);
    });

    it('clears what was typed when swapping, so a half-entered code is not carried over', async () => {
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });
        mockForm.code = '123';

        await wrapper
            .findAll('button')
            .find((b) => b.text().includes('recovery code'))
            .trigger('click');

        expect(mockForm.code).toBe('');
        expect(mockForm.clearErrors).toHaveBeenCalled();
    });

    it('sends only the field in use', async () => {
        // A blank companion field must not read as an attempt with an empty
        // code.
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });
        mockForm.code = '654321';

        await wrapper.find('form').trigger('submit');

        expect(mockForm.__transformed).toEqual({ code: '654321' });
        expect(mockForm.post).toHaveBeenCalled();
    });

    it('sends the recovery code when that is the mode', async () => {
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });
        await wrapper
            .findAll('button')
            .find((b) => b.text().includes('recovery code'))
            .trigger('click');

        mockForm.recovery_code = 'abcd-efgh';
        await wrapper.find('form').trigger('submit');

        expect(mockForm.__transformed).toEqual({ recovery_code: 'abcd-efgh' });
    });

    it('posts to the action the backend supplied', async () => {
        // A host mounts Escalated under its own prefix, and this page is reached
        // before any layout has resolved one.
        const wrapper = mount(TwoFactorChallenge, {
            props: { action: '/support/two-factor/challenge' },
            ...mountOptions,
        });

        await wrapper.find('form').trigger('submit');

        expect(mockForm.post).toHaveBeenCalledWith('/support/two-factor/challenge');
    });

    it('shows an error the backend passed', () => {
        const wrapper = mount(TwoFactorChallenge, {
            props: { error: 'That code has expired.' },
            ...mountOptions,
        });

        expect(wrapper.text()).toContain('That code has expired.');
    });

    it('shows a validation error from the form', () => {
        mockForm.errors = { code: 'Invalid code.' };
        const wrapper = mount(TwoFactorChallenge, { props: {}, ...mountOptions });

        expect(wrapper.text()).toContain('Invalid code.');
    });
});
