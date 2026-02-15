<h1>
  <img src="https://escalated.dev/apple-touch-icon.png" width="28" style="vertical-align:middle;" />
  Escalated
</h1>

Escalated is an embeddable support ticket system with SLA tracking, escalation rules, agent workflows, and a customer portal. This repo contains all the shared frontend assets (Vue 3 + Inertia.js) used across every supported backend framework.

👉 **Learn more, view demos, and compare Cloud vs Self-Hosted options at** **[https://escalated.dev](https://escalated.dev)**

**You don't install this package directly.** Start with the backend package for your framework — it handles everything including pulling in these frontend assets.

## Get Started

Pick your framework:

| Framework | Repo | Install |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |

Each backend repo has full setup instructions — install command, migrations, config, and frontend integration.

## Tailwind CSS

Escalated components use Tailwind CSS classes. You **must** add this package to your Tailwind `content` config so its classes aren't purged:

```js
// tailwind.config.js
export default {
    content: [
        // ... your existing paths
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Without this, Escalated UI will render but styles like button backgrounds and badge colors will be missing.

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

Pass your app's layout component and all Escalated pages render inside it automatically. The layout component must accept a `#header` slot and a default slot:

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

### CSS Custom Properties

The `theme` option sets CSS custom properties you can reference in your own styles:

| Property | Default | Description |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Primary action color |
| `--esc-primary-hover` | auto-darkened | Primary hover color |
| `--esc-radius` | `0.5rem` | Border radius for inputs and buttons |
| `--esc-radius-lg` | auto-scaled | Border radius for cards and panels |
| `--esc-font-family` | inherit | Font family override |

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

## What's in This Repo

All the Vue 3 + Inertia.js components that power the Escalated UI. These are identical across Laravel, Rails, Django, and AdonisJS — the backend framework renders them via Inertia.

## 📸 Screenshots

<p align="center">
  <img src="docs/assets/escalated_admin_1.png" alt="Escalated Admin Screenshot 1" width="800" />
</p>

<p align="center">
  <img src="docs/assets/escalated_admin_2.png" alt="Escalated Admin Screenshot 2" width="800" />
</p>

### Pages

**Customer Portal** — Self-service ticket management
- `pages/Customer/Index.vue` — Ticket list with status filters and search
- `pages/Customer/Create.vue` — New ticket form with file attachments
- `pages/Customer/Show.vue` — Ticket detail with reply thread

**Agent Dashboard** — Ticket queue and workflows
- `pages/Agent/Dashboard.vue` — Stats overview and recent tickets
- `pages/Agent/TicketIndex.vue` — Filterable ticket queue
- `pages/Agent/TicketShow.vue` — Full ticket view with sidebar, internal notes, canned responses

**Admin Panel** — System configuration
- `pages/Admin/Reports.vue` — Analytics dashboard
- `pages/Admin/Departments/` — Department CRUD
- `pages/Admin/SlaPolicies/` — SLA policy management
- `pages/Admin/EscalationRules/` — Escalation rule builder
- `pages/Admin/Tags/` — Tag management
- `pages/Admin/CannedResponses/` — Canned response templates

### Shared Components

Reusable building blocks used across the pages above.

| Component | Description |
|-----------|-------------|
| `StatusBadge` | Colored badge for ticket status |
| `PriorityBadge` | Colored badge for ticket priority |
| `TicketList` | Paginated ticket table |
| `ReplyThread` | Chronological reply display |
| `ReplyComposer` | Reply/note editor with file upload and canned response insertion |
| `ActivityTimeline` | Audit log of ticket events |
| `SlaTimer` | SLA countdown with breach/warning states |
| `TicketFilters` | Status, priority, agent, department filter bar |
| `TicketSidebar` | Ticket detail sidebar (status, SLA, tags, activity) |
| `AssigneeSelect` | Agent assignment dropdown |
| `TagSelect` | Multi-select tag picker |
| `FileDropzone` | Drag-and-drop file upload |
| `AttachmentList` | File attachment display with download links |
| `StatsCard` | Metric card with label, value, and trend |
| `EscalatedLayout` | Top-level layout with navigation (supports host layout injection) |
| `BulkActionBar` | Toolbar for batch operations on selected tickets |
| `QuickFilters` | One-click filter chips (My Tickets, Unassigned, Urgent, SLA Breaching) |
| `MacroDropdown` | Dropdown to apply multi-step macros to a ticket |
| `FollowButton` | Toggle button to follow/unfollow a ticket |
| `SatisfactionRating` | 1-5 star CSAT rating input with optional comment |
| `KeyboardShortcutHelp` | Modal overlay showing all available keyboard shortcuts |
| `PinnedNotes` | Display pinned internal notes at the top of the thread |
| `PresenceIndicator` | Real-time indicator showing who is viewing a ticket |

### Composables

| Composable | Description |
|------------|-------------|
| `useKeyboardShortcuts` | Registers and manages keyboard shortcuts for ticket actions |

### Plugin

| Export | Description |
|--------|-------------|
| `EscalatedPlugin` | Vue plugin for layout injection and CSS theming |

## For Package Maintainers

If you're building a new backend integration, this package is available on npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Import the plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Import individual components
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Or reference pages directly for Inertia resolution
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer dependencies: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecosystem

This is the shared frontend for the Escalated support ticket system. Backend packages available for every major framework:

- **[Escalated for Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composer package
- **[Escalated for Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Rails engine
- **[Escalated for Django](https://github.com/escalated-dev/escalated-django)** — Django reusable app
- **[Escalated for AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6 package
- **[Escalated for Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3 admin panel plugin
- **[Shared Frontend](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UI components (you are here)

## License

MIT
