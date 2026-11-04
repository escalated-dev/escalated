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
    const match = radius.match(/^(\d+(?:\.\d+)?|\.\d+)([a-z%]*)$/i);
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
    noteBg: 'rgba(245,158,11,0.07)',
    noteBorder: 'rgba(245,158,11,0.28)',
    noteText: '#fbbf24',
    priorityLow: '#a3a3a3',
    priorityMedium: '#eab308',
    priorityHigh: '#fb923c',
    priorityUrgent: '#f87171',
    slaOk: '#34d399',
    slaWarn: '#fbbf24',
    slaBreach: '#f87171',
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
    textTertiary: '#646b78',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    accentSecondary: '#6366f1',
    accentHover: '#2563eb',
    accentSecondaryHover: '#818cf8',
    hover: 'rgba(0,0,0,0.02)',
    active: '#eff6ff',
    noteBg: '#fffbeb',
    noteBorder: '#fcd34d',
    noteText: '#92400e',
    priorityLow: '#6b7280',
    priorityMedium: '#ca8a04',
    priorityHigh: '#ea580c',
    priorityUrgent: '#b31b1b',
    slaOk: '#047857',
    slaWarn: '#a34807',
    slaBreach: '#b91c1c',
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
    // Semantic tokens for the agent panel (internal notes, the selected list
    // row, the primary button, priority dots and SLA markers).
    noteBg: '--esc-panel-note-bg',
    noteBorder: '--esc-panel-note-border',
    noteText: '--esc-panel-note-text',
    selectedBg: '--esc-panel-selected-bg',
    selectedBorder: '--esc-panel-selected-border',
    primaryBg: '--esc-panel-primary-bg',
    primaryText: '--esc-panel-primary-text',
    priorityLow: '--esc-priority-low',
    priorityMedium: '--esc-priority-medium',
    priorityHigh: '--esc-priority-high',
    priorityUrgent: '--esc-priority-urgent',
    slaOk: '--esc-sla-ok',
    slaWarn: '--esc-sla-warn',
    slaBreach: '--esc-sla-breach',
};

// Optional panel hooks. The layout reads each through a CSS fallback to the
// token it used before the hook existed, so a host that leaves one unset sees
// no change. They are set only when given, and cleared otherwise, so a host
// stylesheet can also set them on :root.
const panelOptionalTokenMap = {
    activeText: '--esc-panel-active-text', // active nav item text + icon (falls back to text)
    headerBg: '--esc-panel-header-bg', // admin top bar / agent top nav (falls back to topbarBg / sidebarBg)
    headerText: '--esc-panel-header-text', // page title and menu button in that bar (falls back to text)
    logoTileBg: '--esc-panel-logo-tile-bg', // square behind the logo (falls back to borderInput)
    logoTileFg: '--esc-panel-logo-tile-fg', // currentColor inside the logo tile (falls back to text)
};

// Relative luminance of a #rgb / #rrggbb colour, or null for anything else.
function luminance(color) {
    const hex = String(color).trim().replace('#', '');
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    if (!/^[0-9a-f]{6}$/i.test(full)) return null;
    const channel = (i) => {
        const v = parseInt(full.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

// Black or white, whichever reads better on the given background.
function readableOn(color) {
    const l = luminance(color);
    if (l === null) return '#ffffff';
    return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? '#000000' : '#ffffff';
}

/**
 * Resolve the full set of panel tokens (CSS custom property -> value) for a
 * panel config. Tokens derived from the accent (selected row, primary button)
 * follow an accent override unless the host sets them itself.
 */
function resolvePanelTokens(panelConfig = {}) {
    const light = panelConfig.mode === 'light';
    const defaults = light ? panelLightDefaults : panelDarkDefaults;
    const overrides = {};
    for (const key of Object.keys(panelTokenMap)) {
        if (panelConfig[key] !== undefined && panelConfig[key] !== null) {
            overrides[key] = panelConfig[key];
        }
    }
    const merged = { ...defaults, ...overrides };
    // Light mode buttons sit on white, where the darker hover shade of the
    // accent is the one that holds white text at AA.
    const primaryBg = overrides.primaryBg ?? (light ? merged.accentHover : merged.accent);
    const derived = {
        selectedBg: `color-mix(in srgb, ${merged.accent} ${light ? 8 : 10}%, transparent)`,
        selectedBorder: merged.accent,
        primaryBg,
        primaryText: readableOn(primaryBg),
    };
    // Anything the host set itself (including a derived token) wins.
    const resolved = { ...derived, ...merged };
    return Object.fromEntries(Object.entries(panelTokenMap).map(([key, cssVar]) => [cssVar, resolved[key]]));
}

/**
 * The panel tokens for a mode, as a map of CSS custom property to value.
 * Storybook and tests use it to theme a subtree without the plugin.
 */
export function panelThemeTokens(mode = 'dark', overrides = {}) {
    return resolvePanelTokens({ ...overrides, mode });
}

function applyPanelTheme(panelConfig) {
    const style = document.documentElement.style;
    for (const [cssVar, value] of Object.entries(resolvePanelTokens(panelConfig))) {
        style.setProperty(cssVar, value);
    }
    for (const [key, cssVar] of Object.entries(panelOptionalTokenMap)) {
        if (panelConfig[key] !== undefined && panelConfig[key] !== null) {
            style.setProperty(cssVar, panelConfig[key]);
        } else {
            style.removeProperty(cssVar);
        }
    }
}
