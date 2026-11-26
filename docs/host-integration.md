# Integrating Escalated into your app

## Embedding the admin in your own admin panel (optional)

Escalated comes with its own standalone admin panel, and that stays the default.
If your app already has an admin panel, you can optionally show Escalated's admin
screens inside it instead: under your sidebar and header, your URL prefix and
your middleware, with Escalated's menu available to render in your own sidebar.
Nothing changes unless you turn it on.

Three ways to do it, depending on your admin:

- **Vue + Inertia admin**: Escalated's admin pages render chrome-free inside your
  layout (`app.use(EscalatedPlugin, { layout, layoutScope: ['admin'] })`), and
  `<EscalatedNavigation />` lists the admin menu in your sidebar.
- **Server-rendered admin** (Blade, ERB, Django templates, …): your admin template
  becomes the Inertia root view for the embedded pages.
- **Anything else**: an allow-listed iframe with a small `postMessage` protocol
  for height, theme and navigation (`@escalated-dev/escalated/embed`).

Guides: [frontend](embedding-admin.md) ·
[Laravel](https://github.com/escalated-dev/escalated-laravel/blob/main/docs/embedding-admin.md) ·
[Rails](https://github.com/escalated-dev/escalated-rails/blob/main/docs/embedding-admin.md) ·
[Django](https://github.com/escalated-dev/escalated-django/blob/main/docs/embedding-admin.md) ·
[AdonisJS](https://github.com/escalated-dev/escalated-adonis/blob/main/docs/embedding-admin.md) ·
[NestJS](https://github.com/escalated-dev/escalated-nestjs/blob/main/docs/embedding-admin.md) ·
[Symfony](https://github.com/escalated-dev/escalated-symfony/blob/master/docs/embedding-admin.md) ·
[Phoenix](https://github.com/escalated-dev/escalated-phoenix/blob/master/docs/embedding-admin.md) ·
[Go](https://github.com/escalated-dev/escalated-go/blob/main/docs/embedding-admin.md) ·
[.NET](https://github.com/escalated-dev/escalated-dotnet/blob/main/docs/embedding-admin.md) ·
[Spring](https://github.com/escalated-dev/escalated-spring/blob/main/docs/embedding-admin.md) ·
[WordPress](https://github.com/escalated-dev/escalated-wordpress/blob/main/docs/embedding-admin.md).
Laravel is the reference implementation; the other backends are adding it.

## Resolving pages

Backends render Escalated pages as `Escalated/<Path>`. Wrap your Inertia
resolver with `resolveEscalatedPage` so those names come from this package and
everything else comes from yours:

```js
import { resolveEscalatedPage } from '@escalated-dev/escalated';

createInertiaApp({
    resolve: (name) =>
        resolveEscalatedPage(name, () =>
            resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
        ),
});
```

A name without the `Escalated/` prefix always goes to your resolver, even
when this package ships a page at the same path (`Admin/Users/Index`,
`Auth/TwoFactorChallenge`, `Error`), so your pages are never replaced. Only
when you pass no resolver does an unprefixed name fall back to the package.

## Tailwind CSS

Escalated components use Tailwind CSS utility classes (~hundreds of them across 140+ Vue files). **Some Tailwind-compatible class processor must be available in the host app for the UI to render correctly** — without one, every component renders as unstyled DOM with class names that don't resolve to any CSS.

### Recommended: Tailwind in your existing build

If your host app already uses Tailwind via Vite / PostCSS / Tailwind CLI, your build has to scan this package's source. Without that the built CSS silently misses most of its classes (many are arbitrary values such as `bg-[var(--esc-panel-surface)]`): the admin sidebar stays hidden and buttons lose their backgrounds, often only in production builds.

**Tailwind 3 and earlier:** add the package to your `content` config so its classes aren't purged:

```js
// tailwind.config.js
export default {
    content: [
        // ... your existing paths
        './node_modules/@escalated-dev/escalated/src/**/*.{vue,js}',
    ],
}
```

**Tailwind 4:** there is no `content` array, and automatic source detection skips `node_modules`, so name the package with `@source` in your app's CSS:

```css
/* resources/css/app.css */
@import 'tailwindcss';
@source '../../node_modules/@escalated-dev/escalated/src';
```

The path is relative to the CSS file. Both snippets include the `.js` files: some badge colours are defined there.

### Using Escalated without a Tailwind build step

If you don't want a Tailwind toolchain in your build pipeline, you have a few options. Each has trade-offs — pick the one closest to your project's constraints:

| Option | When to use | How |
|---|---|---|
| **Tailwind Play CDN** | Prototyping, internal tools, demos. Not recommended for production (no purging, ~3 MB script tag). | Add `<script src="https://cdn.tailwindcss.com"></script>` to the page that renders Escalated. The CDN script JIT-compiles classes at runtime. |
| **Tailwind standalone CLI** | You want a static stylesheet without npm/Vite. | Download the [standalone CLI binary](https://tailwindcss.com/blog/standalone-cli) and run `tailwindcss -i input.css -o public/escalated.css --content './node_modules/@escalated-dev/escalated/src/**/*.vue' --minify`. Link the output stylesheet from your page. |
| **UnoCSS / Twind in attributify mode** | Already using one of these atomic-CSS engines. | Configure with the Tailwind preset (`@unocss/preset-wind` or `@twind/preset-tailwind`) and add the Escalated package path to the engine's scan config. Class semantics match. |
| **Forking with hand-rolled CSS** | You categorically cannot ship any Tailwind-compatible tooling and are willing to maintain a fork. | Replace utility classes with scoped CSS per component. Substantial effort; not officially supported. |

If none of these fit, please [open a discussion](https://github.com/escalated-dev/escalated/discussions) so we can understand the constraint and consider a pre-compiled CSS distribution.

Whatever path you choose, also make sure the [theme tokens](#theming) (CSS custom properties) are applied — those control colour, spacing, and radius and are independent of Tailwind.

## Theming

Escalated renders inside a standalone layout by default. To integrate it into your app's design system, use the `EscalatedPlugin`:

```js
import { createApp } from 'vue'
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/Layouts/AppLayout.vue'

const app = createApp(...)

app.use(EscalatedPlugin, {
    layout: AppLayout,
    theme: {
        primary: '#3b82f6',
        radius: '0.75rem',
    }
})
```

### Layout Integration

Pass your app's layout component and Escalated's **customer pages** (the ticket
portal and knowledge base) render inside it. The admin and agent panels keep
their own navigation by default. The layout component must accept a `#header`
slot and a default slot:

```vue
<!-- Your layout must support these slots -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

When no layout is provided, Escalated uses its own built-in navigation bar.

To render the admin (and optionally the agent workspace) inside your layout as
well, list those sections in `layoutScope`. Admin pages then render without
Escalated's sidebar and top bar, with the page title in your `#header` slot:

```js
app.use(EscalatedPlugin, {
    layout: AdminLayout,
    layoutScope: ['customer', 'admin'], // default: ['customer']
})
```

This is optional and only changes anything when you set it. See
[Embedding the admin in your own admin panel](#embedding-the-admin-in-your-own-admin-panel-optional).

### CSS Custom Properties

The `theme` option sets CSS custom properties you can reference in your own styles:

| Property | Default | Description |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Primary action color |
| `--esc-primary-hover` | auto-darkened | Primary hover color |
| `--esc-radius` | `0.5rem` | Border radius for inputs and buttons |
| `--esc-radius-lg` | auto-scaled | Border radius for cards and panels |
| `--esc-font-family` | inherit | Font family override |

### Admin and Agent Panels

`theme.panel` colours the admin and agent panels: navigation, header, logo
tile, links and surfaces, in dark or light mode. Both panels collapse their
navigation behind a menu button below 1024px. See
[docs/theming.md](theming.md) for every token.

### Framework Examples

**Laravel** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

app.use(EscalatedPlugin, { layout: AuthenticatedLayout })
```

**Rails** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```

**Django** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import BaseLayout from '@/layouts/BaseLayout.vue'

app.use(EscalatedPlugin, { layout: BaseLayout })
```

**AdonisJS** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```
