<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <a href="README.it.md">Italiano</a> •
  <a href="README.ja.md">日本語</a> •
  <a href="README.ko.md">한국어</a> •
  <b>Nederlands</b> •
  <a href="README.pl.md">Polski</a> •
  <a href="README.pt-BR.md">Português (BR)</a> •
  <a href="README.ru.md">Русский</a> •
  <a href="README.tr.md">Türkçe</a> •
  <a href="README.zh-CN.md">简体中文</a>
</p>

<h1>
  <img src="https://escalated.dev/apple-touch-icon.png" width="28" style="vertical-align:middle;" />
  Escalated
</h1>

[![Tests](https://github.com/escalated-dev/escalated/actions/workflows/run-tests.yml/badge.svg)](https://github.com/escalated-dev/escalated/actions/workflows/run-tests.yml)
[![npm](https://img.shields.io/npm/v/@escalated-dev/escalated)](https://www.npmjs.com/package/@escalated-dev/escalated)
[![Vue 3](https://img.shields.io/badge/vue-3.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Escalated is een inbedbaar supportticketsysteem met SLA-tracking, escalatieregels, agentworkflows en een klantenportaal. Deze repository bevat alle gedeelde frontend-assets (Vue 3 + Inertia.js) die worden gebruikt in alle ondersteunde backend-frameworks.

👉 **Meer informatie, bekijk demo's en vergelijk Cloud vs Zelf-gehost opties op** **[https://escalated.dev](https://escalated.dev)**

**Installeer dit pakket niet rechtstreeks.** Begin met het backend-pakket voor je framework — dat regelt alles, inclusief het ophalen van deze frontend-assets.

## Functies

- **Ticket splitsen** — Splits een antwoord in een nieuw zelfstandig ticket met behoud van context
- **Ticket snoozen** — Snooze tickets met voorinstellingen (1u, 4u, morgen, volgende week) en automatisch ontwaken
- **Opgeslagen weergaven / aangepaste wachtrijen** — Sla filtervoorinstellingen op als herbruikbare ticketweergaven, geef ze een naam en deel ze
- **Inbedbaar supportwidget** — Drop-in `<script>` widget met KB-zoeken, ticketformulier en statuscontrole
- **Realtime updates** — WebSocket-ondersteuning (Pusher/Reverb/Soketi) met automatische polling-fallback
- **Kennisbank schakelaar** — Schakel de openbare kennisbank in of uit vanuit de beheerdersinstellingen
- **CI: ESLint + Prettier** — Automatische codestijlhandhaving bij elk pull request

## Aan de Slag

Kies je framework:

| Framework | Repository | Installatie |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Download escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Zie [pubspec.yaml setup](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Elke backend-repository heeft volledige installatie-instructies — installatiecommando, migraties, configuratie en frontend-integratie.

## Tailwind CSS

Escalated-componenten gebruiken Tailwind CSS-klassen. Je **moet** dit pakket toevoegen aan je Tailwind `content`-configuratie zodat de klassen niet worden verwijderd:

```js
// tailwind.config.js
export default {
    content: [
        // ... je bestaande paden
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Zonder dit wordt de Escalated UI weergegeven, maar stijlen zoals knopachtergronden en badgekleuren ontbreken.

## Thema's

Escalated wordt standaard weergegeven in een zelfstandige layout. Om het te integreren in het ontwerpsysteem van je app, gebruik je het `EscalatedPlugin`:

```js
import { createApp } from 'vue'
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/Layouts/AppLayout.vue'

const app = createApp(...)

app.use(EscalatedPlugin, {
    layout: AppLayout,
    theme: {
        primary: '#3b82f6',
        radius: '0.75rem',
    }
})
```

### Layout-integratie

Geef het layout-component van je app door en alle Escalated-pagina's worden automatisch daarin weergegeven. Het layout-component moet een `#header` slot en een standaard slot accepteren:

```vue
<!-- Je layout moet deze slots ondersteunen -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Wanneer geen layout wordt opgegeven, gebruikt Escalated zijn eigen ingebouwde navigatiebalk.

### Aangepaste CSS-eigenschappen

De `theme` optie stelt aangepaste CSS-eigenschappen in die je kunt refereren in je eigen stijlen:

| Eigenschap | Standaard | Beschrijving |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Primaire actiekleur |
| `--esc-primary-hover` | automatisch donkerder | Primaire hover-kleur |
| `--esc-radius` | `0.5rem` | Randradius voor invoervelden en knoppen |
| `--esc-radius-lg` | automatisch geschaald | Randradius voor kaarten en panelen |
| `--esc-font-family` | overgenomen | Lettertypefamilie-overschrijving |

### Framework-voorbeelden

**Laravel** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

app.use(EscalatedPlugin, { layout: AuthenticatedLayout })
```

**Rails** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```

**Django** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import BaseLayout from '@/layouts/BaseLayout.vue'

app.use(EscalatedPlugin, { layout: BaseLayout })
```

**AdonisJS** (Inertia + Vue 3):
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```

## Wat Zit er in Deze Repository

Alle Vue 3 + Inertia.js componenten die de Escalated UI aandrijven. Deze zijn identiek voor Laravel, Rails, Django en AdonisJS — het backend-framework rendert ze via Inertia.

## 📸 Screenshots

> Screenshots worden automatisch gegenereerd vanuit Storybook via de [component-screenshots](.github/workflows/screenshots.yml) workflow.

<p align="center">
  <strong>Beheerderspaneel (Donker)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Escalated Beheerderspaneel — donkere modus met zijbalknavigatie, KPI-kaarten, statistieken en ticketlijst" width="800" />
</p>

<p align="center">
  <strong>Beheerderspaneel (Licht)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Escalated Beheerderspaneel — lichte modus met zijbalknavigatie, KPI-kaarten, statistieken en ticketlijst" width="800" />
</p>

<p align="center">
  <strong>Ticketwachtrij</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Escalated Ticketwachtrij — agent ticketlijst met filters, zoeken, bulkacties en SLA-indicatoren" width="800" />
</p>

<p align="center">
  <strong>Agentpaneel</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Escalated Agentpaneel — bovenste navigatie, statistieken en toegewezen ticketwachtrij" width="800" />
</p>

<p align="center">
  <strong>Ticket Detailweergave</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Escalated Ticket Detailweergave — gespreksthread, antwoordcomposer en ticketzijbalk met SLA-timer" width="800" />
</p>

### Pagina's

**Klantenportaal** — Selfservice ticketbeheer
- `pages/Customer/Index.vue` — Ticketlijst met statusfilters en zoeken
- `pages/Customer/Create.vue` — Nieuw ticketformulier met bestandsbijlagen
- `pages/Customer/Show.vue` — Ticketdetail met antwoordthread

**Agent Dashboard** — Ticketwachtrij en workflows
- `pages/Agent/Dashboard.vue` — Statistiekenoverzicht en recente tickets
- `pages/Agent/TicketIndex.vue` — Filterbare ticketwachtrij
- `pages/Agent/TicketShow.vue` — Volledige ticketweergave met zijbalk, interne notities, standaardantwoorden

**Beheerderspaneel** — Systeemconfiguratie
- `pages/Admin/Reports.vue` — Analysedashboard
- `pages/Admin/Departments/` — Afdelingsbeheer (CRUD)
- `pages/Admin/SlaPolicies/` — SLA-beleidsbeheer
- `pages/Admin/EscalationRules/` — Escalatieregel-builder
- `pages/Admin/Tags/` — Tagbeheer
- `pages/Admin/CannedResponses/` — Standaardantwoordsjablonen

### Gedeelde Componenten

Herbruikbare bouwstenen die worden gebruikt op bovenstaande pagina's.

| Component | Beschrijving |
|-----------|-------------|
| `StatusBadge` | Gekleurde badge voor ticketstatus |
| `PriorityBadge` | Gekleurde badge voor ticketprioriteit |
| `TicketList` | Gepagineerde tickettabel |
| `ReplyThread` | Chronologische antwoordweergave |
| `ReplyComposer` | Antwoord-/notitie-editor met bestandsupload en standaardantwoord-invoeging |
| `ActivityTimeline` | Auditlog van ticketgebeurtenissen |
| `SlaTimer` | SLA-aftelling met overtredings-/waarschuwingsstatussen |
| `TicketFilters` | Filter balk voor status, prioriteit, agent, afdeling |
| `TicketSidebar` | Ticketdetail-zijbalk (status, SLA, tags, activiteit) |
| `AssigneeSelect` | Dropdown voor agenttoewijzing |
| `TagSelect` | Multi-select tagkiezer |
| `FileDropzone` | Drag-and-drop bestandsupload |
| `AttachmentList` | Bestandsbijlageweergave met downloadlinks |
| `StatsCard` | Metriekskaart met label, waarde en trend |
| `EscalatedLayout` | Top-level layout met navigatie (ondersteunt host layout-injectie) |
| `BulkActionBar` | Werkbalk voor bulkoperaties op geselecteerde tickets |
| `QuickFilters` | Eenklik-filterchips (Mijn Tickets, Niet-toegewezen, Urgent, SLA-overtreding) |
| `MacroDropdown` | Dropdown om meerstaps-macro's op een ticket toe te passen |
| `FollowButton` | Schakelknop om een ticket te volgen/ontvolgen |
| `SatisfactionRating` | 1-5 sterren CSAT-beoordelingsinvoer met optioneel commentaar |
| `KeyboardShortcutHelp` | Modale overlay met alle beschikbare sneltoetsen |
| `PinnedNotes` | Weergave van vastgepinde interne notities bovenaan de thread |
| `PresenceIndicator` | Realtime indicator die toont wie een ticket bekijkt |

### Composables

| Composable | Beschrijving |
|------------|-------------|
| `useKeyboardShortcuts` | Registreert en beheert sneltoetsen voor ticketacties |

### Plugin

| Export | Beschrijving |
|--------|-------------|
| `EscalatedPlugin` | Vue-plugin voor layout-injectie en CSS-thema's |

## Plugin-ontwikkeling

Escalated ondersteunt framework-onafhankelijke plugins gebouwd met de [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Plugins worden eenmalig geschreven in TypeScript en werken op alle Escalated-backends.

### Hoe het Frontend Plugin Systeem Werkt

De frontend gebruikt `defineEscalatedPlugin()` om Vue-componenten te registreren — aangepaste beheerderspagina's, ticketzijbalk-widgets of dashboardpanelen — die automatisch worden gemount wanneer de plugin actief is.

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

### Hoe het Verbindt met de Backend

De backend gebruikt `definePlugin()` van de [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) om TypeScript-bedrijfslogica af te handelen — abonneren op ticket lifecycle hooks, API-endpoints blootleggen en gegevens persisteren. De frontend- en backend-ingangen werken samen als een enkel npm-pakket.

```typescript
// backend-ingang (index.ts)
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

### Snel Voorbeeld: Beide Ingangspunten

Een gepubliceerd plugin-pakket exporteert doorgaans beide:

```
my-plugin/
  index.ts          ← backend: definePlugin() voor TypeScript-logica
  frontend.ts       ← frontend: defineEscalatedPlugin() voor Vue-componenten
```

Het backend-framework (Laravel, Rails, Django, AdonisJS) laadt `index.ts` via de [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). De Vue-app importeert `frontend.ts` en registreert het met `app.use()`.

### Plugins Installeren

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Bronnen

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript SDK voor het bouwen van plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Runtime host voor plugins
- [Plugin Ontwikkelgids](https://github.com/escalated-dev/escalated-docs) — Volledige documentatie

## Voor Pakketbeheerders

Als je een nieuwe backend-integratie bouwt, is dit pakket beschikbaar op npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Importeer de plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importeer individuele componenten
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Of verwijs direct naar pagina's voor Inertia-resolutie
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer-afhankelijkheden: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecosysteem

Dit is de gedeelde frontend voor het Escalated supportticketsysteem. Backend-pakketten beschikbaar voor elk groot framework:

- **[Escalated voor Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composer-pakket
- **[Escalated voor Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Rails engine
- **[Escalated voor Django](https://github.com/escalated-dev/escalated-django)** — Herbruikbare Django-app
- **[Escalated voor AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6-pakket
- **[Escalated voor Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3 beheerderspaneel-plugin
- **[Gedeelde Frontend](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UI-componenten (je bent hier)

## Licentie

MIT
