<p align="center"><sub>
  <a href="docs/translations/README.ar.md">العربية</a> ·
  <a href="docs/translations/README.de.md">Deutsch</a> ·
  <b>English</b> ·
  <a href="docs/translations/README.es.md">Español</a> ·
  <a href="docs/translations/README.fr.md">Français</a> ·
  <a href="docs/translations/README.it.md">Italiano</a> ·
  <a href="docs/translations/README.ja.md">日本語</a> ·
  <a href="docs/translations/README.ko.md">한국어</a> ·
  <a href="docs/translations/README.nl.md">Nederlands</a> ·
  <a href="docs/translations/README.pl.md">Polski</a> ·
  <a href="docs/translations/README.pt-BR.md">Português (BR)</a> ·
  <a href="docs/translations/README.ru.md">Русский</a> ·
  <a href="docs/translations/README.tr.md">Türkçe</a> ·
  <a href="docs/translations/README.zh-CN.md">简体中文</a>
</sub></p>

<p align="center">
  <a href="https://escalated.dev"><img src="docs/assets/readme/logo.png" width="72" height="72" alt="Escalated"></a>
</p>

<h1 align="center">Escalated</h1>

<p align="center">
  Support tickets, built into your app.<br>
  An open-source helpdesk with SLAs, escalation rules, an agent inbox and a customer portal.
</p>

<p align="center">
  <a href="https://escalated.dev"><b>Website</b></a> ·
  <a href="https://escalated.dev/docs"><b>Docs</b></a> ·
  <a href="https://escalated.dev/cloud"><b>Cloud</b></a> ·
  <a href="CHANGELOG.md"><b>Changelog</b></a>
</p>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/inbox-dark.png">
  <img src="docs/assets/readme/inbox-light.png" alt="The Escalated agent inbox: saved views with counts, SLA countdowns and priorities on every ticket" width="100%">
</picture>

## What it does

<table>
  <tr>
    <td width="40%">
      <h3>An inbox your agents can work in all day</h3>
      Conversation, internal notes, canned replies and SLA timers on one screen, with keyboard shortcuts to move through the queue.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/ticket-dark.png">
        <img src="docs/assets/readme/ticket-light.png" alt="A ticket open in the agent workspace with the reply composer">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dashboard-dark.png">
        <img src="docs/assets/readme/dashboard-light.png" alt="The admin reports page with response times, CSAT and SLA breaches">
      </picture>
    </td>
    <td width="40%">
      <h3>SLAs and escalation rules you can see</h3>
      Set response and resolution targets per priority, escalate automatically when they slip, and track breaches on the reports page.
    </td>
  </tr>
  <tr>
    <td width="40%">
      <h3>A customer portal that's already built</h3>
      Customers open tickets, reply and check status from your app, with a knowledge base beside it. Or embed the widget on any site.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/portal-dark.png">
        <img src="docs/assets/readme/portal-light.png" alt="The customer portal ticket list">
      </picture>
    </td>
  </tr>
</table>

## Features

<table>
<tr>
<td width="33%" valign="top">

**Agent workspace**
- Filterable queue with saved views
- Quick filters: mine, unassigned, urgent, SLA
- Bulk actions and macros
- Internal notes and pinned notes
- Canned responses in the composer
- Keyboard shortcuts and command palette

</td>
<td width="33%" valign="top">

**Ticket tools**
- Split a reply into a new ticket
- Snooze with presets and automatic wake
- Follow tickets you care about
- Attachments with drag and drop
- Full activity timeline

</td>
<td width="33%" valign="top">

**SLAs and escalation**
- SLA countdowns with warning and breach
- SLA policy management
- Escalation rule builder
- Departments and tags

</td>
</tr>
<tr>
<td width="33%" valign="top">

**Customer portal**
- Ticket list with filters and search
- New ticket form with attachments
- Reply thread and status tracking
- CSAT rating with comments
- Knowledge base, on or off

</td>
<td width="33%" valign="top">

**Real time**
- Live updates over Pusher, Reverb or Soketi
- Automatic polling fallback
- See who else is viewing a ticket
- Collision warning while replying

</td>
<td width="33%" valign="top">

**Fits your app**
- Renders inside your own layout
- Theme tokens for colour, radius, font
- Admin embeddable in your admin panel
- Drop-in support widget for any site
- Plugins for pages and sidebar widgets

</td>
</tr>
</table>

<p align="center"><sub><a href="docs/components.md">Every page and component</a></sub></p>

<p align="center">
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3"></a>
  <a href="https://inertiajs.com"><img src="https://img.shields.io/badge/Inertia_1--3-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia 1, 2 and 3"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/Plugin_SDK_in_TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Plugin SDK in TypeScript"></a>
</p>

## Quick start

This package is the shared Vue 3 + Inertia frontend. You don't install it on its own: add the package for your backend and it brings this UI with it.

<table>
  <tr>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-laravel"><b>Laravel</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-rails"><b>Rails</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-django"><b>Django</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-nestjs"><b>NestJS</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-adonis"><b>AdonisJS</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-symfony"><b>Symfony</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-phoenix"><b>Phoenix</b></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-go"><b>Go</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-dotnet"><b>.NET</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-spring"><b>Spring</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-wordpress"><b>WordPress</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-filament"><b>Filament</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-react-native"><b>React Native</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-flutter"><b>Flutter</b></a></td>
  </tr>
</table>

## Learn more

- [All features](docs/features.md)
- [Getting started with each backend](docs/getting-started.md)
- [Integrating with your app: Tailwind, theming, embedding the admin](docs/host-integration.md)
- [Theming tokens](docs/theming.md) · [Agent panel](docs/agent-panel.md) · [Embedding the widget](docs/embedding-the-widget.md)
- [Pages and components in this package](docs/components.md)
- [Plugin development](docs/plugin-development.md)
- [For package maintainers](docs/package-maintainers.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT. Copyright (c) Escalated.dev. See [LICENSE](LICENSE).
