import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WebhookForm from '../../src/pages/Admin/Webhooks/Form.vue';
import SsoSettings from '../../src/pages/Admin/Settings/SsoSettings.vue';

/**
 * Stored secrets never reach the page.
 *
 * Backends send a webhook's `has_secret` (boolean) instead of its signing
 * secret: a blank secret on save keeps the stored one and `clear_secret: true`
 * removes it. Backends that still send `secret` keep the old behaviour (the
 * field is filled in and posted back as it is).
 *
 * SSO secrets arrive as a mask (`********`); posting the mask back keeps the
 * stored value.
 */
const submitted = vi.hoisted(() => ({ forms: [] }));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');

    return {
        useForm: vi.fn((data) => {
            const form = reactive({
                ...data,
                processing: false,
                errors: {},
                data() {
                    return Object.fromEntries(Object.keys(data).map((key) => [key, form[key]]));
                },
            });
            form.post = vi.fn(() => submitted.forms.push(form.data()));
            form.put = vi.fn(() => submitted.forms.push(form.data()));
            return form;
        }),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support', is_admin: true } } })),
        router: { post: vi.fn() },
        Link: { template: '<a><slot /></a>' },
    };
});

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

const events = ['ticket.created', 'ticket.updated'];

function mountWebhook(webhook) {
    return mount(WebhookForm, { props: { webhook, availableEvents: events }, ...mountOptions });
}

function secretInput(wrapper) {
    return wrapper.find('[data-testid="webhook-secret"]');
}

beforeEach(() => {
    submitted.forms = [];
});

describe('Admin/Webhooks/Form with has_secret', () => {
    const stored = {
        id: 4,
        url: 'https://hooks.example.com/escalated',
        events: ['ticket.created'],
        active: true,
        has_secret: true,
    };

    it('says a secret is set and leaves the field blank', () => {
        const wrapper = mountWebhook(stored);

        expect(wrapper.text()).toContain('A secret is set. Leave blank to keep it.');
        expect(secretInput(wrapper).element.value).toBe('');
        expect(wrapper.find('[data-testid="webhook-remove-secret"]').exists()).toBe(true);
    });

    it('posts a blank secret and clear_secret false when the secret is left alone', async () => {
        const wrapper = mountWebhook(stored);

        await wrapper.find('form').trigger('submit');

        expect(submitted.forms).toHaveLength(1);
        expect(submitted.forms[0]).toMatchObject({ secret: '', clear_secret: false });
    });

    it('posts a new secret typed into the field', async () => {
        const wrapper = mountWebhook(stored);

        await secretInput(wrapper).setValue('whsec-rotated');
        await wrapper.find('form').trigger('submit');

        expect(submitted.forms[0]).toMatchObject({ secret: 'whsec-rotated', clear_secret: false });
    });

    it('posts clear_secret true after Remove secret, and can undo it', async () => {
        const wrapper = mountWebhook(stored);

        await wrapper.find('[data-testid="webhook-remove-secret"]').trigger('click');
        expect(wrapper.text()).toContain('The secret will be removed when you save.');
        expect(secretInput(wrapper).exists()).toBe(false);

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0]).toMatchObject({ secret: '', clear_secret: true });

        await wrapper.find('[data-testid="webhook-keep-secret"]').trigger('click');
        expect(secretInput(wrapper).exists()).toBe(true);
        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[1]).toMatchObject({ secret: '', clear_secret: false });
    });

    it('offers no Remove secret control when no secret is stored', () => {
        const wrapper = mountWebhook({ ...stored, has_secret: false });

        expect(wrapper.text()).not.toContain('A secret is set');
        expect(wrapper.find('[data-testid="webhook-remove-secret"]').exists()).toBe(false);
    });
});

describe('Admin/Webhooks/Form with a backend that still sends secret', () => {
    const legacy = {
        id: 4,
        url: 'https://hooks.example.com/escalated',
        events: ['ticket.created'],
        active: true,
        secret: 'whsec-legacy',
    };

    it('fills the field in and posts it back unchanged, without clear_secret', async () => {
        const wrapper = mountWebhook(legacy);

        expect(secretInput(wrapper).element.value).toBe('whsec-legacy');
        expect(wrapper.find('[data-testid="webhook-remove-secret"]').exists()).toBe(false);

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0].secret).toBe('whsec-legacy');
        expect(submitted.forms[0]).not.toHaveProperty('clear_secret');
    });
});

describe('Admin/Webhooks/Form when creating', () => {
    it('posts the entered secret without clear_secret', async () => {
        const wrapper = mountWebhook(null);

        expect(wrapper.text()).not.toContain('A secret is set');
        await wrapper.find('input[type="url"]').setValue('https://hooks.example.com/new');
        await secretInput(wrapper).setValue('whsec-new');
        await wrapper.find('form').trigger('submit');

        expect(submitted.forms[0]).toMatchObject({ url: 'https://hooks.example.com/new', secret: 'whsec-new' });
        expect(submitted.forms[0]).not.toHaveProperty('clear_secret');
    });
});

describe('Admin/Settings/SsoSettings masked secrets', () => {
    function mountSso(settings) {
        return mount(SsoSettings, { props: { settings }, ...mountOptions });
    }

    it('says a stored secret is set and posts the mask back so it is kept', async () => {
        const wrapper = mountSso({
            sso_provider: 'jwt',
            sso_jwt_secret: '********',
            sso_oauth_client_secret: '********',
        });

        expect(wrapper.find('[data-testid="sso-jwt-secret-set"]').exists()).toBe(true);

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0]).toMatchObject({
            sso_jwt_secret: '********',
            sso_oauth_client_secret: '********',
        });
    });

    it('shows the client secret hint for oauth when one is stored', () => {
        const wrapper = mountSso({ sso_provider: 'oauth', sso_oauth_client_secret: '********' });

        expect(wrapper.find('[data-testid="sso-oauth-secret-set"]').exists()).toBe(true);
    });

    it('shows no hint when no secret is stored', () => {
        const wrapper = mountSso({ sso_provider: 'jwt', sso_jwt_secret: '' });

        expect(wrapper.find('[data-testid="sso-jwt-secret-set"]').exists()).toBe(false);
    });
});
