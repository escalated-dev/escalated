import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp } from 'vue';
import { EscalatedPlugin } from '../src/plugin.js';

/**
 * Helper: create a fresh Vue app, install the plugin, and return the app.
 */
function installPlugin(options = {}) {
    const app = createApp({ template: '<div />' });
    app.use(EscalatedPlugin, options);
    return app;
}

describe('EscalatedPlugin', () => {
    beforeEach(() => {
        // Reset CSS custom properties between tests
        const style = document.documentElement.style;
        style.removeProperty('--esc-primary');
        style.removeProperty('--esc-primary-hover');
        style.removeProperty('--esc-radius');
        style.removeProperty('--esc-radius-lg');
        style.removeProperty('--esc-font-family');
    });

    it('has an install method', () => {
        expect(EscalatedPlugin).toBeDefined();
        expect(typeof EscalatedPlugin.install).toBe('function');
    });

    it('installs without errors when no options are given', () => {
        expect(() => installPlugin()).not.toThrow();
    });

    it('does not set CSS variables when no theme option is provided', () => {
        installPlugin();

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-primary')).toBe('');
        expect(style.getPropertyValue('--esc-primary-hover')).toBe('');
        expect(style.getPropertyValue('--esc-radius')).toBe('');
        expect(style.getPropertyValue('--esc-radius-lg')).toBe('');
    });

    it('applies default theme values when theme is empty object', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        // Defaults from themeDefaults: primary '#4f46e5', radius '0.5rem'
        expect(style.getPropertyValue('--esc-primary')).toBe('#4f46e5');
        expect(style.getPropertyValue('--esc-radius')).toBe('0.5rem');
    });

    it('sets --esc-primary to the default value #4f46e5', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-primary')).toBe('#4f46e5');
    });

    it('sets --esc-radius to the default value 0.5rem', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-radius')).toBe('0.5rem');
    });

    it('sets --esc-primary-hover to a darken()ed variant by default', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        const hover = style.getPropertyValue('--esc-primary-hover');
        // Must be a valid hex colour
        expect(hover).toMatch(/^#[0-9a-f]{6}$/);
        // Must differ from primary (it was darkened)
        expect(hover).not.toBe('#4f46e5');
    });

    it('sets --esc-radius-lg to a scaled variant by default', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        const lg = style.getPropertyValue('--esc-radius-lg');
        // 0.5rem * 1.5 = 0.75rem
        expect(lg).toBe('0.75rem');
    });

    it('allows custom primary color override', () => {
        installPlugin({ theme: { primary: '#ff0000' } });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-primary')).toBe('#ff0000');
    });

    it('allows custom primaryHover override', () => {
        installPlugin({ theme: { primaryHover: '#aabbcc' } });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-primary-hover')).toBe('#aabbcc');
    });

    it('allows custom radius override', () => {
        installPlugin({ theme: { radius: '1rem' } });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-radius')).toBe('1rem');
    });

    it('allows custom radiusLg override', () => {
        installPlugin({ theme: { radiusLg: '2rem' } });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-radius-lg')).toBe('2rem');
    });

    it('sets --esc-font-family when fontFamily is provided', () => {
        installPlugin({ theme: { fontFamily: 'Inter, sans-serif' } });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-font-family')).toBe('Inter, sans-serif');
    });

    it('does not set --esc-font-family when not provided', () => {
        installPlugin({ theme: {} });

        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-font-family')).toBe('');
    });

    it('provides the layout when one is given', () => {
        const FakeLayout = { name: 'FakeLayout', template: '<div />' };
        const app = createApp({ template: '<div />' });

        // Spy on provide
        const provideSpy = vi.spyOn(app, 'provide');
        app.use(EscalatedPlugin, { layout: FakeLayout });

        // markRaw is applied, so we check the call was made
        expect(provideSpy).toHaveBeenCalledWith('escalated-layout', expect.objectContaining({ name: 'FakeLayout' }));
    });

    it('provides the theme object when given', () => {
        const theme = { primary: '#123456' };
        const app = createApp({ template: '<div />' });

        const provideSpy = vi.spyOn(app, 'provide');
        app.use(EscalatedPlugin, { theme });

        expect(provideSpy).toHaveBeenCalledWith('escalated-theme', theme);
    });

    it('does not call provide for layout when none given', () => {
        const app = createApp({ template: '<div />' });
        const provideSpy = vi.spyOn(app, 'provide');

        app.use(EscalatedPlugin, {});

        const layoutCalls = provideSpy.mock.calls.filter((c) => c[0] === 'escalated-layout');
        expect(layoutCalls).toHaveLength(0);
    });
});

describe('darken() utility (tested indirectly via theme)', () => {
    beforeEach(() => {
        document.documentElement.style.removeProperty('--esc-primary-hover');
    });

    it('produces a valid 6-digit hex color from #ffffff', () => {
        installPlugin({ theme: { primary: '#ffffff' } });

        const hover = document.documentElement.style.getPropertyValue('--esc-primary-hover');
        expect(hover).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('darkens #ffffff correctly (10% darker)', () => {
        installPlugin({ theme: { primary: '#ffffff' } });

        const hover = document.documentElement.style.getPropertyValue('--esc-primary-hover');
        // darken(#ffffff, 10): each channel = 255 - round(2.55 * 10) = 255 - 26 = 229 = 0xe5
        expect(hover).toBe('#e5e5e5');
    });

    it('clamps at 0 for already-dark colors', () => {
        installPlugin({ theme: { primary: '#000000' } });

        const hover = document.documentElement.style.getPropertyValue('--esc-primary-hover');
        // darken(#000000, 10): all channels already 0, clamp to 0
        expect(hover).toBe('#000000');
    });

    it('handles mid-range color #3b82f6', () => {
        installPlugin({ theme: { primary: '#3b82f6' } });

        const hover = document.documentElement.style.getPropertyValue('--esc-primary-hover');
        expect(hover).toMatch(/^#[0-9a-f]{6}$/);
        // #3b82f6 => R:59 G:130 B:246, darken by round(25.5)=26
        // R: 59-26=33=0x21, G: 130-26=104=0x68, B: 246-26=220=0xdc
        expect(hover).toBe('#2168dc');
    });
});

describe('scaleBorderRadius() utility (tested indirectly via theme)', () => {
    beforeEach(() => {
        document.documentElement.style.removeProperty('--esc-radius-lg');
    });

    it('scales 0.5rem by 1.5 to 0.75rem', () => {
        installPlugin({ theme: { radius: '0.5rem' } });

        const lg = document.documentElement.style.getPropertyValue('--esc-radius-lg');
        expect(lg).toBe('0.75rem');
    });

    it('scales 1rem by 1.5 to 1.50rem', () => {
        installPlugin({ theme: { radius: '1rem' } });

        const lg = document.documentElement.style.getPropertyValue('--esc-radius-lg');
        expect(lg).toBe('1.50rem');
    });

    it('scales px-based radius (8px by 1.5 = 12.00px)', () => {
        installPlugin({ theme: { radius: '8px' } });

        const lg = document.documentElement.style.getPropertyValue('--esc-radius-lg');
        expect(lg).toBe('12.00px');
    });

    it('handles unitless numeric values by defaulting to rem', () => {
        installPlugin({ theme: { radius: '2' } });

        const lg = document.documentElement.style.getPropertyValue('--esc-radius-lg');
        expect(lg).toBe('3.00rem');
    });
});

describe('Panel theming', () => {
    const panelProps = [
        '--esc-panel-bg',
        '--esc-panel-sidebar-bg',
        '--esc-panel-topbar-bg',
        '--esc-panel-surface',
        '--esc-panel-surface-alt',
        '--esc-panel-border',
        '--esc-panel-border-input',
        '--esc-panel-text',
        '--esc-panel-text-secondary',
        '--esc-panel-text-tertiary',
        '--esc-panel-text-muted',
        '--esc-panel-accent',
        '--esc-panel-accent-secondary',
        '--esc-panel-accent-hover',
        '--esc-panel-accent-secondary-hover',
        '--esc-panel-hover',
        '--esc-panel-active',
    ];

    beforeEach(() => {
        const style = document.documentElement.style;
        panelProps.forEach((p) => style.removeProperty(p));
    });

    it('does not set panel CSS variables when no panel option is provided', () => {
        installPlugin({ theme: {} });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-panel-bg')).toBe('');
    });

    it('sets all dark-mode panel defaults when panel is empty object', () => {
        installPlugin({ theme: { panel: {} } });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-panel-bg')).toBe('#000000');
        expect(style.getPropertyValue('--esc-panel-sidebar-bg')).toBe('#0a0a0a');
        expect(style.getPropertyValue('--esc-panel-text')).toBe('#ffffff');
        expect(style.getPropertyValue('--esc-panel-accent')).toBe('#06b6d4');
        expect(style.getPropertyValue('--esc-panel-accent-secondary')).toBe('#8b5cf6');
    });

    it('sets light-mode defaults when mode is light', () => {
        installPlugin({ theme: { panel: { mode: 'light' } } });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-panel-bg')).toBe('#f9fafb');
        expect(style.getPropertyValue('--esc-panel-sidebar-bg')).toBe('#ffffff');
        expect(style.getPropertyValue('--esc-panel-text')).toBe('#111827');
        expect(style.getPropertyValue('--esc-panel-accent')).toBe('#3b82f6');
        expect(style.getPropertyValue('--esc-panel-accent-secondary')).toBe('#6366f1');
    });

    it('allows individual token overrides on top of dark defaults', () => {
        installPlugin({ theme: { panel: { accent: '#e94560', bg: '#0f0f23' } } });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-panel-accent')).toBe('#e94560');
        expect(style.getPropertyValue('--esc-panel-bg')).toBe('#0f0f23');
        expect(style.getPropertyValue('--esc-panel-text')).toBe('#ffffff');
    });

    it('allows individual token overrides on top of light defaults', () => {
        installPlugin({ theme: { panel: { mode: 'light', accent: '#e94560' } } });
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--esc-panel-accent')).toBe('#e94560');
        expect(style.getPropertyValue('--esc-panel-bg')).toBe('#f9fafb');
    });

    it('provides panel config including appName and logo via Vue provide', () => {
        const app = createApp({ template: '<div />' });
        const provideSpy = vi.spyOn(app, 'provide');
        app.use(EscalatedPlugin, {
            theme: { panel: { appName: 'HelpDesk Pro', logo: '/img/logo.svg' } },
        });
        expect(provideSpy).toHaveBeenCalledWith(
            'escalated-panel',
            expect.objectContaining({ appName: 'HelpDesk Pro', logo: '/img/logo.svg', mode: 'dark' }),
        );
    });

    it('defaults appName to Escalated and logo to null', () => {
        const app = createApp({ template: '<div />' });
        const provideSpy = vi.spyOn(app, 'provide');
        app.use(EscalatedPlugin, { theme: { panel: {} } });
        expect(provideSpy).toHaveBeenCalledWith(
            'escalated-panel',
            expect.objectContaining({ appName: 'Escalated', logo: null, mode: 'dark' }),
        );
    });
});
