# Panel Theming Design

**Date:** 2026-03-01
**Branch:** `feature/panel-theming`
**Status:** Approved

## Problem

The Escalated framework allows theming for the customer-facing frontend via `EscalatedPlugin` (primary color, border radius, font family), but the admin and agent panels are locked to a hardcoded dark theme. Users who need to whitelabel or brand these panels have no mechanism to do so.

## Goals

- Enable theming/branding for both admin and agent panels (they share a visual identity)
- Support two tiers: quick customization (accent color, logo, mode) and full whitelabel (granular token overrides)
- Support both dark and light mode for panels
- Allow custom logo via URL or Vue component
- Maintain zero-config backwards compatibility — default tokens reproduce the current look exactly

## Approach

CSS custom properties (`--esc-panel-*`) applied to `:root`, consistent with the existing frontend theming pattern. All admin/agent hardcoded Tailwind color classes are migrated to `var()` references.

## Token System

~15 base tokens with dark and light default palettes:

| Token | Purpose | Dark Default | Light Default |
|-------|---------|-------------|--------------|
| `--esc-panel-bg` | Page background | `#000000` | `#f9fafb` |
| `--esc-panel-sidebar-bg` | Sidebar background | `#0a0a0a` | `#ffffff` |
| `--esc-panel-topbar-bg` | Top bar background | `rgba(0,0,0,0.8)` | `rgba(255,255,255,0.95)` |
| `--esc-panel-surface` | Cards, panels | `rgba(23,23,23,0.6)` | `#ffffff` |
| `--esc-panel-surface-alt` | Nested surfaces, inputs | `#0a0a0a` | `#f9fafb` |
| `--esc-panel-border` | Primary borders | `rgba(255,255,255,0.06)` | `#e5e7eb` |
| `--esc-panel-border-input` | Input borders | `rgba(255,255,255,0.1)` | `#d1d5db` |
| `--esc-panel-text` | Primary text | `#ffffff` | `#111827` |
| `--esc-panel-text-secondary` | Labels, body text | `#e5e5e5` | `#374151` |
| `--esc-panel-text-muted` | Hints, placeholders | `#737373` | `#6b7280` |
| `--esc-panel-accent` | Primary accent | `#06b6d4` | `#3b82f6` |
| `--esc-panel-accent-secondary` | Secondary accent (gradient end) | `#8b5cf6` | `#6366f1` |
| `--esc-panel-accent-hover` | Accent hover state | `#22d3ee` | `#2563eb` |
| `--esc-panel-hover` | Row/item hover bg | `rgba(255,255,255,0.03)` | `#f9fafb` |
| `--esc-panel-active` | Active nav item bg | `rgba(255,255,255,0.08)` | `#eff6ff` |

**Not tokenized:** Status colors (open/closed/escalated/etc.) and priority colors remain hardcoded — they are semantic indicators, not brand colors.

## Plugin API

### Tier 1 — Quick Customization

```js
app.use(EscalatedPlugin, {
    theme: {
        primary: '#3b82f6',       // existing frontend theming (unchanged)
        panel: {
            mode: 'dark',         // 'dark' | 'light'
            accent: '#e94560',    // overrides accent + accent-secondary
            appName: 'HelpDesk Pro',
            logo: '/img/brand-logo.svg',  // URL string
        }
    }
})
```

### Tier 2 — Full Whitelabel

```js
app.use(EscalatedPlugin, {
    theme: {
        panel: {
            mode: 'dark',
            appName: 'ClientDesk',
            logo: MyLogoComponent,        // Vue component
            accent: '#e94560',
            accentSecondary: '#ff6b6b',
            bg: '#0f0f23',
            sidebarBg: '#1a1a2e',
            topbarBg: '#0f0f23',
            surface: '#16213e',
            surfaceAlt: '#0f0f23',
            border: 'rgba(255,255,255,0.08)',
            borderInput: 'rgba(255,255,255,0.12)',
            text: '#ffffff',
            textSecondary: '#a0aec0',
            textMuted: '#718096',
        }
    }
})
```

### Logo Detection

```js
// String → image URL → renders <img :src="logo">
// Object/Function → Vue component → renders <component :is="logo">
```

## Migration Scope

### Changes:

1. **`plugin.js`** — New `applyPanelTheme()` function with dark/light default palettes. `provide()` for logo, appName, panel config.

2. **`EscalatedLayout.vue`** — Admin sidebar, topbar, and agent nav switch from hardcoded Tailwind colors to `var(--esc-panel-*)` references. Logo section becomes dynamic (default SVG / URL / component). App name becomes dynamic.

3. **All admin pages (~25)** — Card containers, form inputs, buttons, tables, text all migrate to `var()`. Gradient buttons become `from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)]`.

4. **Shared components in dark-mode branch** — Components using `inject('esc-dark')` have their dark-mode styling branch updated to use `var()` references.

5. **Storybook** — Add panel theme selector to preview different theme configurations.

### No changes:

- Customer-facing pages (light mode) — untouched
- Status/priority semantic colors — hardcoded
- Existing `theme.primary`, `theme.radius`, `theme.fontFamily` — untouched
- Component APIs/props — no breaking changes

## Color Scheme Handling

When `mode: 'light'` is set:
- The `color-scheme: dark` inline style on admin/agent containers switches to `color-scheme: light`
- The `esc-dark` injection value respects the mode setting (light mode panels inject `false`)
- Components that use `inject('esc-dark')` will automatically pick their light-mode branch
- The light default palette is applied via CSS custom properties

## Backwards Compatibility

- Zero-config behavior is identical to current — dark tokens default to exact current values
- Existing `theme` options continue to work unchanged
- No new peer dependencies
- No build step changes required for consumers
