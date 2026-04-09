<p align="center">
  <a href="README.ar.md">العربية</a> •
  <b>Deutsch</b> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <a href="README.it.md">Italiano</a> •
  <a href="README.ja.md">日本語</a> •
  <a href="README.ko.md">한국어</a> •
  <a href="README.nl.md">Nederlands</a> •
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

Escalated ist ein einbettbares Support-Ticket-System mit SLA-Tracking, Eskalationsregeln, Agenten-Workflows und einem Kundenportal. Dieses Repository enthält alle gemeinsamen Frontend-Assets (Vue 3 + Inertia.js), die in allen unterstützten Backend-Frameworks verwendet werden.

👉 **Erfahren Sie mehr, sehen Sie Demos und vergleichen Sie Cloud- und Self-Hosted-Optionen auf** **[https://escalated.dev](https://escalated.dev)**

**Installieren Sie dieses Paket nicht direkt.** Beginnen Sie mit dem Backend-Paket für Ihr Framework — es kümmert sich um alles, einschließlich des Einbindens dieser Frontend-Assets.

## Funktionen

- **Ticket-Aufspaltung** — Spalten Sie eine Antwort in ein neues eigenständiges Ticket auf und bewahren Sie den Kontext
- **Ticket-Schlummerfunktion** — Schlummern Sie Tickets mit Voreinstellungen (1h, 4h, morgen, nächste Woche) und automatischem Aufwachen
- **Gespeicherte Ansichten / Benutzerdefinierte Warteschlangen** — Speichern, benennen und teilen Sie Filtervoreinstellungen als wiederverwendbare Ticket-Ansichten
- **Einbettbares Support-Widget** — Sofort einsetzbares `<script>`-Widget mit KB-Suche, Ticket-Formular und Statusprüfung
- **Echtzeit-Updates** — WebSocket-Unterstützung (Pusher/Reverb/Soketi) mit automatischem Polling-Fallback
- **Wissensdatenbank-Umschalter** — Aktivieren oder deaktivieren Sie die öffentliche Wissensdatenbank in den Admin-Einstellungen
- **CI: ESLint + Prettier** — Automatische Code-Stil-Durchsetzung bei jedem Pull Request

## Erste Schritte

Wählen Sie Ihr Framework:

| Framework | Repository | Installation |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [escalated.zip herunterladen](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Siehe [pubspec.yaml-Einrichtung](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Jedes Backend-Repository enthält vollständige Einrichtungsanweisungen — Installationsbefehl, Migrationen, Konfiguration und Frontend-Integration.

## Tailwind CSS

Escalated-Komponenten verwenden Tailwind-CSS-Klassen. Sie **müssen** dieses Paket zu Ihrer Tailwind-`content`-Konfiguration hinzufügen, damit seine Klassen nicht entfernt werden:

```js
// tailwind.config.js
export default {
    content: [
        // ... Ihre vorhandenen Pfade
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Ohne dies wird die Escalated-Benutzeroberfläche gerendert, aber Stile wie Schaltflächenhintergründe und Badge-Farben fehlen.

## Theming

Escalated wird standardmäßig in einem eigenständigen Layout gerendert. Um es in das Design-System Ihrer App zu integrieren, verwenden Sie das `EscalatedPlugin`:

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

### Layout-Integration

Übergeben Sie die Layout-Komponente Ihrer App und alle Escalated-Seiten werden automatisch darin gerendert. Die Layout-Komponente muss einen `#header`-Slot und einen Standard-Slot akzeptieren:

```vue
<!-- Ihr Layout muss diese Slots unterstützen -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Wenn kein Layout angegeben wird, verwendet Escalated seine eigene integrierte Navigationsleiste.

### Benutzerdefinierte CSS-Eigenschaften

Die `theme`-Option setzt benutzerdefinierte CSS-Eigenschaften, die Sie in Ihren eigenen Stilen referenzieren können:

| Eigenschaft | Standard | Beschreibung |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Primäre Aktionsfarbe |
| `--esc-primary-hover` | automatisch abgedunkelt | Primäre Hover-Farbe |
| `--esc-radius` | `0.5rem` | Rahmenradius für Eingaben und Schaltflächen |
| `--esc-radius-lg` | automatisch skaliert | Rahmenradius für Karten und Panels |
| `--esc-font-family` | vererbt | Schriftfamilien-Überschreibung |

### Framework-Beispiele

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

## Was in diesem Repository enthalten ist

Alle Vue 3 + Inertia.js-Komponenten, die die Escalated-Benutzeroberfläche antreiben. Diese sind identisch über Laravel, Rails, Django und AdonisJS hinweg — das Backend-Framework rendert sie über Inertia.

## 📸 Screenshots

> Screenshots werden automatisch aus Storybook über den [component-screenshots](.github/workflows/screenshots.yml)-Workflow generiert.

<p align="center">
  <strong>Admin-Panel (Dunkel)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Escalated Admin-Panel — Dunkelmodus mit Seitenleisten-Navigation, KPI-Karten, Statistiken und Ticket-Liste" width="800" />
</p>

<p align="center">
  <strong>Admin-Panel (Hell)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Escalated Admin-Panel — Hellmodus mit Seitenleisten-Navigation, KPI-Karten, Statistiken und Ticket-Liste" width="800" />
</p>

<p align="center">
  <strong>Ticket-Warteschlange</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Escalated Ticket-Warteschlange — Agenten-Ticketliste mit Filtern, Suche, Massenaktionen und SLA-Indikatoren" width="800" />
</p>

<p align="center">
  <strong>Agenten-Panel</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Escalated Agenten-Panel — obere Navigation, Statistiken und zugewiesene Ticket-Warteschlange" width="800" />
</p>

<p align="center">
  <strong>Ticket-Detailansicht</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Escalated Ticket-Detailansicht — Konversationsthread, Antwort-Editor und Ticket-Seitenleiste mit SLA-Timer" width="800" />
</p>

### Seiten

**Kundenportal** — Self-Service-Ticketverwaltung
- `pages/Customer/Index.vue` — Ticketliste mit Statusfiltern und Suche
- `pages/Customer/Create.vue` — Neues Ticketformular mit Dateianhängen
- `pages/Customer/Show.vue` — Ticketdetail mit Antwortthread

**Agenten-Dashboard** — Ticket-Warteschlange und Workflows
- `pages/Agent/Dashboard.vue` — Statistikübersicht und neueste Tickets
- `pages/Agent/TicketIndex.vue` — Filterbare Ticket-Warteschlange
- `pages/Agent/TicketShow.vue` — Vollständige Ticketansicht mit Seitenleiste, internen Notizen, vorgefertigten Antworten

**Admin-Panel** — Systemkonfiguration
- `pages/Admin/Reports.vue` — Analyse-Dashboard
- `pages/Admin/Departments/` — Abteilungsverwaltung
- `pages/Admin/SlaPolicies/` — SLA-Richtlinienverwaltung
- `pages/Admin/EscalationRules/` — Eskalationsregel-Builder
- `pages/Admin/Tags/` — Tag-Verwaltung
- `pages/Admin/CannedResponses/` — Vorgefertigte Antwortvorlagen

### Gemeinsame Komponenten

Wiederverwendbare Bausteine, die auf den obigen Seiten verwendet werden.

| Komponente | Beschreibung |
|-----------|-------------|
| `StatusBadge` | Farbiges Badge für Ticket-Status |
| `PriorityBadge` | Farbiges Badge für Ticket-Priorität |
| `TicketList` | Paginierte Ticket-Tabelle |
| `ReplyThread` | Chronologische Antwortanzeige |
| `ReplyComposer` | Antwort-/Notiz-Editor mit Datei-Upload und Einfügen vorgefertigter Antworten |
| `ActivityTimeline` | Prüfprotokoll der Ticket-Ereignisse |
| `SlaTimer` | SLA-Countdown mit Verletzungs-/Warnzuständen |
| `TicketFilters` | Filter-Leiste für Status, Priorität, Agent, Abteilung |
| `TicketSidebar` | Ticket-Detail-Seitenleiste (Status, SLA, Tags, Aktivität) |
| `AssigneeSelect` | Dropdown für Agentenzuweisung |
| `TagSelect` | Mehrfachauswahl-Tag-Picker |
| `FileDropzone` | Drag-and-Drop-Datei-Upload |
| `AttachmentList` | Dateianhang-Anzeige mit Download-Links |
| `StatsCard` | Metrikkarte mit Bezeichnung, Wert und Trend |
| `EscalatedLayout` | Top-Level-Layout mit Navigation (unterstützt Host-Layout-Injection) |
| `BulkActionBar` | Werkzeugleiste für Massenoperationen auf ausgewählten Tickets |
| `QuickFilters` | Ein-Klick-Filter-Chips (Meine Tickets, Nicht zugewiesen, Dringend, SLA-Verletzung) |
| `MacroDropdown` | Dropdown zum Anwenden mehrstufiger Makros auf ein Ticket |
| `FollowButton` | Umschaltknopf zum Folgen/Entfolgen eines Tickets |
| `SatisfactionRating` | 1-5 Sterne CSAT-Bewertungseingabe mit optionalem Kommentar |
| `KeyboardShortcutHelp` | Modal-Overlay mit allen verfügbaren Tastenkombinationen |
| `PinnedNotes` | Anzeige angehefteter interner Notizen oben im Thread |
| `PresenceIndicator` | Echtzeit-Indikator, der zeigt, wer ein Ticket ansieht |

### Composables

| Composable | Beschreibung |
|------------|-------------|
| `useKeyboardShortcuts` | Registriert und verwaltet Tastenkombinationen für Ticket-Aktionen |

### Plugin

| Export | Beschreibung |
|--------|-------------|
| `EscalatedPlugin` | Vue-Plugin für Layout-Injection und CSS-Theming |

## Plugin-Entwicklung

Escalated unterstützt framework-unabhängige Plugins, die mit dem [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) erstellt werden. Plugins werden einmal in TypeScript geschrieben und funktionieren auf allen Escalated-Backends.

### Wie das Frontend-Plugin-System funktioniert

Das Frontend verwendet `defineEscalatedPlugin()`, um Vue-Komponenten zu registrieren — benutzerdefinierte Admin-Seiten, Ticket-Seitenleisten-Widgets oder Dashboard-Panels — die automatisch gemountet werden, wenn das Plugin aktiv ist.

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

### Wie es sich mit dem Backend verbindet

Das Backend verwendet `definePlugin()` aus dem [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk), um die TypeScript-Geschäftslogik zu handhaben — Ticket-Lebenszyklus-Hooks abonnieren, API-Endpunkte bereitstellen und Daten persistieren. Die Frontend- und Backend-Einträge arbeiten als ein einziges npm-Paket zusammen.

```typescript
// Backend-Eintrag (index.ts)
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

### Schnellbeispiel: Beide Einstiegspunkte

Ein veröffentlichtes Plugin-Paket exportiert typischerweise beides:

```
my-plugin/
  index.ts          ← Backend: definePlugin() für TypeScript-Logik
  frontend.ts       ← Frontend: defineEscalatedPlugin() für Vue-Komponenten
```

Das Backend-Framework (Laravel, Rails, Django, AdonisJS) lädt `index.ts` über die [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). Die Vue-App importiert `frontend.ts` und registriert es mit `app.use()`.

### Plugins installieren

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Ressourcen

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript-SDK zum Erstellen von Plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Laufzeit-Host für Plugins
- [Plugin-Entwicklungshandbuch](https://github.com/escalated-dev/escalated-docs) — Vollständige Dokumentation

## Für Paket-Maintainer

Wenn Sie eine neue Backend-Integration erstellen, ist dieses Paket auf npm verfügbar:

```bash
npm install @escalated-dev/escalated
```

```js
// Plugin importieren
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Einzelne Komponenten importieren
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Oder Seiten direkt für die Inertia-Auflösung referenzieren
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer-Abhängigkeiten: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ökosystem

Dies ist das gemeinsame Frontend für das Escalated-Support-Ticket-System. Backend-Pakete sind für jedes große Framework verfügbar:

- **[Escalated für Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composer-Paket
- **[Escalated für Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Rails Engine
- **[Escalated für Django](https://github.com/escalated-dev/escalated-django)** — Wiederverwendbare Django-App
- **[Escalated für AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6-Paket
- **[Escalated für Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3 Admin-Panel-Plugin
- **[Gemeinsames Frontend](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UI-Komponenten (Sie sind hier)

## Lizenz

MIT
