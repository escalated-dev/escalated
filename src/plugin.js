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
        if (options.layout) {
            app.provide('escalated-layout', markRaw(options.layout));
        }

        if (options.theme) {
            app.provide('escalated-theme', options.theme);
            applyTheme(options.theme);
        }
    },
};

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
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function scaleBorderRadius(radius, factor) {
    const match = radius.match(/^([\d.]+)(.*)$/);
    if (!match) return radius;
    return `${(parseFloat(match[1]) * factor).toFixed(2)}${match[2] || 'rem'}`;
}
