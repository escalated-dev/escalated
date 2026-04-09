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
  <a href="README.pl.md">Polski</a> •
  <a href="README.pt-BR.md">Português (BR)</a> •
  <b>Русский</b> •
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

Escalated — это встраиваемая система тикетов поддержки с отслеживанием SLA, правилами эскалации, рабочими процессами агентов и клиентским порталом. Этот репозиторий содержит все общие фронтенд-ресурсы (Vue 3 + Inertia.js), используемые во всех поддерживаемых бэкенд-фреймворках.

👉 **Узнайте больше, посмотрите демо и сравните варианты Облако vs Самостоятельный хостинг на** **[https://escalated.dev](https://escalated.dev)**

**Не устанавливайте этот пакет напрямую.** Начните с бэкенд-пакета для вашего фреймворка — он позаботится обо всём, включая подключение этих фронтенд-ресурсов.

## Возможности

- **Разделение тикетов** — Разделите ответ на новый самостоятельный тикет с сохранением контекста
- **Откладывание тикетов** — Откладывайте тикеты с предустановками (1ч, 4ч, завтра, следующая неделя) и автоматическим пробуждением
- **Сохранённые представления / пользовательские очереди** — Сохраняйте, именуйте и делитесь предустановками фильтров как многоразовыми представлениями тикетов
- **Встраиваемый виджет поддержки** — Готовый виджет `<script>` с поиском по базе знаний, формой тикета и проверкой статуса
- **Обновления в реальном времени** — Поддержка WebSocket (Pusher/Reverb/Soketi) с автоматическим откатом на поллинг
- **Переключатель базы знаний** — Включайте или отключайте публичную базу знаний в настройках администратора
- **CI: ESLint + Prettier** — Автоматическое применение стиля кода при каждом pull request

## Начало работы

Выберите ваш фреймворк:

| Фреймворк | Репозиторий | Установка |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Скачать escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | См. [настройка pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Каждый бэкенд-репозиторий содержит полные инструкции по настройке — команда установки, миграции, конфигурация и интеграция фронтенда.

## Tailwind CSS

Компоненты Escalated используют классы Tailwind CSS. Вы **должны** добавить этот пакет в конфигурацию `content` Tailwind, чтобы его классы не были удалены:

```js
// tailwind.config.js
export default {
    content: [
        // ... ваши существующие пути
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Без этого интерфейс Escalated будет отрендерен, но стили, такие как фоны кнопок и цвета бейджей, будут отсутствовать.

## Темы

Escalated по умолчанию рендерится внутри автономного макета. Чтобы интегрировать его в систему дизайна вашего приложения, используйте `EscalatedPlugin`:

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

### Интеграция макета

Передайте компонент макета вашего приложения, и все страницы Escalated автоматически будут рендериться внутри него. Компонент макета должен принимать слот `#header` и слот по умолчанию:

```vue
<!-- Ваш макет должен поддерживать эти слоты -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Когда макет не предоставлен, Escalated использует свою встроенную навигационную панель.

### Пользовательские CSS-свойства

Опция `theme` устанавливает пользовательские CSS-свойства, на которые вы можете ссылаться в своих стилях:

| Свойство | По умолчанию | Описание |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Основной цвет действия |
| `--esc-primary-hover` | автозатемнение | Основной цвет при наведении |
| `--esc-radius` | `0.5rem` | Радиус границы для полей ввода и кнопок |
| `--esc-radius-lg` | автомасштабирование | Радиус границы для карточек и панелей |
| `--esc-font-family` | наследуется | Переопределение семейства шрифтов |

### Примеры для фреймворков

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

## Что в этом репозитории

Все компоненты Vue 3 + Inertia.js, которые обеспечивают работу интерфейса Escalated. Они идентичны для Laravel, Rails, Django и AdonisJS — бэкенд-фреймворк рендерит их через Inertia.

## 📸 Скриншоты

> Скриншоты автоматически генерируются из Storybook через рабочий процесс [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Панель администратора (Тёмная)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Панель администратора Escalated — тёмный режим с боковой навигацией, KPI-карточками, статистикой и списком тикетов" width="800" />
</p>

<p align="center">
  <strong>Панель администратора (Светлая)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Панель администратора Escalated — светлый режим с боковой навигацией, KPI-карточками, статистикой и списком тикетов" width="800" />
</p>

<p align="center">
  <strong>Очередь тикетов</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Очередь тикетов Escalated — список тикетов агента с фильтрами, поиском, массовыми действиями и индикаторами SLA" width="800" />
</p>

<p align="center">
  <strong>Панель агента</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Панель агента Escalated — верхняя навигация, статистика и очередь назначенных тикетов" width="800" />
</p>

<p align="center">
  <strong>Детальный просмотр тикета</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Детальный просмотр тикета Escalated — ветка разговора, редактор ответа и боковая панель тикета с таймером SLA" width="800" />
</p>

### Страницы

**Клиентский портал** — Самообслуживание тикетов
- `pages/Customer/Index.vue` — Список тикетов с фильтрами статуса и поиском
- `pages/Customer/Create.vue` — Форма нового тикета с вложениями файлов
- `pages/Customer/Show.vue` — Детали тикета с веткой ответов

**Панель агента** — Очередь тикетов и рабочие процессы
- `pages/Agent/Dashboard.vue` — Обзор статистики и последних тикетов
- `pages/Agent/TicketIndex.vue` — Фильтруемая очередь тикетов
- `pages/Agent/TicketShow.vue` — Полный просмотр тикета с боковой панелью, внутренними заметками, шаблонами ответов

**Панель администратора** — Конфигурация системы
- `pages/Admin/Reports.vue` — Аналитическая панель
- `pages/Admin/Departments/` — Управление отделами (CRUD)
- `pages/Admin/SlaPolicies/` — Управление политиками SLA
- `pages/Admin/EscalationRules/` — Конструктор правил эскалации
- `pages/Admin/Tags/` — Управление тегами
- `pages/Admin/CannedResponses/` — Шаблоны готовых ответов

### Общие компоненты

Переиспользуемые строительные блоки, используемые на страницах выше.

| Компонент | Описание |
|-----------|-------------|
| `StatusBadge` | Цветной бейдж для статуса тикета |
| `PriorityBadge` | Цветной бейдж для приоритета тикета |
| `TicketList` | Пагинированная таблица тикетов |
| `ReplyThread` | Хронологическое отображение ответов |
| `ReplyComposer` | Редактор ответа/заметки с загрузкой файлов и вставкой шаблонных ответов |
| `ActivityTimeline` | Журнал аудита событий тикета |
| `SlaTimer` | Обратный отсчёт SLA с состояниями нарушения/предупреждения |
| `TicketFilters` | Панель фильтров статуса, приоритета, агента, отдела |
| `TicketSidebar` | Боковая панель деталей тикета (статус, SLA, теги, активность) |
| `AssigneeSelect` | Выпадающий список назначения агента |
| `TagSelect` | Множественный выбор тегов |
| `FileDropzone` | Загрузка файлов перетаскиванием |
| `AttachmentList` | Отображение вложений с ссылками для скачивания |
| `StatsCard` | Карточка метрик с меткой, значением и трендом |
| `EscalatedLayout` | Макет верхнего уровня с навигацией (поддерживает внедрение хост-макета) |
| `BulkActionBar` | Панель инструментов для массовых операций над выбранными тикетами |
| `QuickFilters` | Фильтр-чипы в один клик (Мои тикеты, Неназначенные, Срочные, SLA нарушен) |
| `MacroDropdown` | Выпадающий список для применения многошаговых макросов к тикету |
| `FollowButton` | Кнопка переключения для подписки/отписки от тикета |
| `SatisfactionRating` | Ввод оценки CSAT от 1 до 5 звёзд с необязательным комментарием |
| `KeyboardShortcutHelp` | Модальное окно со всеми доступными горячими клавишами |
| `PinnedNotes` | Отображение закреплённых внутренних заметок вверху ветки |
| `PresenceIndicator` | Индикатор реального времени, показывающий кто просматривает тикет |

### Composables

| Composable | Описание |
|------------|-------------|
| `useKeyboardShortcuts` | Регистрирует и управляет горячими клавишами для действий с тикетами |

### Плагин

| Экспорт | Описание |
|--------|-------------|
| `EscalatedPlugin` | Vue-плагин для внедрения макета и CSS-тем |

## Разработка плагинов

Escalated поддерживает фреймворк-независимые плагины, созданные с помощью [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Плагины пишутся один раз на TypeScript и работают на всех бэкендах Escalated.

### Как работает система плагинов фронтенда

Фронтенд использует `defineEscalatedPlugin()` для регистрации компонентов Vue — пользовательских страниц администратора, виджетов боковой панели тикетов или панелей дашборда — которые автоматически монтируются, когда плагин активен.

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

### Как он подключается к бэкенду

Бэкенд использует `definePlugin()` из [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) для обработки бизнес-логики TypeScript — подписка на хуки жизненного цикла тикетов, предоставление API-эндпоинтов и сохранение данных. Фронтенд и бэкенд входные точки работают вместе как единый npm-пакет.

```typescript
// бэкенд входная точка (index.ts)
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

### Быстрый пример: обе точки входа

Опубликованный пакет плагина обычно экспортирует оба:

```
my-plugin/
  index.ts          ← бэкенд: definePlugin() для логики TypeScript
  frontend.ts       ← фронтенд: defineEscalatedPlugin() для компонентов Vue
```

Бэкенд-фреймворк (Laravel, Rails, Django, AdonisJS) загружает `index.ts` через [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). Vue-приложение импортирует `frontend.ts` и регистрирует его через `app.use()`.

### Установка плагинов

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Ресурсы

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript SDK для создания плагинов
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Хост выполнения для плагинов
- [Руководство по разработке плагинов](https://github.com/escalated-dev/escalated-docs) — Полная документация

## Для мейнтейнеров пакетов

Если вы создаёте новую бэкенд-интеграцию, этот пакет доступен на npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Импорт плагина
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Импорт отдельных компонентов
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Или ссылка на страницы напрямую для разрешения Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer-зависимости: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Экосистема

Это общий фронтенд для системы тикетов поддержки Escalated. Бэкенд-пакеты доступны для каждого основного фреймворка:

- **[Escalated для Laravel](https://github.com/escalated-dev/escalated-laravel)** — Пакет Laravel Composer
- **[Escalated для Rails](https://github.com/escalated-dev/escalated-rails)** — Движок Ruby on Rails
- **[Escalated для Django](https://github.com/escalated-dev/escalated-django)** — Переиспользуемое приложение Django
- **[Escalated для AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Пакет AdonisJS v6
- **[Escalated для Filament](https://github.com/escalated-dev/escalated-filament)** — Плагин панели администратора Filament v3
- **[Общий фронтенд](https://github.com/escalated-dev/escalated)** — Компоненты UI Vue 3 + Inertia.js (вы здесь)

## Лицензия

MIT
