<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <b>Français</b> •
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

Escalated est un systeme de tickets de support integrable avec suivi des SLA, regles d'escalade, workflows pour agents et portail client. Ce depot contient tous les assets frontend partages (Vue 3 + Inertia.js) utilises dans tous les frameworks backend supportes.

👉 **En savoir plus, voir les demos et comparer les options Cloud vs Auto-heberge sur** **[https://escalated.dev](https://escalated.dev)**

**N'installez pas ce paquet directement.** Commencez par le paquet backend pour votre framework — il gere tout, y compris l'integration de ces assets frontend.

## Fonctionnalites

- **Division de tickets** — Divisez une reponse en un nouveau ticket independant tout en preservant le contexte
- **Mise en veille de tickets** — Mettez en veille les tickets avec des preselections (1h, 4h, demain, semaine prochaine) et reveil automatique
- **Vues enregistrees / files d'attente personnalisees** — Enregistrez, nommez et partagez des preselections de filtres comme vues de tickets reutilisables
- **Widget de support integrable** — Widget `<script>` pret a l'emploi avec recherche KB, formulaire de ticket et verification de statut
- **Mises a jour en temps reel** — Support WebSocket (Pusher/Reverb/Soketi) avec repli de sondage automatique
- **Basculement de la base de connaissances** — Activez ou desactivez la base de connaissances publique depuis les parametres d'administration
- **CI : ESLint + Prettier** — Application automatique du style de code a chaque pull request

## Pour Commencer

Choisissez votre framework :

| Framework | Depot | Installation |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Telecharger escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Voir [configuration pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Chaque depot backend contient des instructions de configuration completes — commande d'installation, migrations, configuration et integration frontend.

## Tailwind CSS

Les composants Escalated utilisent des classes Tailwind CSS. Vous **devez** ajouter ce paquet a votre configuration `content` de Tailwind pour que ses classes ne soient pas purgees :

```js
// tailwind.config.js
export default {
    content: [
        // ... vos chemins existants
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Sans cela, l'interface Escalated sera rendue mais les styles comme les arriere-plans de boutons et les couleurs de badges seront absents.

## Personnalisation

Escalated s'affiche dans un layout autonome par defaut. Pour l'integrer dans le systeme de design de votre application, utilisez le `EscalatedPlugin` :

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

### Integration du Layout

Passez le composant de layout de votre application et toutes les pages Escalated s'afficheront automatiquement a l'interieur. Le composant de layout doit accepter un slot `#header` et un slot par defaut :

```vue
<!-- Votre layout doit supporter ces slots -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Lorsqu'aucun layout n'est fourni, Escalated utilise sa propre barre de navigation integree.

### Proprietes CSS Personnalisees

L'option `theme` definit des proprietes CSS personnalisees que vous pouvez referencer dans vos propres styles :

| Propriete | Par defaut | Description |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Couleur d'action principale |
| `--esc-primary-hover` | assombrissement automatique | Couleur de survol principale |
| `--esc-radius` | `0.5rem` | Rayon de bordure pour les champs et boutons |
| `--esc-radius-lg` | mise a l'echelle automatique | Rayon de bordure pour les cartes et panneaux |
| `--esc-font-family` | herite | Remplacement de la famille de polices |

### Exemples par Framework

**Laravel** (Inertia + Vue 3) :
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'

app.use(EscalatedPlugin, { layout: AuthenticatedLayout })
```

**Rails** (Inertia + Vue 3) :
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```

**Django** (Inertia + Vue 3) :
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import BaseLayout from '@/layouts/BaseLayout.vue'

app.use(EscalatedPlugin, { layout: BaseLayout })
```

**AdonisJS** (Inertia + Vue 3) :
```js
import { EscalatedPlugin } from '@escalated-dev/escalated'
import AppLayout from '@/layouts/AppLayout.vue'

app.use(EscalatedPlugin, { layout: AppLayout })
```

## Contenu de ce Depot

Tous les composants Vue 3 + Inertia.js qui alimentent l'interface Escalated. Ceux-ci sont identiques sur Laravel, Rails, Django et AdonisJS — le framework backend les rend via Inertia.

## 📸 Captures d'ecran

> Les captures d'ecran sont generees automatiquement depuis Storybook via le workflow [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Panneau d'Administration (Sombre)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Panneau d'administration Escalated — mode sombre avec navigation laterale, cartes KPI, statistiques et liste de tickets" width="800" />
</p>

<p align="center">
  <strong>Panneau d'Administration (Clair)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Panneau d'administration Escalated — mode clair avec navigation laterale, cartes KPI, statistiques et liste de tickets" width="800" />
</p>

<p align="center">
  <strong>File d'Attente des Tickets</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="File d'attente des tickets Escalated — liste de tickets de l'agent avec filtres, recherche, actions groupees et indicateurs SLA" width="800" />
</p>

<p align="center">
  <strong>Panneau de l'Agent</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Panneau de l'agent Escalated — navigation superieure, statistiques et file d'attente des tickets assignes" width="800" />
</p>

<p align="center">
  <strong>Vue Detail du Ticket</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Vue detail du ticket Escalated — fil de conversation, editeur de reponse et barre laterale du ticket avec minuteur SLA" width="800" />
</p>

### Pages

**Portail Client** — Gestion des tickets en libre-service
- `pages/Customer/Index.vue` — Liste de tickets avec filtres de statut et recherche
- `pages/Customer/Create.vue` — Formulaire de nouveau ticket avec pieces jointes
- `pages/Customer/Show.vue` — Detail du ticket avec fil de reponses

**Tableau de Bord de l'Agent** — File d'attente des tickets et workflows
- `pages/Agent/Dashboard.vue` — Vue d'ensemble des statistiques et tickets recents
- `pages/Agent/TicketIndex.vue` — File d'attente de tickets filtrable
- `pages/Agent/TicketShow.vue` — Vue complete du ticket avec barre laterale, notes internes, reponses predefinies

**Panneau d'Administration** — Configuration du systeme
- `pages/Admin/Reports.vue` — Tableau de bord analytique
- `pages/Admin/Departments/` — Gestion des departements (CRUD)
- `pages/Admin/SlaPolicies/` — Gestion des politiques SLA
- `pages/Admin/EscalationRules/` — Constructeur de regles d'escalade
- `pages/Admin/Tags/` — Gestion des etiquettes
- `pages/Admin/CannedResponses/` — Modeles de reponses predefinies

### Composants Partages

Blocs de construction reutilisables utilises dans les pages ci-dessus.

| Composant | Description |
|-----------|-------------|
| `StatusBadge` | Badge colore pour le statut du ticket |
| `PriorityBadge` | Badge colore pour la priorite du ticket |
| `TicketList` | Tableau de tickets pagine |
| `ReplyThread` | Affichage chronologique des reponses |
| `ReplyComposer` | Editeur de reponse/note avec upload de fichiers et insertion de reponses predefinies |
| `ActivityTimeline` | Journal d'audit des evenements du ticket |
| `SlaTimer` | Compte a rebours SLA avec etats de violation/avertissement |
| `TicketFilters` | Barre de filtres statut, priorite, agent, departement |
| `TicketSidebar` | Barre laterale de detail du ticket (statut, SLA, etiquettes, activite) |
| `AssigneeSelect` | Menu deroulant d'assignation d'agent |
| `TagSelect` | Selecteur d'etiquettes a selection multiple |
| `FileDropzone` | Upload de fichiers par glisser-deposer |
| `AttachmentList` | Affichage des pieces jointes avec liens de telechargement |
| `StatsCard` | Carte de metriques avec libelle, valeur et tendance |
| `EscalatedLayout` | Layout de niveau superieur avec navigation (supporte l'injection de layout hote) |
| `BulkActionBar` | Barre d'outils pour les operations groupees sur les tickets selectionnes |
| `QuickFilters` | Puces de filtre en un clic (Mes Tickets, Non Assignes, Urgent, SLA Viole) |
| `MacroDropdown` | Menu deroulant pour appliquer des macros multi-etapes a un ticket |
| `FollowButton` | Bouton bascule pour suivre/ne plus suivre un ticket |
| `SatisfactionRating` | Saisie de note CSAT de 1 a 5 etoiles avec commentaire optionnel |
| `KeyboardShortcutHelp` | Superposition modale affichant tous les raccourcis clavier disponibles |
| `PinnedNotes` | Affichage des notes internes epinglees en haut du fil |
| `PresenceIndicator` | Indicateur en temps reel montrant qui consulte un ticket |

### Composables

| Composable | Description |
|------------|-------------|
| `useKeyboardShortcuts` | Enregistre et gere les raccourcis clavier pour les actions sur les tickets |

### Plugin

| Export | Description |
|--------|-------------|
| `EscalatedPlugin` | Plugin Vue pour l'injection de layout et la personnalisation CSS |

## Developpement de Plugins

Escalated supporte les plugins independants du framework construits avec le [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Les plugins sont ecrits une fois en TypeScript et fonctionnent sur tous les backends Escalated.

### Comment Fonctionne le Systeme de Plugins Frontend

Le frontend utilise `defineEscalatedPlugin()` pour enregistrer des composants Vue — pages d'administration personnalisees, widgets de barre laterale de tickets ou panneaux de tableau de bord — qui sont montes automatiquement lorsque le plugin est actif.

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

### Comment il se Connecte au Backend

Le backend utilise `definePlugin()` du [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) pour gerer la logique metier TypeScript — s'abonner aux hooks du cycle de vie des tickets, exposer des endpoints API et persister les donnees. Les entrees frontend et backend fonctionnent ensemble comme un seul paquet npm.

```typescript
// entree backend (index.ts)
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

### Exemple Rapide : Les Deux Points d'Entree

Un paquet de plugin publie exporte typiquement les deux :

```
my-plugin/
  index.ts          ← backend : definePlugin() pour la logique TypeScript
  frontend.ts       ← frontend : defineEscalatedPlugin() pour les composants Vue
```

Le framework backend (Laravel, Rails, Django, AdonisJS) charge `index.ts` via le [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). L'application Vue importe `frontend.ts` et l'enregistre avec `app.use()`.

### Installation des Plugins

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Ressources

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — SDK TypeScript pour construire des plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Hote d'execution pour les plugins
- [Guide de Developpement de Plugins](https://github.com/escalated-dev/escalated-docs) — Documentation complete

## Pour les Mainteneurs de Paquets

Si vous construisez une nouvelle integration backend, ce paquet est disponible sur npm :

```bash
npm install @escalated-dev/escalated
```

```js
// Importer le plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importer des composants individuels
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Ou referencer les pages directement pour la resolution Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Dependances peer : `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecosysteme

Ceci est le frontend partage pour le systeme de tickets de support Escalated. Paquets backend disponibles pour chaque framework majeur :

- **[Escalated pour Laravel](https://github.com/escalated-dev/escalated-laravel)** — Paquet Laravel Composer
- **[Escalated pour Rails](https://github.com/escalated-dev/escalated-rails)** — Moteur Ruby on Rails
- **[Escalated pour Django](https://github.com/escalated-dev/escalated-django)** — Application Django reutilisable
- **[Escalated pour AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Paquet AdonisJS v6
- **[Escalated pour Filament](https://github.com/escalated-dev/escalated-filament)** — Plugin de panneau d'administration Filament v3
- **[Frontend Partage](https://github.com/escalated-dev/escalated)** — Composants UI Vue 3 + Inertia.js (vous etes ici)

## Licence

MIT
