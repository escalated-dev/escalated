# Merge-Order Guide for the Public Ticket System Rollout

> Companion to `2026-04-24-public-tickets-rollout-status.md`. That doc records **what** was shipped; this one records the **order** PRs should merge in so stacked chains don't hit conflicts.

**As of iteration 116:** 110 open PRs across 14 repositories. All feature work is complete; everything below is waiting for review.

## Why stacking

Each greenfield framework built the inbound pipeline as a chain of dependent PRs rather than a monolithic blob. The CI filter on most repos is `pull_request.branches: [main]`, so stacked PRs don't trigger CI until they're rebased onto main. That means the merge order matters — merge the base first, rebase the next, CI goes green, merge, repeat.

## Greenfield framework chains

Each of the 5 greenfield framework repos has roughly the same 12-15 PR chain. Merge top-to-bottom: each row depends on everything below it.

| Layer | What it ships | .NET | Spring | Go | Phoenix | Symfony |
|---|---|---|---|---|---|---|
| parser-equivalence | Postmark/Mailgun/SES contract test | [#31](https://github.com/escalated-dev/escalated-dotnet/pull/31) | [#34](https://github.com/escalated-dev/escalated-spring/pull/34) | [#37](https://github.com/escalated-dev/escalated-go/pull/37) | [#43](https://github.com/escalated-dev/escalated-phoenix/pull/43) | [#39](https://github.com/escalated-dev/escalated-symfony/pull/39) |
| SES parser | 3rd inbound provider | [#30](https://github.com/escalated-dev/escalated-dotnet/pull/30) | [#33](https://github.com/escalated-dev/escalated-spring/pull/33) | [#36](https://github.com/escalated-dev/escalated-go/pull/36) | [#42](https://github.com/escalated-dev/escalated-phoenix/pull/42) | [#38](https://github.com/escalated-dev/escalated-symfony/pull/38) |
| AttachmentDownloader | Mailgun-hosted attachment fetcher | [#29](https://github.com/escalated-dev/escalated-dotnet/pull/29) | [#32](https://github.com/escalated-dev/escalated-spring/pull/32) | [#35](https://github.com/escalated-dev/escalated-go/pull/35) | [#41](https://github.com/escalated-dev/escalated-phoenix/pull/41) | [#37](https://github.com/escalated-dev/escalated-symfony/pull/37) |
| handler-level controller tests | HTTP-boundary coverage | [#28](https://github.com/escalated-dev/escalated-dotnet/pull/28) | [#31](https://github.com/escalated-dev/escalated-spring/pull/31) | — (folded into #34) | [#40](https://github.com/escalated-dev/escalated-phoenix/pull/40) | [#36](https://github.com/escalated-dev/escalated-symfony/pull/36) |
| handler uses orchestration (Go only) | Wire service into HTTP | — | — | [#34](https://github.com/escalated-dev/escalated-go/pull/34) | — | — |
| README advertises inbound | Top-level feature list + setup snippet | [#27](https://github.com/escalated-dev/escalated-dotnet/pull/27) | [#30](https://github.com/escalated-dev/escalated-spring/pull/30) | [#33](https://github.com/escalated-dev/escalated-go/pull/33) | [#39](https://github.com/escalated-dev/escalated-phoenix/pull/39) | [#34](https://github.com/escalated-dev/escalated-symfony/pull/34) |
| orchestration | `InboundEmailService` + controller wire-up | [#26](https://github.com/escalated-dev/escalated-dotnet/pull/26) | [#29](https://github.com/escalated-dev/escalated-spring/pull/29) | [#32](https://github.com/escalated-dev/escalated-go/pull/32) | [#38](https://github.com/escalated-dev/escalated-phoenix/pull/38) | [#33](https://github.com/escalated-dev/escalated-symfony/pull/33) |
| Mailgun parser | 2nd inbound provider | [#25](https://github.com/escalated-dev/escalated-dotnet/pull/25) | [#28](https://github.com/escalated-dev/escalated-spring/pull/28) | [#31](https://github.com/escalated-dev/escalated-go/pull/31) | [#37](https://github.com/escalated-dev/escalated-phoenix/pull/37) | [#32](https://github.com/escalated-dev/escalated-symfony/pull/32) |
| Postmark parser + controller | 1st inbound provider + webhook ingress | [#24](https://github.com/escalated-dev/escalated-dotnet/pull/24) | [#27](https://github.com/escalated-dev/escalated-spring/pull/27) | [#30](https://github.com/escalated-dev/escalated-go/pull/30) | [#36](https://github.com/escalated-dev/escalated-phoenix/pull/36) | [#31](https://github.com/escalated-dev/escalated-symfony/pull/31) |
| router scaffold | `InboundEmailRouter` with 5-step resolve chain | [#23](https://github.com/escalated-dev/escalated-dotnet/pull/23) | [#26](https://github.com/escalated-dev/escalated-spring/pull/26) | [#29](https://github.com/escalated-dev/escalated-go/pull/29) | [#35](https://github.com/escalated-dev/escalated-phoenix/pull/35) | [#30](https://github.com/escalated-dev/escalated-symfony/pull/30) |
| email service wire-up | Outbound Message-ID + signed Reply-To | [#22](https://github.com/escalated-dev/escalated-dotnet/pull/22) | [#25](https://github.com/escalated-dev/escalated-spring/pull/25) | [#28](https://github.com/escalated-dev/escalated-go/pull/28) | [#34](https://github.com/escalated-dev/escalated-phoenix/pull/34) | [#29](https://github.com/escalated-dev/escalated-symfony/pull/29) |
| MessageIdUtil | RFC 5322 + signed Reply-To pure helpers | [#21](https://github.com/escalated-dev/escalated-dotnet/pull/21) | [#24](https://github.com/escalated-dev/escalated-spring/pull/24) | [#27](https://github.com/escalated-dev/escalated-go/pull/27) | [#33](https://github.com/escalated-dev/escalated-phoenix/pull/33) | [#28](https://github.com/escalated-dev/escalated-symfony/pull/28) |
| workflow listener | Event bus → runner bridge | [#20](https://github.com/escalated-dev/escalated-dotnet/pull/20) | [#23](https://github.com/escalated-dev/escalated-spring/pull/23) | — | [#32](https://github.com/escalated-dev/escalated-phoenix/pull/32) | — |
| workflow runner | Per-event workflow execution | [#19](https://github.com/escalated-dev/escalated-dotnet/pull/19) | [#22](https://github.com/escalated-dev/escalated-spring/pull/22) | — | [#31](https://github.com/escalated-dev/escalated-phoenix/pull/31) | [#27](https://github.com/escalated-dev/escalated-symfony/pull/27) |
| workflow executor | Action dispatch | [#18](https://github.com/escalated-dev/escalated-dotnet/pull/18) | [#21](https://github.com/escalated-dev/escalated-spring/pull/21) | — | [#30](https://github.com/escalated-dev/escalated-phoenix/pull/30) | — |
| Contact model | Pattern B dedupe | [#17](https://github.com/escalated-dev/escalated-dotnet/pull/17) | [#20](https://github.com/escalated-dev/escalated-spring/pull/20) | [#26](https://github.com/escalated-dev/escalated-go/pull/26) | [#29](https://github.com/escalated-dev/escalated-phoenix/pull/29) | [#26](https://github.com/escalated-dev/escalated-symfony/pull/26) |

**Recommended merge sequence per framework:**

1. Contact model → merge `main`.
2. Workflow executor → runner → listener → merge each in that order, rebasing between each.
3. MessageIdUtil → email service wire-up → merge.
4. Router scaffold → Postmark parser + controller → Mailgun parser → orchestration → README → merge in that order.
5. Handler controller tests → AttachmentDownloader → SES parser → parser-equivalence tests → merge.

After step 1 the rest only touch email code and should interleave cleanly with feature work on the respective framework.

## Legacy host-app framework PRs (Contact / Workflow / MessageIdUtil reused from greenfield designs)

| Framework | Contact | Workflow | MessageIdUtil | Email wireup | Inbound verify |
|---|---|---|---|---|---|
| escalated-laravel | [#67](https://github.com/escalated-dev/escalated-laravel/pull/67) (draft) | — | [#68](https://github.com/escalated-dev/escalated-laravel/pull/68) | [#69](https://github.com/escalated-dev/escalated-laravel/pull/69) | [#70](https://github.com/escalated-dev/escalated-laravel/pull/70) |
| escalated-rails | [#41](https://github.com/escalated-dev/escalated-rails/pull/41) | [#42](https://github.com/escalated-dev/escalated-rails/pull/42) | [#43](https://github.com/escalated-dev/escalated-rails/pull/43) | [#44](https://github.com/escalated-dev/escalated-rails/pull/44) | — |
| escalated-django | [#38](https://github.com/escalated-dev/escalated-django/pull/38) | [#39](https://github.com/escalated-dev/escalated-django/pull/39) | [#40](https://github.com/escalated-dev/escalated-django/pull/40) | [#41](https://github.com/escalated-dev/escalated-django/pull/41) | — |
| escalated-adonis | [#47](https://github.com/escalated-dev/escalated-adonis/pull/47) | — | [#48](https://github.com/escalated-dev/escalated-adonis/pull/48) | [#49](https://github.com/escalated-dev/escalated-adonis/pull/49) | — |
| escalated-wordpress | [#27](https://github.com/escalated-dev/escalated-wordpress/pull/27) | [#28-30](https://github.com/escalated-dev/escalated-wordpress/pull/28) | [#31](https://github.com/escalated-dev/escalated-wordpress/pull/31) | [#32](https://github.com/escalated-dev/escalated-wordpress/pull/32) | — |
| escalated-symfony | [#26](https://github.com/escalated-dev/escalated-symfony/pull/26) | [#27](https://github.com/escalated-dev/escalated-symfony/pull/27) | [#28](https://github.com/escalated-dev/escalated-symfony/pull/28) | [#29](https://github.com/escalated-dev/escalated-symfony/pull/29) | — |

Guest-policy admin UI for the Inertia host adapters (iter 92-95):

- escalated-laravel [#71](https://github.com/escalated-dev/escalated-laravel/pull/71)
- escalated-rails [#46](https://github.com/escalated-dev/escalated-rails/pull/46)
- escalated-django [#43](https://github.com/escalated-dev/escalated-django/pull/43)
- escalated-adonis [#51](https://github.com/escalated-dev/escalated-adonis/pull/51)
- escalated-wordpress [#34](https://github.com/escalated-dev/escalated-wordpress/pull/34)
- escalated-filament [#24](https://github.com/escalated-dev/escalated-filament/pull/24)
- escalated-symfony [#35](https://github.com/escalated-dev/escalated-symfony/pull/35) (includes the `EscalatedSetting` foundation Symfony was missing)

## Shared frontend + docs + reference

- **escalated (shared Vue frontend):** [#32](https://github.com/escalated-dev/escalated/pull/32) `Admin/Settings/PublicTickets.vue` + discovery link. [#33](https://github.com/escalated-dev/escalated/pull/33) widget Storybook story.
- **escalated-docs:** [#6](https://github.com/escalated-dev/escalated-docs/pull/6) greenfield framework pages + `_intro` rewrite. [#7](https://github.com/escalated-dev/escalated-docs/pull/7) AttachmentDownloader. [#8](https://github.com/escalated-dev/escalated-docs/pull/8) SES adapter. Merge in order: #6 → #7 → #8.
- **escalated-nestjs (reference):** the reference has its own stack now that it's caught up to the ports on parsers + attachment downloader. Merge in order:
  - [#17](https://github.com/escalated-dev/escalated-nestjs/pull/17) full public ticket system (9 phases) — base
  - [#18](https://github.com/escalated-dev/escalated-nestjs/pull/18) E2E inbound integration test
  - [#19](https://github.com/escalated-dev/escalated-nestjs/pull/19) MailgunInboundParser + provider dispatch
  - [#20](https://github.com/escalated-dev/escalated-nestjs/pull/20) SESInboundParser
  - [#21](https://github.com/escalated-dev/escalated-nestjs/pull/21) AttachmentDownloader + LocalFileAttachmentStorage
  - [#22](https://github.com/escalated-dev/escalated-nestjs/pull/22) parser-equivalence test

## What to do when you pick this up

1. Start with one framework's Contact PR — lowest blast radius, independent of email work.
2. Merge each chain top-down, rebasing the next PR onto the newly-moved main before merging.
3. CI on greenfield repos only runs on `main`-based PRs — after rebase each branch's CI should go green.
4. If any CI breaks after rebase, the issue is almost certainly a merge conflict in DI registration or routes wiring — search the target framework's startup file for the old vs new entity/service list.

See `2026-04-24-public-tickets-rollout-status.md` for the full history of what each PR ships.
