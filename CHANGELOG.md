# Changelog

All notable changes to `@escalated-dev/escalated` will be documented in this file.

## [Unreleased]

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
