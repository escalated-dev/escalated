<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <a href="README.it.md">Italiano</a> •
  <a href="README.ja.md">日本語</a> •
  <a href="README.ko.md">한국어</a> •
  <a href="README.nl.md">Nederlands</a> •
  <b>Polski</b> •
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

Escalated to osadzalny system zgloszen wsparcia z monitorowaniem SLA, regulami eskalacji, przepywami pracy agentow i portalem klienta. To repozytorium zawiera wszystkie wspoldzielone zasoby frontendowe (Vue 3 + Inertia.js) uzywane we wszystkich obslugiwanych frameworkach backendowych.

👉 **Dowiedz sie wiecej, obejrzyj dema i porownaj opcje Chmura vs Samodzielny hosting na** **[https://escalated.dev](https://escalated.dev)**

**Nie instaluj tego pakietu bezposrednio.** Zacznij od pakietu backendowego dla swojego frameworka — zajmie sie wszystkim, w tym pobieraniem tych zasobow frontendowych.

## Funkcje

- **Dzielenie zgloszen** — Podziel odpowiedz na nowe samodzielne zgloszenie z zachowaniem kontekstu
- **Odkadanie zgloszen** — Odloz zgloszenia z predefiniowanymi ustawieniami (1h, 4h, jutro, nastepny tydzien) i automatycznym budzeniem
- **Zapisane widoki / niestandardowe kolejki** — Zapisuj, nazywaj i udostepniaj ustawienia filtrow jako wielokrotnie uzywane widoki zgloszen
- **Osadzalny widget wsparcia** — Gotowy widget `<script>` z wyszukiwaniem bazy wiedzy, formularzem zgloszenia i sprawdzaniem statusu
- **Aktualizacje w czasie rzeczywistym** — Obsluga WebSocket (Pusher/Reverb/Soketi) z automatycznym fallbackiem pollingu
- **Przelacznik bazy wiedzy** — Wlacz lub wylacz publiczna baze wiedzy w ustawieniach administratora
- **CI: ESLint + Prettier** — Automatyczne egzekwowanie stylu kodu przy kazdym pull requeście

## Pierwsze Kroki

Wybierz swoj framework:

| Framework | Repozytorium | Instalacja |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Pobierz escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Zobacz [konfiguracja pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Kazde repozytorium backendowe ma pelne instrukcje konfiguracji — polecenie instalacji, migracje, konfiguracja i integracja frontendowa.

## Tailwind CSS

Komponenty Escalated uzywaja klas Tailwind CSS. **Musisz** dodac ten pakiet do konfiguracji `content` Tailwinda, aby jego klasy nie zostaly usuniete:

```js
// tailwind.config.js
export default {
    content: [
        // ... twoje istniejace sciezki
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Bez tego interfejs Escalated zostanie wyrenderowany, ale style takie jak tla przyciskow i kolory odznak beda brakujace.

## Motywy

Escalated domyslnie renderuje sie wewnatrz samodzielnego layoutu. Aby zintegrowac go z systemem projektowania swojej aplikacji, uzyj `EscalatedPlugin`:

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

### Integracja Layoutu

Przekaz komponent layoutu swojej aplikacji, a wszystkie strony Escalated beda renderowane wewnatrz niego automatycznie. Komponent layoutu musi akceptowac slot `#header` i domyslny slot:

```vue
<!-- Twoj layout musi obslugiwac te sloty -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Gdy nie zostanie podany layout, Escalated uzywa wlasnego wbudowanego paska nawigacji.

### Niestandardowe Wlasciwosci CSS

Opcja `theme` ustawia niestandardowe wlasciwosci CSS, do ktorych mozesz sie odwolywac we wlasnych stylach:

| Wlasciwosc | Domyslnie | Opis |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Glowny kolor akcji |
| `--esc-primary-hover` | automatycznie przyciemniony | Glowny kolor najechania |
| `--esc-radius` | `0.5rem` | Promien obramowania dla pol i przyciskow |
| `--esc-radius-lg` | automatycznie skalowany | Promien obramowania dla kart i paneli |
| `--esc-font-family` | dziedziczony | Nadpisanie rodziny czcionek |

### Przyklady Frameworkow

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

## Co Jest w Tym Repozytorium

Wszystkie komponenty Vue 3 + Inertia.js napedzajace interfejs Escalated. Sa identyczne w Laravel, Rails, Django i AdonisJS — framework backendowy renderuje je przez Inertia.

## 📸 Zrzuty Ekranu

> Zrzuty ekranu sa automatycznie generowane ze Storybooka przez workflow [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Panel Administratora (Ciemny)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Panel administratora Escalated — tryb ciemny z nawigacja boczna, kartami KPI, statystykami i lista zgloszen" width="800" />
</p>

<p align="center">
  <strong>Panel Administratora (Jasny)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Panel administratora Escalated — tryb jasny z nawigacja boczna, kartami KPI, statystykami i lista zgloszen" width="800" />
</p>

<p align="center">
  <strong>Kolejka Zgloszen</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Kolejka zgloszen Escalated — lista zgloszen agenta z filtrami, wyszukiwaniem, akcjami masowymi i wskaznikami SLA" width="800" />
</p>

<p align="center">
  <strong>Panel Agenta</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Panel agenta Escalated — gorny pasek nawigacji, statystyki i kolejka przypisanych zgloszen" width="800" />
</p>

<p align="center">
  <strong>Widok Szczegolowy Zgloszenia</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Widok szczegolowy zgloszenia Escalated — watek rozmowy, edytor odpowiedzi i boczny panel zgloszenia z zegarem SLA" width="800" />
</p>

### Strony

**Portal Klienta** — Samoobslugowe zarzadzanie zgloszeniami
- `pages/Customer/Index.vue` — Lista zgloszen z filtrami statusu i wyszukiwaniem
- `pages/Customer/Create.vue` — Formularz nowego zgloszenia z zalacznikami plikow
- `pages/Customer/Show.vue` — Szczegoly zgloszenia z watkiem odpowiedzi

**Panel Agenta** — Kolejka zgloszen i przeplywy pracy
- `pages/Agent/Dashboard.vue` — Przeglad statystyk i ostatnich zgloszen
- `pages/Agent/TicketIndex.vue` — Filtrowalna kolejka zgloszen
- `pages/Agent/TicketShow.vue` — Pelny widok zgloszenia z panelem bocznym, notatkami wewnetnymi, gotowymi odpowiedziami

**Panel Administratora** — Konfiguracja systemu
- `pages/Admin/Reports.vue` — Panel analityczny
- `pages/Admin/Departments/` — Zarzadzanie dzialami (CRUD)
- `pages/Admin/SlaPolicies/` — Zarzadzanie politykami SLA
- `pages/Admin/EscalationRules/` — Kreator regul eskalacji
- `pages/Admin/Tags/` — Zarzadzanie tagami
- `pages/Admin/CannedResponses/` — Szablony gotowych odpowiedzi

### Wspoldzielone Komponenty

Wielokrotnie uzywane bloki budulcowe stosowane na powyzszych stronach.

| Komponent | Opis |
|-----------|-------------|
| `StatusBadge` | Kolorowa odznaka statusu zgloszenia |
| `PriorityBadge` | Kolorowa odznaka priorytetu zgloszenia |
| `TicketList` | Paginowana tabela zgloszen |
| `ReplyThread` | Chronologiczny widok odpowiedzi |
| `ReplyComposer` | Edytor odpowiedzi/notatki z przesylaniem plikow i wstawianiem gotowych odpowiedzi |
| `ActivityTimeline` | Dziennik audytu zdarzen zgloszenia |
| `SlaTimer` | Odliczanie SLA ze stanami naruszenia/ostrzezenia |
| `TicketFilters` | Pasek filtrow statusu, priorytetu, agenta, dzialu |
| `TicketSidebar` | Boczny panel szczegulow zgloszenia (status, SLA, tagi, aktywnosc) |
| `AssigneeSelect` | Rozwijana lista przypisania agenta |
| `TagSelect` | Wielokrotny wybor tagow |
| `FileDropzone` | Przesylanie plikow przeciagnij i upusc |
| `AttachmentList` | Wyswietlanie zalacznikow z linkami do pobrania |
| `StatsCard` | Karta metryk z etykieta, wartoscia i trendem |
| `EscalatedLayout` | Layout najwyzszego poziomu z nawigacja (obsluguje wstrzykiwanie layoutu hosta) |
| `BulkActionBar` | Pasek narzedzi do operacji masowych na wybranych zgloszeniach |
| `QuickFilters` | Chipy filtrow jednym kliknieciem (Moje Zgloszenia, Nieprzypisane, Pilne, SLA Naruszone) |
| `MacroDropdown` | Rozwijana lista do stosowania wieloetapowych makr na zgloszeniu |
| `FollowButton` | Przycisk przelaczania sledzenia/odsledzenia zgloszenia |
| `SatisfactionRating` | Wprowadzanie oceny CSAT 1-5 gwiazdek z opcjonalnym komentarzem |
| `KeyboardShortcutHelp` | Nakladka modalna pokazujaca wszystkie dostepne skroty klawiszowe |
| `PinnedNotes` | Wyswietlanie przypinych notatek wewnetrznych na gorze watku |
| `PresenceIndicator` | Wskaznik w czasie rzeczywistym pokazujacy kto przegada zgloszenie |

### Composables

| Composable | Opis |
|------------|-------------|
| `useKeyboardShortcuts` | Rejestruje i zarzadza skrotami klawiszowymi dla akcji na zgloszeniach |

### Plugin

| Eksport | Opis |
|--------|-------------|
| `EscalatedPlugin` | Plugin Vue do wstrzykiwania layoutu i motywow CSS |

## Tworzenie Pluginow

Escalated obsluguje pluginy niezalezne od frameworka, zbudowane za pomoca [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Pluginy sa pisane raz w TypeScript i dzialaja na wszystkich backendach Escalated.

### Jak Dziala System Pluginow Frontendowych

Frontend uzywa `defineEscalatedPlugin()` do rejestrowania komponentow Vue — niestandardowych stron administratora, widgetow paska bocznego zgloszen lub paneli dashboardu — ktore sa automatycznie montowane, gdy plugin jest aktywny.

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

### Jak Laczy Sie z Backendem

Backend uzywa `definePlugin()` z [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) do obslugi logiki biznesowej TypeScript — subskrybowania hookow cyklu zycia zgloszen, udostepniania endpointow API i utrwalania danych. Wpisy frontendowe i backendowe dzialaja razem jako pojedynczy pakiet npm.

```typescript
// wpis backendowy (index.ts)
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

### Szybki Przyklad: Oba Punkty Wejscia

Opublikowany pakiet pluginu typowo eksportuje oba:

```
my-plugin/
  index.ts          ← backend: definePlugin() dla logiki TypeScript
  frontend.ts       ← frontend: defineEscalatedPlugin() dla komponentow Vue
```

Framework backendowy (Laravel, Rails, Django, AdonisJS) laduje `index.ts` przez [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). Aplikacja Vue importuje `frontend.ts` i rejestruje go za pomoca `app.use()`.

### Instalacja Pluginow

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Zasoby

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript SDK do tworzenia pluginow
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Host uruchomieniowy dla pluginow
- [Przewodnik Tworzenia Pluginow](https://github.com/escalated-dev/escalated-docs) — Pelna dokumentacja

## Dla Opiekunow Pakietow

Jesli budujesz nowa integracje backendowa, ten pakiet jest dostepny na npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Importuj plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importuj pojedyncze komponenty
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Lub odwoluj sie do stron bezposrednio dla rozdzielczosci Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Zaleznosci peer: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ekosystem

To jest wspoldzielony frontend dla systemu zgloszen wsparcia Escalated. Pakiety backendowe dostepne dla kazdego waznego frameworka:

- **[Escalated dla Laravel](https://github.com/escalated-dev/escalated-laravel)** — Pakiet Laravel Composer
- **[Escalated dla Rails](https://github.com/escalated-dev/escalated-rails)** — Silnik Ruby on Rails
- **[Escalated dla Django](https://github.com/escalated-dev/escalated-django)** — Wielokrotnie uzywana aplikacja Django
- **[Escalated dla AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Pakiet AdonisJS v6
- **[Escalated dla Filament](https://github.com/escalated-dev/escalated-filament)** — Plugin panelu administratora Filament v3
- **[Wspoldzielony Frontend](https://github.com/escalated-dev/escalated)** — Komponenty UI Vue 3 + Inertia.js (jestes tutaj)

## Licencja

MIT
