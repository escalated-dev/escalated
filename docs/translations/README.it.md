<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <b>Italiano</b> •
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

Escalated e un sistema di ticket di supporto integrabile con tracciamento SLA, regole di escalation, workflow per agenti e portale clienti. Questo repository contiene tutte le risorse frontend condivise (Vue 3 + Inertia.js) utilizzate in tutti i framework backend supportati.

👉 **Scopri di piu, guarda le demo e confronta le opzioni Cloud vs Self-Hosted su** **[https://escalated.dev](https://escalated.dev)**

**Non installare questo pacchetto direttamente.** Inizia con il pacchetto backend per il tuo framework — gestisce tutto, incluso l'integrazione di queste risorse frontend.

## Funzionalita

- **Divisione ticket** — Dividi una risposta in un nuovo ticket indipendente preservando il contesto
- **Posticipo ticket** — Posticipa i ticket con preimpostazioni (1h, 4h, domani, prossima settimana) e riattivazione automatica
- **Viste salvate / code personalizzate** — Salva, nomina e condividi preimpostazioni di filtri come viste ticket riutilizzabili
- **Widget di supporto integrabile** — Widget `<script>` pronto all'uso con ricerca KB, modulo ticket e verifica stato
- **Aggiornamenti in tempo reale** — Supporto WebSocket (Pusher/Reverb/Soketi) con fallback polling automatico
- **Interruttore knowledge base** — Abilita o disabilita la knowledge base pubblica dalle impostazioni admin
- **CI: ESLint + Prettier** — Applicazione automatica dello stile del codice ad ogni pull request

## Per Iniziare

Scegli il tuo framework:

| Framework | Repository | Installazione |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Scarica escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Vedi [configurazione pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Ogni repository backend ha istruzioni di configurazione complete — comando di installazione, migrazioni, configurazione e integrazione frontend.

## Tailwind CSS

I componenti Escalated utilizzano classi Tailwind CSS. **Devi** aggiungere questo pacchetto alla configurazione `content` di Tailwind affinche le sue classi non vengano eliminate:

```js
// tailwind.config.js
export default {
    content: [
        // ... i tuoi percorsi esistenti
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Senza questo, l'interfaccia Escalated verra renderizzata ma gli stili come gli sfondi dei pulsanti e i colori dei badge saranno assenti.

## Personalizzazione

Escalated viene renderizzato all'interno di un layout autonomo per impostazione predefinita. Per integrarlo nel design system della tua app, usa l'`EscalatedPlugin`:

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

### Integrazione Layout

Passa il componente layout della tua app e tutte le pagine Escalated verranno renderizzate al suo interno automaticamente. Il componente layout deve accettare uno slot `#header` e uno slot predefinito:

```vue
<!-- Il tuo layout deve supportare questi slot -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Quando non viene fornito un layout, Escalated utilizza la propria barra di navigazione integrata.

### Proprieta CSS Personalizzate

L'opzione `theme` imposta proprieta CSS personalizzate che puoi referenziare nei tuoi stili:

| Proprieta | Predefinito | Descrizione |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Colore azione primaria |
| `--esc-primary-hover` | scurimento automatico | Colore hover primario |
| `--esc-radius` | `0.5rem` | Raggio bordo per input e pulsanti |
| `--esc-radius-lg` | scalatura automatica | Raggio bordo per card e pannelli |
| `--esc-font-family` | ereditato | Override famiglia font |

### Esempi per Framework

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

## Contenuto di Questo Repository

Tutti i componenti Vue 3 + Inertia.js che alimentano l'interfaccia Escalated. Questi sono identici su Laravel, Rails, Django e AdonisJS — il framework backend li renderizza tramite Inertia.

## 📸 Screenshot

> Gli screenshot vengono generati automaticamente da Storybook tramite il workflow [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Pannello Admin (Scuro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Pannello admin Escalated — modalita scura con navigazione laterale, card KPI, statistiche e lista ticket" width="800" />
</p>

<p align="center">
  <strong>Pannello Admin (Chiaro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Pannello admin Escalated — modalita chiara con navigazione laterale, card KPI, statistiche e lista ticket" width="800" />
</p>

<p align="center">
  <strong>Coda Ticket</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Coda ticket Escalated — lista ticket dell'agente con filtri, ricerca, azioni di massa e indicatori SLA" width="800" />
</p>

<p align="center">
  <strong>Pannello Agente</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Pannello agente Escalated — navigazione superiore, statistiche e coda ticket assegnati" width="800" />
</p>

<p align="center">
  <strong>Vista Dettaglio Ticket</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Vista dettaglio ticket Escalated — thread conversazione, editor risposta e barra laterale ticket con timer SLA" width="800" />
</p>

### Pagine

**Portale Clienti** — Gestione ticket self-service
- `pages/Customer/Index.vue` — Lista ticket con filtri stato e ricerca
- `pages/Customer/Create.vue` — Modulo nuovo ticket con allegati
- `pages/Customer/Show.vue` — Dettaglio ticket con thread risposte

**Dashboard Agente** — Coda ticket e workflow
- `pages/Agent/Dashboard.vue` — Panoramica statistiche e ticket recenti
- `pages/Agent/TicketIndex.vue` — Coda ticket filtrabile
- `pages/Agent/TicketShow.vue` — Vista ticket completa con barra laterale, note interne, risposte predefinite

**Pannello Admin** — Configurazione sistema
- `pages/Admin/Reports.vue` — Dashboard analitico
- `pages/Admin/Departments/` — Gestione dipartimenti (CRUD)
- `pages/Admin/SlaPolicies/` — Gestione politiche SLA
- `pages/Admin/EscalationRules/` — Costruttore regole di escalation
- `pages/Admin/Tags/` — Gestione tag
- `pages/Admin/CannedResponses/` — Modelli risposte predefinite

### Componenti Condivisi

Blocchi di costruzione riutilizzabili utilizzati nelle pagine sopra.

| Componente | Descrizione |
|-----------|-------------|
| `StatusBadge` | Badge colorato per lo stato del ticket |
| `PriorityBadge` | Badge colorato per la priorita del ticket |
| `TicketList` | Tabella ticket paginata |
| `ReplyThread` | Visualizzazione cronologica delle risposte |
| `ReplyComposer` | Editor risposta/nota con upload file e inserimento risposte predefinite |
| `ActivityTimeline` | Log di audit degli eventi del ticket |
| `SlaTimer` | Conto alla rovescia SLA con stati violazione/avviso |
| `TicketFilters` | Barra filtri stato, priorita, agente, dipartimento |
| `TicketSidebar` | Barra laterale dettaglio ticket (stato, SLA, tag, attivita) |
| `AssigneeSelect` | Menu a tendina assegnazione agente |
| `TagSelect` | Selettore tag a selezione multipla |
| `FileDropzone` | Upload file drag-and-drop |
| `AttachmentList` | Visualizzazione allegati con link di download |
| `StatsCard` | Card metriche con etichetta, valore e tendenza |
| `EscalatedLayout` | Layout di livello superiore con navigazione (supporta iniezione layout host) |
| `BulkActionBar` | Barra strumenti per operazioni di massa sui ticket selezionati |
| `QuickFilters` | Chip filtro a un clic (I Miei Ticket, Non Assegnati, Urgente, SLA Violato) |
| `MacroDropdown` | Menu a tendina per applicare macro multi-step a un ticket |
| `FollowButton` | Pulsante toggle per seguire/smettere di seguire un ticket |
| `SatisfactionRating` | Input valutazione CSAT da 1 a 5 stelle con commento opzionale |
| `KeyboardShortcutHelp` | Overlay modale che mostra tutte le scorciatoie da tastiera disponibili |
| `PinnedNotes` | Visualizzazione note interne fissate in cima al thread |
| `PresenceIndicator` | Indicatore in tempo reale che mostra chi sta visualizzando un ticket |

### Composables

| Composable | Descrizione |
|------------|-------------|
| `useKeyboardShortcuts` | Registra e gestisce le scorciatoie da tastiera per le azioni sui ticket |

### Plugin

| Export | Descrizione |
|--------|-------------|
| `EscalatedPlugin` | Plugin Vue per iniezione layout e personalizzazione CSS |

## Sviluppo Plugin

Escalated supporta plugin indipendenti dal framework costruiti con il [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). I plugin vengono scritti una volta in TypeScript e funzionano su tutti i backend Escalated.

### Come Funziona il Sistema Plugin Frontend

Il frontend usa `defineEscalatedPlugin()` per registrare componenti Vue — pagine admin personalizzate, widget barra laterale ticket o pannelli dashboard — che vengono montati automaticamente quando il plugin e attivo.

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

### Come si Connette al Backend

Il backend usa `definePlugin()` dal [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) per gestire la logica business TypeScript — sottoscrivere hook del ciclo di vita dei ticket, esporre endpoint API e persistere dati. Le entry frontend e backend lavorano insieme come un singolo pacchetto npm.

```typescript
// entry backend (index.ts)
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

### Esempio Rapido: Entrambi i Punti di Ingresso

Un pacchetto plugin pubblicato tipicamente esporta entrambi:

```
my-plugin/
  index.ts          ← backend: definePlugin() per logica TypeScript
  frontend.ts       ← frontend: defineEscalatedPlugin() per componenti Vue
```

Il framework backend (Laravel, Rails, Django, AdonisJS) carica `index.ts` tramite il [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). L'app Vue importa `frontend.ts` e lo registra con `app.use()`.

### Installazione Plugin

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Risorse

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — SDK TypeScript per costruire plugin
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Host runtime per plugin
- [Guida allo Sviluppo Plugin](https://github.com/escalated-dev/escalated-docs) — Documentazione completa

## Per i Manutentori dei Pacchetti

Se stai costruendo una nuova integrazione backend, questo pacchetto e disponibile su npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Importa il plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importa componenti individuali
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// O referenzia le pagine direttamente per la risoluzione Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Dipendenze peer: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecosistema

Questo e il frontend condiviso per il sistema di ticket di supporto Escalated. Pacchetti backend disponibili per ogni framework principale:

- **[Escalated per Laravel](https://github.com/escalated-dev/escalated-laravel)** — Pacchetto Laravel Composer
- **[Escalated per Rails](https://github.com/escalated-dev/escalated-rails)** — Engine Ruby on Rails
- **[Escalated per Django](https://github.com/escalated-dev/escalated-django)** — App Django riutilizzabile
- **[Escalated per AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Pacchetto AdonisJS v6
- **[Escalated per Filament](https://github.com/escalated-dev/escalated-filament)** — Plugin pannello admin Filament v3
- **[Frontend Condiviso](https://github.com/escalated-dev/escalated)** — Componenti UI Vue 3 + Inertia.js (sei qui)

## Licenza

MIT
