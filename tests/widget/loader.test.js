import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';

beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url) => ({
            ok: true,
            json: async () => (url.endsWith('/config') ? { kb_enabled: true, departments: [] } : { available: false }),
        })),
    );
});

afterEach(() => {
    delete document.body;
    delete document.currentScript;
    document.head.querySelectorAll('script').forEach((el) => el.remove());
    document.body.innerHTML = '';
    delete window.EscalatedWidget;
    delete globalThis.__ESCALATED_WIDGET_NO_AUTOBOOT__;
    vi.unstubAllGlobals();
});

function addScript(attributes) {
    const el = document.createElement('script');
    el.setAttribute('data-escalated-widget', '');
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
    document.body.appendChild(el);
}

/**
 * Imports the loader the way a browser runs a <script> in <head>: during
 * evaluation `currentScript` is the tag and there is no body yet; by
 * DOMContentLoaded `currentScript` is null again.
 */
async function importFromHead(scriptEl) {
    const body = document.body;
    Object.defineProperty(document, 'body', { configurable: true, get: () => null });
    Object.defineProperty(document, 'currentScript', { configurable: true, get: () => scriptEl });
    await import('../../src/widget/index.js');
    Object.defineProperty(document, 'currentScript', { configurable: true, get: () => null });
    Object.defineProperty(document, 'body', { configurable: true, get: () => body });
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
    await flushPromises();
}

const shadowOf = (selector) => document.querySelector(selector)?.shadowRoot;

describe('widget loader', () => {
    it('boots a launcher from the script tag and exposes the control API', async () => {
        addScript({ 'data-base-url': 'https://help.example.com' });

        await import('../../src/widget/index.js');
        await flushPromises();

        const root = shadowOf('#escalated-widget-host');
        expect(root.querySelector('.esc-w-fab')).not.toBeNull();
        expect(fetch).toHaveBeenCalledWith('https://help.example.com/support/widget/config', expect.anything());

        window.EscalatedWidget.open('ticket');
        await flushPromises();
        expect(root.querySelector('[data-widget-panel]').classList).toContain('esc-open');
        expect(root.querySelector('.esc-w-tab.active').textContent.trim()).toBe('Contact');

        window.EscalatedWidget.close();
        await flushPromises();
        expect(root.querySelector('[data-widget-panel]').classList).not.toContain('esc-open');
    });

    it('mounts inline into the host page target', async () => {
        document.body.innerHTML = '<main><div id="support-form"></div></main>';
        addScript({ 'data-mode': 'inline', 'data-target': '#support-form', 'data-tabs': 'ticket' });

        await import('../../src/widget/index.js');
        await flushPromises();

        const host = document.querySelector('#support-form .escalated-widget-inline');
        expect(host).not.toBeNull();
        expect(document.querySelector('#escalated-widget-host')).toBeNull();
        expect(host.shadowRoot.querySelector('.esc-w-fab')).toBeNull();
        expect(host.shadowRoot.querySelector('form textarea')).not.toBeNull();
    });

    it('keeps settings a host set on window.EscalatedWidget before loading', async () => {
        window.EscalatedWidget = { baseUrl: 'https://desk.example.com', title: 'Acme Help' };
        addScript({});

        await import('../../src/widget/index.js');
        await flushPromises();

        expect(window.EscalatedWidget.baseUrl).toBe('https://desk.example.com');
        expect(shadowOf('#escalated-widget-host').querySelector('.esc-w-header h2').textContent).toBe('Acme Help');
    });

    it('does not mount a second launcher when the script is included twice', async () => {
        addScript({});
        await import('../../src/widget/index.js');
        vi.resetModules();
        await import('../../src/widget/index.js');
        await flushPromises();

        expect(document.querySelectorAll('#escalated-widget-host')).toHaveLength(1);
    });

    it('keeps the script config when embed.js loads in <head>', async () => {
        // No data-escalated-widget and a src the fallback selector can't
        // match: only the tag captured during evaluation carries the config.
        // (innerHTML so the test DOM doesn't try to fetch the src.)
        document.head.innerHTML =
            '<script src="https://cdn.example.com/escalated/widget.js" data-base-url="https://help.example.com" data-title="Head Help"></script>';
        const el = document.head.querySelector('script');

        await importFromHead(el);

        expect(fetch).toHaveBeenCalledWith('https://help.example.com/support/widget/config', expect.anything());
        expect(shadowOf('#escalated-widget-host').querySelector('.esc-w-header h2').textContent).toBe('Head Help');
    });

    it('finds the backend-served embed.js by its src when currentScript is unavailable', async () => {
        document.head.innerHTML = '<script src="https://help.example.com/support/widget/embed.js"></script>';

        await importFromHead(null);

        expect(fetch).toHaveBeenCalledWith('https://help.example.com/support/widget/config', expect.anything());
    });

    it('mounts extra instances on demand and removes them again', async () => {
        globalThis.__ESCALATED_WIDGET_NO_AUTOBOOT__ = true;
        document.body.innerHTML = '<div id="a"></div>';
        const { mountEscalatedWidget } = await import('../../src/widget/index.js');

        const instance = mountEscalatedWidget({ mode: 'inline', target: '#a' });
        await flushPromises();
        expect(document.querySelector('#a .escalated-widget-inline')).not.toBeNull();

        instance.destroy();
        expect(document.querySelector('#a .escalated-widget-inline')).toBeNull();
    });

    it('warns instead of throwing when the inline target is missing', async () => {
        globalThis.__ESCALATED_WIDGET_NO_AUTOBOOT__ = true;
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { mountEscalatedWidget } = await import('../../src/widget/index.js');

        expect(mountEscalatedWidget({ mode: 'inline', target: '#missing' })).toBeNull();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
