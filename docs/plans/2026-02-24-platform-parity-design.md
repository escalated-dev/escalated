# platform Feature Parity — Design Document

## Goal

Implement all 36 core gaps and scaffold all 24 plugin gaps identified in the platform comparison. Core features get full frontend + backend implementations across all frameworks. Plugins get their own repos under `escalated/plugins/` with frontend components and backend hooks. Each feature includes a TODO section documenting remaining work.

## Architecture

### Core Features

Core features live in the existing repos:
- `escalated/` — Vue 3 frontend (pages, components, composables)
- `escalated-laravel/` — Laravel backend (models, controllers, migrations, routes)
- `escalated-adonis/` — AdonisJS backend
- `escalated-django/` — Django backend
- `escalated-rails/` — Rails backend
- `escalated-wordpress/` — WordPress adapter
- `escalated-filament/` — Filament admin panel

### Plugins

Each plugin is a standalone package under `escalated/plugins/`:
```
plugins/
├── escalated-plugin-livechat/
├── escalated-plugin-slack/
├── escalated-plugin-jira/
├── escalated-plugin-ai-copilot/
├── escalated-plugin-web-widget/
├── escalated-plugin-whatsapp/
├── escalated-plugin-sms/
├── escalated-plugin-social/
├── escalated-plugin-phone/
├── escalated-plugin-community/
├── escalated-plugin-nps/
├── escalated-plugin-kb-ai/
├── escalated-plugin-approvals/
├── escalated-plugin-custom-objects/
├── escalated-plugin-ip-restriction/
├── escalated-plugin-compliance/
├── escalated-plugin-marketplace/
├── escalated-plugin-scheduled-reports/
├── escalated-plugin-custom-layouts/
├── escalated-plugin-proactive-messages/
├── escalated-plugin-omnichannel-routing/
├── escalated-plugin-mobile-sdk/
├── escalated-plugin-unified-status/
└── escalated-plugin-ticket-sharing/
```

Each plugin follows a standard structure:
```
escalated-plugin-<name>/
├── package.json
├── src/
│   ├── index.js              # defineEscalatedPlugin() entry
│   └── components/           # Vue components
├── TODO.md                    # What remains to implement
└── README.md                  # Plugin documentation
```

## Implementation Layers

### Layer 1: Structural Foundations

| Feature | Frontend | Backend | Priority |
|---------|----------|---------|----------|
| Custom Fields & Forms | Field renderer component, form builder UI | Migration, model, field types API | P0 |
| Custom Statuses | Status config UI, updated StatusBadge | Migration, status categories model | P0 |
| Business Hours | Schedule editor UI, holiday calendar | Schedule model, SLA time calculator | P0 |
| RBAC / Custom Roles | Role editor, permission matrix UI | Roles/permissions models, middleware | P0 |
| Audit Log | Audit log viewer, filters | Auditable trait, log storage | P0 |

### Layer 2: Core Workflows

| Feature | Frontend | Backend |
|---------|----------|---------|
| Ticket Merging | Merge dialog, merged ticket indicator | Merge service, reply consolidation |
| Problem/Incident Linking | Link type selector, linked tickets panel | Ticket types, cascade resolution |
| Parent/Child Tickets | Child ticket creator, relationship view | Parent-child model relationship |
| Side Conversations | Side thread UI, channel selector | Side conversation model, notifications |
| Agent Collision Detection | Typing indicator, collision warning banner | Real-time presence channel |
| Light Agents | Permission-restricted agent view | Light agent role, limited permissions |
| Skills-Based Routing | Skills tag manager, routing config UI | Skills model, routing algorithm |
| Agent Capacity | Capacity settings UI, load indicator | Capacity tracking, assignment limiter |
| Webhooks (Outbound) | Webhook config UI, delivery log viewer | Webhook model, dispatcher, retry queue |
| Time-Based Automations | Time-condition builder UI | Automation scheduler, condition evaluator |
| Trigger Categories | Category organizer for triggers | Category model for automation rules |

### Layer 3: Content & Analytics

| Feature | Frontend | Backend |
|---------|----------|---------|
| Knowledge Base | Article editor, category tree, search | Article/Category models, full-text search |
| Pre-built Dashboards | Dashboard widgets, chart components | Aggregation queries, data endpoints |
| Custom Report Builder | Drag-drop report editor | Report definition model, query engine |
| Real-time Dashboards | Live-updating stats, queue depth | WebSocket/SSE data stream |
| Agent Metrics | Per-agent performance cards | Metric collection, aggregation |
| SLA Reporting | SLA compliance charts, breach analysis | SLA achievement calculator |
| CSAT Customization | Survey config UI, conditional delivery | Survey model, delivery rules |
| CSAT Reporting | CSAT analytics dashboard | CSAT aggregation queries |

### Layer 4: Platform & Security

| Feature | Frontend | Backend |
|---------|----------|---------|
| SSO (SAML/JWT) | SSO config UI, login redirect | SAML/JWT auth drivers |
| Two-Factor Auth | 2FA setup wizard, TOTP input | TOTP generation, verification |
| Data Retention | Retention policy config UI | Scheduled deletion jobs |
| Custom Objects | Object/field definition UI | Dynamic schema, lookup relationships |
| Sandbox | Sandbox creation UI | Environment cloning |
| Email Channel (Advanced) | Multi-address config, DKIM setup | Email piping, authentication |
| Conditional Fields | Show/hide rules builder | Condition evaluation engine |
| Custom Statuses per Category | Sub-status config within categories | Status category model |

## Branching Strategy

- `escalated/` frontend: `feature/platform-parity` branch
- Each backend: `feature/platform-parity` branch
- Plugins: new repos initialized in `plugins/` directory

## Success Criteria

- All 36 core gaps have frontend components + at least Laravel backend implementation
- All 24 plugins have scaffold with entry point, components, and TODO.md
- All tests pass
- Each feature has a TODO.md documenting remaining work
