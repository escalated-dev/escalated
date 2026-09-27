# Theming the admin and agent panels

The admin panel (`/support/admin/*`) and the agent panel (`/support/agent/*`)
render inside `EscalatedLayout`, which is coloured entirely by CSS custom
properties. Set them through `theme.panel` when installing the plugin:

```js
app.use(EscalatedPlugin, {
    theme: {
        primary: '#0d9488',
        panel: {
            appName: 'Acme Support',
            logo: '/img/acme-mark.svg', // a URL, or a Vue component
            mode: 'light', // 'dark' (default) or 'light'

            // Links, badges and checkboxes in every panel page
            accent: '#0d9488',
            accentHover: '#0f766e',

            // Navigation
            active: '#f0fdfa', // background of the current nav item
            activeText: '#0f766e', // its text and icon

            // The admin top bar and the agent top nav
            headerBg: '#ffffff',
            headerText: '#134e4a',

            // The square behind the logo
            logoTileBg: '#0d9488',
            logoTileFg: '#ffffff',
        },
    },
});
```

`mode` picks a full set of defaults; every other key overrides one of them.

## Panel tokens

| Option | CSS custom property | What it colours |
|---|---|---|
| `bg` | `--esc-panel-bg` | Page background |
| `sidebarBg` | `--esc-panel-sidebar-bg` | Admin sidebar; agent top nav unless `headerBg` is set |
| `topbarBg` | `--esc-panel-topbar-bg` | Admin top bar unless `headerBg` is set |
| `surface` / `surfaceAlt` | `--esc-panel-surface`, `--esc-panel-surface-alt` | Cards, tables, inputs |
| `border` / `borderInput` | `--esc-panel-border`, `--esc-panel-border-input` | Dividers, input borders; the logo tile unless `logoTileBg` is set |
| `text`, `textSecondary`, `textTertiary`, `textMuted` | `--esc-panel-text*` | Text, strongest to faintest |
| `accent` / `accentHover` | `--esc-panel-accent`, `--esc-panel-accent-hover` | **Link colour** in panel pages, plus badges and checkboxes |
| `accentSecondary` / `accentSecondaryHover` | `--esc-panel-accent-secondary*` | Secondary highlights |
| `hover` | `--esc-panel-hover` | Hover backgrounds |
| `active` | `--esc-panel-active` | **Current nav item** background |

### Optional hooks

These have no default of their own. Unset, each falls back to the token it
replaced, so the panels look exactly as they did before the hook existed.

| Option | CSS custom property | Falls back to | What it colours |
|---|---|---|---|
| `activeText` | `--esc-panel-active-text` | `text` | Current nav item text and icon |
| `headerBg` | `--esc-panel-header-bg` | `topbarBg` (admin), `sidebarBg` (agent) | Admin top bar, agent top nav |
| `headerText` | `--esc-panel-header-text` | `text` | Page title, app name and menu button in that bar |
| `logoTileBg` | `--esc-panel-logo-tile-bg` | `borderInput` | The square behind the logo |
| `logoTileFg` | `--esc-panel-logo-tile-fg` | `text` | `currentColor` inside the logo tile, for an SVG component logo |

The plugin writes these onto `document.documentElement`. A host rendering on
the server, or preferring CSS, can set the same properties in a stylesheet
instead:

```css
:root {
    --esc-panel-header-bg: #134e4a;
    --esc-panel-header-text: #ffffff;
}
```

A value given in `theme.panel` wins over the stylesheet, since the plugin sets
it inline.

## Narrow screens

Below Tailwind's `lg` breakpoint (1024px):

- the admin sidebar becomes a drawer, opened by the menu button in the top
  bar and closed by its backdrop, its close button, <kbd>Escape</kbd>, or
  following a link;
- the agent top nav folds its links, the Admin and Back to App links, and the
  user into a menu under a menu button.

Tables in the panels sit inside an `.esc-table-scroll` container that scrolls
sideways instead of widening the page. A shadow appears on any edge with more
content past it. A host page rendered inside `EscalatedLayout` can use the
same class on its own tables.
