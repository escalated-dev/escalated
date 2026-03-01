# Panel Theming Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add CSS custom property-based theming for admin and agent panels, supporting quick customization (mode, accent, logo) and full whitelabel (granular token overrides).

**Architecture:** Extend `plugin.js` to set `--esc-panel-*` CSS custom properties on `:root` with dark/light default palettes. Migrate all admin/agent hardcoded Tailwind color classes to `var()` references. Provide logo/appName via Vue `provide()`. The `esc-dark` injection respects the panel mode setting.

**Tech Stack:** Vue 3, Tailwind CSS (arbitrary value syntax for `var()` refs), Vitest

---

## Token Mapping Reference

All tasks reference this mapping. **Dark defaults** reproduce the current look exactly.

| Token | CSS Property | Dark Default | Light Default |
|-------|-------------|-------------|--------------|
| bg | `--esc-panel-bg` | `#000000` | `#f9fafb` |
| sidebar-bg | `--esc-panel-sidebar-bg` | `#0a0a0a` | `#ffffff` |
| topbar-bg | `--esc-panel-topbar-bg` | `rgba(0,0,0,0.8)` | `rgba(255,255,255,0.95)` |
| surface | `--esc-panel-surface` | `rgba(23,23,23,0.6)` | `#ffffff` |
| surface-alt | `--esc-panel-surface-alt` | `#0a0a0a` | `#f9fafb` |
| border | `--esc-panel-border` | `rgba(255,255,255,0.06)` | `#e5e7eb` |
| border-input | `--esc-panel-border-input` | `rgba(255,255,255,0.1)` | `#d1d5db` |
| text | `--esc-panel-text` | `#ffffff` | `#111827` |
| text-secondary | `--esc-panel-text-secondary` | `#e5e5e5` | `#374151` |
| text-tertiary | `--esc-panel-text-tertiary` | `#a3a3a3` | `#6b7280` |
| text-muted | `--esc-panel-text-muted` | `#737373` | `#9ca3af` |
| accent | `--esc-panel-accent` | `#06b6d4` | `#3b82f6` |
| accent-secondary | `--esc-panel-accent-secondary` | `#8b5cf6` | `#6366f1` |
| accent-hover | `--esc-panel-accent-hover` | `#22d3ee` | `#2563eb` |
| accent-secondary-hover | `--esc-panel-accent-secondary-hover` | `#a78bfa` | `#818cf8` |
| hover | `--esc-panel-hover` | `rgba(255,255,255,0.03)` | `rgba(0,0,0,0.02)` |
| active | `--esc-panel-active` | `rgba(255,255,255,0.08)` | `#eff6ff` |

### Class Replacement Patterns

These are the mechanical replacements applied across all admin/agent templates:

| Original Tailwind Class | Replacement |
|------------------------|-------------|
| `bg-black` (page bg) | `bg-[var(--esc-panel-bg)]` |
| `bg-neutral-950` (sidebar, inputs) | `bg-[var(--esc-panel-surface-alt)]` |
| `bg-neutral-900/60` (cards) | `bg-[var(--esc-panel-surface)]` |
| `bg-neutral-900` (inputs alt) | `bg-[var(--esc-panel-surface)]` |
| `border-white/[0.06]` | `border-[var(--esc-panel-border)]` |
| `border-white/[0.04]` | `border-[var(--esc-panel-border)]` |
| `border-white/10` | `border-[var(--esc-panel-border-input)]` |
| `border-white/20` | `border-[var(--esc-panel-border-input)]` |
| `text-white` (headings) | `text-[var(--esc-panel-text)]` |
| `text-neutral-200` | `text-[var(--esc-panel-text-secondary)]` |
| `text-neutral-300` | `text-[var(--esc-panel-text-secondary)]` |
| `text-neutral-400` | `text-[var(--esc-panel-text-tertiary)]` |
| `text-neutral-500` | `text-[var(--esc-panel-text-muted)]` |
| `text-neutral-600` | `text-[var(--esc-panel-text-muted)]` |
| `text-neutral-700` | `text-[var(--esc-panel-text-muted)]` |
| `bg-gradient-to-r from-cyan-500 to-violet-500` | `bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)]` |
| `hover:from-cyan-400 hover:to-violet-400` | `hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]` |
| `hover:bg-white/[0.03]` | `hover:bg-[var(--esc-panel-hover)]` |
| `hover:bg-white/[0.04]` | `hover:bg-[var(--esc-panel-hover)]` |
| `hover:bg-white/[0.06]` | `hover:bg-[var(--esc-panel-hover)]` |
| `bg-white/[0.08]` (active) | `bg-[var(--esc-panel-active)]` |
| `bg-white/[0.03]` | `bg-[var(--esc-panel-hover)]` |
| `bg-white/[0.02]` (table header) | `bg-[var(--esc-panel-hover)]` |
| `bg-white/[0.04]` | `bg-[var(--esc-panel-hover)]` |
| `shadow-black/20` | `shadow-[var(--esc-panel-bg)]/20` |
| `hover:text-neutral-300` | `hover:text-[var(--esc-panel-text-secondary)]` |
| `hover:text-neutral-200` | `hover:text-[var(--esc-panel-text-secondary)]` |
| `hover:text-white` | `hover:text-[var(--esc-panel-text)]` |
| `bg-neutral-700` (toggle off) | `bg-[var(--esc-panel-text-muted)]` |
| `focus:border-white/20` | `focus:border-[var(--esc-panel-border-input)]` |
| `focus:ring-white/10` | `focus:ring-[var(--esc-panel-border-input)]` |
| `bg-black/80` (topbar) | `bg-[var(--esc-panel-topbar-bg)]` |
| `divide-white/[0.06]` | `divide-[var(--esc-panel-border)]` |
| `divide-white/[0.04]` | `divide-[var(--esc-panel-border)]` |
| `placeholder-neutral-500` | `placeholder-[var(--esc-panel-text-muted)]` |
| `placeholder-neutral-600` | `placeholder-[var(--esc-panel-text-muted)]` |
| `text-cyan-400` (link/info) | `text-[var(--esc-panel-accent)]` |

**DO NOT replace:**
- Status colors: `cyan-500`, `violet-500`, `amber-*`, `rose-*`, `emerald-*`, `orange-*`, `gray-*` when used in `StatusBadge`, `PriorityBadge`, `SlaTimer`, `AuditLogEntry` status contexts
- `bg-emerald-500` / `bg-neutral-700` toggle patterns (semantic: on/off states)
- Any colors in light-mode (customer-facing) template branches
- SVG gradient hex values in logo definitions

---

### Task 1: Add panel theme defaults and applyPanelTheme to plugin.js

**Files:**
- Modify: `src/plugin.js`
- Modify: `tests/plugin.test.js`

**Step 1: Write failing tests for panel theme**

Add to `tests/plugin.test.js` after the existing test blocks:

```js
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
        panelProps.forEach(p => style.removeProperty(p));
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
        // Others still get dark defaults
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
            theme: {
                panel: { appName: 'HelpDesk Pro', logo: '/img/logo.svg' }
            }
        });

        expect(provideSpy).toHaveBeenCalledWith(
            'escalated-panel',
            expect.objectContaining({
                appName: 'HelpDesk Pro',
                logo: '/img/logo.svg',
                mode: 'dark',
            })
        );
    });

    it('defaults appName to Escalated and logo to null', () => {
        const app = createApp({ template: '<div />' });
        const provideSpy = vi.spyOn(app, 'provide');

        app.use(EscalatedPlugin, { theme: { panel: {} } });

        expect(provideSpy).toHaveBeenCalledWith(
            'escalated-panel',
            expect.objectContaining({
                appName: 'Escalated',
                logo: null,
                mode: 'dark',
            })
        );
    });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd escalated && npx vitest run tests/plugin.test.js`
Expected: FAIL — `--esc-panel-bg` is never set, provide never called with `escalated-panel`

**Step 3: Implement panel theme in plugin.js**

Replace the entire `src/plugin.js` with the updated version that adds:
- `panelDarkDefaults` and `panelLightDefaults` objects
- `applyPanelTheme(panelConfig)` function
- Updated `install()` to handle `theme.panel`, call `applyPanelTheme()`, and `provide('escalated-panel', ...)`

```js
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
 *           panel: {
 *               mode: 'dark',           // 'dark' | 'light'
 *               accent: '#e94560',      // primary accent color
 *               appName: 'My Helpdesk',
 *               logo: '/img/logo.svg',  // URL string or Vue component
 *           }
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

const themeDefaults = {
    primary: '#4f46e5',
    primaryHover: null,
    radius: '0.5rem',
    radiusLg: null,
    fontFamily: null,
};

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
    const merged = { ...defaults };

    // Apply user overrides (skip non-token keys like mode, appName, logo)
    for (const key of Object.keys(panelTokenMap)) {
        if (panelConfig[key] !== undefined) {
            merged[key] = panelConfig[key];
        }
    }

    const style = document.documentElement.style;
    for (const [key, prop] of Object.entries(panelTokenMap)) {
        style.setProperty(prop, merged[key]);
    }
}

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
```

**Step 4: Run tests to verify they pass**

Run: `cd escalated && npx vitest run tests/plugin.test.js`
Expected: All tests PASS (existing + new panel tests)

**Step 5: Commit**

```bash
git add src/plugin.js tests/plugin.test.js
git commit -m "feat: add panel theming support to EscalatedPlugin

Adds --esc-panel-* CSS custom properties with dark and light default
palettes. Panel config (appName, logo, mode) is provided via Vue
provide() for layout components."
```

---

### Task 2: Migrate EscalatedLayout.vue — Admin sidebar and topbar

**Files:**
- Modify: `src/components/EscalatedLayout.vue`

**Step 1: Add panel config injection to script setup**

In `EscalatedLayout.vue`, add after line 11 (`const hostLayout = inject(...)`):

```js
const panelConfig = inject('escalated-panel', { appName: 'Escalated', logo: null, mode: 'dark' });
```

**Step 2: Update isDark to respect panel mode**

Change line 23 from:
```js
const isDark = computed(() => isAdminSection.value || isAgentSection.value);
```
To:
```js
const isPanel = computed(() => isAdminSection.value || isAgentSection.value);
const isDark = computed(() => isPanel.value && panelConfig.mode !== 'light');
```

**Step 3: Migrate admin sidebar template (MODE 1, lines 203-332)**

Replace all hardcoded color classes in the admin section with `var()` references following the Class Replacement Patterns table above. Key replacements in this section:

- Line 203: `bg-black` → `bg-[var(--esc-panel-bg)]`
- Line 205: `bg-neutral-950` → `bg-[var(--esc-panel-sidebar-bg)]`, `border-white/[0.06]` → `border-[var(--esc-panel-border)]`
- Line 208: `bg-white/10` → `bg-[var(--esc-panel-border-input)]`
- Line 233: `text-white` → `text-[var(--esc-panel-text)]`
- Line 235: `bg-white/[0.08]` → `bg-[var(--esc-panel-active)]`, `text-neutral-500` → `text-[var(--esc-panel-text-muted)]`
- Line 249-251: `bg-white/[0.08] text-white` → `bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]`, `text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300` → `text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]`
- Line 256-258: `text-white` → `text-[var(--esc-panel-text)]`, `text-neutral-600 group-hover:text-neutral-400` → `text-[var(--esc-panel-text-muted)] group-hover:text-[var(--esc-panel-text-tertiary)]`
- Lines 269-270: `bg-cyan-500/20` and `text-cyan-400` → `bg-[var(--esc-panel-accent)]/20` and `text-[var(--esc-panel-accent)]`
- Line 277: `border-white/[0.06]` → `border-[var(--esc-panel-border)]`
- Lines 281, 294: `text-neutral-500 ... hover:bg-white/[0.04] hover:text-neutral-300` → `text-[var(--esc-panel-text-muted)] ... hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]`
- Lines 307-313: User section colors similarly migrated
- Line 322: `border-white/[0.06] bg-black/80` → `border-[var(--esc-panel-border)] bg-[var(--esc-panel-topbar-bg)]`
- Line 324: `text-white` → `text-[var(--esc-panel-text)]`

**Step 4: Migrate admin topbar (lines 320-326)**

Same pattern — `bg-black/80` → `bg-[var(--esc-panel-topbar-bg)]`, border and text similarly.

**Step 5: Migrate agent nav section (MODE 2, lines 335-417)**

Apply same replacements to the agent section. Key targets:
- Line 335: `bg-black` → `bg-[var(--esc-panel-bg)]`
- Line 337: `border-white/[0.06] bg-neutral-950/95` → `border-[var(--esc-panel-border)] bg-[var(--esc-panel-sidebar-bg)]`
- All text-white, text-neutral-* classes in agent nav
- Line 341: `bg-white/10` → `bg-[var(--esc-panel-border-input)]`
- Line 365: `text-white` → `text-[var(--esc-panel-text)]`

**Step 6: Add dynamic logo rendering**

Replace the admin logo block (lines 207-231) with:

```html
<div class="flex h-16 items-center gap-3 px-5">
    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--esc-panel-border-input)]">
        <img v-if="typeof panelConfig.logo === 'string'" :src="panelConfig.logo" class="h-5 w-5" alt="" />
        <component v-else-if="panelConfig.logo" :is="panelConfig.logo" class="h-5 w-5" />
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <defs>
                <linearGradient id="esc-rainbow-admin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f97316" />
                    <stop offset="30%" stop-color="#eab308" />
                    <stop offset="50%" stop-color="#22c55e" />
                    <stop offset="70%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
            </defs>
            <g transform="translate(12,12) scale(1.35) translate(-12,-12)">
                <polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-admin)" />
                <polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-admin)" />
            </g>
        </svg>
    </div>
    <div>
        <span class="text-sm font-bold text-[var(--esc-panel-text)] tracking-wide">{{ panelConfig.appName }}</span>
        <span class="ml-1.5 rounded bg-[var(--esc-panel-active)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--esc-panel-text-muted)]">ADMIN</span>
    </div>
</div>
```

Do the same for the agent logo block (lines 340-365), but without the ADMIN badge.

**Step 7: Update color-scheme style attribute**

Line 203: Change `style="color-scheme: dark"` to `:style="{ colorScheme: panelConfig.mode === 'light' ? 'light' : 'dark' }"`

Same for line 335 (agent section).

**Step 8: Commit**

```bash
git add src/components/EscalatedLayout.vue
git commit -m "feat: migrate EscalatedLayout to panel theme tokens

Admin sidebar, topbar, and agent nav now use --esc-panel-* CSS
custom properties. Logo and appName are dynamic from panel config.
color-scheme respects panel mode setting."
```

---

### Task 3: Migrate admin pages — Batch 1 (Reports, Settings, Tickets)

**Files:**
- `src/pages/Admin/Reports.vue`
- `src/pages/Admin/Reports/Dashboard.vue`
- `src/pages/Admin/Reports/AgentMetrics.vue`
- `src/pages/Admin/Reports/CsatReport.vue`
- `src/pages/Admin/Reports/SlaReport.vue`
- `src/pages/Admin/Settings.vue`
- `src/pages/Admin/Settings/CsatSettings.vue`
- `src/pages/Admin/Settings/DataRetention.vue`
- `src/pages/Admin/Settings/EmailSettings.vue`
- `src/pages/Admin/Settings/Sandbox.vue`
- `src/pages/Admin/Settings/SsoSettings.vue`
- `src/pages/Admin/Settings/TwoFactor.vue`
- `src/pages/Admin/Tickets/Index.vue`
- `src/pages/Admin/Tickets/Show.vue`

**Step 1: Apply class replacements**

For each file, apply the Class Replacement Patterns from the reference table above. These are mechanical find-and-replace operations within the template section only:

1. Replace card containers: `border-white/[0.06] bg-neutral-900/60` → `border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]`
2. Replace input classes: `border-white/10 bg-neutral-950` → `border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)]`
3. Replace text classes: `text-white` → `text-[var(--esc-panel-text)]`, etc.
4. Replace gradient buttons: `from-cyan-500 to-violet-500` → `from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)]`
5. Replace hover/focus states per the table
6. Replace table divide classes: `divide-white/[0.06]` → `divide-[var(--esc-panel-border)]`
7. Replace table header bg: `bg-white/[0.02]` → `bg-[var(--esc-panel-hover)]`
8. Replace row hover: `hover:bg-white/[0.03]` → `hover:bg-[var(--esc-panel-hover)]`

**Important:** Do NOT replace status/priority semantic colors (emerald, amber, rose, etc.) in StatusBadge, PriorityBadge, or similar status indicator contexts.

**Step 2: Commit**

```bash
git add src/pages/Admin/Reports.vue src/pages/Admin/Reports/ src/pages/Admin/Settings.vue src/pages/Admin/Settings/ src/pages/Admin/Tickets/
git commit -m "feat: migrate reports, settings, and tickets pages to panel tokens"
```

---

### Task 4: Migrate admin pages — Batch 2 (CRUD pages A-E)

**Files:**
- `src/pages/Admin/ApiTokens/Index.vue`
- `src/pages/Admin/AuditLog/Index.vue`
- `src/pages/Admin/Automations/Form.vue`
- `src/pages/Admin/Automations/Index.vue`
- `src/pages/Admin/BusinessHours/Form.vue`
- `src/pages/Admin/BusinessHours/Index.vue`
- `src/pages/Admin/CannedResponses/Index.vue`
- `src/pages/Admin/Capacity/Index.vue`
- `src/pages/Admin/CustomFields/Form.vue`
- `src/pages/Admin/CustomFields/Index.vue`
- `src/pages/Admin/CustomObjects/Form.vue`
- `src/pages/Admin/CustomObjects/Index.vue`
- `src/pages/Admin/CustomObjects/Records.vue`
- `src/pages/Admin/Departments/Form.vue`
- `src/pages/Admin/Departments/Index.vue`
- `src/pages/Admin/EscalationRules/Form.vue`
- `src/pages/Admin/EscalationRules/Index.vue`

**Step 1:** Apply same mechanical Class Replacement Patterns as Task 3.

**Step 2: Commit**

```bash
git add src/pages/Admin/ApiTokens/ src/pages/Admin/AuditLog/ src/pages/Admin/Automations/ src/pages/Admin/BusinessHours/ src/pages/Admin/CannedResponses/ src/pages/Admin/Capacity/ src/pages/Admin/CustomFields/ src/pages/Admin/CustomObjects/ src/pages/Admin/Departments/ src/pages/Admin/EscalationRules/
git commit -m "feat: migrate CRUD pages (A-E) to panel tokens"
```

---

### Task 5: Migrate admin pages — Batch 3 (CRUD pages K-W)

**Files:**
- `src/pages/Admin/KnowledgeBase/Articles/Form.vue`
- `src/pages/Admin/KnowledgeBase/Articles/Index.vue`
- `src/pages/Admin/KnowledgeBase/Categories/Index.vue`
- `src/pages/Admin/Macros/Index.vue`
- `src/pages/Admin/Plugins/Index.vue`
- `src/pages/Admin/Roles/Form.vue`
- `src/pages/Admin/Roles/Index.vue`
- `src/pages/Admin/Skills/Form.vue`
- `src/pages/Admin/Skills/Index.vue`
- `src/pages/Admin/SlaPolicies/Form.vue`
- `src/pages/Admin/SlaPolicies/Index.vue`
- `src/pages/Admin/Statuses/Form.vue`
- `src/pages/Admin/Statuses/Index.vue`
- `src/pages/Admin/Tags/Index.vue`
- `src/pages/Admin/Webhooks/DeliveryLog.vue`
- `src/pages/Admin/Webhooks/Form.vue`
- `src/pages/Admin/Webhooks/Index.vue`

**Step 1:** Apply same mechanical Class Replacement Patterns as Task 3.

**Step 2: Commit**

```bash
git add src/pages/Admin/KnowledgeBase/ src/pages/Admin/Macros/ src/pages/Admin/Plugins/ src/pages/Admin/Roles/ src/pages/Admin/Skills/ src/pages/Admin/SlaPolicies/ src/pages/Admin/Statuses/ src/pages/Admin/Tags/ src/pages/Admin/Webhooks/
git commit -m "feat: migrate CRUD pages (K-W) to panel tokens"
```

---

### Task 6: Migrate shared components (dark-mode branches)

**Files (18 components with `inject('esc-dark')`):**
- `src/components/ActivityTimeline.vue`
- `src/components/AssigneeSelect.vue`
- `src/components/AttachmentList.vue`
- `src/components/BulkActionBar.vue`
- `src/components/FileDropzone.vue`
- `src/components/FollowButton.vue`
- `src/components/KeyboardShortcutHelp.vue`
- `src/components/MacroDropdown.vue`
- `src/components/PinnedNotes.vue`
- `src/components/PriorityBadge.vue`
- `src/components/QuickFilters.vue`
- `src/components/ReplyThread.vue`
- `src/components/SatisfactionRating.vue`
- `src/components/SlaTimer.vue`
- `src/components/StatsCard.vue`
- `src/components/TagSelect.vue`
- `src/components/TicketFilters.vue`
- `src/components/TicketSidebar.vue`

**Step 1: Apply class replacements in dark-mode config/branch only**

These components have a pattern like:
```js
const darkConfig = {
    container: 'bg-neutral-900/60 border-white/[0.06]',
    text: 'text-white',
    // ...
};
```

Replace color values in the dark config objects/branches only. Do NOT touch the light config objects — those are for the customer-facing frontend.

Apply the same Class Replacement Patterns table, but only within:
- `darkConfig` / `dark` style objects
- Inline ternary classes where `escDark.value` / `dark.value` selects the dark branch
- e.g., `dark ? 'bg-neutral-950 text-white' : 'bg-white text-gray-900'` — only replace the dark branch

**Important exceptions:**
- `StatusBadge.vue`: Do NOT migrate — all colors are semantic status indicators
- `PriorityBadge.vue`: Do NOT migrate status color mappings (low=gray, high=amber, etc.). Only migrate container/wrapper classes if present.
- `SlaTimer.vue`: Do NOT migrate compliant/at_risk/breached colors. Only migrate container styling.
- `AuditLogEntry.vue` (if it uses inject): Do NOT migrate action type colors.
- In all components, gradient accent classes (`from-cyan-500 to-violet-500`) that represent the brand accent SHOULD be migrated to `from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)]`.

**Step 2: Commit**

```bash
git add src/components/ActivityTimeline.vue src/components/AssigneeSelect.vue src/components/AttachmentList.vue src/components/BulkActionBar.vue src/components/FileDropzone.vue src/components/FollowButton.vue src/components/KeyboardShortcutHelp.vue src/components/MacroDropdown.vue src/components/PinnedNotes.vue src/components/PriorityBadge.vue src/components/QuickFilters.vue src/components/ReplyThread.vue src/components/SatisfactionRating.vue src/components/SlaTimer.vue src/components/StatsCard.vue src/components/TagSelect.vue src/components/TicketFilters.vue src/components/TicketSidebar.vue
git commit -m "feat: migrate shared components dark-mode branches to panel tokens"
```

---

### Task 7: Update Storybook panel theme preview

**Files:**
- Modify: `.storybook/preview.js`

**Step 1: Add panel theme global type**

In `.storybook/preview.js`, add a `panelTheme` global type alongside the existing `theme` type:

```js
panelTheme: {
    description: 'Panel theme preset',
    defaultValue: 'default-dark',
    toolbar: {
        title: 'Panel Theme',
        items: [
            { value: 'default-dark', title: 'Default Dark' },
            { value: 'default-light', title: 'Default Light' },
            { value: 'custom-brand', title: 'Custom Brand' },
        ],
    },
},
```

**Step 2: Add decorator that applies panel CSS vars**

Add a decorator that reads `globals.panelTheme` and sets `--esc-panel-*` properties:

```js
const panelPresets = {
    'default-dark': {}, // uses panelDarkDefaults
    'default-light': {
        bg: '#f9fafb', sidebarBg: '#ffffff', topbarBg: 'rgba(255,255,255,0.95)',
        surface: '#ffffff', surfaceAlt: '#f9fafb',
        border: '#e5e7eb', borderInput: '#d1d5db',
        text: '#111827', textSecondary: '#374151', textTertiary: '#6b7280', textMuted: '#9ca3af',
        accent: '#3b82f6', accentSecondary: '#6366f1', accentHover: '#2563eb', accentSecondaryHover: '#818cf8',
        hover: 'rgba(0,0,0,0.02)', active: '#eff6ff',
    },
    'custom-brand': {
        bg: '#0f0f23', sidebarBg: '#1a1a2e', topbarBg: 'rgba(15,15,35,0.8)',
        surface: '#16213e', surfaceAlt: '#0f0f23',
        border: 'rgba(255,255,255,0.08)', borderInput: 'rgba(255,255,255,0.12)',
        text: '#ffffff', textSecondary: '#a0aec0', textTertiary: '#718096', textMuted: '#4a5568',
        accent: '#e94560', accentSecondary: '#ff6b6b', accentHover: '#c81e45', accentSecondaryHover: '#ff8787',
        hover: 'rgba(255,255,255,0.03)', active: 'rgba(233,69,96,0.12)',
    },
};
```

**Step 3: Commit**

```bash
git add .storybook/preview.js
git commit -m "feat: add panel theme preview to Storybook"
```

---

### Task 8: Verification pass

**Step 1: Run full test suite**

Run: `cd escalated && npx vitest run`
Expected: All tests pass

**Step 2: Run Storybook build**

Run: `cd escalated && npx storybook build`
Expected: Builds without errors

**Step 3: Visual spot-check in Storybook**

Run: `cd escalated && npx storybook dev -p 6006`
Check that:
- Default Dark panel theme looks identical to before
- Default Light panel theme renders a clean light admin panel
- Custom Brand theme shows the alternative brand colors
- Switching between themes works smoothly

**Step 4: Final commit with any fixes**

```bash
git add -A
git commit -m "fix: address verification findings for panel theming"
```
