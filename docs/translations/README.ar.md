<p align="center">
  <b>العربية</b> •
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

Escalated هو نظام تذاكر دعم قابل للتضمين مع تتبع اتفاقيات مستوى الخدمة (SLA)، وقواعد التصعيد، وسير عمل الوكلاء، وبوابة العملاء. يحتوي هذا المستودع على جميع أصول الواجهة الأمامية المشتركة (Vue 3 + Inertia.js) المستخدمة عبر جميع أُطر العمل الخلفية المدعومة.

👉 **تعرف على المزيد، شاهد العروض التوضيحية، وقارن بين خيارات السحابة والاستضافة الذاتية على** **[https://escalated.dev](https://escalated.dev)**

**لا تقم بتثبيت هذه الحزمة مباشرة.** ابدأ بحزمة الواجهة الخلفية لإطار العمل الخاص بك — فهي تتولى كل شيء بما في ذلك سحب أصول الواجهة الأمامية هذه.

## الميزات

- **تقسيم التذاكر** — قسّم رداً إلى تذكرة مستقلة جديدة مع الحفاظ على السياق
- **تأجيل التذاكر** — أجّل التذاكر مع خيارات محددة مسبقاً (ساعة، 4 ساعات، غداً، الأسبوع القادم) وإيقاظ تلقائي
- **العروض المحفوظة / قوائم الانتظار المخصصة** — احفظ وسمّ وشارك إعدادات التصفية المسبقة كعروض تذاكر قابلة لإعادة الاستخدام
- **أداة دعم قابلة للتضمين** — أداة `<script>` جاهزة للإدراج مع بحث قاعدة المعرفة ونموذج التذاكر والتحقق من الحالة
- **تحديثات في الوقت الفعلي** — دعم WebSocket (Pusher/Reverb/Soketi) مع بديل الاستطلاع التلقائي
- **تبديل قاعدة المعرفة** — تفعيل أو تعطيل قاعدة المعرفة العامة من إعدادات المسؤول
- **CI: ESLint + Prettier** — فرض نمط الكود تلقائياً في كل طلب سحب

## ابدأ الآن

اختر إطار العمل الخاص بك:

| إطار العمل | المستودع | التثبيت |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [تحميل escalated.zip](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | انظر [إعداد pubspec.yaml](https://github.com/escalated-dev/escalated-flutter#quick-start) |

كل مستودع خلفي يحتوي على تعليمات إعداد كاملة — أمر التثبيت، الترحيلات، الإعدادات، وتكامل الواجهة الأمامية.

## Tailwind CSS

تستخدم مكونات Escalated فئات Tailwind CSS. **يجب** عليك إضافة هذه الحزمة إلى تكوين `content` الخاص بـ Tailwind حتى لا يتم حذف فئاتها:

```js
// tailwind.config.js
export default {
    content: [
        // ... المسارات الموجودة لديك
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

بدون هذا، ستُعرض واجهة Escalated ولكن الأنماط مثل خلفيات الأزرار وألوان الشارات ستكون مفقودة.

## التخصيص

يُعرض Escalated داخل تخطيط مستقل بشكل افتراضي. لدمجه في نظام التصميم الخاص بتطبيقك، استخدم `EscalatedPlugin`:

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

### تكامل التخطيط

مرر مكون تخطيط تطبيقك وستُعرض جميع صفحات Escalated بداخله تلقائياً. يجب أن يقبل مكون التخطيط فتحة `#header` وفتحة افتراضية:

```vue
<!-- يجب أن يدعم تخطيطك هذه الفتحات -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

عندما لا يتم تقديم تخطيط، يستخدم Escalated شريط التنقل المدمج الخاص به.

### خصائص CSS المخصصة

يعيّن خيار `theme` خصائص CSS مخصصة يمكنك الرجوع إليها في أنماطك الخاصة:

| الخاصية | الافتراضي | الوصف |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | لون الإجراء الأساسي |
| `--esc-primary-hover` | تعتيم تلقائي | لون التمرير الأساسي |
| `--esc-radius` | `0.5rem` | نصف قطر الحدود للمدخلات والأزرار |
| `--esc-radius-lg` | تحجيم تلقائي | نصف قطر الحدود للبطاقات واللوحات |
| `--esc-font-family` | وراثة | تجاوز عائلة الخط |

### أمثلة الأُطر

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

## ما في هذا المستودع

جميع مكونات Vue 3 + Inertia.js التي تشغّل واجهة Escalated. هذه متطابقة عبر Laravel وRails وDjango وAdonisJS — يعرضها إطار العمل الخلفي عبر Inertia.

## 📸 لقطات الشاشة

> يتم إنشاء لقطات الشاشة تلقائياً من Storybook عبر سير عمل [component-screenshots](.github/workflows/screenshots.yml).

<p align="center">
  <strong>لوحة المسؤول (داكن)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="لوحة مسؤول Escalated — الوضع الداكن مع التنقل الجانبي وبطاقات KPI والإحصائيات وقائمة التذاكر" width="800" />
</p>

<p align="center">
  <strong>لوحة المسؤول (فاتح)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="لوحة مسؤول Escalated — الوضع الفاتح مع التنقل الجانبي وبطاقات KPI والإحصائيات وقائمة التذاكر" width="800" />
</p>

<p align="center">
  <strong>قائمة التذاكر</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="قائمة تذاكر Escalated — قائمة تذاكر الوكيل مع المرشحات والبحث والإجراءات المجمعة ومؤشرات SLA" width="800" />
</p>

<p align="center">
  <strong>لوحة الوكيل</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="لوحة وكيل Escalated — التنقل العلوي والإحصائيات وقائمة التذاكر المعينة" width="800" />
</p>

<p align="center">
  <strong>عرض تفاصيل التذكرة</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="عرض تفاصيل تذكرة Escalated — سلسلة المحادثة ومحرر الرد والشريط الجانبي للتذكرة مع مؤقت SLA" width="800" />
</p>

### الصفحات

**بوابة العملاء** — إدارة التذاكر بالخدمة الذاتية
- `pages/Customer/Index.vue` — قائمة التذاكر مع مرشحات الحالة والبحث
- `pages/Customer/Create.vue` — نموذج تذكرة جديدة مع مرفقات الملفات
- `pages/Customer/Show.vue` — تفاصيل التذكرة مع سلسلة الردود

**لوحة الوكيل** — قائمة التذاكر وسير العمل
- `pages/Agent/Dashboard.vue` — نظرة عامة على الإحصائيات والتذاكر الأخيرة
- `pages/Agent/TicketIndex.vue` — قائمة تذاكر قابلة للتصفية
- `pages/Agent/TicketShow.vue` — عرض تذكرة كامل مع الشريط الجانبي والملاحظات الداخلية والردود الجاهزة

**لوحة المسؤول** — تكوين النظام
- `pages/Admin/Reports.vue` — لوحة التحليلات
- `pages/Admin/Departments/` — إدارة الأقسام (CRUD)
- `pages/Admin/SlaPolicies/` — إدارة سياسات SLA
- `pages/Admin/EscalationRules/` — منشئ قواعد التصعيد
- `pages/Admin/Tags/` — إدارة العلامات
- `pages/Admin/CannedResponses/` — قوالب الردود الجاهزة

### المكونات المشتركة

كتل بناء قابلة لإعادة الاستخدام تُستخدم عبر الصفحات أعلاه.

| المكون | الوصف |
|-----------|-------------|
| `StatusBadge` | شارة ملونة لحالة التذكرة |
| `PriorityBadge` | شارة ملونة لأولوية التذكرة |
| `TicketList` | جدول تذاكر مُرقّم |
| `ReplyThread` | عرض الردود بترتيب زمني |
| `ReplyComposer` | محرر الرد/الملاحظة مع رفع الملفات وإدراج الردود الجاهزة |
| `ActivityTimeline` | سجل تدقيق لأحداث التذكرة |
| `SlaTimer` | عد تنازلي SLA مع حالات الانتهاك/التحذير |
| `TicketFilters` | شريط تصفية الحالة والأولوية والوكيل والقسم |
| `TicketSidebar` | الشريط الجانبي لتفاصيل التذكرة (الحالة، SLA، العلامات، النشاط) |
| `AssigneeSelect` | قائمة منسدلة لتعيين الوكيل |
| `TagSelect` | منتقي علامات متعدد الاختيار |
| `FileDropzone` | رفع ملفات بالسحب والإفلات |
| `AttachmentList` | عرض مرفقات الملفات مع روابط التحميل |
| `StatsCard` | بطاقة مقاييس مع تسمية وقيمة واتجاه |
| `EscalatedLayout` | تخطيط المستوى الأعلى مع التنقل (يدعم حقن تخطيط المضيف) |
| `BulkActionBar` | شريط أدوات للعمليات المجمعة على التذاكر المحددة |
| `QuickFilters` | رقاقات تصفية بنقرة واحدة (تذاكري، غير معيّنة، عاجلة، SLA منتهكة) |
| `MacroDropdown` | قائمة منسدلة لتطبيق وحدات ماكرو متعددة الخطوات على تذكرة |
| `FollowButton` | زر تبديل لمتابعة/إلغاء متابعة تذكرة |
| `SatisfactionRating` | إدخال تقييم CSAT من 1-5 نجوم مع تعليق اختياري |
| `KeyboardShortcutHelp` | نافذة منبثقة تعرض جميع اختصارات لوحة المفاتيح المتاحة |
| `PinnedNotes` | عرض الملاحظات الداخلية المثبتة في أعلى السلسلة |
| `PresenceIndicator` | مؤشر فوري يعرض من يشاهد التذكرة |

### التركيبات (Composables)

| التركيب | الوصف |
|------------|-------------|
| `useKeyboardShortcuts` | يسجل ويدير اختصارات لوحة المفاتيح لإجراءات التذاكر |

### الإضافة

| التصدير | الوصف |
|--------|-------------|
| `EscalatedPlugin` | إضافة Vue لحقن التخطيط وتخصيص CSS |

## تطوير الإضافات

يدعم Escalated الإضافات المستقلة عن إطار العمل المبنية باستخدام [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk). تُكتب الإضافات مرة واحدة بـ TypeScript وتعمل عبر جميع واجهات Escalated الخلفية.

### كيف يعمل نظام إضافات الواجهة الأمامية

تستخدم الواجهة الأمامية `defineEscalatedPlugin()` لتسجيل مكونات Vue — صفحات مسؤول مخصصة أو أدوات الشريط الجانبي للتذاكر أو لوحات لوحة المعلومات — التي يتم تركيبها تلقائياً عندما تكون الإضافة نشطة.

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

### كيف تتصل بالواجهة الخلفية

تستخدم الواجهة الخلفية `definePlugin()` من [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) للتعامل مع منطق TypeScript للأعمال — الاشتراك في خطافات دورة حياة التذاكر وكشف نقاط نهاية API واستمرار البيانات. تعمل إدخالات الواجهة الأمامية والخلفية معاً كحزمة npm واحدة.

```typescript
// إدخال الواجهة الخلفية (index.ts)
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

### مثال سريع: كلا نقطتي الدخول

تصدر حزمة الإضافة المنشورة عادةً كليهما:

```
my-plugin/
  index.ts          ← الواجهة الخلفية: definePlugin() لمنطق TypeScript
  frontend.ts       ← الواجهة الأمامية: defineEscalatedPlugin() لمكونات Vue
```

يحمّل إطار العمل الخلفي (Laravel، Rails، Django، AdonisJS) `index.ts` عبر [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime). يستورد تطبيق Vue `frontend.ts` ويسجله مع `app.use()`.

### تثبيت الإضافات

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### الموارد

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — TypeScript SDK لبناء الإضافات
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — مضيف وقت التشغيل للإضافات
- [دليل تطوير الإضافات](https://github.com/escalated-dev/escalated-docs) — التوثيق الكامل

## لمشرفي الحزم

إذا كنت تبني تكاملاً خلفياً جديداً، فهذه الحزمة متوفرة على npm:

```bash
npm install @escalated-dev/escalated
```

```js
// استيراد الإضافة
import { EscalatedPlugin } from '@escalated-dev/escalated'

// استيراد مكونات فردية
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// أو الإشارة إلى الصفحات مباشرة لحل Inertia
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

التبعيات المتناظرة: `vue` ^3.3.0، `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## المنظومة

هذه هي الواجهة الأمامية المشتركة لنظام تذاكر دعم Escalated. حزم الواجهة الخلفية متوفرة لكل إطار عمل رئيسي:

- **[Escalated لـ Laravel](https://github.com/escalated-dev/escalated-laravel)** — حزمة Laravel Composer
- **[Escalated لـ Rails](https://github.com/escalated-dev/escalated-rails)** — محرك Ruby on Rails
- **[Escalated لـ Django](https://github.com/escalated-dev/escalated-django)** — تطبيق Django قابل لإعادة الاستخدام
- **[Escalated لـ AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — حزمة AdonisJS v6
- **[Escalated لـ Filament](https://github.com/escalated-dev/escalated-filament)** — إضافة لوحة مسؤول Filament v3
- **[الواجهة الأمامية المشتركة](https://github.com/escalated-dev/escalated)** — مكونات Vue 3 + Inertia.js (أنت هنا)

## الرخصة

MIT
