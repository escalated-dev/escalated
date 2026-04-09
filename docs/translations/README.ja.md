<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <a href="README.it.md">Italiano</a> •
  <b>日本語</b> •
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

Escalatedは、SLAトラッキング、エスカレーションルール、エージェントワークフロー、カスタマーポータルを備えた組み込み可能なサポートチケットシステムです。このリポジトリには、サポートされているすべてのバックエンドフレームワークで使用される共有フロントエンドアセット（Vue 3 + Inertia.js）が含まれています。

👉 **詳細、デモ、クラウドvsセルフホストオプションの比較は** **[https://escalated.dev](https://escalated.dev)** **をご覧ください**

**このパッケージを直接インストールしないでください。** お使いのフレームワークのバックエンドパッケージから始めてください — フロントエンドアセットの取り込みを含め、すべてを処理します。

## 機能

- **チケット分割** — 返信をコンテキストを保持しながら新しい独立したチケットに分割
- **チケットスヌーズ** — プリセット（1時間、4時間、明日、来週）でチケットをスヌーズし、自動的にウェイク
- **保存済みビュー / カスタムキュー** — フィルタープリセットを再利用可能なチケットビューとして保存、命名、共有
- **組み込み可能なサポートウィジェット** — KB検索、チケットフォーム、ステータスチェック付きのドロップイン`<script>`ウィジェット
- **リアルタイム更新** — WebSocketサポート（Pusher/Reverb/Soketi）と自動ポーリングフォールバック
- **ナレッジベーストグル** — 管理設定から公開ナレッジベースを有効/無効に切り替え
- **CI: ESLint + Prettier** — すべてのプルリクエストでコードスタイルを自動適用

## はじめに

フレームワークを選択してください：

| フレームワーク | リポジトリ | インストール |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [escalated.zipをダウンロード](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | [pubspec.yamlセットアップ](https://github.com/escalated-dev/escalated-flutter#quick-start)を参照 |

各バックエンドリポジトリには、インストールコマンド、マイグレーション、設定、フロントエンド統合を含む完全なセットアップ手順があります。

## Tailwind CSS

EscalatedコンポーネントはTailwind CSSクラスを使用します。クラスがパージされないように、このパッケージをTailwindの`content`設定に追加する**必要があります**：

```js
// tailwind.config.js
export default {
    content: [
        // ... 既存のパス
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

これがないと、Escalated UIはレンダリングされますが、ボタンの背景やバッジの色などのスタイルが欠落します。

## テーマ設定

Escalatedはデフォルトでスタンドアロンレイアウト内にレンダリングされます。アプリのデザインシステムに統合するには、`EscalatedPlugin`を使用してください：

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

### レイアウト統合

アプリのレイアウトコンポーネントを渡すと、すべてのEscalatedページが自動的にその中にレンダリングされます。レイアウトコンポーネントは`#header`スロットとデフォルトスロットを受け入れる必要があります：

```vue
<!-- レイアウトはこれらのスロットをサポートする必要があります -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

レイアウトが提供されない場合、Escalatedは独自の組み込みナビゲーションバーを使用します。

### CSSカスタムプロパティ

`theme`オプションは、独自のスタイルで参照できるCSSカスタムプロパティを設定します：

| プロパティ | デフォルト | 説明 |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | プライマリアクションカラー |
| `--esc-primary-hover` | 自動的に暗く | プライマリホバーカラー |
| `--esc-radius` | `0.5rem` | 入力フィールドとボタンのボーダー半径 |
| `--esc-radius-lg` | 自動スケール | カードとパネルのボーダー半径 |
| `--esc-font-family` | 継承 | フォントファミリーのオーバーライド |

### フレームワーク別の例

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

## このリポジトリの内容

Escalated UIを動かすすべてのVue 3 + Inertia.jsコンポーネント。これらはLaravel、Rails、Django、AdonisJS間で同一です — バックエンドフレームワークがInertia経由でレンダリングします。

## 📸 スクリーンショット

> スクリーンショットは[component-screenshots](.github/workflows/screenshots.yml)ワークフローを通じてStorybookから自動生成されます。

<p align="center">
  <strong>管理パネル（ダーク）</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Escalated管理パネル — サイドバーナビゲーション、KPIカード、統計、チケットリスト付きダークモード" width="800" />
</p>

<p align="center">
  <strong>管理パネル（ライト）</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Escalated管理パネル — サイドバーナビゲーション、KPIカード、統計、チケットリスト付きライトモード" width="800" />
</p>

<p align="center">
  <strong>チケットキュー</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Escalatedチケットキュー — フィルター、検索、一括アクション、SLAインジケーター付きエージェントチケットリスト" width="800" />
</p>

<p align="center">
  <strong>エージェントパネル</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Escalatedエージェントパネル — トップナビゲーション、統計、割り当てチケットキュー" width="800" />
</p>

<p align="center">
  <strong>チケット詳細ビュー</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Escalatedチケット詳細ビュー — 会話スレッド、返信コンポーザー、SLAタイマー付きチケットサイドバー" width="800" />
</p>

### ページ

**カスタマーポータル** — セルフサービスチケット管理
- `pages/Customer/Index.vue` — ステータスフィルターと検索付きチケットリスト
- `pages/Customer/Create.vue` — ファイル添付付き新規チケットフォーム
- `pages/Customer/Show.vue` — 返信スレッド付きチケット詳細

**エージェントダッシュボード** — チケットキューとワークフロー
- `pages/Agent/Dashboard.vue` — 統計概要と最近のチケット
- `pages/Agent/TicketIndex.vue` — フィルタリング可能なチケットキュー
- `pages/Agent/TicketShow.vue` — サイドバー、内部メモ、定型応答付きフルチケットビュー

**管理パネル** — システム設定
- `pages/Admin/Reports.vue` — 分析ダッシュボード
- `pages/Admin/Departments/` — 部門管理（CRUD）
- `pages/Admin/SlaPolicies/` — SLAポリシー管理
- `pages/Admin/EscalationRules/` — エスカレーションルールビルダー
- `pages/Admin/Tags/` — タグ管理
- `pages/Admin/CannedResponses/` — 定型応答テンプレート

### 共有コンポーネント

上記のページで使用される再利用可能なビルディングブロック。

| コンポーネント | 説明 |
|-----------|-------------|
| `StatusBadge` | チケットステータスのカラーバッジ |
| `PriorityBadge` | チケット優先度のカラーバッジ |
| `TicketList` | ページネーション付きチケットテーブル |
| `ReplyThread` | 時系列の返信表示 |
| `ReplyComposer` | ファイルアップロードと定型応答挿入付き返信/メモエディター |
| `ActivityTimeline` | チケットイベントの監査ログ |
| `SlaTimer` | 違反/警告状態付きSLAカウントダウン |
| `TicketFilters` | ステータス、優先度、エージェント、部門のフィルターバー |
| `TicketSidebar` | チケット詳細サイドバー（ステータス、SLA、タグ、アクティビティ） |
| `AssigneeSelect` | エージェント割り当てドロップダウン |
| `TagSelect` | 複数選択タグピッカー |
| `FileDropzone` | ドラッグ&ドロップファイルアップロード |
| `AttachmentList` | ダウンロードリンク付きファイル添付表示 |
| `StatsCard` | ラベル、値、トレンド付きメトリクスカード |
| `EscalatedLayout` | ナビゲーション付きトップレベルレイアウト（ホストレイアウトインジェクション対応） |
| `BulkActionBar` | 選択したチケットの一括操作ツールバー |
| `QuickFilters` | ワンクリックフィルターチップ（マイチケット、未割り当て、緊急、SLA違反） |
| `MacroDropdown` | チケットにマルチステップマクロを適用するドロップダウン |
| `FollowButton` | チケットのフォロー/フォロー解除トグルボタン |
| `SatisfactionRating` | オプションコメント付き1-5星CSAT評価入力 |
| `KeyboardShortcutHelp` | 利用可能なすべてのキーボードショートカットを表示するモーダルオーバーレイ |
| `PinnedNotes` | スレッドの上部に固定された内部メモを表示 |
| `PresenceIndicator` | チケットを閲覧しているユーザーを表示するリアルタイムインジケーター |

### コンポーザブル

| コンポーザブル | 説明 |
|------------|-------------|
| `useKeyboardShortcuts` | チケットアクション用のキーボードショートカットを登録・管理 |

### プラグイン

| エクスポート | 説明 |
|--------|-------------|
| `EscalatedPlugin` | レイアウトインジェクションとCSSテーマ設定用のVueプラグイン |

## プラグイン開発

Escalatedは[Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk)で構築されたフレームワーク非依存のプラグインをサポートしています。プラグインはTypeScriptで一度書くだけで、すべてのEscalatedバックエンドで動作します。

### フロントエンドプラグインシステムの仕組み

フロントエンドは`defineEscalatedPlugin()`を使用してVueコンポーネント — カスタム管理ページ、チケットサイドバーウィジェット、ダッシュボードパネル — を登録し、プラグインがアクティブな時に自動的にマウントされます。

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

### バックエンドとの接続方法

バックエンドは[Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk)の`definePlugin()`を使用してTypeScriptビジネスロジックを処理します — チケットライフサイクルフックのサブスクライブ、APIエンドポイントの公開、データの永続化。フロントエンドとバックエンドのエントリーは単一のnpmパッケージとして連携します。

```typescript
// バックエンドエントリー (index.ts)
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

### クイック例：両方のエントリーポイント

公開されたプラグインパッケージは通常、両方をエクスポートします：

```
my-plugin/
  index.ts          ← バックエンド: TypeScriptロジック用のdefinePlugin()
  frontend.ts       ← フロントエンド: Vueコンポーネント用のdefineEscalatedPlugin()
```

バックエンドフレームワーク（Laravel、Rails、Django、AdonisJS）は[Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime)経由で`index.ts`をロードします。VueアプリはAは`frontend.ts`をインポートし、`app.use()`で登録します。

### プラグインのインストール

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### リソース

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — プラグイン構築用TypeScript SDK
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — プラグイン用ランタイムホスト
- [プラグイン開発ガイド](https://github.com/escalated-dev/escalated-docs) — 完全なドキュメント

## パッケージメンテナー向け

新しいバックエンド統合を構築している場合、このパッケージはnpmで利用可能です：

```bash
npm install @escalated-dev/escalated
```

```js
// プラグインのインポート
import { EscalatedPlugin } from '@escalated-dev/escalated'

// 個別コンポーネントのインポート
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// またはInertia解決用にページを直接参照
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

ピア依存関係: `vue` ^3.3.0、`@inertiajs/vue3` ^1.0.0 || ^2.0.0

## エコシステム

これはEscalatedサポートチケットシステムの共有フロントエンドです。すべての主要フレームワーク向けのバックエンドパッケージが利用可能です：

- **[Escalated for Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composerパッケージ
- **[Escalated for Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Railsエンジン
- **[Escalated for Django](https://github.com/escalated-dev/escalated-django)** — Django再利用可能アプリ
- **[Escalated for AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6パッケージ
- **[Escalated for Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3管理パネルプラグイン
- **[共有フロントエンド](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UIコンポーネント（現在のリポジトリ）

## ライセンス

MIT
