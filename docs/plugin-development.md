# Plugin development

## Plugin Development

Escalated supports framework-agnostic plugins built with the [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Plugins are written once in TypeScript and work across all Escalated backends.

### How the Frontend Plugin System Works

The frontend uses `defineEscalatedPlugin()` to register Vue components — custom admin pages, ticket sidebar widgets, or dashboard panels — that are mounted automatically when the plugin is active.

```typescript
import { defineEscalatedPlugin } from '@escalated-dev/escalated'
import MySettingsPage from './MySettingsPage.vue'

export default defineEscalatedPlugin({
  name: 'my-plugin',
  pages: {
    'admin/my-plugin/settings': MySettingsPage,
  },
})
```

### How It Connects to the Backend

The backend uses `definePlugin()` from the [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) to handle TypeScript business logic — subscribing to ticket lifecycle hooks, exposing API endpoints, and persisting data. The frontend and backend entries work together as a single npm package.

```typescript
// backend entry (index.ts)
import { definePlugin } from '@escalated-dev/plugin-sdk'

export default definePlugin({
  name: 'my-plugin',
  version: '1.0.0',
  actions: {
    'ticket.created': async (event, ctx) => {
      ctx.log.info('New ticket!', event)
    },
  },
})
```

### Quick Example: Both Entry Points

A published plugin package typically exports both:

```
my-plugin/
  index.ts          ← backend: definePlugin() for TypeScript logic
  frontend.ts       ← frontend: defineEscalatedPlugin() for Vue components
```

The backend framework (Laravel, Rails, Django, AdonisJS) loads `index.ts` via the [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). The Vue app imports `frontend.ts` and registers it with `app.use()`.

### Installing Plugins

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Resources

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript SDK for building plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Runtime host for plugins
- [Plugin Development Guide](https://github.com/escalated-dev/escalated-docs) — Full documentation
