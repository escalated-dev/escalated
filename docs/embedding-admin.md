# Embedding the admin in your own admin panel (optional)

Escalated ships a complete standalone admin panel at `/{prefix}/admin`
(`/support/admin` by default), with its own sidebar and top bar. **That is the
default, and it needs no setup.** If your application already has an admin
panel, you can instead show Escalated's admin screens inside it, under your
sidebar, header, URL scheme and authorization.

Embedding is an optional alternative to the standalone admin. Nothing on this
page has any effect until you turn it on, and you can turn it off again at any
time. The design is recorded in the developer-context ADR
[`2026-11-05-embeddable-admin`](https://github.com/escalated-dev/escalated-developer-context/blob/main/decisions/2026-11-05-embeddable-admin.md).

## Contents

- [Pick your setup](#pick-your-setup)
- [What the backend does](#what-the-backend-does)
- [1. Vue + Inertia host: render Escalated inside your layout](#1-vue--inertia-host)
- [2. Server-rendered host: your admin template as the root view](#2-server-rendered-host)
- [3. iframe: any other admin](#3-iframe)
- [Plugin options reference](#plugin-options-reference)
- [Shared props reference](#shared-props-reference)
- [Security](#security)
- [Backend guides](#backend-guides)

## Pick your setup

| Your admin panel | Use | Escalated renders |
|---|---|---|
| Vue 3 + Inertia, in the same app | [Layout embed](#1-vue--inertia-host) | each admin page inside your Vue layout, chrome-free |
| Server-rendered templates (Blade, ERB, Django, Twig, HEEx, …) in the same app | [Root-view embed](#2-server-rendered-host) | chrome-free inside your admin template |
| Anything else: another app or origin, a non-Vue SPA, a CMS admin | [iframe embed](#3-iframe) | chrome-free in a frame, sized and themed over `postMessage` |

"Chrome-free" means no Escalated sidebar, top bar, logo, "Back to App" link or
"Powered by" footer: just the page title and the page itself, still styled with
the panel theme tokens (`--esc-panel-*`).

## What the backend does

Turning embedding on in your backend (see [Backend guides](#backend-guides)):

- mounts Escalated's admin routes under **your** prefix (default `admin/support`)
  and **your** middleware. Route names stay `escalated.admin.*`, so every link
  the frontend builds with `route()` follows them;
- keeps Escalated's admin gate in place unless you explicitly opt in to
  replacing it with your own guards;
- marks embedded pages with `escalated.embed` and shares the admin menu as
  `escalated.navigation`, so your sidebar can list it.

The agent panel, customer portal, widget, API, two-factor and newsletter URLs
do not move.

## 1. Vue + Inertia host

The plugin's existing `layout` option wraps **customer** pages in your layout.
Add `admin` to the new `layoutScope` option and admin pages render inside it
too, chrome-free:

```js
import { EscalatedPlugin } from '@escalated-dev/escalated';
import AdminLayout from '@/Layouts/AdminLayout.vue';

app.use(EscalatedPlugin, {
    layout: AdminLayout,
    layoutScope: ['admin'], // which Escalated sections render inside `layout`
    theme: { panel: { mode: 'light' } }, // match your admin's light/dark look
});
```

Your layout keeps the contract it already has for customer pages: a `#header`
slot (Escalated puts the page title there) and a default slot (the page).

```vue
<!-- resources/js/Layouts/AdminLayout.vue -->
<script setup>
import { EscalatedNavigation } from '@escalated-dev/escalated';
</script>

<template>
    <div class="flex min-h-screen">
        <aside class="w-64 border-r">
            <!-- your own menu… -->
            <p class="px-3 pt-4 text-xs uppercase text-gray-500">Support</p>
            <EscalatedNavigation />
        </aside>
        <div class="flex-1">
            <header class="border-b px-6 py-4"><slot name="header" /></header>
            <main class="p-6"><slot /></main>
        </div>
    </div>
</template>
```

Notes:

- `layoutScope` defaults to `['customer']`, which is exactly today's behaviour.
  List `customer` as well if your customer pages should keep using `layout`:
  `layoutScope: ['customer', 'admin']`.
- If your public and admin layouts differ, register named layouts and let the
  backend pick one per page (its `layout` setting, shared as
  `escalated.embed.layout`):

  ```js
  app.use(EscalatedPlugin, {
      layout: PublicLayout, // customer pages
      layouts: { 'Layouts/AdminLayout': AdminLayout }, // embedded admin pages
  });
  ```

- `agent` in `layoutScope` renders the agent workspace inside your layout too.
  The workspace keeps its queue rail, sections and search (that is its content);
  set the `--esc-shell-height` CSS variable to the height your layout leaves it,
  e.g. `calc(100dvh - 4rem)`.
- Without the backend embed switch, `layoutScope: ['admin']` still works: the
  admin stays at `/{prefix}/admin` with Escalated's gate, rendered inside your
  layout.

### Rendering the menu yourself

`<EscalatedNavigation />` renders an accessible `<nav>` with icons, the active
item (`aria-current="page"`) and plugin badges. Restyle it with `link-class` /
`active-class`, or take over each item with its slot:

```vue
<EscalatedNavigation link-class="nav-link" active-class="nav-link is-active" />

<EscalatedNavigation v-slot="{ item }">
    <MyIcon :name="item.icon" /> {{ item.label }}
</EscalatedNavigation>
```

Or use the data directly:

```js
import { useEscalatedNavigation, escalatedNavIcons } from '@escalated-dev/escalated';

const { items, activeItem, isEmbedded } = useEscalatedNavigation();
// items: [{ key, label, route, url, icon, position, active, badge, plugin, children }]
// escalatedNavIcons[item.icon] is the 24x24 outline SVG path for core items.
```

The list is already filtered for the signed-in user by the backend (admin
gate, feature switches, route permissions) and includes plugin menu items.

## 2. Server-rendered host

If your admin layout is a server template, make it the Inertia **root view** for
embedded pages (the backend's `root_view` setting). The template contains your
chrome and the Inertia mount point; Escalated renders chrome-free inside it
(title + page). Render the menu in the template from the backend's navigation
helper (for Laravel, `Escalated::adminNavigation()`). Your frontend entry needs
no extra option: the `escalated.embed` flag is enough.

## 3. iframe

For an admin that is not Vue + Inertia, or lives on another origin, frame the
embedded admin. Set the backend to iframe mode and list the origins allowed to
frame it (the backend sends `Content-Security-Policy: frame-ancestors` with
exactly those origins). Then, on your admin page:

```html
<iframe id="support-admin" src="https://support.example.com/admin/support/tickets"
        style="width: 100%; border: 0" title="Support administration"></iframe>
```

```js
import { connectEscalatedFrame } from '@escalated-dev/escalated/embed';

const frame = connectEscalatedFrame(document.getElementById('support-admin'), {
    origin: 'https://support.example.com', // Escalated's exact origin
    onNavigate: ({ url, route, title }) => highlightMyMenu(route),
});

frame.setTheme('light'); // or 'dark', optionally with panel token overrides
frame.navigate('/admin/support/settings'); // must be under the embed base URL
```

`@escalated-dev/escalated/embed` has no Vue or Inertia dependency. The frame
resizes itself to its content unless you pass `autoResize: false`.

### Protocol (v1)

Every message has `source` and `version: 1`.

| Direction | `type` | Fields |
|---|---|---|
| frame → host (`source: 'escalated'`) | `ready` | `url`, `route`, `title` |
| | `resize` | `height` (px) |
| | `navigate` | `url`, `route`, `title`, after each page change |
| host → frame (`source: 'escalated-host'`) | `theme` | `mode` (`'light'`/`'dark'`), optional `tokens` |
| | `navigate` | `url`, a path under the embed base URL |

### Cookies

The framed admin uses the normal session cookie:

- **Same site** (e.g. `admin.example.com` framing `support.example.com`): works
  with the default `SameSite=Lax`.
- **Cross-site** (different registrable domains): the session cookie must be
  `SameSite=None; Secure` and everything served over HTTPS. Browsers that block
  third-party cookies will not keep a session in a cross-site frame; use the
  layout or root-view embed in that case.

## Plugin options reference

| Option | Default | Meaning |
|---|---|---|
| `layout` | none | Your layout component (`#header` + default slot). Existing option. |
| `layoutScope` | `['customer']` | Sections rendered inside `layout`: any of `'customer'`, `'admin'`, `'agent'`. |
| `layouts` | none | `{ name: Component }`; the backend's `escalated.embed.layout` picks one for embedded admin pages. |

Resolution for an admin page: if the backend embeds it in iframe mode, no host
layout; otherwise `layouts[embed.layout]`, then `layout` when `layoutScope`
lists `admin`, then chrome-free with no host layout.

## Shared props reference

Present only while the backend has embedding on:

```jsonc
"escalated": {
  "embed": {
    "enabled": true,                 // true on embedded admin pages only
    "mode": "layout",                // or "iframe"
    "layout": "Layouts/AdminLayout", // or null
    "route": "escalated.admin.tickets.index", // current route name, or null
    "base_url": "/admin/support",
    "allowed_origins": []            // iframe mode: the frame_ancestors list
  },
  "navigation": [
    { "key": "tickets", "label": "Tickets", "route": "escalated.admin.tickets.index",
      "url": "/admin/support/tickets", "icon": "tickets", "position": 20,
      "active": true, "badge": null, "plugin": null, "children": [] }
  ]
}
```

## Security

- **No auth weakening by default.** Escalated's admin gate stays on embedded
  routes. A backend only drops it when you explicitly opt in to replacing it
  with your own guards; then your middleware is the only check, so it must
  restrict access to admins.
- **iframe framing is allow-listed.** Only the origins you configure can frame
  the admin (`frame-ancestors`); nothing else, and never `*`.
- **No open `postMessage`.** The frame posts only to an allow-listed parent
  origin and accepts messages only from that origin and window; the host helper
  does the same in reverse. Navigation requests are limited to paths under the
  embed base URL.

## Backend guides

Each backend documents its own switch in `docs/embedding-admin.md`:

| Backend | Guide |
|---|---|
| Laravel | [escalated-laravel/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-laravel/blob/main/docs/embedding-admin.md) |
| Rails | [escalated-rails/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-rails/blob/main/docs/embedding-admin.md) |
| Django | [escalated-django/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-django/blob/main/docs/embedding-admin.md) |
| AdonisJS | [escalated-adonis/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-adonis/blob/main/docs/embedding-admin.md) |
| NestJS | [escalated-nestjs/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-nestjs/blob/main/docs/embedding-admin.md) |
| Symfony | [escalated-symfony/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-symfony/blob/master/docs/embedding-admin.md) |
| Phoenix | [escalated-phoenix/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-phoenix/blob/master/docs/embedding-admin.md) |
| Go | [escalated-go/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-go/blob/main/docs/embedding-admin.md) |
| .NET | [escalated-dotnet/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-dotnet/blob/main/docs/embedding-admin.md) |
| Spring | [escalated-spring/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-spring/blob/main/docs/embedding-admin.md) |
| WordPress | [escalated-wordpress/docs/embedding-admin.md](https://github.com/escalated-dev/escalated-wordpress/blob/main/docs/embedding-admin.md) |

Laravel is the reference implementation; the other backends are adding it.
