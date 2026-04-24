# Public Ticket System — Rollout Status Across Frameworks

**Context:** the public ticket system is now shipped in `@escalated-dev/escalated-nestjs` (PR #17, all 9 phases complete). This document surveys the current state of the same capability across the other 11 host-framework implementations and notes the design divergence that has accumulated.

**Survey date:** 2026-04-24
**Last updated:** 2026-04-24 (after convergence PRs opened)

## PRs in flight

| Framework | PR | Scope |
|---|---|---|
| escalated-nestjs | [#17](https://github.com/escalated-dev/escalated-nestjs/pull/17) | Full feature (232 tests) — reference impl |
| escalated-laravel | [#67](https://github.com/escalated-dev/escalated-laravel/pull/67) | Schema + model convergence |
| escalated-rails | [#41](https://github.com/escalated-dev/escalated-rails/pull/41) | Schema + model convergence |
| escalated-django | [#38](https://github.com/escalated-dev/escalated-django/pull/38) | Schema + model convergence |
| escalated-adonis | [#47](https://github.com/escalated-dev/escalated-adonis/pull/47) | Schema + model convergence |
| escalated-dotnet | [#17](https://github.com/escalated-dev/escalated-dotnet/pull/17) | Schema + model convergence |
| escalated-wordpress | [#27](https://github.com/escalated-dev/escalated-wordpress/pull/27) | Schema + model convergence |
| Symfony / Filament / Phoenix / Go / Spring | — | Greenfield, not yet started |


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
