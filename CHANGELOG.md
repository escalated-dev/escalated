# Changelog

All notable changes to `@escalated-dev/escalated` will be documented in this file.

## [Unreleased]

## [0.11.2] - 2026-09-12

### Added
- **`resolveEscalatedPage()`**, so a page name with no component behind it says
  so. Inertia resolves an unknown name to nothing: Vue renders nothing and the
  panel comes up blank on a 200 response, which reads as a permissions problem
  or an empty dataset. It is how four screens shipped blank. The resolver throws
  in development, naming what was asked for and the nearest thing that exists,
  and in production logs the same message rather than rendering an empty page.

  ```js
  createInertiaApp({
      resolve: (name) =>
          resolveEscalatedPage(name, () =>
              resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**')),
          ),
  });
  ```

  Suggestions are ranked on path-segment overlap rather than leaf equality —
  nearly every page ends in `Index` or `Form`, so matching on the last segment
  ranks half the package equally.

- **`pages.json`**, the list of every page name this package can resolve,
  generated from `src/pages` and exported at `@escalated-dev/escalated/pages.json`.
  It is what each backend checks its own page names against in CI, which is the
  only place both halves of that comparison are known. `npm run pages:check`
  fails if it has drifted from the components, and CI runs it.

## [0.11.1] - 2026-09-12
## [0.11.1] - 2026-09-12

### Fixed
- **The package could not be published at all.** `@escalated-dev/locale` was
  depended on as a git reference — `github:escalated-dev/escalated-locale#v0.1.8`
  — and npm refuses to fetch git-type packages while publishing:

      npm error code EALLOWGIT
      npm error Fetching packages of type "git" have been disabled

  `npm publish` failed for **v0.10.0 and v0.11.0**, leaving 0.9.0 as the latest
  version on the registry while two releases sat tagged and unpublished. The
  same package is on npm as `@escalated-dev/locale@0.1.8`; it is now depended on
  from there.

  A git dependency is also invisible to Dependabot, so nothing was ever going to
  flag it.

## [0.11.0] - 2026-09-12

### Added
- **Automations screens** (`Admin/Automations/Index.vue`, `Admin/Automations/Form.vue`). Six backends render
  `Escalated/Admin/Automations/*` and this package had no component behind either name, so the screen came up blank —
  Inertia resolves a missing page to nothing rather than to an error. Automations are the time-based half of the admin
  automation surface; Workflows are the event-driven half. They are separate surfaces and both need a screen.

  The form offers only the fields, operators and actions the backend runner actually evaluates. Anything else would save
  cleanly and then silently never match a ticket.

- **Public tickets settings** (`Admin/Settings/PublicTickets.vue`). Rendered by five backends, previously blank. Each
  guest policy mode asks for exactly the value the backend requires alongside it, because a mode saved without its
  companion value is rejected server-side and the field has to be on screen to be filled in.

- **Plugin pages** (`Plugin/Page.vue`). A plugin declares a route on the backend and a component on the frontend, and
  this is where the two meet. Two backends render `Escalated/Plugin/Page`; with nothing behind the name, every plugin
  page was blank — and blank in the same way whether the plugin was installed on the frontend or not. It now resolves
  the registered component, and names what is missing when there is none.

- **`Admin/Workflows/Form.vue`**, the name the backends render for the workflow editor. `Builder.vue` is the editor and
  takes exactly these props; the name simply had no page behind it.

- **`scripts/audit-page-parity.py`**, which compares every page name the backends render against the components this
  package ships. That comparison is the only way to see this class of bug: the request succeeds, the tests pass, and the
  screen is empty.

- **An `Automations` entry in the admin navigation.** The screen the backends render had no way in.

### Changed
- **Test runner on vitest 5**, with `@storybook/*` 10.6 and happy-dom 20.14. The suite runs in roughly half the time.
- **`.gitattributes` normalising line endings.** Prettier's `endOfLine` defaults to `lf`, so a Windows checkout with
  `core.autocrlf=true` failed `format:check` on files that were perfectly formatted — a failure that appeared only on a
  contributor's machine and never in CI.

## [0.10.0] - 2026-09-11

### Added
- **Database connection settings screen** (`Admin/Settings/DatabaseConnection.vue`). Shows which database Escalated is reading and writing, lists the connections it could use, probes each without committing to it, and switches between them. An unmigrated or unreachable connection is disabled with the reason shown — pointing Escalated at a database with no Escalated tables does not error, it renders an empty panel, which reads exactly like data loss. When `escalated.connection` is pinned in config the form is not rendered at all.

## [0.9.0] - 2026-06-04

### Added
- **Newsletter system admin UI (Wave 0).** Full Vue/Inertia admin surface for the newsletter feature: compose / index / show pages, deliveries table, analytics tiles, dynamic segment-filter builder, list-member table, markdown editor, merge-field dropdown, preview iframe, and supporting components + Storybook stories. (#75)
- `usePermissions()` composable and permission-gated admin navigation — the newsletter nav entry renders only for users holding `newsletters.manage`, matching the backend permission enforcement (escalated-laravel #129). (#96)
- Consume translations from `@escalated-dev/locale` as the canonical base source, with `src/locales/*.json` retained as local plugin overrides that win over central. Public `useI18n().t()` / `$t` API is unchanged.

### Changed
- Newsletter admin pages wired to locale strings (i18n). (#96)

## [0.7.1] - 2026-04-28

### Changed
- `peerDependencies."@inertiajs/vue3"` widened from `^1.0.0 || ^2.0.0` to `^1.0.0 || ^2.0.0 || ^3.0.0`. Host apps on `@inertiajs/vue3` 3.x no longer trip an `npm install` peer-dep conflict. We use only `Link`, `router`, `useForm`, and `usePage` from this package, all stable across the v1/v2/v3 line.

### Fixed
- Widget's API endpoint path is now configurable via `data-widget-path` (on the script tag) / `widgetPath` option (on `createEscalated`). Default stays `/support/widget` for backward compatibility. Unblocks NestJS hosts where the base path isn't `/support`.
- `useChat()` threads the resolved `widgetPath` through all six chat API endpoints; Agent `TicketShow`, `ActiveChatsPanel`, `ChatQueue` read `page.props.escalated?.prefix` to build the right path on the agent side.

## [0.7.0] - 2026-04-05

### Added

- **Ticket type/category support** — ticket type and category in list view, filters, sidebar, and create form
- **Configurable table columns and view tabs** for the ticket queue
- **Advanced search** with expanded ticket search capabilities
- **Panel theming support** via `EscalatedPlugin`, with panel theme tokens migrated across all layouts, CRUD pages, shared components, reports, settings, and ticket pages
- **Light/dark mode** with full light-mode agent panel story, ARIA accessibility across all components, and panel theme preview in Storybook
- **Import wizard** — Vue pages, exports, i18n strings, and Zendesk import adapter plugin with admin nav link
- **Knowledge base pages** — frontend pages, components, and Knowledge Panel in ticket sidebar
- **Automations admin pages** (triggers, rules, categories)
- **Webhooks admin pages**
- **Capacity admin page** with AgentLoadIndicator component
- **Skills admin pages** with SkillTagManager component
- **Side conversations** — SideConversation and SideConversationList components
- **Ticket merging** — TicketMergeDialog component
- **Ticket linking** — TicketLinkPanel and TicketTypeSelector components
- **Custom Fields admin pages**
- **Custom Statuses admin pages**
- **Business Hours admin pages**
- **Audit Log frontend**
- **Agent Roles frontend**
- **Reporting** — dashboard, chart/KPI components, agent productivity metrics, SLA achievement reporting with compliance chart, CSAT settings and report pages
- **Context panel framework** for ticket view
- **Sandbox environment** placeholder page
- **Custom objects** frontend pages
- **Conditional fields** rule builder and visibility logic
- **Advanced email channel settings** page
- **Data retention settings** page
- **Two-factor authentication** frontend components
- **SSO (SAML/JWT) settings** page
- **Collision warning** component and typing indicator for agent collaboration
- **Light agent restrictions** in TicketShow
- **"Powered by Escalated" badge** with admin toggle
- **Storybook and GitHub Actions screenshot workflow** with Playwright tests and auto-generated README images
- **Plugin hooks expansion** for richer extension use cases
- **Consolidated plugins page**, keyboard shortcuts, and presence indicator polish

### Changed

- Migrated all components to panel theme tokens (replacing direct dark-mode branches)
- Updated navigation, exports, and tests for platform parity
- Extracted shared constants, formatting utils, and debounced search into reusable modules
- Screenshots run only on tagged releases in CI
- README updated with WordPress, Filament, React Native, Flutter frameworks and Plugin Development section

### Fixed

- Ticket search reliability improvements
- StatsCard tests updated for panel theme tokens
- Export count test updated for new shared utils, composables, and admin import pages
- Husky pre-commit hook cross-platform compatibility (Windows and Mac/Linux)
- Hero screenshots now transparent with rounded corners

## [0.6.0] - 2025-12-01

Initial public release.
