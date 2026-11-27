import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BrowserExtensions from '../../src/pages/Agent/BrowserExtensions.vue';
import { setLocale } from '../../src/composables/useI18n';

const router = vi.hoisted(() => ({ delete: vi.fn() }));

vi.mock('@inertiajs/vue3', () => ({
    router,
    usePage: () => ({ url: '/support/agent/browser-extensions', props: { escalated: { prefix: 'support' } } }),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

const NOW = new Date('2026-11-26T12:00:00Z').getTime();
const ago = (ms) => new Date(NOW - ms).toISOString();

const tokens = [
    {
        id: 5,
        name: 'Browser extension (Escalated for Chrome)',
        extension_id: 'abcdefghijklmnopabcdefghijklmnop',
        created_at: ago(10 * 86400000),
        last_used_at: ago(3 * 3600000),
        expires_at: null,
    },
    {
        id: 6,
        name: 'Browser extension',
        extension_id: 'ponmlkjihgfedcbaponmlkjihgfedcba',
        created_at: ago(86400000),
        last_used_at: null,
        expires_at: null,
    },
];

const mountPage = (overrides = {}) =>
    mount(BrowserExtensions, {
        props: { tokens, revoke_url_template: '/support/agent/browser-extensions/__ID__', ...overrides },
        global: { stubs: { EscalatedLayout: { template: '<div><slot /></div>' } } },
    });

const confirm = vi.fn();
const click = (row, label) =>
    row
        .findAll('button')
        .find((b) => b.text() === label)
        .trigger('click');

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    vi.stubGlobal('confirm', confirm);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setLocale('en');
});

describe('Agent/BrowserExtensions', () => {
    it('lists each extension with its name and extension ID', () => {
        const rows = mountPage().findAll('[data-testid="extension-row"]');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('Browser extension (Escalated for Chrome)');
        expect(rows[0].text()).toContain('abcdefghijklmnopabcdefghijklmnop');
        expect(rows[1].text()).toContain('ponmlkjihgfedcbaponmlkjihgfedcba');
    });

    it('shows a relative last used time, or Never used', () => {
        const rows = mountPage().findAll('[data-testid="extension-row"]');
        expect(rows[0].text()).toContain('3 hours ago');
        expect(rows[1].text()).toContain('Never used');
    });

    it('shows the empty state', () => {
        const wrapper = mountPage({ tokens: [] });
        expect(wrapper.text()).toContain('No browser extensions connected.');
        expect(wrapper.findAll('[data-testid="extension-row"]')).toHaveLength(0);
    });

    it('asks for confirmation inline without window.confirm, and deletes nothing yet', async () => {
        const row = mountPage().findAll('[data-testid="extension-row"]')[0];
        await click(row, 'Revoke');
        expect(confirm).not.toHaveBeenCalled();
        expect(router.delete).not.toHaveBeenCalled();
        expect(row.text()).toContain('Revoke this extension?');
    });

    it('deletes through the revoke URL once confirmed', async () => {
        const row = mountPage().findAll('[data-testid="extension-row"]')[0];
        await click(row, 'Revoke');
        await click(row, 'Yes, revoke');
        expect(router.delete).toHaveBeenCalledTimes(1);
        expect(router.delete.mock.calls[0][0]).toBe('/support/agent/browser-extensions/5');
    });

    it('Cancel backs out without deleting', async () => {
        const row = mountPage().findAll('[data-testid="extension-row"]')[0];
        await click(row, 'Revoke');
        await click(row, 'Cancel');
        expect(router.delete).not.toHaveBeenCalled();
        expect(row.text()).not.toContain('Revoke this extension?');
    });

    it('formats last used in the current locale', () => {
        setLocale('de');
        const rows = mountPage().findAll('[data-testid="extension-row"]');
        expect(rows[0].text()).toMatch(/vor 3 Stunden/);
    });
});
