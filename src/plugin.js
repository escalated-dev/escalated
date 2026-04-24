import { markRaw } from 'vue';

/**
 * EscalatedPlugin — Vue plugin for integrating Escalated into your app's design system.
 *
 * Usage:
 *   import { EscalatedPlugin } from '@escalated-dev/escalated'
 *   import AppLayout from '@/Layouts/AppLayout.vue'
 *
 *   app.use(EscalatedPlugin, {
 *       layout: AppLayout,
 *       theme: {
 *           primary: '#3b82f6',
 *           radius: '0.75rem',
 *       }
 *   })
 */
export const EscalatedPlugin = {
    install(app, options = {}) {
        installRouteShim();

        if (options.layout) {
            app.provide('escalated-layout', markRaw(options.layout));
        }

        if (options.theme) {
            app.provide('escalated-theme', options.theme);
            applyTheme(options.theme);

            if (options.theme.panel) {
                const panelConfig = options.theme.panel;
                applyPanelTheme(panelConfig);
                app.provide('escalated-panel', {
                    appName: panelConfig.appName || 'Escalated',
                    logo: panelConfig.logo || null,
                    mode: panelConfig.mode || 'dark',
                });
            }
        }
    },
};

// 77 components in this package call the Ziggy `route()` helper (Laravel's
// named-route URL generator). Laravel hosts ship Ziggy and get `window.route`
// for free; other host frameworks (Rails, Django, NestJS, Phoenix, Symfony,
// Adonis, Go, .NET, Spring, WordPress) don't, and the call sites would
// otherwise throw a bare ReferenceError deep inside a component render with
// no hint at the cause.
//
// Install a stub that throws an informative error instead, so the host app's
// first failing request points at the actual missing dependency. Laravel hosts
// that already have Ziggy loaded are left alone.
function installRouteShim() {
    if (typeof window === 'undefined') return;
    if (typeof window.route === 'function') return;

    window.route = function escalatedRouteShimMissing(name) {
        throw new Error(
            `[escalated] window.route('${name}') called, but no \`route()\` helper is installed on this host. ` +
                `The escalated agent/admin UI depends on Laravel's Ziggy-style \`route(name, params)\` helper. ` +
                `Install Ziggy (on Laravel hosts) or register a compatible shim on window.route before mounting the app.`,
        );
    };
}

const themeDefaults = {
    primary: '#4f46e5',
    primaryHover: null,
    radius: '0.5rem',
    radiusLg: null,
    fontFamily: null,
};

function applyTheme(theme) {
    const merged = { ...themeDefaults, ...theme };
    const style = document.documentElement.style;

    style.setProperty('--esc-primary', merged.primary);
    style.setProperty('--esc-primary-hover', merged.primaryHover || darken(merged.primary, 10));
    style.setProperty('--esc-radius', merged.radius);
    style.setProperty('--esc-radius-lg', merged.radiusLg || scaleBorderRadius(merged.radius, 1.5));

    if (merged.fontFamily) {
        style.setProperty('--esc-font-family', merged.fontFamily);
    }
}

function darken(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function scaleBorderRadius(radius, factor) {
    const match = radius.match(/^([\d.]+)(.*)$/);
    if (!match) return radius;
    return `${(parseFloat(match[1]) * factor).toFixed(2)}${match[2] || 'rem'}`;
}

const panelDarkDefaults = {
    bg: '#000000',
    sidebarBg: '#0a0a0a',
    topbarBg: 'rgba(0,0,0,0.8)',
    surface: 'rgba(23,23,23,0.6)',
    surfaceAlt: '#0a0a0a',
    border: 'rgba(255,255,255,0.06)',
    borderInput: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textSecondary: '#e5e5e5',
    textTertiary: '#a3a3a3',
    textMuted: '#737373',
    accent: '#06b6d4',
    accentSecondary: '#8b5cf6',
    accentHover: '#22d3ee',
    accentSecondaryHover: '#a78bfa',
    hover: 'rgba(255,255,255,0.03)',
    active: 'rgba(255,255,255,0.08)',
};

const panelLightDefaults = {
    bg: '#f9fafb',
    sidebarBg: '#ffffff',
    topbarBg: 'rgba(255,255,255,0.95)',
    surface: '#ffffff',
    surfaceAlt: '#f9fafb',
    border: '#e5e7eb',
    borderInput: '#d1d5db',
    text: '#111827',
    textSecondary: '#374151',
    textTertiary: '#6b7280',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    accentSecondary: '#6366f1',
    accentHover: '#2563eb',
    accentSecondaryHover: '#818cf8',
    hover: 'rgba(0,0,0,0.02)',
    active: '#eff6ff',
};

const panelTokenMap = {
    bg: '--esc-panel-bg',
    sidebarBg: '--esc-panel-sidebar-bg',
    topbarBg: '--esc-panel-topbar-bg',
    surface: '--esc-panel-surface',
    surfaceAlt: '--esc-panel-surface-alt',
    border: '--esc-panel-border',
    borderInput: '--esc-panel-border-input',
    text: '--esc-panel-text',
    textSecondary: '--esc-panel-text-secondary',
    textTertiary: '--esc-panel-text-tertiary',
    textMuted: '--esc-panel-text-muted',
    accent: '--esc-panel-accent',
    accentSecondary: '--esc-panel-accent-secondary',
    accentHover: '--esc-panel-accent-hover',
    accentSecondaryHover: '--esc-panel-accent-secondary-hover',
    hover: '--esc-panel-hover',
    active: '--esc-panel-active',
};

function applyPanelTheme(panelConfig) {
    const defaults = panelConfig.mode === 'light' ? panelLightDefaults : panelDarkDefaults;
    const overrides = {};
    for (const key of Object.keys(panelTokenMap)) {
        if (panelConfig[key] !== undefined) {
            overrides[key] = panelConfig[key];
        }
    }
    const merged = { ...defaults, ...overrides };
    const style = document.documentElement.style;
    for (const [key, cssVar] of Object.entries(panelTokenMap)) {
        style.setProperty(cssVar, merged[key]);
    }
}
