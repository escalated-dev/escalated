import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApiTokens from '../../src/pages/Admin/ApiTokens/Index.vue';
import { setLocale } from '../../src/composables/useI18n';
import locales from '../../src/locales/index.js';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ props: { escalated: { prefix: 'support' } } }),
    useForm: (data) => ({ ...data, post: vi.fn(), delete: vi.fn(), reset: vi.fn() }),
    router: { post: vi.fn() },
    Link: { template: '<a><slot /></a>' },
}));

const base = {
    user_name: 'Agent',
    user_email: 'agent@example.com',
    abilities: ['agent'],
    last_used_at: null,
    last_used_ip: null,
    expires_at: null,
    is_expired: false,
    created_at: '2026-11-26T12:00:00Z',
};

const tokens = [
    { ...base, id: 1, name: 'Desktop App', kind: null, extension_id: null },
    {
        ...base,
        id: 2,
        name: 'Browser extension (Escalated for Chrome)',
        kind: 'browser_extension',
        extension_id: 'abcdefghijklmnopabcdefghijklmnop',
    },
    // A token from a backend that does not send the new fields at all.
    { ...base, id: 3, name: 'Legacy token' },
];

const mountPage = () =>
    mount(ApiTokens, {
        props: { tokens, users: [], api_enabled: true },
        global: { stubs: { EscalatedLayout: { template: '<main><slot /></main>' } } },
    });

const row = (wrapper, id) => wrapper.get(`[data-testid="api-token-${id}"]`);

afterEach(() => setLocale('en'));

describe('Admin/ApiTokens kind display', () => {
    it('badges a browser extension token and shows its extension ID', () => {
        const extension = row(mountPage(), 2);
        expect(extension.get('[data-testid="api-token-kind"]').text()).toBe('Browser extension');
        expect(extension.get('[data-testid="api-token-extension-id"]').text()).toContain(
            'abcdefghijklmnopabcdefghijklmnop',
        );
        expect(extension.get('[data-testid="api-token-extension-id"]').text()).toContain('Extension ID');
    });

    it('shows no badge or extension ID for an ordinary token or one without the fields', () => {
        const wrapper = mountPage();
        for (const id of [1, 3]) {
            expect(row(wrapper, id).find('[data-testid="api-token-kind"]').exists()).toBe(false);
            expect(row(wrapper, id).find('[data-testid="api-token-extension-id"]').exists()).toBe(false);
        }
    });

    it('shows an unknown kind as sent', () => {
        const wrapper = mount(ApiTokens, {
            props: { tokens: [{ ...base, id: 9, name: 'Other', kind: 'service', extension_id: null }], users: [] },
            global: { stubs: { EscalatedLayout: { template: '<main><slot /></main>' } } },
        });
        expect(row(wrapper, 9).get('[data-testid="api-token-kind"]').text()).toBe('service');
    });

    it('translates the badge', () => {
        setLocale('de');
        expect(row(mountPage(), 2).get('[data-testid="api-token-kind"]').text()).toBe(
            locales.de.browser_extensions.kind_badge,
        );
    });
});
