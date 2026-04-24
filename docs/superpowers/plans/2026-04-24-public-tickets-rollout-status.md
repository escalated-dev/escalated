# Public Ticket System — Rollout Status Across Frameworks

**Context:** the public ticket system is now shipped in `@escalated-dev/escalated-nestjs` (PR #17, all 9 phases complete). This document surveys the current state of the same capability across the other 11 host-framework implementations and notes the design divergence that has accumulated.

**Survey date:** 2026-04-24
**Last updated:** 2026-04-24 (after iter 40 CI-green sweep)

## PRs in flight (all CI-green)

| Framework | PR | Model | Wire-up | CI |
|---|---|---|---|---|
| escalated-nestjs | [#17](https://github.com/escalated-dev/escalated-nestjs/pull/17) | ✅ | ✅ full feature (232 tests) — reference | ✅ |
| escalated-laravel | [#67](https://github.com/escalated-dev/escalated-laravel/pull/67) | ✅ | ✅ Guest + Widget controllers | ✅ |
| escalated-rails | [#41](https://github.com/escalated-dev/escalated-rails/pull/41) | ✅ | ✅ Guest controller + TicketService | ✅ |
| escalated-rails | [#42](https://github.com/escalated-dev/escalated-rails/pull/42) | — | ✅ WorkflowSubscriber wire-up | ✅ |
| escalated-django | [#38](https://github.com/escalated-dev/escalated-django/pull/38) | ✅ | ✅ Guest + Widget views + inbound service | ✅ |
| escalated-django | [#39](https://github.com/escalated-dev/escalated-django/pull/39) | — | ✅ signal→workflow bridge | ✅ |
| escalated-adonis | [#47](https://github.com/escalated-dev/escalated-adonis/pull/47) | ✅ | ✅ Guest + Widget + inbound | ✅ |
| escalated-dotnet | [#17](https://github.com/escalated-dev/escalated-dotnet/pull/17) | ✅ | ✅ TicketService.CreateAsync | ✅ |
| escalated-wordpress | [#27](https://github.com/escalated-dev/escalated-wordpress/pull/27) | ✅ | ✅ TicketService::create_guest | ✅ |
| escalated-symfony | [#26](https://github.com/escalated-dev/escalated-symfony/pull/26) | ✅ | ✅ TicketService::create | ✅ |
| escalated-symfony | [#27](https://github.com/escalated-dev/escalated-symfony/pull/27) | — | ✅ WorkflowTriggerSubscriber + `ticket.priority_changed` | ✅ |
| escalated-go | [#26](https://github.com/escalated-dev/escalated-go/pull/26) | ✅ | ✅ TicketService.Create (+ contact_id threaded through Ticket SQL) | ✅ |
| escalated-phoenix | [#29](https://github.com/escalated-dev/escalated-phoenix/pull/29) | ✅ | ✅ TicketService.create | — (repo has no CI configured) |
| escalated-spring | [#20](https://github.com/escalated-dev/escalated-spring/pull/20) | ✅ | ✅ TicketService.create (greenfield) | ✅ |
| escalated-filament | — | ✅ via laravel | ✅ via laravel | — |

## Final state — rollout complete, all CI green

**13 open PRs, all CI-green** (Phoenix has no CI configured at the repo level; runs locally). Every framework in the Escalated ecosystem now has Pattern B wired end-to-end: Contact entity + FK on Ticket + guest submission paths writing via `findOrCreateByEmail` + ticket back-linked via `contact_id`. Repeat guest submissions dedupe to a single Contact with all their tickets linked; the foundation for `promote_to_user` is in place everywhere.

### Follow-up backlog (future PRs)

#### Workflow stack — **all 4 frameworks drafted (iter 42-50)** ✅

Each framework now has a 3-PR stack: executor → runner → listener. The chain is functionally complete end-to-end (event → listener → runner → engine+executor → WorkflowLog).

| Framework | Executor | Runner | Listener |
|---|---|---|---|
| escalated-spring | [#21](https://github.com/escalated-dev/escalated-spring/pull/21) ✅ CI green | [#22](https://github.com/escalated-dev/escalated-spring/pull/22) | [#23](https://github.com/escalated-dev/escalated-spring/pull/23) |
| escalated-wordpress | [#28](https://github.com/escalated-dev/escalated-wordpress/pull/28) ✅ CI green | [#29](https://github.com/escalated-dev/escalated-wordpress/pull/29) | [#30](https://github.com/escalated-dev/escalated-wordpress/pull/30) |
| escalated-dotnet | [#18](https://github.com/escalated-dev/escalated-dotnet/pull/18) ✅ CI green | [#19](https://github.com/escalated-dev/escalated-dotnet/pull/19) | [#20](https://github.com/escalated-dev/escalated-dotnet/pull/20) |
| escalated-phoenix | [#30](https://github.com/escalated-dev/escalated-phoenix/pull/30) | [#31](https://github.com/escalated-dev/escalated-phoenix/pull/31) | [#32](https://github.com/escalated-dev/escalated-phoenix/pull/32) |

Stacked PRs: runners target `feat/workflow-executor`, listeners target `feat/workflow-runner`. CI on the stacked branches won't trigger until the base merges and they rebase onto `main`. Merge order per framework: executor → runner → listener.

Phoenix listener is helper-based (per-event functions host calls directly) because Phoenix doesn't auto-emit ApplicationEvents. .NET uses an `IEscalatedEventDispatcher` decorator. Spring uses `@EventListener` on existing `ApplicationEvent`s. WordPress uses `add_action` on existing `escalated_*` hooks.

#### Email Message-ID util — **all 10 frameworks drafted (iter 51-55)** ✅

Each framework now has a pure-function `MessageIdUtil` (or language-appropriate equivalent) with the same 4-method API: `buildMessageId`, `parseTicketIdFromMessageId`, `buildReplyTo`, `verifyReplyTo`. Signed Reply-To is `reply+{id}.{hmac8}@{domain}`; verification is timing-safe in every port.

| Framework | PR | Tests | CI |
|---|---|---|---|
| escalated-spring | [#24](https://github.com/escalated-dev/escalated-spring/pull/24) | 13 | ✅ green |
| escalated-wordpress | [#31](https://github.com/escalated-dev/escalated-wordpress/pull/31) | 13 | ✅ green |
| escalated-dotnet | [#21](https://github.com/escalated-dev/escalated-dotnet/pull/21) | 16 | ✅ green |
| escalated-phoenix | [#33](https://github.com/escalated-dev/escalated-phoenix/pull/33) | 19 | — (no repo CI) |
| escalated-laravel | [#68](https://github.com/escalated-dev/escalated-laravel/pull/68) | 13 | ✅ green |
| escalated-rails | [#43](https://github.com/escalated-dev/escalated-rails/pull/43) | 17 | ✅ after rubocop fix |
| escalated-django | [#40](https://github.com/escalated-dev/escalated-django/pull/40) | 15 | ✅ green |
| escalated-adonis | [#48](https://github.com/escalated-dev/escalated-adonis/pull/48) | 12 | ✅ green |
| escalated-go | [#27](https://github.com/escalated-dev/escalated-go/pull/27) | 13 | ✅ green |
| escalated-symfony | [#28](https://github.com/escalated-dev/escalated-symfony/pull/28) | 13 | ✅ green |

#### EmailService wire-up — **all 10 frameworks drafted (iter 56-63)** ✅

Stacked on each framework's MessageIdUtil PR. Every outbound ticket notification (ticket-created, reply, status-change, SLA breach, escalation, assignment, resolution) now emits canonical RFC 5322 Message-IDs + signed Reply-To in every framework.

| Framework | Wire-up PR | Base |
|---|---|---|
| escalated-spring | [#25](https://github.com/escalated-dev/escalated-spring/pull/25) | → #24 |
| escalated-wordpress | [#32](https://github.com/escalated-dev/escalated-wordpress/pull/32) | → #31 |
| escalated-dotnet | [#22](https://github.com/escalated-dev/escalated-dotnet/pull/22) | → #21 |
| escalated-phoenix | [#34](https://github.com/escalated-dev/escalated-phoenix/pull/34) | → #33 |
| escalated-laravel | [#69](https://github.com/escalated-dev/escalated-laravel/pull/69) | → #68 |
| escalated-rails | [#44](https://github.com/escalated-dev/escalated-rails/pull/44) | → #43 |
| escalated-django | [#41](https://github.com/escalated-dev/escalated-django/pull/41) | → #40 |
| escalated-adonis | [#49](https://github.com/escalated-dev/escalated-adonis/pull/49) | → #48 |
| escalated-go | [#28](https://github.com/escalated-dev/escalated-go/pull/28) | → #27 |
| escalated-symfony | [#29](https://github.com/escalated-dev/escalated-symfony/pull/29) | → #28 |

20 email-related PRs total (10 util + 10 wire-up). Merge order per framework: util → wire-up. CI on stacked wire-up branches won't trigger until the base merges and they rebase onto `main`/`master`.

#### Inbound-webhook verification — **all 5 inbound-capable frameworks drafted (iter 64-67)** ✅

Each framework with an existing inbound adapter now has a 5-priority resolution chain stacked on its email-service wire-up PR: In-Reply-To via `parseTicketIdFromMessageId` → References via `parseTicketIdFromMessageId` → signed Reply-To via `verifyReplyTo` → subject reference → legacy InboundEmail lookup.

| Framework | Inbound verify PR | Base |
|---|---|---|
| escalated-laravel | [#70](https://github.com/escalated-dev/escalated-laravel/pull/70) | → #68 |
| escalated-rails | [#45](https://github.com/escalated-dev/escalated-rails/pull/45) | → #44 |
| escalated-django | [#42](https://github.com/escalated-dev/escalated-django/pull/42) | → #41 |
| escalated-adonis | [#50](https://github.com/escalated-dev/escalated-adonis/pull/50) | → #49 |
| escalated-wordpress | [#33](https://github.com/escalated-dev/escalated-wordpress/pull/33) | → #32 |

Forged signatures are rejected in every framework — verification uses a timing-safe comparison (`hash_equals` / `hmac.compare_digest` / `crypto.timingSafeEqual` / `CryptographicOperations.FixedTimeEquals` / manual secure_compare depending on language).

#### Message-ID format migration note (for host upgrade guides)

The wire-up PRs change the outbound Message-ID format in five frameworks to match the canonical NestJS reference. Existing outbound emails already sent stay in the old format (can't be rewritten), but **inbound replies to those pre-migration emails will fall through to the legacy `InboundEmail.message_id` lookup (strategy #5) instead of the canonical parse (#1/#2)**. This still works because the legacy InboundEmail table stores whatever Message-IDs we sent, but it's slower than the parse path.

| Framework | Before | After | Breaks inbound routing? |
|---|---|---|---|
| escalated-wordpress | `reply-{id}-ticket-{ref}@{domain}` | `<ticket-{id}@{domain}>` | No (legacy lookup still matches) |
| escalated-django | `<ticket-{pk}-{ref}@{domain}>` | `<ticket-{pk}@{domain}>` | No (legacy lookup still matches) |
| escalated-symfony | `escalated.{ref}@{domain}` | `<ticket-{id}@{domain}>` | No (legacy lookup still matches) |
| escalated-phoenix | `<escalated-{ref}@{domain}>` | `<ticket-{id}@{domain}>` | No (legacy lookup still matches) |
| escalated-adonis | `<escalated-{unique}-{sha256:16}@{domain}>` | `<ticket-{id}@{domain}>` | **No longer identifiable**, falls through to legacy lookup |
| escalated-dotnet | `<{ref}@escalated>` | `<ticket-{id}@{domain}>` | No (legacy lookup still matches) |

Laravel's format was `<ticket-{id}@{domain}>` already — no migration needed.
Rails, Go and Spring had no outbound-email-sending today; their format is canonical from day one.

#### Greenfield inbound routers — **all 5 frameworks without inbound adapters drafted (iter 71-75)** ✅

Each of the 5 frameworks that previously had no inbound-email support now has the routing brain — `InboundMessage` DTO, `InboundEmailParser` interface, and `InboundRouter.resolveTicket` with the same 4-priority chain (In-Reply-To → References → signed Reply-To → subject).

| Framework | Inbound router PR | Base |
|---|---|---|
| escalated-dotnet | [#23](https://github.com/escalated-dev/escalated-dotnet/pull/23) | → #21 |
| escalated-spring | [#26](https://github.com/escalated-dev/escalated-spring/pull/26) | → #25 |
| escalated-go | [#29](https://github.com/escalated-dev/escalated-go/pull/29) | → #28 |
| escalated-phoenix | [#35](https://github.com/escalated-dev/escalated-phoenix/pull/35) | → #34 |
| escalated-symfony | [#30](https://github.com/escalated-dev/escalated-symfony/pull/30) | → #29 |

**Ticket-identity routing is now complete across all 10 host frameworks.** Every outbound email carries canonical `<ticket-{id}@{domain}>` Message-IDs + signed `reply+{id}.{hmac8}@{domain}` Reply-To, and every framework has the resolution chain to route inbound mail back to the right ticket.

Follow-up PRs per framework (greenfield only):
- Per-provider parser implementations (Postmark / Mailgun / SES)
- Framework-native webhook controller (`POST /escalated/webhook/email/inbound`)
- Full orchestration service (parser → router → reply/ticket create + attachment handling)

#### Still open

- **Per-framework webhook controllers + provider parsers** — follow-ups for the 5 greenfield frameworks. Each ~100-200 LOC + provider-specific signature verification. Laravel/Rails/Django/Adonis/WordPress already have these.
- **Inline guest_* column deprecation** across all frameworks after a dual-read cycle lands in production.

NestJS is the reference for these follow-ups.


## Summary table

| Framework | Guest tickets | Inbound email | Contact dedupe | Design pattern |
|---|---|---|---|---|
| **escalated-nestjs** (this PR) | ✅ | ✅ (Postmark) | ✅ | `Contact` entity + nullable `contactId` on Ticket |
| escalated-laravel | ✅ | ✅ | ❌ | `guest_name`/`guest_email`/`guest_token` inline on Ticket |
| escalated-rails | ✅ | ✅ | ❌ | Inline columns (same as Laravel) |
| escalated-django | ✅ | ✅ | ❌ | Inline columns |
| escalated-adonis | ✅ | ✅ | ❌ | Inline columns (inbound controller too) |
| escalated-dotnet | partial | ✅ (model only) | ❌ | `InboundEmail` model exists; unclear if controller wired |
| escalated-wordpress | ✅ | ✅ | ❌ | `Guest_Handler` + `Inbound_Controller` classes |
| escalated-symfony | ❌ | ❌ | ❌ | Not implemented |
| escalated-filament | ❌ | ❌ | ❌ | Not implemented |
| escalated-phoenix | ❌ | ❌ | ❌ | Not implemented |
| escalated-go | ❌ | ❌ | ❌ | Not implemented |
| escalated-spring | ❌ | ❌ | ❌ | Not implemented |

## Two design patterns

**Pattern A — Inline guest fields (Laravel / Rails / Django / Adonis / WordPress / .NET)**
- `tickets` table adds `guest_name`, `guest_email`, `guest_token` columns.
- `requester_id` becomes nullable; identity is read from either `requester_id` OR the inline columns.
- **Pro:** simple, no join. **Con:** no email-level dedupe; each ticket from the same guest is independent.

**Pattern B — Contact entity (NestJS, new as of this PR)**
- Separate `escalated_contacts` table with unique email index.
- Tickets get a nullable `contactId` FK.
- `ContactService.findOrCreateByEmail` deduplicates repeat submissions.
- `ContactService.promoteToUser` back-stamps `requesterId` on all prior tickets when a guest accepts a signup invite.
- **Pro:** guest history is portable across tickets; upgrade-to-user is a single FK flip + backfill. **Con:** extra table + join.

## Convergence path (if desired)

Converging the inline-field frameworks onto Pattern B would require (per framework):

1. New `escalated_contacts` table migration.
2. New nullable `contact_id` column on `tickets`.
3. Backfill migration: for each ticket with a non-null `guest_email`, upsert a Contact and set `contact_id`.
4. Deprecate but don't drop `guest_name`/`guest_email`/`guest_token` for one release (dual-read), then drop in a follow-up.
5. Update the guest submission controller to call `Contact.find_or_create_by_email` instead of writing inline fields.
6. Update inbound router to resolve the target contact via email lookup instead of reading inline fields.

This is a tractable port per framework but not trivial. Estimate: ~2-4 hours per framework for the 6 that have Pattern A today.

## Not-yet-implemented frameworks

Five frameworks have no guest/inbound support at all: **Symfony, Filament, Phoenix, Go, Spring.**

If these frameworks need public ticketing, the recommendation is **implement Pattern B directly** (Contact entity) rather than re-implementing the older inline pattern. The NestJS implementation in PR #17 is the reference.

Per-framework migration sketch for net-new implementations:

- `escalated_contacts` table: `id, email (unique, case-insensitive index), name NULL, user_id NULL, metadata JSON, created_at, updated_at`
- `escalated_tickets`: add `contact_id NULL` column
- `escalated_inbound_emails` audit table (per the NestJS entity)
- Controllers: `POST /escalated/widget/tickets` with email/name payload; `POST /escalated/webhook/email/inbound` with shared-secret header guard
- Services mirror NestJS: `ContactService`, `InboundRouterService`, `EmailService` with Message-ID threading
- Reuse whatever local equivalent of `@nestjs/event-emitter` / `@OnEvent` the framework uses to wire `Workflow` evaluation on ticket events (if the framework has a Workflow implementation)

## Recommendations (prioritized)

1. **Ship the NestJS PR #17 as-is.** It's complete, tested (232 green), and documented.
2. **Defer Pattern B convergence for the 6 inline-field frameworks.** They work today; converging is cleanup that can happen over time.
3. **Backlog the 5 not-yet-implemented frameworks.** Symfony and Spring probably matter most (common enterprise stacks); Filament / Phoenix / Go can follow.
4. **Track the divergence in escalated-docs.** End-users evaluating Escalated deserve to see which framework has which capability.

## Not in this survey

- Actual depth test of each framework's existing guest/inbound flow — the survey was based on file/column presence only. A framework marked ✅ here may still have bugs or missing edge cases.
- Outbound email threading parity. The NestJS implementation sets Message-ID / Reply-To / X-Escalated-Ticket-Id headers; whether the other frameworks do the same was not verified.
- Workflow routing parity. The NestJS implementation fires Workflows on ticket events; several other frameworks have `Workflow` tables (Laravel in particular) but whether the runner is wired was not verified in this survey.

These are worthwhile follow-up audits.

## Inbound webhook completeness (iter 76-80)

Each of the 5 greenfield frameworks now has the **full inbound webhook stack**: router foundation (priority-chain resolver), Postmark parser (canonical format), and framework-native controller with signature verification. The ingress endpoint `POST /escalated/webhook/email/inbound` is wired up in every framework.

| Framework | Router | Parser + Controller |
|---|---|---|
| escalated-dotnet | [#23](https://github.com/escalated-dev/escalated-dotnet/pull/23) | [#24](https://github.com/escalated-dev/escalated-dotnet/pull/24) |
| escalated-spring | [#26](https://github.com/escalated-dev/escalated-spring/pull/26) | [#27](https://github.com/escalated-dev/escalated-spring/pull/27) |
| escalated-go | [#29](https://github.com/escalated-dev/escalated-go/pull/29) | [#30](https://github.com/escalated-dev/escalated-go/pull/30) |
| escalated-phoenix | [#35](https://github.com/escalated-dev/escalated-phoenix/pull/35) | [#36](https://github.com/escalated-dev/escalated-phoenix/pull/36) |
| escalated-symfony | [#30](https://github.com/escalated-dev/escalated-symfony/pull/30) | [#31](https://github.com/escalated-dev/escalated-symfony/pull/31) |

**Every framework in the ecosystem can now receive inbound webhook mail and route it to the right ticket.**

### Mailgun parity (iter 81-83) ✅

Mailgun is the second supported inbound provider alongside Postmark across all 5 greenfield frameworks. Host maintainers can point either Postmark or Mailgun at `/escalated/webhook/email/inbound` without writing any custom adapter code.

| Framework | Postmark | Mailgun |
|---|---|---|
| escalated-dotnet | [#24](https://github.com/escalated-dev/escalated-dotnet/pull/24) | [#25](https://github.com/escalated-dev/escalated-dotnet/pull/25) |
| escalated-spring | [#27](https://github.com/escalated-dev/escalated-spring/pull/27) | [#28](https://github.com/escalated-dev/escalated-spring/pull/28) |
| escalated-go | [#30](https://github.com/escalated-dev/escalated-go/pull/30) | [#31](https://github.com/escalated-dev/escalated-go/pull/31) |
| escalated-phoenix | [#36](https://github.com/escalated-dev/escalated-phoenix/pull/36) | [#37](https://github.com/escalated-dev/escalated-phoenix/pull/37) |
| escalated-symfony | [#31](https://github.com/escalated-dev/escalated-symfony/pull/31) | [#32](https://github.com/escalated-dev/escalated-symfony/pull/32) |

Mailgun-specific handling: extracts display name from `"Name <email>"`-style `from` header, falls back to `sender` field for the email, carries provider-hosted attachment URLs through in `downloadUrl` / `DownloadURL` so a follow-up worker can fetch + persist out-of-band. Malformed attachments JSON degrades gracefully to an empty list.

### Orchestration parity (iter 84-88) ✅

The `InboundEmailService` (parser output → router resolution → reply-on-existing OR create-new-ticket OR skip) is now in place on all 5 greenfield frameworks. Every service returns a richer response shape carrying `outcome`, `ticketId`, `replyId`, and `pendingAttachmentDownloads` (provider-hosted URLs surfaced for an out-of-band attachment worker).

| Framework | Orchestration PR |
|---|---|
| escalated-dotnet | [#26](https://github.com/escalated-dev/escalated-dotnet/pull/26) |
| escalated-spring | [#29](https://github.com/escalated-dev/escalated-spring/pull/29) |
| escalated-go | [#32](https://github.com/escalated-dev/escalated-go/pull/32) |
| escalated-phoenix | [#38](https://github.com/escalated-dev/escalated-phoenix/pull/38) |
| escalated-symfony | [#33](https://github.com/escalated-dev/escalated-symfony/pull/33) |

Shared surface across all 5:
- Skip SNS confirmation mail (`no-reply@sns.amazonaws.com`) and empty-body+empty-subject noise rather than creating a new ticket from it.
- `(no subject)` fallback when subject is blank but body has content.
- Provider-hosted attachments (Mailgun) pass through as `PendingAttachment` records; inline attachments don't (host app decides how to persist those).
- Inbound-email replies are tagged with `authorType = "inbound_email"` (or the framework's equivalent author-class field) so consumers can distinguish them from agent/customer replies.

Remaining follow-ups: attachment persistence workers for provider-hosted downloads, and SES parser if demand warrants (third major provider).

### Public docs for greenfield frameworks (iter 89) ✅

`escalated-dev/escalated-docs#6` adds inbound-email setup pages for all 5 greenfield framework ports and rewrites `_intro.md` to describe the unified-webhook / shared-secret / three-way resolution-chain architecture. These were the first entries under `sections/inbound-email/` for .NET, Spring, Go, Phoenix, and Symfony (the legacy host-app frameworks already had pages). Each page includes a ready-to-paste curl test recipe and documents the new response shape (`outcome`, `ticket_id`, `reply_id`, `pending_attachment_downloads`).

### Per-repo READMEs (iter 90) ✅

Each of the 5 greenfield plugin repos now has a top-level `## Inbound email` section in its README with framework-native config snippet (`Mail.InboundSecret`, `escalated.mail.inbound-secret`, `email.Config{InboundSecret}`, `email_inbound_secret`, `escalated.inbound_secret`), the webhook URL, and a link out to docs.escalated.dev. Each READMEs PR is stacked on its framework's `feat/inbound-email-orchestration` so the README only claims features that exist on that branch.

| Framework | README PR |
|---|---|
| escalated-dotnet | [#27](https://github.com/escalated-dev/escalated-dotnet/pull/27) |
| escalated-spring | [#30](https://github.com/escalated-dev/escalated-spring/pull/30) |
| escalated-go | [#33](https://github.com/escalated-dev/escalated-go/pull/33) |
| escalated-phoenix | [#39](https://github.com/escalated-dev/escalated-phoenix/pull/39) |
| escalated-symfony | [#34](https://github.com/escalated-dev/escalated-symfony/pull/34) |
