<p align="center">
  <a href="README.ar.md">العربية</a> •
  <a href="README.de.md">Deutsch</a> •
  <a href="../../README.md">English</a> •
  <a href="README.es.md">Español</a> •
  <a href="README.fr.md">Français</a> •
  <a href="README.it.md">Italiano</a> •
  <a href="README.ja.md">日本語</a> •
  <b>한국어</b> •
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

Escalated는 SLA 추적, 에스컬레이션 규칙, 상담원 워크플로우, 고객 포털을 갖춘 임베드 가능한 지원 티켓 시스템입니다. 이 저장소에는 지원되는 모든 백엔드 프레임워크에서 사용되는 공유 프론트엔드 에셋(Vue 3 + Inertia.js)이 포함되어 있습니다.

👉 **자세히 알아보기, 데모 보기, 클라우드 vs 셀프 호스팅 옵션 비교:** **[https://escalated.dev](https://escalated.dev)**

**이 패키지를 직접 설치하지 마세요.** 사용하는 프레임워크의 백엔드 패키지부터 시작하세요 — 프론트엔드 에셋 가져오기를 포함하여 모든 것을 처리합니다.

## 기능

- **티켓 분할** — 컨텍스트를 유지하면서 답변을 새로운 독립 티켓으로 분할
- **티켓 스누즈** — 프리셋(1시간, 4시간, 내일, 다음 주)으로 티켓을 스누즈하고 자동 웨이크
- **저장된 뷰 / 사용자 정의 큐** — 필터 프리셋을 재사용 가능한 티켓 뷰로 저장, 이름 지정, 공유
- **임베드 가능한 지원 위젯** — KB 검색, 티켓 양식, 상태 확인이 포함된 드롭인 `<script>` 위젯
- **실시간 업데이트** — WebSocket 지원(Pusher/Reverb/Soketi)과 자동 폴링 폴백
- **지식 베이스 토글** — 관리자 설정에서 공개 지식 베이스 활성화/비활성화
- **CI: ESLint + Prettier** — 모든 풀 리퀘스트에서 코드 스타일 자동 적용

## 시작하기

프레임워크를 선택하세요:

| 프레임워크 | 저장소 | 설치 |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [escalated.zip 다운로드](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | [pubspec.yaml 설정](https://github.com/escalated-dev/escalated-flutter#quick-start) 참조 |

각 백엔드 저장소에는 설치 명령, 마이그레이션, 설정, 프론트엔드 통합을 포함한 전체 설정 안내가 있습니다.

## Tailwind CSS

Escalated 컴포넌트는 Tailwind CSS 클래스를 사용합니다. 클래스가 퍼지되지 않도록 이 패키지를 Tailwind `content` 설정에 추가**해야 합니다**:

```js
// tailwind.config.js
export default {
    content: [
        // ... 기존 경로
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

이것 없이는 Escalated UI가 렌더링되지만 버튼 배경색이나 배지 색상 같은 스타일이 누락됩니다.

## 테마 설정

Escalated는 기본적으로 독립 레이아웃 내에서 렌더링됩니다. 앱의 디자인 시스템에 통합하려면 `EscalatedPlugin`을 사용하세요:

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

### 레이아웃 통합

앱의 레이아웃 컴포넌트를 전달하면 모든 Escalated 페이지가 자동으로 그 안에서 렌더링됩니다. 레이아웃 컴포넌트는 `#header` 슬롯과 기본 슬롯을 허용해야 합니다:

```vue
<!-- 레이아웃은 이 슬롯들을 지원해야 합니다 -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

레이아웃이 제공되지 않으면 Escalated는 자체 내장 네비게이션 바를 사용합니다.

### CSS 사용자 정의 속성

`theme` 옵션은 자체 스타일에서 참조할 수 있는 CSS 사용자 정의 속성을 설정합니다:

| 속성 | 기본값 | 설명 |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | 기본 액션 색상 |
| `--esc-primary-hover` | 자동 어둡게 | 기본 호버 색상 |
| `--esc-radius` | `0.5rem` | 입력 필드와 버튼의 테두리 반경 |
| `--esc-radius-lg` | 자동 스케일 | 카드와 패널의 테두리 반경 |
| `--esc-font-family` | 상속 | 글꼴 패밀리 오버라이드 |

### 프레임워크 예제

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

## 이 저장소의 내용

Escalated UI를 구동하는 모든 Vue 3 + Inertia.js 컴포넌트. Laravel, Rails, Django, AdonisJS에서 동일하며 — 백엔드 프레임워크가 Inertia를 통해 렌더링합니다.

## 📸 스크린샷

> 스크린샷은 [component-screenshots](.github/workflows/screenshots.yml) 워크플로우를 통해 Storybook에서 자동 생성됩니다.

<p align="center">
  <strong>관리자 패널 (다크)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Escalated 관리자 패널 — 사이드바 네비게이션, KPI 카드, 통계, 티켓 목록이 있는 다크 모드" width="800" />
</p>

<p align="center">
  <strong>관리자 패널 (라이트)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Escalated 관리자 패널 — 사이드바 네비게이션, KPI 카드, 통계, 티켓 목록이 있는 라이트 모드" width="800" />
</p>

<p align="center">
  <strong>티켓 큐</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Escalated 티켓 큐 — 필터, 검색, 일괄 작업, SLA 인디케이터가 있는 상담원 티켓 목록" width="800" />
</p>

<p align="center">
  <strong>상담원 패널</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Escalated 상담원 패널 — 상단 네비게이션, 통계, 할당된 티켓 큐" width="800" />
</p>

<p align="center">
  <strong>티켓 상세 보기</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Escalated 티켓 상세 보기 — 대화 스레드, 답장 작성기, SLA 타이머가 있는 티켓 사이드바" width="800" />
</p>

### 페이지

**고객 포털** — 셀프 서비스 티켓 관리
- `pages/Customer/Index.vue` — 상태 필터와 검색이 있는 티켓 목록
- `pages/Customer/Create.vue` — 파일 첨부가 가능한 새 티켓 양식
- `pages/Customer/Show.vue` — 답장 스레드가 있는 티켓 상세

**상담원 대시보드** — 티켓 큐와 워크플로우
- `pages/Agent/Dashboard.vue` — 통계 개요와 최근 티켓
- `pages/Agent/TicketIndex.vue` — 필터링 가능한 티켓 큐
- `pages/Agent/TicketShow.vue` — 사이드바, 내부 메모, 정형 응답이 있는 전체 티켓 보기

**관리자 패널** — 시스템 설정
- `pages/Admin/Reports.vue` — 분석 대시보드
- `pages/Admin/Departments/` — 부서 관리 (CRUD)
- `pages/Admin/SlaPolicies/` — SLA 정책 관리
- `pages/Admin/EscalationRules/` — 에스컬레이션 규칙 빌더
- `pages/Admin/Tags/` — 태그 관리
- `pages/Admin/CannedResponses/` — 정형 응답 템플릿

### 공유 컴포넌트

위 페이지에서 사용되는 재사용 가능한 빌딩 블록.

| 컴포넌트 | 설명 |
|-----------|-------------|
| `StatusBadge` | 티켓 상태용 컬러 배지 |
| `PriorityBadge` | 티켓 우선순위용 컬러 배지 |
| `TicketList` | 페이지네이션된 티켓 테이블 |
| `ReplyThread` | 시간순 답장 표시 |
| `ReplyComposer` | 파일 업로드와 정형 응답 삽입이 가능한 답장/메모 에디터 |
| `ActivityTimeline` | 티켓 이벤트 감사 로그 |
| `SlaTimer` | 위반/경고 상태가 있는 SLA 카운트다운 |
| `TicketFilters` | 상태, 우선순위, 상담원, 부서 필터 바 |
| `TicketSidebar` | 티켓 상세 사이드바 (상태, SLA, 태그, 활동) |
| `AssigneeSelect` | 상담원 할당 드롭다운 |
| `TagSelect` | 다중 선택 태그 피커 |
| `FileDropzone` | 드래그 앤 드롭 파일 업로드 |
| `AttachmentList` | 다운로드 링크가 있는 파일 첨부 표시 |
| `StatsCard` | 라벨, 값, 트렌드가 있는 메트릭 카드 |
| `EscalatedLayout` | 네비게이션이 있는 최상위 레이아웃 (호스트 레이아웃 인젝션 지원) |
| `BulkActionBar` | 선택한 티켓에 대한 일괄 작업 툴바 |
| `QuickFilters` | 원클릭 필터 칩 (내 티켓, 미할당, 긴급, SLA 위반) |
| `MacroDropdown` | 티켓에 다단계 매크로를 적용하는 드롭다운 |
| `FollowButton` | 티켓 팔로우/언팔로우 토글 버튼 |
| `SatisfactionRating` | 선택적 코멘트가 있는 1-5 별 CSAT 평가 입력 |
| `KeyboardShortcutHelp` | 사용 가능한 모든 키보드 단축키를 표시하는 모달 오버레이 |
| `PinnedNotes` | 스레드 상단에 고정된 내부 메모 표시 |
| `PresenceIndicator` | 티켓을 보고 있는 사람을 표시하는 실시간 인디케이터 |

### 컴포저블

| 컴포저블 | 설명 |
|------------|-------------|
| `useKeyboardShortcuts` | 티켓 작업용 키보드 단축키 등록 및 관리 |

### 플러그인

| 내보내기 | 설명 |
|--------|-------------|
| `EscalatedPlugin` | 레이아웃 인젝션과 CSS 테마 설정용 Vue 플러그인 |

## 플러그인 개발

Escalated는 [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk)로 구축된 프레임워크 비의존적 플러그인을 지원합니다. 플러그인은 TypeScript로 한 번 작성하면 모든 Escalated 백엔드에서 작동합니다.

### 프론트엔드 플러그인 시스템 작동 방식

프론트엔드는 `defineEscalatedPlugin()`을 사용하여 Vue 컴포넌트 — 사용자 정의 관리 페이지, 티켓 사이드바 위젯, 대시보드 패널 — 를 등록하고, 플러그인이 활성화되면 자동으로 마운트됩니다.

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

### 백엔드와의 연결 방식

백엔드는 [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk)의 `definePlugin()`을 사용하여 TypeScript 비즈니스 로직을 처리합니다 — 티켓 라이프사이클 훅 구독, API 엔드포인트 노출, 데이터 영속화. 프론트엔드와 백엔드 엔트리는 단일 npm 패키지로 함께 작동합니다.

```typescript
// 백엔드 엔트리 (index.ts)
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

### 빠른 예제: 두 진입점

게시된 플러그인 패키지는 일반적으로 둘 다 내보냅니다:

```
my-plugin/
  index.ts          ← 백엔드: TypeScript 로직용 definePlugin()
  frontend.ts       ← 프론트엔드: Vue 컴포넌트용 defineEscalatedPlugin()
```

백엔드 프레임워크(Laravel, Rails, Django, AdonisJS)는 [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime)을 통해 `index.ts`를 로드합니다. Vue 앱은 `frontend.ts`를 가져와 `app.use()`로 등록합니다.

### 플러그인 설치

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### 리소스

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — 플러그인 구축용 TypeScript SDK
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — 플러그인용 런타임 호스트
- [플러그인 개발 가이드](https://github.com/escalated-dev/escalated-docs) — 전체 문서

## 패키지 메인테이너를 위해

새로운 백엔드 통합을 구축하는 경우, 이 패키지는 npm에서 이용 가능합니다:

```bash
npm install @escalated-dev/escalated
```

```js
// 플러그인 가져오기
import { EscalatedPlugin } from '@escalated-dev/escalated'

// 개별 컴포넌트 가져오기
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// 또는 Inertia 해석을 위해 페이지를 직접 참조
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

피어 의존성: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## 에코시스템

이것은 Escalated 지원 티켓 시스템의 공유 프론트엔드입니다. 모든 주요 프레임워크용 백엔드 패키지가 제공됩니다:

- **[Escalated for Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composer 패키지
- **[Escalated for Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Rails 엔진
- **[Escalated for Django](https://github.com/escalated-dev/escalated-django)** — Django 재사용 가능 앱
- **[Escalated for AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6 패키지
- **[Escalated for Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3 관리 패널 플러그인
- **[공유 프론트엔드](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UI 컴포넌트 (현재 저장소)

## 라이선스

MIT
