# Zendesk Feature Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 36 core feature gaps and scaffold all 24 plugins identified in the Zendesk comparison, with full frontend + Laravel backend implementations and TODO.md for remaining work per feature.

**Architecture:** Core features go into existing repos (escalated frontend + escalated-laravel backend). Plugins live as standalone packages under `escalated/plugins/`. Every feature gets a Vue frontend component + Laravel backend (models, migrations, controllers, routes). Other backends (Adonis, Django, Rails) get TODO stubs.

**Tech Stack:** Vue 3, Inertia.js, Laravel 11, PHP 8.2, Tailwind CSS, Vitest

---

## Setup

### Task 0: Create branches and directory structure

**Step 1: Create feature branches**
```bash
cd C:/Users/work/escalated/escalated && git checkout -b feature/zendesk-parity
cd C:/Users/work/escalated/escalated-laravel && git stash && git checkout main && git checkout -b feature/zendesk-parity && git stash pop
```

**Step 2: Create plugins directory**
```bash
mkdir -p C:/Users/work/escalated/plugins
```

**Step 3: Commit setup**

---

## LAYER 1: Structural Foundations (5 tasks, run in parallel)

### Task 1: Custom Fields & Forms

**Files:**
- Create: `escalated/src/components/CustomFieldRenderer.vue`
- Create: `escalated/src/pages/Admin/CustomFields/Index.vue`
- Create: `escalated/src/pages/Admin/CustomFields/Form.vue`
- Create: `escalated-laravel/src/Models/CustomField.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/CustomFieldController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000001_create_escalated_custom_fields_table.php`
- Create: `escalated-laravel/routes/custom_fields.php`

**Frontend — CustomFieldRenderer.vue:**
A component that renders custom fields dynamically based on type. Props: `fields` (Array), `values` (Object), `errors` (Object). Supports types: text, textarea, select, multi-select, checkbox, date, number, regex-validated. Each field: `{ id, label, name, type, options, required, placeholder, description, position }`. Renders appropriate input for each type with validation error display.

**Frontend — Admin pages:**
Index page: Table of custom fields with name, type, required badge, drag-to-reorder. CRUD operations.
Form page: Create/edit form with field type selector, options editor (for select/multi-select), validation rules, position.

**Backend — Model + Migration:**
`custom_fields` table: id, name, slug, type (enum), options (json), required (bool), position (int), active (bool), context (enum: ticket, user, organization), validation_rules (json), timestamps.

**Backend — Controller:**
Standard CRUD: index, create, store, edit, update, destroy, reorder.

**Integration:**
- Add `<CustomFieldRenderer>` to ticket create/show pages
- Add custom field values to ticket model as JSON column or pivot table

**TODO remaining:** Conditional field visibility, field groups/sections, per-form field sets, field value search/filter.

---

### Task 2: Custom Statuses

**Files:**
- Create: `escalated/src/pages/Admin/Statuses/Index.vue`
- Create: `escalated/src/pages/Admin/Statuses/Form.vue`
- Modify: `escalated/src/components/StatusBadge.vue` — support custom statuses
- Create: `escalated-laravel/src/Models/TicketStatus.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/StatusController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000002_create_escalated_ticket_statuses_table.php`

**Frontend — Admin pages:**
Index: List statuses grouped by category (New, Open, Pending, On-Hold, Solved). Each shows label, color, category. Drag-to-reorder within category.
Form: Create sub-status with label, description, color, category selector.

**StatusBadge update:** Accept custom status objects, not just string keys. Fallback to string matching for built-in statuses.

**Backend:**
`ticket_statuses` table: id, label, slug, category (enum: new, open, pending, on_hold, solved), color, description, position, is_default (bool), timestamps.
Seed with default statuses. Update ticket model to use status_id FK with fallback to legacy string.

**TODO remaining:** Status transitions rules, per-status SLA behavior, status-based triggers.

---

### Task 3: Business Hours & Schedules

**Files:**
- Create: `escalated/src/pages/Admin/BusinessHours/Index.vue`
- Create: `escalated/src/pages/Admin/BusinessHours/Form.vue`
- Create: `escalated/src/components/ScheduleEditor.vue`
- Create: `escalated-laravel/src/Models/BusinessSchedule.php`
- Create: `escalated-laravel/src/Models/Holiday.php`
- Create: `escalated-laravel/src/Services/BusinessHoursCalculator.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/BusinessHoursController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000003_create_escalated_business_schedules_table.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000004_create_escalated_holidays_table.php`

**Frontend — ScheduleEditor.vue:**
Weekly grid with time blocks per day (Mon-Sun). Click-drag to set hours. Shows timezone selector. Holiday list with date picker and name input.

**Backend:**
`business_schedules` table: id, name, timezone, is_default, schedule (json — per-day hours), timestamps.
`holidays` table: id, schedule_id (FK), name, date, recurring (bool), timestamps.
`BusinessHoursCalculator` service: `isWithinBusinessHours(DateTime)`, `addBusinessHours(DateTime, hours)`, `getNextBusinessHourStart(DateTime)`. Used by SLA timer to pause outside hours.

**TODO remaining:** Multiple schedules per department, SLA integration (pause timers outside hours), schedule-aware automation timing.

---

### Task 4: Custom Agent Roles (RBAC)

**Files:**
- Create: `escalated/src/pages/Admin/Roles/Index.vue`
- Create: `escalated/src/pages/Admin/Roles/Form.vue`
- Create: `escalated/src/components/PermissionMatrix.vue`
- Create: `escalated-laravel/src/Models/Role.php`
- Create: `escalated-laravel/src/Models/Permission.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/RoleController.php`
- Create: `escalated-laravel/src/Http/Middleware/CheckPermission.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000005_create_escalated_roles_tables.php`

**Frontend — PermissionMatrix.vue:**
Grid component: rows = permission categories (Tickets, Users, Reports, Settings, etc.), columns = actions (View, Create, Edit, Delete, Manage). Checkbox per cell. Group headers for categories.

**Backend:**
`roles` table: id, name, slug, description, is_system (bool for admin/agent), timestamps.
`permissions` table: id, name, slug, group, description.
`role_permission` pivot: role_id, permission_id.
`role_user` pivot: user_id, role_id.
Seed default roles: admin (all), agent (tickets+responses), light_agent (view+comment).
`CheckPermission` middleware: `->middleware('escalated.permission:tickets.edit')`.

**TODO remaining:** Per-department permissions, field-level permissions, permission inheritance, dynamic UI hiding based on permissions.

---

### Task 5: Audit Log

**Files:**
- Create: `escalated/src/pages/Admin/AuditLog/Index.vue`
- Create: `escalated/src/components/AuditLogEntry.vue`
- Create: `escalated-laravel/src/Models/AuditLog.php`
- Create: `escalated-laravel/src/Traits/Auditable.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/AuditLogController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000006_create_escalated_audit_logs_table.php`

**Frontend — AuditLog Index:**
Paginated timeline of admin/agent actions. Filters: user, action type, resource type, date range. Each entry shows: user avatar, action description, timestamp, changed fields diff (old → new).

**Backend:**
`audit_logs` table: id, user_id, action (enum: created, updated, deleted, login, setting_changed, etc.), auditable_type, auditable_id, old_values (json), new_values (json), ip_address, user_agent, created_at.
`Auditable` trait: auto-logs create/update/delete on any model using it. `static::created()`, `static::updated()`, `static::deleted()` observers.

**TODO remaining:** Bulk export, retention policies, compliance reports, real-time streaming.

---

## LAYER 2: Core Workflows (11 tasks, run in parallel)

### Task 6: Ticket Merging

**Files:**
- Create: `escalated/src/components/TicketMergeDialog.vue`
- Create: `escalated-laravel/src/Services/TicketMergeService.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/TicketMergeController.php`
- Modify: `escalated-laravel/database/migrations/` — add merged_into_id to tickets

**Frontend:** Dialog with ticket search, preview of merge target, confirmation. Shows which replies will be consolidated.

**Backend:** `TicketMergeService`: moves replies from source to target, closes source with `closed_by_merge` status, adds system note. Migration: `merged_into_id` nullable FK on tickets table.

**TODO remaining:** AI-powered duplicate detection, bulk merge, merge undo.

---

### Task 7: Problem/Incident Linking

**Files:**
- Create: `escalated/src/components/TicketLinkPanel.vue`
- Create: `escalated/src/components/TicketTypeSelector.vue`
- Create: `escalated-laravel/src/Models/TicketLink.php`
- Modify: `escalated-laravel/src/Models/Ticket.php` — add type field
- Create: `escalated-laravel/database/migrations/2026_02_24_000007_add_ticket_type_and_links.php`

**Frontend:** TicketTypeSelector: dropdown (Question, Problem, Incident, Task). TicketLinkPanel: sidebar panel showing linked tickets with type badges, link/unlink actions.

**Backend:** `ticket_links` table: id, parent_ticket_id, child_ticket_id, link_type (enum: problem_incident, parent_child, related). When Problem is resolved, auto-resolve all linked Incidents.

**TODO remaining:** Cascade status updates, incident count on problem tickets, bulk incident creation.

---

### Task 8: Side Conversations

**Files:**
- Create: `escalated/src/components/SideConversation.vue`
- Create: `escalated/src/components/SideConversationList.vue`
- Create: `escalated-laravel/src/Models/SideConversation.php`
- Create: `escalated-laravel/src/Models/SideConversationReply.php`
- Create: `escalated-laravel/src/Http/Controllers/SideConversationController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000008_create_escalated_side_conversations_table.php`

**Frontend:** Collapsible side thread UI within ticket detail. New side conversation button with channel selector (email, internal, child ticket). Each side conversation shows its own reply thread.

**Backend:** `side_conversations` table: id, ticket_id, subject, channel (email/internal/child_ticket), status, created_by, timestamps. `side_conversation_replies` table with standard reply fields.

**TODO remaining:** Email-based side conversations (send/receive), Slack channel integration, child ticket auto-creation.

---

### Task 9: Agent Collision Detection (Full)

**Files:**
- Modify: `escalated/src/components/PresenceIndicator.vue` — add typing detection
- Create: `escalated/src/components/CollisionWarning.vue`
- Modify: `escalated/src/components/ReplyComposer.vue` — emit typing events
- Create: `escalated-laravel/src/Http/Controllers/PresenceController.php`

**Frontend — CollisionWarning.vue:** Banner that appears when another agent is actively typing a reply. Shows "Agent X is typing a reply..." with pulsing indicator. Dismissable.

**ReplyComposer update:** Debounced typing indicator — POST to presence endpoint on keypress (every 5s while typing). Clear on submit or blur.

**Backend:** Presence endpoint stores typing state with TTL. Returns both viewers and active typers.

**TODO remaining:** WebSocket-based real-time (replace polling), draft conflict resolution, typing indicator in real-time.

---

### Task 10: Light Agents

**Files:**
- Modify: `escalated/src/pages/Agent/TicketShow.vue` — conditional UI based on permissions
- Create: `escalated-laravel/database/migrations/2026_02_24_000009_add_agent_type_to_users.php`

**Frontend:** When user has `light_agent` role: hide reply composer, show only internal note tab, hide status/priority/assignment controls, show read-only ticket detail.

**Backend:** Add `agent_type` enum (full, light) to users or use RBAC role. Light agents can: view tickets, add internal notes. Cannot: reply to customers, change status/priority/assignment, use bulk actions.

**TODO remaining:** Light agent seat licensing, per-department light agent access, light agent activity metrics.

---

### Task 11: Skills-Based Routing

**Files:**
- Create: `escalated/src/pages/Admin/Skills/Index.vue`
- Create: `escalated/src/pages/Admin/Skills/Form.vue`
- Create: `escalated/src/components/SkillTagManager.vue`
- Create: `escalated-laravel/src/Models/Skill.php`
- Create: `escalated-laravel/src/Services/SkillRoutingService.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/SkillController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000010_create_escalated_skills_table.php`

**Frontend:** Admin skill manager: create skills (e.g., "Spanish", "Billing", "Technical"), assign to agents, set routing rules (match ticket tags/department to required skills).

**Backend:** `skills` table: id, name, slug, timestamps. `agent_skill` pivot: user_id, skill_id, proficiency (int). `SkillRoutingService`: when ticket is created/updated, find agents with matching skills sorted by proficiency and current load.

**TODO remaining:** Skill-based queue views, proficiency weighting, skill gap reporting.

---

### Task 12: Agent Capacity Management

**Files:**
- Create: `escalated/src/pages/Admin/Capacity/Index.vue`
- Create: `escalated/src/components/AgentLoadIndicator.vue`
- Create: `escalated-laravel/src/Models/AgentCapacity.php`
- Create: `escalated-laravel/src/Services/CapacityService.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000011_create_escalated_agent_capacity_table.php`

**Frontend:** Admin capacity settings per channel. AgentLoadIndicator: shows current/max in agent list. Color-coded (green/amber/red).

**Backend:** `agent_capacity` table: user_id, channel (email/chat/phone), max_concurrent, current_count. `CapacityService`: check before assignment, increment/decrement on assign/resolve.

**TODO remaining:** Auto-assignment based on capacity, capacity by priority, real-time capacity dashboard.

---

### Task 13: Outbound Webhooks

**Files:**
- Create: `escalated/src/pages/Admin/Webhooks/Index.vue`
- Create: `escalated/src/pages/Admin/Webhooks/Form.vue`
- Create: `escalated/src/pages/Admin/Webhooks/DeliveryLog.vue`
- Create: `escalated-laravel/src/Models/Webhook.php`
- Create: `escalated-laravel/src/Models/WebhookDelivery.php`
- Create: `escalated-laravel/src/Services/WebhookDispatcher.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/WebhookController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000012_create_escalated_webhooks_table.php`

**Frontend:** Webhook CRUD: URL, events (ticket.created, ticket.updated, reply.created, etc.), secret for signing, active toggle. Delivery log: table of recent deliveries with status, response code, payload preview, retry button.

**Backend:** `webhooks` table: id, url, events (json array), secret, active, timestamps. `webhook_deliveries` table: id, webhook_id, event, payload (json), response_code, response_body, attempts, delivered_at, timestamps. `WebhookDispatcher`: queue-based, HMAC-SHA256 signing, exponential retry (3 attempts).

**TODO remaining:** Webhook testing (send test payload), event filtering conditions, batch delivery.

---

### Task 14: Time-Based Automations

**Files:**
- Create: `escalated/src/pages/Admin/Automations/Index.vue`
- Create: `escalated/src/pages/Admin/Automations/Form.vue`
- Create: `escalated-laravel/src/Models/Automation.php`
- Create: `escalated-laravel/src/Services/AutomationRunner.php`
- Create: `escalated-laravel/src/Console/Commands/RunAutomationsCommand.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000013_create_escalated_automations_table.php`

**Frontend:** Condition builder: "Hours since created/updated/assigned > X AND status = Y THEN action". Actions: change status, assign, add tag, send notification, escalate.

**Backend:** `automations` table: id, name, conditions (json), actions (json), active, position, last_run_at, timestamps. `AutomationRunner`: scheduled command (hourly), evaluates conditions against all open tickets, executes actions. `RunAutomationsCommand`: `php artisan escalated:run-automations`.

**TODO remaining:** Business-hours-aware timing, automation history/log, per-automation run stats.

---

### Task 15: Trigger Categories

**Files:**
- Modify: `escalated/src/pages/Admin/EscalationRules/Index.vue` — add category grouping
- Create: `escalated-laravel/database/migrations/2026_02_24_000014_add_category_to_escalation_rules.php`

**Frontend:** Add category dropdown to escalation rule form. Group rules by category in index page with collapsible sections.

**Backend:** Add `category` string column to escalation_rules table. Default: 'Uncategorized'.

**TODO remaining:** Category CRUD page, drag-to-reorder within categories.

---

### Task 16: Knowledge Panel in Ticket View

**Files:**
- Create: `escalated/src/components/KnowledgePanel.vue`
- Modify: `escalated/src/pages/Agent/TicketShow.vue` — add panel to sidebar

**Frontend:** Sidebar panel with search input. As agent types, searches KB articles (once KB exists). Shows article previews with "Insert Link" and "Quote" buttons. Depends on Knowledge Base (Task 21) but can scaffold the UI now with mock data.

**TODO remaining:** Full KB integration, auto-suggest based on ticket content, article link tracking.

---

## LAYER 3: Content & Analytics (8 tasks)

### Task 17: Knowledge Base — Articles & Categories

**Files:**
- Create: `escalated/src/pages/Admin/KnowledgeBase/Articles/Index.vue`
- Create: `escalated/src/pages/Admin/KnowledgeBase/Articles/Form.vue`
- Create: `escalated/src/pages/Admin/KnowledgeBase/Categories/Index.vue`
- Create: `escalated/src/components/ArticleEditor.vue`
- Create: `escalated/src/components/CategoryTree.vue`
- Create: `escalated/src/pages/Customer/KnowledgeBase/Index.vue`
- Create: `escalated/src/pages/Customer/KnowledgeBase/Article.vue`
- Create: `escalated-laravel/src/Models/Article.php`
- Create: `escalated-laravel/src/Models/ArticleCategory.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/ArticleController.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/ArticleCategoryController.php`
- Create: `escalated-laravel/src/Http/Controllers/Customer/KnowledgeBaseController.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000015_create_escalated_knowledge_base_tables.php`

**Frontend:** ArticleEditor: rich text (contenteditable with toolbar), title, category selector, status (draft/published), SEO fields. CategoryTree: nested drag-drop tree. Customer-facing: searchable article browser, article detail with feedback ("Was this helpful?").

**Backend:** `article_categories` table: id, name, slug, parent_id (self-referential), position, description, timestamps. `articles` table: id, category_id, title, slug, body (longtext), status (draft/review/published), author_id, view_count, helpful_count, not_helpful_count, published_at, timestamps. Full-text search on title + body.

**TODO remaining:** Article versioning, publishing workflow (author/reviewer/publisher), multilingual articles, content cues/AI suggestions, SEO metadata, article attachments.

---

### Task 18: Pre-Built Dashboards & Reporting

**Files:**
- Create: `escalated/src/pages/Admin/Reports/Dashboard.vue`
- Create: `escalated/src/components/ChartWidget.vue`
- Create: `escalated/src/components/KpiCard.vue`
- Modify: `escalated/src/pages/Admin/Reports.vue` — enhance with dashboard tabs
- Create: `escalated-laravel/src/Services/ReportingService.php`
- Create: `escalated-laravel/src/Http/Controllers/Admin/ReportController.php` (enhance existing)

**Frontend:** Dashboard with tabs: Overview, Agents, SLA, CSAT. ChartWidget: wrapper for simple bar/line/pie charts (CSS-only, no charting library). KpiCard: large number with trend indicator.

**Backend:** `ReportingService`: query methods for ticket volume by date, agent performance, SLA compliance rates, CSAT averages. Endpoints return JSON data for charts.

**TODO remaining:** Custom report builder (drag-drop), scheduled report delivery, date range comparisons, export to CSV/PDF, real-time dashboard via WebSocket.

---

### Task 19: Agent Productivity Metrics

**Files:**
- Create: `escalated/src/pages/Admin/Reports/AgentMetrics.vue`
- Create: `escalated/src/components/AgentPerformanceCard.vue`

**Frontend:** Per-agent view: tickets resolved, avg response time, avg resolution time, CSAT score, tickets per day trend.

**Backend:** Extend `ReportingService` with per-agent aggregation queries.

**TODO remaining:** Team comparisons, coaching insights, export.

---

### Task 20: SLA Achievement Reporting

**Files:**
- Create: `escalated/src/pages/Admin/Reports/SlaReport.vue`
- Create: `escalated/src/components/SlaComplianceChart.vue`

**Frontend:** SLA compliance rates by policy, priority, department. Breach analysis: which tickets breached and why. Trend chart.

**Backend:** Query SLA breach data from tickets, aggregate by dimensions.

**TODO remaining:** SLA forecasting, breach alerts, business-hours-adjusted calculations.

---

### Task 21: CSAT Customization & Reporting

**Files:**
- Create: `escalated/src/pages/Admin/Settings/CsatSettings.vue`
- Create: `escalated/src/pages/Admin/Reports/CsatReport.vue`
- Create: `escalated-laravel/database/migrations/2026_02_24_000016_create_escalated_csat_config_table.php`

**Frontend:** CSAT settings: customize survey question text, rating scale, delivery timing (on resolve, X hours after resolve, manual). CSAT report: score by agent, team, time period.

**Backend:** `csat_config` table or settings: question_text, scale, delivery_trigger, delivery_delay_hours.

**TODO remaining:** Conditional survey delivery (skip for specific tags/departments), multi-question surveys.

---

## LAYER 4: Platform & Security (8 tasks)

### Task 22: SSO (SAML/JWT)

**Files:**
- Create: `escalated/src/pages/Admin/Settings/SsoSettings.vue`
- Create: `escalated-laravel/src/Services/SsoService.php`

**Frontend:** SSO config form: provider selection (SAML, JWT, OAuth), endpoint URLs, certificate upload, attribute mapping.

**Backend:** `SsoService`: handle SAML assertion parsing, JWT verification. Store config in settings.

**TODO remaining:** Full SAML SP implementation, IdP metadata import, auto-provisioning, logout redirect.

---

### Task 23: Two-Factor Authentication

**Files:**
- Create: `escalated/src/components/TwoFactorSetup.vue`
- Create: `escalated/src/components/TotpInput.vue`
- Create: `escalated-laravel/src/Services/TwoFactorService.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000017_add_two_factor_to_users.php`

**Frontend:** Setup wizard: QR code display, TOTP verification, recovery codes. Login: 6-digit code input after password.

**Backend:** TOTP secret generation, QR code URI, verification. Recovery codes (hashed). Add `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at` to users.

**TODO remaining:** Enforce 2FA for admin role, remember device, backup methods (SMS, email).

---

### Task 24: Data Retention Policies

**Files:**
- Create: `escalated/src/pages/Admin/Settings/DataRetention.vue`
- Create: `escalated-laravel/src/Console/Commands/PurgeExpiredDataCommand.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000018_create_escalated_data_retention_config.php`

**Frontend:** Config form: retention period per data type (tickets, attachments, audit logs, user data). Preview of data to be purged.

**Backend:** Scheduled command to delete data older than retention period. Soft-delete first, permanent delete after grace period.

**TODO remaining:** GDPR right-to-erasure endpoint, per-user data export, retention policy per department.

---

### Task 25: Email Channel (Advanced)

**Files:**
- Create: `escalated/src/pages/Admin/Settings/EmailSettings.vue`
- Create: `escalated-laravel/src/Services/EmailChannelService.php`

**Frontend:** Multi-address support email config. Per-address: display name, DKIM status, auto-reply template. Inbound routing rules.

**Backend:** Support multiple email addresses mapped to departments. DKIM/SPF verification status display. Email piping configuration.

**TODO remaining:** DKIM key generation, SPF record helper, email template editor, bounce handling.

---

### Task 26: Conditional Fields

**Files:**
- Create: `escalated/src/components/ConditionalFieldRules.vue`
- Modify: `escalated/src/components/CustomFieldRenderer.vue` — evaluate conditions

**Frontend:** Rule builder: "When [Field A] equals [Value X], show [Field B]". Visual rule editor with add/remove conditions.

**Backend:** Store conditions on custom fields as JSON. Frontend evaluates conditions client-side for responsiveness.

**TODO remaining:** Server-side condition validation, nested conditions (AND/OR groups).

---

### Task 27: Custom Objects & Lookup Relationships

**Files:**
- Create: `escalated/src/pages/Admin/CustomObjects/Index.vue`
- Create: `escalated/src/pages/Admin/CustomObjects/Form.vue`
- Create: `escalated-laravel/src/Models/CustomObject.php`
- Create: `escalated-laravel/src/Models/CustomObjectRecord.php`
- Create: `escalated-laravel/database/migrations/2026_02_24_000019_create_escalated_custom_objects_tables.php`

**Frontend:** Define custom object schemas (e.g., "Product" with fields: name, SKU, category). Record browser. Lookup field type for custom fields.

**Backend:** `custom_objects` table: id, name, slug, fields_schema (json), timestamps. `custom_object_records` table: id, object_id, data (json), timestamps.

**TODO remaining:** Lookup relationships to tickets/users, record search, import/export.

---

### Task 28: Sandbox Environment

**Files:**
- Create: `escalated/src/pages/Admin/Settings/Sandbox.vue`

**Frontend:** Sandbox creation button, status indicator, sync controls.

**Backend:** Conceptual — sandbox requires environment cloning which is infrastructure-level.

**TODO remaining:** Full sandbox implementation (DB clone, config isolation, sync back), this is primarily a backend/DevOps feature.

---

### Task 29: Context Panel Framework

**Files:**
- Create: `escalated/src/components/ContextPanel.vue`
- Create: `escalated/src/components/ContextPanelSection.vue`
- Modify: `escalated/src/pages/Agent/TicketShow.vue` — add context panel to sidebar

**Frontend:** Right-side collapsible panel framework. Each section is a `ContextPanelSection` with title, icon, collapsible body. Plugins register sections via `sidebarPanels` extension. Built-in sections: Customer Info, Related Tickets, Recent Activity.

**TODO remaining:** Plugin-provided context panels (Shopify, Salesforce, etc.), panel ordering/customization.

---

## PLUGINS (24 plugins, each gets scaffold + TODO.md)

Each plugin follows this structure:
```
escalated-plugin-<name>/
├── package.json
├── src/
│   ├── index.js          # defineEscalatedPlugin() entry
│   └── components/       # Vue components
├── TODO.md
└── README.md
```

### Task 30: Scaffold all 24 plugins

Create each plugin directory with:
1. `package.json` with name, version 0.1.0, peer deps
2. `src/index.js` using `defineEscalatedPlugin()` with appropriate hooks
3. `src/components/` with at least one placeholder component
4. `TODO.md` with detailed remaining work
5. `README.md` with plugin description and install instructions

**Plugins to scaffold:**
1. `escalated-plugin-livechat` — Real-time messaging widget
2. `escalated-plugin-slack` — Slack notifications + ticket creation
3. `escalated-plugin-jira` — Jira issue linking + sync
4. `escalated-plugin-ai-copilot` — AI reply suggestions + summarization
5. `escalated-plugin-web-widget` — Embeddable support widget
6. `escalated-plugin-whatsapp` — WhatsApp Business messaging
7. `escalated-plugin-sms` — SMS channel via Twilio/etc
8. `escalated-plugin-social` — Facebook/X/Instagram
9. `escalated-plugin-phone` — Voice/IVR integration
10. `escalated-plugin-community` — Community forums
11. `escalated-plugin-nps` — Net Promoter Score surveys
12. `escalated-plugin-kb-ai` — KB article suggestions + content cues
13. `escalated-plugin-approvals` — Approval workflows on tickets
14. `escalated-plugin-custom-objects` — Custom data objects UI
15. `escalated-plugin-ip-restriction` — IP whitelist for agents
16. `escalated-plugin-compliance` — HIPAA/SOC2 compliance tools
17. `escalated-plugin-marketplace` — Plugin marketplace browser
18. `escalated-plugin-scheduled-reports` — Email report delivery
19. `escalated-plugin-custom-layouts` — Custom workspace layouts
20. `escalated-plugin-proactive-messages` — Proactive customer outreach
21. `escalated-plugin-omnichannel-routing` — Unified cross-channel routing
22. `escalated-plugin-mobile-sdk` — Mobile SDK documentation + helpers
23. `escalated-plugin-unified-status` — Cross-channel agent status
24. `escalated-plugin-ticket-sharing` — Cross-instance ticket sharing

---

## Final Tasks

### Task 31: Update navigation and exports

- Add nav items for all new admin pages in `EscalatedLayout.vue`
- Export all new components from `src/index.js`
- Update test export count

### Task 32: Run tests and commit

- Run `npm test` in `escalated/`
- Fix any failing tests
- Commit all changes to `feature/zendesk-parity` branches
- Push to remote

---

## Execution Strategy

Tasks 1-5 (Layer 1) can run in parallel — they have no dependencies on each other.
Tasks 6-16 (Layer 2) can run in parallel after Layer 1 commits.
Tasks 17-21 (Layer 3) can mostly run in parallel, Task 17 (KB) first since Task 16 depends on it.
Tasks 22-29 (Layer 4) can run in parallel.
Task 30 (plugins) can run in parallel with everything.
Tasks 31-32 run last.
