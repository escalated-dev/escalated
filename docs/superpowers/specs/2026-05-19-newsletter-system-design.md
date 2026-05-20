# Newsletter System — Design Spec

**Date:** 2026-05-19
**Owner:** Matthew Gros
**Status:** Draft for review

## Summary

Adds a newsletter / broadcast system to Escalated as an opt-in admin feature. Disabled by default. Lets admins compose Markdown-authored emails against themed wrappers, send to static lists or dynamic contact segments, schedule sends, and track opens/clicks/bounces via a hybrid ESP-webhook + self-hosted pipeline. One-click unsubscribe is contact-scoped and respects Gmail/Yahoo bulk-sender rules. Ships PR-per-backend across 11 host frameworks plus the shared Vue/Inertia frontend, with Laravel as the reference implementation.

## Goals

- Move Escalated from "ticketing" toward "complete customer-care platform" by giving admins a first-class broadcast surface.
- Reuse existing infrastructure: contacts, ESP configs, outbound mail adapters, cron scheduling, settings table, permissions, admin UI conventions.
- Zero runtime cost when disabled: feature-flag gates module registration, not just behavior.
- Developer-focused customizability — themes are code files, not WYSIWYG configs.
- Deliverability that meets Gmail/Yahoo 2024+ bulk-sender requirements out of the box.

## Non-Goals (v1)

- A/B subject testing
- Drip / sequence campaigns
- Customer-facing preference center (one-click unsubscribe is sufficient)
- Cold-list imports of emails that have no support history (standalone subscribers)
- Drag-and-drop visual builder / WYSIWYG layout editor
- Engagement-based dynamic segments (e.g. "opened last 3 newsletters")
- Multi-language template variants
- API-driven external sends (admin UI is the only surface)

## Design Decisions

### Architecture

Approach: **Monolithic newsletter module per backend** (rejected alternatives: external plugin SDK package, hosted cloud broadcast service). Each backend ships a self-contained newsletter feature area following existing Workflows/Automations/Macros conventions. The shared Vue/Inertia frontend in `escalated/` carries all admin pages and consumes a backend-injected `escalated.features.newsletters` boolean to gate the sidebar entry.

### Scope shape

Combo of "full campaign platform" + "customer-care focused":

- Templates, scheduling, tracking, list segmentation: present.
- Recipients sourced from existing `escalated_contacts` (no separate subscriber table).
- Both static lists (manual / CSV-imported contact IDs) and dynamic segments (saved contact filters).

### Send infrastructure

Reuses each backend's existing outbound mail adapter — there is no new SMTP/ESP integration layer for v1. The same `EmailService` / `MailerService` / Notification facade that ships transactional ticket emails ships newsletters. ESP credentials are already configured per-host; newsletters inherit them automatically.

### Tracking

**Hybrid**: ESP webhook events when the configured transport supports them; self-hosted pixel + click-redirect endpoints as the fallback (and always-on for opens/clicks because ESP coverage varies). Bounce events come from ESP webhooks when available, with a fallback path through the existing inbound parsers in `src/services/email/` for transports that surface bounces as DSN-style replies.

### Unsubscribe

**One-click, contact-scoped, RFC 8058 compliant.** Outbound emails carry `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers. A new `marketing_opt_out_at` column on `escalated_contacts` is the suppression source-of-truth; once set, the contact is skipped at Plan time on every future campaign regardless of which list they're in.

### Authoring

**Markdown + server-side themes.** Author writes Markdown in the admin UI; merge fields use `{{ contact.field }}` syntax against a strict allowlist; themes are host-language template files (Blade, Handlebars, ERB, Jinja, etc.) that wrap canonical HTML output. Two starter themes (`default`, `branded`) ship in every backend. Customers add themes by dropping new files into the themes directory. No WYSIWYG library; no `npm`-level editor dependency in the shared frontend.

### Permissions

**Two new permissions**: `newsletters.manage` (CRUD on lists, templates, draft newsletters) and `newsletters.send` (Schedule, Send Now). Both attached to the Admin role by default at install time. Splits authoring from send authority so a non-admin Marketing role can be granted later without code changes.

### Rollout

**Laravel first** (override of the usual NestJS-reference rule for this feature, at the user's direction). NestJS port follows immediately and becomes the canonical reference in `escalated-developer-context`. Remaining 8 backends ship in parallel from that reference. WordPress is special-cased due to WP options/cron differences.

## Domain Model

Four new tables plus one altered table.

### `escalated_newsletter_lists`

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | varchar(255) | Required, unique per-tenant if multi-tenant |
| `description` | text | Nullable |
| `kind` | enum | `static` or `dynamic` |
| `filter_json` | json | Nullable; populated only when `kind = dynamic`. Reuses the same shape as existing contacts saved-view filters. |
| `created_by` | int | FK to host users |
| `created_at` / `updated_at` | timestamps | |

### `escalated_newsletter_list_members`

Composite-key pivot for static lists.

| Column | Type | Notes |
|---|---|---|
| `list_id` | int | FK → `escalated_newsletter_lists.id`, cascade delete |
| `contact_id` | int | FK → `escalated_contacts.id`, cascade delete |
| `added_at` | timestamp | |
| `added_by` | int | FK to host users |

Unique index on (`list_id`, `contact_id`).

### `escalated_newsletter_templates`

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | varchar(255) | |
| `theme` | varchar(64) | Theme slug; defaults to `newsletter.default_theme` setting |
| `subject_template` | varchar(998) | Optional default subject with merge fields |
| `body_markdown` | text | |
| `merge_fields_schema` | json | Allowlist of expected fields for validation; nullable |
| `created_by` | int | |
| `created_at` / `updated_at` | timestamps | |

### `escalated_newsletters`

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `subject` | varchar(998) | |
| `from_email` | varchar(320) | Defaults to `newsletter.default_from` |
| `from_name` | varchar(255) | Nullable |
| `reply_to` | varchar(320) | Nullable; defaults to `newsletter.default_reply_to` |
| `target_list_id` | int | FK → `escalated_newsletter_lists.id` |
| `template_id` | int | FK → `escalated_newsletter_templates.id`, nullable (allows ad-hoc body) |
| `theme` | varchar(64) | Override of template's theme; nullable |
| `body_markdown` | text | Override of template body; nullable |
| `status` | enum | `draft`, `scheduled`, `sending`, `sent`, `paused`, `failed` |
| `scheduled_at` | timestamp | Nullable |
| `sent_at` | timestamp | Nullable; set when status flips to `sent` |
| `created_by` | int | |
| `sent_by` | int | Nullable; user who triggered Send Now or whose scheduled send executed |
| `created_at` / `updated_at` | timestamps | |
| `summary_total` | int | Snapshot of recipient count at Plan time |
| `summary_sent` | int | Cached aggregate, updated on dispatcher batch completion |
| `summary_opened` | int | Cached aggregate |
| `summary_clicked` | int | Cached aggregate |
| `summary_bounced` | int | Cached aggregate |
| `summary_complained` | int | Cached aggregate |

Status transitions: `draft → scheduled → sending → sent | failed | paused`. `paused` can go back to `sending` on resume. `failed` is terminal.

### `escalated_newsletter_deliveries`

The high-cardinality table. One row per recipient per campaign.

| Column | Type | Notes |
|---|---|---|
| `id` | PK (bigint) | |
| `newsletter_id` | int | FK → `escalated_newsletters.id`, indexed |
| `contact_id` | int | FK → `escalated_contacts.id`, indexed |
| `email_at_send` | varchar(320) | Snapshot of contact email at Plan time |
| `status` | enum | `pending`, `queued`, `sent`, `bounced`, `complained`, `suppressed`, `failed` |
| `tracking_token` | varchar(40) | Random opaque, unique-indexed; used in pixel + click + unsub URLs |
| `sent_at` | timestamp | Nullable |
| `opened_at` | timestamp | Nullable; first-event-wins |
| `last_clicked_at` | timestamp | Nullable; last-event-wins |
| `clicks_count` | int | Aggregate click count for this delivery |
| `bounce_reason` | text | Nullable; ESP-provided or DSN-parsed |
| `failure_reason` | text | Nullable; for terminal dispatch failures |
| `attempt_count` | smallint | Retry counter, 0-3 |
| `claimed_at` | timestamp | Worker heartbeat for crash recovery |
| `is_test` | boolean | True for "Send Test to Me" deliveries; excluded from analytics |
| `created_at` | timestamp | |

Compound index on (`newsletter_id`, `status`) for the dispatcher's pending-pull query. Unique index on `tracking_token`.

### Alter `escalated_contacts`

Add column:

| Column | Type | Notes |
|---|---|---|
| `marketing_opt_out_at` | timestamp | Nullable. Source-of-truth for marketing suppression. |

## Send Pipeline

### Submit

Admin POSTs to the newsletter CRUD endpoint. Validation enforced:

- `target_list_id` exists and is not empty.
- One of `template_id` or `body_markdown` is present.
- `from_email` is a syntactically valid email.
- For non-draft saves: outbound mail transport is configured at the host level.
- For `scheduled` status: `scheduled_at` is in the future.

No work happens yet. Row persists with `status = draft` or `scheduled`.

### Plan

Triggered by:
1. The scheduler tick when `scheduled_at ≤ now AND status = scheduled`.
2. An explicit "Send Now" admin action (transitions from `draft` or `scheduled`).

The Planner:
1. Flips status to `sending`.
2. Resolves the target list to a set of `contact_id`s:
   - Static list: query `escalated_newsletter_list_members`.
   - Dynamic list: evaluate `filter_json` against the contacts query builder.
3. Filters out contacts where `marketing_opt_out_at IS NOT NULL`.
4. Filters out contacts whose email has previously hard-bounced (tracked via a per-email suppression set, see "Bounce handling" below).
5. Writes one `NewsletterDelivery` row per surviving contact with `status = pending`, a freshly-generated 40-char `tracking_token`, and `email_at_send` snapshotted from the contact.
6. Writes `summary_total` on the parent newsletter.

This snapshot makes the campaign immune to list mutations during a long-running send.

### Dispatch

A background worker (Laravel: queued job triggered by the artisan command; NestJS: scheduled task that processes batches; Rails: ActiveJob; etc.) pulls `pending` deliveries in batches.

- **Batch size**: 50 per tick (configurable via `newsletter.batch_size`).
- **Rate limit**: 60/min by default (configurable via `newsletter.rate_limit_per_minute`).
- **Claim**: row's `claimed_at` is set to `now`, status flipped to `queued`. Other workers skip rows where `claimed_at > now - 10 minutes`.
- **Render**: pipeline below.
- **Send**: hand off to the host's outbound mail adapter with these headers:
  - `Message-ID` — domain + delivery token, used for ESP event correlation
  - `List-Unsubscribe: <https://.../escalated/n/u/{token}>, <mailto:unsubscribe@.../>>`
  - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
  - `X-Escalated-Newsletter-Id: {newsletter_id}`
- **Mark sent**: on synchronous accept, status → `sent`, `sent_at = now`. Increment `summary_sent`.
- **Retry**: on synchronous failure (SMTP 5xx, ESP API error), increment `attempt_count`, requeue with exponential backoff (1m, 5m, 30m). At `attempt_count = 3`, status → `failed`, `failure_reason` populated.

When all deliveries for a newsletter are in terminal states (`sent`, `bounced`, `complained`, `suppressed`, `failed`), newsletter `status` flips to `sent` and `sent_at` is stamped.

### Track

**Two ingress paths feeding the same `NewsletterDelivery` rows.**

#### ESP webhook adapter

Each backend's existing inbound webhook endpoints (Postmark, SES, Mailgun, SendGrid parsers in `src/services/email/`) gain an outbound-events handler. Events are correlated by `Message-ID` → `newsletter_deliveries.tracking_token`.

Handled event types:
- `delivered` (no-op; we already mark `sent` on accept)
- `opened` → set `opened_at` if null, increment `summary_opened`
- `clicked` → set `last_clicked_at`, increment `clicks_count`, increment `summary_clicked` if this is first click on this delivery
- `bounced` (soft) → log, no status change
- `bounced` (hard) → status `bounced`, add email to suppression set, increment `summary_bounced`
- `complained` (spam report) → status `complained`, add email to suppression set, increment `summary_complained`

#### Self-hosted endpoints

Always live when feature flag is on, regardless of ESP. The renderer rewrites every `href` to a click endpoint and appends a tracking pixel before `</body>`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/escalated/n/o/{token}.gif` | GET | 1×1 transparent PNG. Sets `opened_at` if null. Always returns 200. |
| `/escalated/n/c/{token}?u=<base64-url>` | GET | Records click, 302 redirect to decoded URL. Validates URL is non-javascript scheme. |
| `/escalated/n/u/{token}` | GET | Confirmation page (themed). |
| `/escalated/n/u/{token}` | POST | One-click unsub. Sets `contacts.marketing_opt_out_at`. Returns 200 with confirmation page. RFC 8058 compatible — sets `marketing_opt_out_at` even if Content-Type is `application/x-www-form-urlencoded` with `List-Unsubscribe=One-Click`. |
| `/escalated/n/v/{token}` | GET | View-in-browser. Renders themed HTML. Token-gated, no auth required. |

All endpoints are public, idempotent, and return 200/302 even on unknown tokens (constant-time response to avoid token enumeration).

### Failure modes

- **Mail transport not configured** → UI blocks Send/Schedule; banner shown.
- **Scheduler missed a tick** → next tick catches up via `scheduled_at ≤ now` predicate.
- **Process crash mid-dispatch** → rows stuck in `queued` for >10 min get reclaimed to `pending` on next tick.
- **Mass bounce / complaint storm** → if hard-bounce rate exceeds 5% in the first 100 deliveries of a campaign, dispatcher auto-pauses (status → `paused`), surfaces warning in admin UI. Manual resume required.
- **ESP webhook out-of-order events** → bounce-after-open is fine (status reflects last terminal event). Opens-after-bounce are dropped.
- **Disabled mid-flight** → see "Disable-after-enable" below.

## Rendering Pipeline

### Stage 1: Markdown → canonical HTML

Per-backend Markdown library (Laravel: `league/commonmark`, NestJS: `markdown-it`, Django: `markdown`, Rails: `commonmarker`, etc.). Output is canonical HTML with no inline styles, ready for theming.

Merge fields use `{{ contact.field }}` syntax. Resolution happens **after** Markdown→HTML conversion, against a strict allowlist:

- `contact.name`, `contact.first_name`, `contact.email`
- `contact.metadata.<key>` (dotted-path lookup into the contacts JSON metadata column)
- `unsubscribe_url`, `view_in_browser_url`, `tracking_pixel` (auto-injected by renderer)

Unknown fields render as empty strings (never as raw `{{ }}` text). The renderer never invokes the host template language on user content.

### Stage 2: Canonical HTML → themed email

Themes are host-language template files:

| Backend | Path |
|---|---|
| Laravel | `resources/views/vendor/escalated/newsletters/themes/<slug>.blade.php` |
| NestJS | `templates/newsletters/themes/<slug>.hbs` |
| Rails | `app/views/escalated/newsletters/themes/<slug>.html.erb` |
| Django | `templates/escalated/newsletters/themes/<slug>.html` (Jinja) |
| Symfony | `templates/escalated/newsletters/themes/<slug>.html.twig` |
| Phoenix | `lib/escalated_web/templates/newsletter_themes/<slug>.html.eex` |
| Go | `internal/templates/newsletter_themes/<slug>.tmpl` |
| .NET | `Views/Escalated/NewsletterThemes/<slug>.cshtml` |
| Spring | `src/main/resources/templates/escalated/newsletter_themes/<slug>.html` (Thymeleaf) |
| WordPress | `templates/newsletter-themes/<slug>.php` |

Themes receive `{{ body }}`, `{{ subject }}`, `{{ unsubscribe_url }}`, `{{ view_in_browser_url }}`, `{{ tracking_pixel }}`, `{{ brand.* }}` (from settings).

Each backend ships:
- `default.{ext}` — clean single-column, system-font, accessible (AA contrast, scaled fonts, `<title>` set).
- `branded.{ext}` — adds header logo + accent color from `escalated_settings`.

Custom themes are discovered at boot by directory scan. No DB rows.

### Post-render pass

1. **Click rewriting** — walk all `<a href>` attributes, rewrite to `/escalated/n/c/{token}?u=<base64-encoded-original-url>`. Skip the unsubscribe and view-in-browser links (already pointing at our endpoints — match by URL prefix). Skip `mailto:` and `tel:` URLs.
2. **Pixel injection** — append `<img src="/escalated/n/o/{token}.gif" width="1" height="1" alt="" />` immediately before `</body>`.

HTML manipulation uses each host's native library: Laravel `symfony/dom-crawler`, NestJS `cheerio`, Rails `nokogiri`, Django `lxml`, etc.

### Preview & test send

- **Inline preview**: admin UI compose page has an iframe that re-renders against a sample contact (synthetic merge-field values) on debounced edit.
- **Send Test to Me**: button sends to the current agent's email. Creates a `NewsletterDelivery` row with `is_test = true` so it's excluded from analytics. Requires `newsletters.manage`.

## Admin UI

Lives in `escalated/` shared Vue/Inertia frontend under `src/pages/admin/newsletters/`.

### Routes

```
/admin/newsletters                     Index — drafts, scheduled, sent (tabs)
/admin/newsletters/new                 Compose new
/admin/newsletters/:id                 Detail (Overview / Deliveries / Analytics tabs)
/admin/newsletters/:id/edit            Edit draft or scheduled
/admin/newsletters/lists               Lists index
/admin/newsletters/lists/new           Create list (static or dynamic)
/admin/newsletters/lists/:id           List detail + members / saved filter editor
/admin/newsletters/templates           Templates index
/admin/newsletters/templates/new       Create template
/admin/newsletters/templates/:id       Edit template
/admin/newsletters/settings            From-address, default theme, rate-limit, default reply-to, tracking_enabled
```

### Nav gating

A "Newsletters" admin sidebar item appears when:
1. `escalated.features.newsletters === true` in shared page props, AND
2. Current user has `newsletters.manage` or `newsletters.send` permission.

Otherwise the link is absent. Same gating as existing KB/CSAT toggles.

### Compose page layout

Three-pane:

- **Left**: metadata form — subject (with merge-field dropdown), from name + email, reply-to, target list selector (autocomplete with member-count preview), schedule input.
- **Center**: CodeMirror-lite Markdown editor with merge-field dropdown above. No fancy WYSIWYG.
- **Right**: live preview iframe, re-renders on debounced (500ms) edit.

Top bar buttons:
- **Save Draft** — requires `newsletters.manage`
- **Send Test to Me** — requires `newsletters.manage`
- **Schedule** — requires `newsletters.send`
- **Send Now** — requires `newsletters.send`

### Detail page tabs

**Overview**: metadata, status badge, timestamps, summary tiles.

**Deliveries**: paginated table of `NewsletterDelivery` rows. Columns: contact name+email, status, sent_at, opened_at, last_clicked_at, bounce_reason. Filterable by status. CSV export.

**Analytics**: five summary tiles (sent / delivered / opened / clicked / bounced) with absolute counts + rates. Top-clicked-URLs list. No funnel/cohort analysis.

### Lists page

- Static lists: member count, Add / Remove / Import-CSV buttons.
- Dynamic lists: reuses contacts saved-view filter builder, shows live "matches X contacts" counter.
- Both: "Y contacts opted out" indicator.

### Templates page

Card grid. Each card shows name, theme slug, last-used date. Click to edit (name, theme dropdown, subject_template, body_markdown, merge_fields_schema).

### Security note

Tracking tokens never appear in the admin UI — admin operates on stable `contact_id` references.

## Feature Gating & Install Flow

### Three layers of the flag

**1. Module/provider registration.**
Each backend conditionally registers the newsletter module based on `enableNewsletters`. When false: no controllers register, no entities mount, no scheduler hooks subscribe. The migrations still apply on `migrate` (so re-enabling is zero-friction), but no code paths execute.

| Backend | Wiring |
|---|---|
| NestJS | `imports: [...(opts.enableNewsletters ? [NewsletterModule] : [])]` in `EscalatedModule` |
| Laravel | `EscalatedServiceProvider::register` early-returns from newsletter binding when `config('escalated.enable_newsletters') === false` |
| Rails | Engine isolates newsletter routes/controllers; `Escalated.config.enable_newsletters` guards `Rails.application.routes.draw` block |
| Django | App config conditionally mounts URL include |
| Symfony | Bundle extension early-returns when flag is false |
| Adonis | Provider conditionally registers |
| Phoenix | Router pipeline conditionally forwards |
| Go | Mux conditionally registers handlers |
| .NET | Service collection conditionally registers |
| Spring | `@ConditionalOnProperty("escalated.newsletters.enabled")` |
| WordPress | Plugin conditionally registers admin pages + cron hooks |

**2. Frontend page registration.**
Shared frontend reads `escalated.features.newsletters` from shared page props (injected by backend's shared-data middleware). If false: sidebar entry omitted, admin newsletter routes never resolve. Page components remain bundled (shared code) but unreachable.

**3. Setting-level sub-toggles.**
Stored in `escalated_settings`, read only when top-level flag is true:

- `newsletter.default_from` — default From address (defaults to `options.emailFrom`)
- `newsletter.default_reply_to` — default Reply-To
- `newsletter.default_theme` — `default` or `branded` or custom slug
- `newsletter.rate_limit_per_minute` — int, default 60
- `newsletter.batch_size` — int, default 50
- `newsletter.tracking_enabled` — bool, default true. When false: pixel and click-rewriting are skipped at render time. ESP webhooks still process bounces/complaints.

### Install flow

Each backend's installer command gains a single y/n prompt:

```
Enable newsletter system? (admins-only feature for sending broadcasts to contacts) [y/N]
```

Default: no.

On `y`: installer writes the flag to the host's config (Laravel: `config/escalated.php` + `.env` `ESCALATED_ENABLE_NEWSLETTERS=true`; equivalent per backend) and seeds the two new permissions onto the Admin role.

Non-interactive flags supported by every installer:
- `--with-newsletters`
- `--no-newsletters`

### Permission setup

Two new permissions created on install (regardless of newsletter enablement, so they're available if enabled later):

- `newsletters.manage` — CRUD on lists, templates, draft newsletters; Send Test
- `newsletters.send` — Schedule, Send Now

Both attached to the Admin role at install time when newsletters are enabled. If enabled later via setting flip, the host's existing role-seeder re-run attaches them.

### Disable-after-enable

If flag flipped off mid-flight:
- In-flight `sending` newsletters: dispatcher next tick observes flag, no new dispatches happen. Existing `queued` rows are reclaimed but don't dispatch.
- Tracking endpoints: return 404.
- Admin UI: vanishes (nav and routes).
- Data: preserved (lists, templates, deliveries, analytics). Re-enabling resumes cleanly.

Toggling a flag is never destructive.

### Outbound mail prerequisite

If host has not configured outbound mail (`options.mail` unset / `MAIL_MAILER=none` / etc.):
- Feature can still be enabled (avoids chicken/egg with install order).
- Admin UI shows a setup banner: "Configure outbound mail before sending newsletters."
- Send Now / Schedule actions are blocked at server-side validation, not just UI.

## Rollout Plan

Strict wave order to keep the reference implementation canonical before parallel ports.

### Wave 0 — Shared frontend (`escalated/`)

**1 PR.** Adds:
- All `pages/admin/newsletters/*` Vue pages
- List / template / compose components
- Merge-field dropdown component
- Live preview iframe
- Reads `escalated.features.newsletters` for sidebar gating
- Storybook stories for each page
- Locale keys for all newsletter UI strings (English defaults, structured for translation)

Must be merged + tagged release (likely `0.9.0`) before Wave 1.

### Wave 1 — Laravel reference (`escalated-laravel`)

**1 PR.** The full vertical:

- 5 migrations (lists, list_members, templates, newsletters, deliveries, alter contacts)
- 5 models with relationships
- Services: `NewsletterService`, `NewsletterPlannerService`, `NewsletterDispatcherService`, `NewsletterRendererService`, `NewsletterTrackerService`
- Controllers: admin CRUD (lists, templates, newsletters) + public tracking/unsubscribe/view-in-browser
- Artisan command `escalated:newsletters:dispatch` (host schedules every minute via `schedule:run`)
- ESP webhook outbound-event hooks added to existing Mailgun / Postmark / SES / SendGrid inbound webhook controllers
- Two starter Blade themes (`default.blade.php`, `branded.blade.php`)
- Installer prompt + `--with-newsletters` / `--no-newsletters` flags in `escalated:install` Artisan command
- Permission seeding via existing role-seeder pattern
- Feature flag wiring through `EscalatedServiceProvider`
- Pest unit tests per service
- Pest feature tests for public tracking/unsubscribe/view-in-browser
- README section on enabling newsletters and writing custom themes

End-to-end manual verification before merge: send a test campaign against a real ESP sandbox account (Postmark or SES sandbox).

### Wave 2 — NestJS reference port (`escalated-nestjs`) + context docs (`escalated-developer-context`)

**1 PR per repo.**

NestJS PR mirrors Laravel structure exactly:
- Entity shapes identical (field names, types, indexes)
- Service boundaries identical
- Endpoint paths identical
- Theme contract identical (Handlebars instead of Blade)
- TypeORM migrations matching Laravel migration structure

Context repo PR adds:
- `domain-model/newsletters.md` — canonical explanation of the four-table model, send pipeline, tracking, unsubscribe semantics
- `decisions/2026-05-19-newsletter-system.md` — ADR capturing scope decisions from this spec
- Update `glossary.md` with: Newsletter, NewsletterList (static vs dynamic), NewsletterTemplate, NewsletterDelivery, tracking_token, marketing_opt_out_at

### Wave 3 — Eight remaining backends, parallel-dispatched

**1 PR per backend.** Standard dispatch loop (Codex default, Cursor fallback). All work tracked in a single status file at `docs/superpowers/plans/2026-05-19-newsletter-rollout-status.md` in this repo.

- `escalated-rails`
- `escalated-django`
- `escalated-symfony`
- `escalated-adonis`
- `escalated-phoenix`
- `escalated-go`
- `escalated-dotnet`
- `escalated-spring`
- `escalated-wordpress` (special-cased — see below)
- `escalated-filament` (mostly UI integration on top of the Laravel work)

#### WordPress special-casing

- Uses WP options table for the feature flag and sub-settings (rather than a custom settings table).
- Uses WP-Cron for the dispatcher (rather than a queue worker).
- Uses WP user capabilities for permissions (mapped to the same two slugs).
- Otherwise: contract identical, endpoint paths identical, theme contract identical.

### Wave 4 — Docs & marketing

**1 PR per repo.**

- `escalated-docs`: new "Newsletters" section under Admin Features. Subpages: enabling, list management (static & dynamic), templates & themes, scheduling, tracking & privacy, troubleshooting deliverability.
- `escalated.dev`: feature page (marketing's call — not a blocker for the technical rollout).

### Verification gates

- Wave 0 merged + tagged release before Wave 1.
- Wave 1 merged + manual ESP-sandbox verification before Wave 2.
- Wave 2 merged + context repo updated before Wave 3 dispatches.

### Out-of-scope, flagged for v1.1+

- A/B subject testing
- Drip / sequence campaigns
- Customer preference center
- Cold-list / standalone subscriber imports
- WYSIWYG / drag-and-drop builder
- Engagement-based dynamic segments
- Multi-language template variants
- API-driven external sends
- Marketing-role permission preset

## Testing Strategy

### Unit tests

Per-backend service-level tests for:
- `PlannerService`: list resolution (static, dynamic), suppression (opt-out, hard-bounce set), delivery row creation, summary count update.
- `DispatcherService`: batch claiming, rate limiting, retry/backoff, terminal state transitions, claim reclamation after timeout.
- `RendererService`: Markdown→HTML, merge-field allowlist enforcement, click rewriting (including skip cases), pixel injection, theme resolution.
- `TrackerService`: ESP webhook event correlation, idempotency (open-only-once, click-aggregation), bounce/complaint suppression-set updates.

### Feature / integration tests

- Full Submit → Plan → Dispatch → Track loop with a fake mail adapter (verify Message-ID, List-Unsubscribe, sent_at flow).
- Public endpoints: pixel, click-redirect (including URL validation), unsubscribe one-click (RFC 8058 form-post path), view-in-browser. Unknown tokens return 200 in constant time.
- Disable-mid-flight: flip flag false during a `sending` newsletter, verify dispatcher halts cleanly and tracking endpoints 404.

### Manual / end-to-end (Wave 1 gate)

- Send a real campaign to a Postmark/SES sandbox, verify:
  - Email arrives with correct headers (`List-Unsubscribe`, `List-Unsubscribe-Post`, `Message-ID`)
  - Tracking pixel records open
  - Clicking a link records click and redirects correctly
  - One-click unsubscribe from Gmail's UI sets `marketing_opt_out_at`
  - ESP bounce webhook updates delivery status

## Security & Privacy

- **Tracking tokens**: 40-char random opaque, unique-indexed, constant-time response on lookup failure.
- **Click-redirect URL validation**: reject `javascript:`, `data:`, `file:` schemes. Only allow `http`, `https`, `mailto`, `tel`.
- **Merge-field injection safety**: merge resolution happens after Markdown→HTML, against a strict allowlist. No host-template-language interpretation of user content.
- **CSRF**: admin endpoints follow host's standard CSRF protection. Public tracking endpoints are CSRF-exempt (state mutation is intended).
- **Rate limiting public endpoints**: per-IP rate limit on the unsubscribe POST endpoint to prevent enumeration / mass-unsub attacks. 60 requests/min/IP.
- **Privacy / tracking opt-out**: `newsletter.tracking_enabled = false` disables pixel and click-rewriting globally for tracking-sensitive customers. ESP webhooks still process bounces/complaints (required for deliverability).
- **PII in logs**: bounce reasons and failure reasons may contain email addresses; subject to the host's standard log redaction.
- **GDPR**: contact deletion cascades to delivery rows (FK constraint). Marketing opt-out is honored permanently — re-opt-in requires admin action.
- **CAN-SPAM**: physical mailing address requirement — themes are responsible for rendering it in the footer; `brand.physical_address` setting is read from `escalated_settings`. Empty/unset → admin UI banner warns.

## Open Questions

None blocking. Items for future revisitation:

- Should the rollout-status file gain auto-update via the dispatch loop ticker? (Existing pattern for public-tickets rollout suggests yes.)
- Theme contract versioning: how do we handle a v2 that needs new slot variables? (Probably: introduce `theme_version` column on templates, themes declare their version, renderer warns on mismatch.)
- Aggregate summary counts on `escalated_newsletters` vs computed-on-read: caching is faster but introduces a sync surface. v1 uses cached counts with an explicit "Recompute summary" admin action as the escape hatch.

## References

- Existing Workflows / Automations / Macros conventions: `escalated-developer-context/domain-model/workflows-automations-macros.md`
- Existing email service: `escalated-nestjs/src/services/email/email.service.ts`, `escalated-laravel/src/Mail/`
- Existing inbound ESP parsers: `escalated-nestjs/src/services/email/{mailgun,postmark,ses}-parser.service.ts`
- Existing settings table: `escalated_settings`
- Existing contacts model: `escalated_contacts` (id, email, name, userId, metadata)
- Gmail/Yahoo bulk sender requirements (2024+): one-click unsubscribe (RFC 8058), authenticated sending, low spam-complaint rate
- RFC 8058: One-Click List-Unsubscribe
