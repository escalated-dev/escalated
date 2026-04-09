<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <b>Español</b> •
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

Escalated es un sistema de tickets de soporte integrable con seguimiento de SLA, reglas de escalamiento, flujos de trabajo para agentes y un portal de clientes. Este repositorio contiene todos los recursos frontend compartidos (Vue 3 + Inertia.js) utilizados en todos los frameworks backend soportados.

👉 **Aprenda más, vea demos y compare las opciones de Nube vs Auto-hospedado en** **[https://escalated.dev](https://escalated.dev)**

**No instale este paquete directamente.** Comience con el paquete backend para su framework — se encarga de todo, incluyendo la incorporación de estos recursos frontend.

## Características

- **División de tickets** — Divida una respuesta en un nuevo ticket independiente preservando el contexto
- **Posponer tickets** — Posponga tickets con preajustes (1h, 4h, mañana, próxima semana) y activación automática
- **Vistas guardadas / colas personalizadas** — Guarde, nombre y comparta preajustes de filtros como vistas de tickets reutilizables
- **Widget de soporte integrable** — Widget `<script>` listo para usar con búsqueda en KB, formulario de tickets y verificación de estado
- **Actualizaciones en tiempo real** — Soporte WebSocket (Pusher/Reverb/Soketi) con respaldo de sondeo automático
- **Interruptor de base de conocimiento** — Active o desactive la base de conocimiento pública desde la configuración de administrador
- **CI: ESLint + Prettier** — Aplicación automática de estilo de código en cada pull request

## Primeros Pasos

Elija su framework:

| Framework | Repositorio | Instalación |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Descargar escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Ver [configuración de pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Cada repositorio backend tiene instrucciones de configuración completas — comando de instalación, migraciones, configuración e integración frontend.

## Tailwind CSS

Los componentes de Escalated usan clases de Tailwind CSS. **Debe** agregar este paquete a la configuración `content` de Tailwind para que sus clases no sean purgadas:

```js
// tailwind.config.js
export default {
    content: [
        // ... sus rutas existentes
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Sin esto, la interfaz de Escalated se renderizará pero los estilos como fondos de botones y colores de insignias estarán ausentes.

## Personalización

Escalated se renderiza dentro de un layout independiente por defecto. Para integrarlo en el sistema de diseño de su aplicación, use el `EscalatedPlugin`:

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

### Integración de Layout

Pase el componente de layout de su aplicación y todas las páginas de Escalated se renderizarán dentro de él automáticamente. El componente de layout debe aceptar un slot `#header` y un slot predeterminado:

```vue
<!-- Su layout debe soportar estos slots -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Cuando no se proporciona un layout, Escalated usa su propia barra de navegación integrada.

### Propiedades CSS Personalizadas

La opción `theme` establece propiedades CSS personalizadas que puede referenciar en sus propios estilos:

| Propiedad | Predeterminado | Descripción |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Color de acción primaria |
| `--esc-primary-hover` | oscurecido automáticamente | Color primario al pasar el cursor |
| `--esc-radius` | `0.5rem` | Radio de borde para entradas y botones |
| `--esc-radius-lg` | escalado automáticamente | Radio de borde para tarjetas y paneles |
| `--esc-font-family` | heredado | Sobrescritura de familia de fuentes |

### Ejemplos por Framework

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

## Qué Hay en Este Repositorio

Todos los componentes Vue 3 + Inertia.js que impulsan la interfaz de Escalated. Estos son idénticos en Laravel, Rails, Django y AdonisJS — el framework backend los renderiza a través de Inertia.

## 📸 Capturas de Pantalla

> Las capturas de pantalla se generan automáticamente desde Storybook a través del flujo de trabajo [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Panel de Administración (Oscuro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Panel de administración de Escalated — modo oscuro con navegación lateral, tarjetas KPI, estadísticas y lista de tickets" width="800" />
</p>

<p align="center">
  <strong>Panel de Administración (Claro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Panel de administración de Escalated — modo claro con navegación lateral, tarjetas KPI, estadísticas y lista de tickets" width="800" />
</p>

<p align="center">
  <strong>Cola de Tickets</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Cola de tickets de Escalated — lista de tickets del agente con filtros, búsqueda, acciones masivas e indicadores SLA" width="800" />
</p>

<p align="center">
  <strong>Panel del Agente</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Panel del agente de Escalated — navegación superior, estadísticas y cola de tickets asignados" width="800" />
</p>

<p align="center">
  <strong>Vista de Detalle del Ticket</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Vista de detalle del ticket de Escalated — hilo de conversación, editor de respuesta y barra lateral del ticket con temporizador SLA" width="800" />
</p>

### Páginas

**Portal del Cliente** — Gestión de tickets de autoservicio
- `pages/Customer/Index.vue` — Lista de tickets con filtros de estado y búsqueda
- `pages/Customer/Create.vue` — Formulario de nuevo ticket con archivos adjuntos
- `pages/Customer/Show.vue` — Detalle del ticket con hilo de respuestas

**Panel del Agente** — Cola de tickets y flujos de trabajo
- `pages/Agent/Dashboard.vue` — Resumen de estadísticas y tickets recientes
- `pages/Agent/TicketIndex.vue` — Cola de tickets filtrable
- `pages/Agent/TicketShow.vue` — Vista completa del ticket con barra lateral, notas internas, respuestas predefinidas

**Panel de Administración** — Configuración del sistema
- `pages/Admin/Reports.vue` — Panel de análisis
- `pages/Admin/Departments/` — Gestión de departamentos (CRUD)
- `pages/Admin/SlaPolicies/` — Gestión de políticas SLA
- `pages/Admin/EscalationRules/` — Constructor de reglas de escalamiento
- `pages/Admin/Tags/` — Gestión de etiquetas
- `pages/Admin/CannedResponses/` — Plantillas de respuestas predefinidas

### Componentes Compartidos

Bloques de construcción reutilizables utilizados en las páginas anteriores.

| Componente | Descripción |
|-----------|-------------|
| `StatusBadge` | Insignia de color para el estado del ticket |
| `PriorityBadge` | Insignia de color para la prioridad del ticket |
| `TicketList` | Tabla de tickets paginada |
| `ReplyThread` | Visualización cronológica de respuestas |
| `ReplyComposer` | Editor de respuesta/nota con carga de archivos e inserción de respuestas predefinidas |
| `ActivityTimeline` | Registro de auditoría de eventos del ticket |
| `SlaTimer` | Cuenta regresiva SLA con estados de violación/advertencia |
| `TicketFilters` | Barra de filtros de estado, prioridad, agente, departamento |
| `TicketSidebar` | Barra lateral de detalle del ticket (estado, SLA, etiquetas, actividad) |
| `AssigneeSelect` | Desplegable de asignación de agente |
| `TagSelect` | Selector de etiquetas de selección múltiple |
| `FileDropzone` | Carga de archivos con arrastrar y soltar |
| `AttachmentList` | Visualización de archivos adjuntos con enlaces de descarga |
| `StatsCard` | Tarjeta de métricas con etiqueta, valor y tendencia |
| `EscalatedLayout` | Layout de nivel superior con navegación (soporta inyección de layout del host) |
| `BulkActionBar` | Barra de herramientas para operaciones masivas en tickets seleccionados |
| `QuickFilters` | Chips de filtro de un clic (Mis Tickets, Sin Asignar, Urgente, SLA Violado) |
| `MacroDropdown` | Desplegable para aplicar macros de múltiples pasos a un ticket |
| `FollowButton` | Botón de alternancia para seguir/dejar de seguir un ticket |
| `SatisfactionRating` | Entrada de calificación CSAT de 1-5 estrellas con comentario opcional |
| `KeyboardShortcutHelp` | Superposición modal mostrando todos los atajos de teclado disponibles |
| `PinnedNotes` | Mostrar notas internas fijadas en la parte superior del hilo |
| `PresenceIndicator` | Indicador en tiempo real que muestra quién está viendo un ticket |

### Composables

| Composable | Descripción |
|------------|-------------|
| `useKeyboardShortcuts` | Registra y gestiona atajos de teclado para acciones de tickets |

### Plugin

| Exportación | Descripción |
|--------|-------------|
| `EscalatedPlugin` | Plugin Vue para inyección de layout y personalización CSS |

## Desarrollo de Plugins

Escalated soporta plugins agnósticos al framework construidos con el [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Los plugins se escriben una vez en TypeScript y funcionan en todos los backends de Escalated.

### Cómo Funciona el Sistema de Plugins del Frontend

El frontend usa `defineEscalatedPlugin()` para registrar componentes Vue — páginas de administración personalizadas, widgets de barra lateral de tickets o paneles de dashboard — que se montan automáticamente cuando el plugin está activo.

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

### Cómo se Conecta al Backend

El backend usa `definePlugin()` del [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) para manejar la lógica de negocios en TypeScript — suscribirse a hooks del ciclo de vida de tickets, exponer endpoints API y persistir datos. Las entradas del frontend y backend trabajan juntas como un solo paquete npm.

```typescript
// entrada del backend (index.ts)
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

### Ejemplo Rápido: Ambos Puntos de Entrada

Un paquete de plugin publicado típicamente exporta ambos:

```
my-plugin/
  index.ts          ← backend: definePlugin() para lógica TypeScript
  frontend.ts       ← frontend: defineEscalatedPlugin() para componentes Vue
```

El framework backend (Laravel, Rails, Django, AdonisJS) carga `index.ts` a través del [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). La aplicación Vue importa `frontend.ts` y lo registra con `app.use()`.

### Instalación de Plugins

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Recursos

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — SDK TypeScript para construir plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Host de tiempo de ejecución para plugins
- [Guía de Desarrollo de Plugins](https://github.com/escalated-dev/escalated-docs) — Documentación completa

## Para Mantenedores de Paquetes

Si está construyendo una nueva integración backend, este paquete está disponible en npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Importar el plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importar componentes individuales
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// O referenciar páginas directamente para la resolución de Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Dependencias peer: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecosistema

Este es el frontend compartido para el sistema de tickets de soporte Escalated. Paquetes backend disponibles para cada framework principal:

- **[Escalated para Laravel](https://github.com/escalated-dev/escalated-laravel)** — Paquete Laravel Composer
- **[Escalated para Rails](https://github.com/escalated-dev/escalated-rails)** — Motor Ruby on Rails
- **[Escalated para Django](https://github.com/escalated-dev/escalated-django)** — Aplicación reutilizable Django
- **[Escalated para AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Paquete AdonisJS v6
- **[Escalated para Filament](https://github.com/escalated-dev/escalated-filament)** — Plugin de panel de administración Filament v3
- **[Frontend Compartido](https://github.com/escalated-dev/escalated)** — Componentes UI Vue 3 + Inertia.js (usted está aquí)

## Licencia

MIT
