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
  <b>Português (BR)</b> •
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

Escalated e um sistema de tickets de suporte incorporavel com rastreamento de SLA, regras de escalonamento, fluxos de trabalho de agentes e portal do cliente. Este repositorio contem todos os assets de frontend compartilhados (Vue 3 + Inertia.js) usados em todos os frameworks de backend suportados.

👉 **Saiba mais, veja demos e compare as opcoes Cloud vs Auto-hospedado em** **[https://escalated.dev](https://escalated.dev)**

**Nao instale este pacote diretamente.** Comece com o pacote de backend para seu framework — ele cuida de tudo, incluindo a incorporacao destes assets de frontend.

## Recursos

- **Divisao de tickets** — Divida uma resposta em um novo ticket independente preservando o contexto
- **Adiamento de tickets** — Adie tickets com predefinicoes (1h, 4h, amanha, proxima semana) e despertar automatico
- **Visualizacoes salvas / filas personalizadas** — Salve, nomeie e compartilhe predefinicoes de filtros como visualizacoes de tickets reutilizaveis
- **Widget de suporte incorporavel** — Widget `<script>` pronto para uso com busca na KB, formulario de ticket e verificacao de status
- **Atualizacoes em tempo real** — Suporte a WebSocket (Pusher/Reverb/Soketi) com fallback de polling automatico
- **Alternancia da base de conhecimento** — Ative ou desative a base de conhecimento publica nas configuracoes de administrador
- **CI: ESLint + Prettier** — Aplicacao automatica de estilo de codigo em cada pull request

## Comecando

Escolha seu framework:

| Framework | Repositorio | Instalacao |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [Baixar escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Veja [configuracao do pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Cada repositorio de backend tem instrucoes completas de configuracao — comando de instalacao, migracoes, configuracao e integracao de frontend.

## Tailwind CSS

Os componentes do Escalated usam classes Tailwind CSS. Voce **deve** adicionar este pacote a configuracao `content` do Tailwind para que suas classes nao sejam purgadas:

```js
// tailwind.config.js
export default {
    content: [
        // ... seus caminhos existentes
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Sem isso, a interface do Escalated sera renderizada, mas estilos como fundos de botoes e cores de badges estarao ausentes.

## Temas

O Escalated renderiza dentro de um layout autonomo por padrao. Para integra-lo ao sistema de design do seu aplicativo, use o `EscalatedPlugin`:

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

### Integracao de Layout

Passe o componente de layout do seu aplicativo e todas as paginas do Escalated serao renderizadas dentro dele automaticamente. O componente de layout deve aceitar um slot `#header` e um slot padrao:

```vue
<!-- Seu layout deve suportar estes slots -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Quando nenhum layout e fornecido, o Escalated usa sua propria barra de navegacao embutida.

### Propriedades CSS Personalizadas

A opcao `theme` define propriedades CSS personalizadas que voce pode referenciar em seus proprios estilos:

| Propriedade | Padrao | Descricao |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Cor de acao primaria |
| `--esc-primary-hover` | escurecimento automatico | Cor de hover primaria |
| `--esc-radius` | `0.5rem` | Raio de borda para campos e botoes |
| `--esc-radius-lg` | escala automatica | Raio de borda para cards e paineis |
| `--esc-font-family` | herdado | Substituicao da familia de fontes |

### Exemplos por Framework

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

## O Que Ha Neste Repositorio

Todos os componentes Vue 3 + Inertia.js que alimentam a interface do Escalated. Eles sao identicos no Laravel, Rails, Django e AdonisJS — o framework de backend os renderiza via Inertia.

## 📸 Capturas de Tela

> As capturas de tela sao geradas automaticamente do Storybook pelo workflow [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>Painel de Administracao (Escuro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Painel de administracao do Escalated — modo escuro com navegacao lateral, cards KPI, estatisticas e lista de tickets" width="800" />
</p>

<p align="center">
  <strong>Painel de Administracao (Claro)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Painel de administracao do Escalated — modo claro com navegacao lateral, cards KPI, estatisticas e lista de tickets" width="800" />
</p>

<p align="center">
  <strong>Fila de Tickets</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Fila de tickets do Escalated — lista de tickets do agente com filtros, busca, acoes em massa e indicadores SLA" width="800" />
</p>

<p align="center">
  <strong>Painel do Agente</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Painel do agente do Escalated — navegacao superior, estatisticas e fila de tickets atribuidos" width="800" />
</p>

<p align="center">
  <strong>Visualizacao Detalhada do Ticket</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Visualizacao detalhada do ticket do Escalated — thread de conversa, editor de resposta e barra lateral do ticket com temporizador SLA" width="800" />
</p>

### Paginas

**Portal do Cliente** — Gerenciamento de tickets por autoatendimento
- `pages/Customer/Index.vue` — Lista de tickets com filtros de status e busca
- `pages/Customer/Create.vue` — Formulario de novo ticket com anexos de arquivos
- `pages/Customer/Show.vue` — Detalhe do ticket com thread de respostas

**Dashboard do Agente** — Fila de tickets e fluxos de trabalho
- `pages/Agent/Dashboard.vue` — Visao geral de estatisticas e tickets recentes
- `pages/Agent/TicketIndex.vue` — Fila de tickets filtravel
- `pages/Agent/TicketShow.vue` — Visualizacao completa do ticket com barra lateral, notas internas, respostas prontas

**Painel de Administracao** — Configuracao do sistema
- `pages/Admin/Reports.vue` — Dashboard analitico
- `pages/Admin/Departments/` — Gerenciamento de departamentos (CRUD)
- `pages/Admin/SlaPolicies/` — Gerenciamento de politicas SLA
- `pages/Admin/EscalationRules/` — Construtor de regras de escalonamento
- `pages/Admin/Tags/` — Gerenciamento de tags
- `pages/Admin/CannedResponses/` — Modelos de respostas prontas

### Componentes Compartilhados

Blocos de construcao reutilizaveis usados nas paginas acima.

| Componente | Descricao |
|-----------|-------------|
| `StatusBadge` | Badge colorido para status do ticket |
| `PriorityBadge` | Badge colorido para prioridade do ticket |
| `TicketList` | Tabela de tickets paginada |
| `ReplyThread` | Exibicao cronologica de respostas |
| `ReplyComposer` | Editor de resposta/nota com upload de arquivos e insercao de respostas prontas |
| `ActivityTimeline` | Log de auditoria de eventos do ticket |
| `SlaTimer` | Contagem regressiva SLA com estados de violacao/aviso |
| `TicketFilters` | Barra de filtros de status, prioridade, agente, departamento |
| `TicketSidebar` | Barra lateral de detalhe do ticket (status, SLA, tags, atividade) |
| `AssigneeSelect` | Dropdown de atribuicao de agente |
| `TagSelect` | Seletor de tags com selecao multipla |
| `FileDropzone` | Upload de arquivos arrastar e soltar |
| `AttachmentList` | Exibicao de anexos de arquivos com links de download |
| `StatsCard` | Card de metricas com rotulo, valor e tendencia |
| `EscalatedLayout` | Layout de nivel superior com navegacao (suporta injecao de layout do host) |
| `BulkActionBar` | Barra de ferramentas para operacoes em massa em tickets selecionados |
| `QuickFilters` | Chips de filtro com um clique (Meus Tickets, Nao Atribuidos, Urgente, SLA Violado) |
| `MacroDropdown` | Dropdown para aplicar macros de multiplas etapas em um ticket |
| `FollowButton` | Botao de alternancia para seguir/deixar de seguir um ticket |
| `SatisfactionRating` | Entrada de avaliacao CSAT de 1-5 estrelas com comentario opcional |
| `KeyboardShortcutHelp` | Sobreposicao modal mostrando todos os atalhos de teclado disponiveis |
| `PinnedNotes` | Exibicao de notas internas fixadas no topo do thread |
| `PresenceIndicator` | Indicador em tempo real mostrando quem esta visualizando um ticket |

### Composables

| Composable | Descricao |
|------------|-------------|
| `useKeyboardShortcuts` | Registra e gerencia atalhos de teclado para acoes em tickets |

### Plugin

| Exportacao | Descricao |
|--------|-------------|
| `EscalatedPlugin` | Plugin Vue para injecao de layout e temas CSS |

## Desenvolvimento de Plugins

O Escalated suporta plugins independentes de framework construidos com o [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). Os plugins sao escritos uma vez em TypeScript e funcionam em todos os backends do Escalated.

### Como Funciona o Sistema de Plugins do Frontend

O frontend usa `defineEscalatedPlugin()` para registrar componentes Vue — paginas de administracao personalizadas, widgets da barra lateral de tickets ou paineis de dashboard — que sao montados automaticamente quando o plugin esta ativo.

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

### Como se Conecta ao Backend

O backend usa `definePlugin()` do [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) para lidar com logica de negocios TypeScript — assinar hooks do ciclo de vida de tickets, expor endpoints de API e persistir dados. As entradas de frontend e backend trabalham juntas como um unico pacote npm.

```typescript
// entrada do backend (index.ts)
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

### Exemplo Rapido: Ambos Pontos de Entrada

Um pacote de plugin publicado normalmente exporta ambos:

```
my-plugin/
  index.ts          ← backend: definePlugin() para logica TypeScript
  frontend.ts       ← frontend: defineEscalatedPlugin() para componentes Vue
```

O framework de backend (Laravel, Rails, Django, AdonisJS) carrega `index.ts` via [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). O app Vue importa `frontend.ts` e o registra com `app.use()`.

### Instalando Plugins

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Recursos

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — SDK TypeScript para construir plugins
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Host de runtime para plugins
- [Guia de Desenvolvimento de Plugins](https://github.com/escalated-dev/escalated-docs) — Documentacao completa

## Para Mantenedores de Pacotes

Se voce esta construindo uma nova integracao de backend, este pacote esta disponivel no npm:

```bash
npm install @escalated-dev/escalated
```

```js
// Importar o plugin
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Importar componentes individuais
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Ou referenciar paginas diretamente para resolucao do Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Dependencias peer: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ecossistema

Este e o frontend compartilhado para o sistema de tickets de suporte Escalated. Pacotes de backend disponiveis para cada framework principal:

- **[Escalated para Laravel](https://github.com/escalated-dev/escalated-laravel)** — Pacote Laravel Composer
- **[Escalated para Rails](https://github.com/escalated-dev/escalated-rails)** — Engine Ruby on Rails
- **[Escalated para Django](https://github.com/escalated-dev/escalated-django)** — App Django reutilizavel
- **[Escalated para AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — Pacote AdonisJS v6
- **[Escalated para Filament](https://github.com/escalated-dev/escalated-filament)** — Plugin do painel de administracao Filament v3
- **[Frontend Compartilhado](https://github.com/escalated-dev/escalated)** — Componentes UI Vue 3 + Inertia.js (voce esta aqui)

## Licenca

MIT
