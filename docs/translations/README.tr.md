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
  <a href="README.ru.md">Русский</a> •
  <b>Türkçe</b> •
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

Escalated, SLA takibi, yukseltme kurallari, temsilci is akislari ve musteri portali ile gomulu bir destek bilet sistemidir. Bu depo, desteklenen tum backend cercevelerinde kullanilan tum paylasilan frontend varliklarini (Vue 3 + Inertia.js) icerir.

👉 **Daha fazla bilgi edinin, demolari goruntuluyin ve Bulut ile Kendi Sunucunuz seceneklerini karsilastirin:** **[https://escalated.dev](https://escalated.dev)**

**Bu paketi dogrudan kurmayIn.** Cerceveniz icin backend paketiyle baslayin — bu frontend varliklarinin cekilmesi dahil her seyi halleder.

## Ozellikler

- **Bilet bolme** — Bir yaniti baglami koruyarak yeni bagimsiz bir bilete bolun
- **Bilet erteleme** — On ayarlarla (1s, 4s, yarin, gelecek hafta) biletleri erteleyin ve otomatik uyandirma
- **Kaydedilmis gorunumler / ozel kuyruklar** — Filtre on ayarlarini yeniden kullanilabilir bilet gorunumleri olarak kaydedin, adlandirin ve paylasin
- **Gomulu destek widget'i** — KB aramasi, bilet formu ve durum kontrolu iceren hazir `<script>` widget'i
- **Gercek zamanli guncellemeler** — WebSocket destegi (Pusher/Reverb/Soketi) ile otomatik yoklama geri donusu
- **Bilgi bankasi degistirici** — Yonetici ayarlarindan genel bilgi bankasini etkinlestirin veya devre disi birakin
- **CI: ESLint + Prettier** — Her pull request'te otomatik kod stili uygulamasi

## Baslangic

Cercevenizi secin:

| Cerceve | Depo | Kurulum |
|-----------|------|---------|
| **Laravel** | [escalated-dev/escalated-laravel](https://github.com/escalated-dev/escalated-laravel) | `composer require escalated-dev/escalated-laravel` |
| **Rails** | [escalated-dev/escalated-rails](https://github.com/escalated-dev/escalated-rails) | `gem "escalated"` |
| **Django** | [escalated-dev/escalated-django](https://github.com/escalated-dev/escalated-django) | `pip install escalated-django` |
| **AdonisJS** | [escalated-dev/escalated-adonis](https://github.com/escalated-dev/escalated-adonis) | `npm install @escalated-dev/escalated-adonis` |
| **WordPress** | [escalated-dev/escalated-wordpress](https://github.com/escalated-dev/escalated-wordpress) | [escalated.zip indir](https://github.com/escalated-dev/escalated-wordpress/releases/latest) |
| **Filament** | [escalated-dev/escalated-filament](https://github.com/escalated-dev/escalated-filament) | `composer require escalated-dev/escalated-filament` |
| **React Native** | [escalated-dev/escalated-react-native](https://github.com/escalated-dev/escalated-react-native) | `npm install @escalated-dev/escalated-react-native` |
| **Flutter** | [escalated-dev/escalated-flutter](https://github.com/escalated-dev/escalated-flutter) | Bkz. [pubspec.yaml kurulumu](https://github.com/escalated-dev/escalated-flutter#quick-start) |

Her backend deposunda tam kurulum talimatlari vardir — kurulum komutu, migrasyon, yapilandirma ve frontend entegrasyonu.

## Tailwind CSS

Escalated bilesenleri Tailwind CSS siniflarini kullanir. Bu paketin siniflarinin temizlenmemesi icin Tailwind `content` yapilandirmaniza eklemeniz **gerekir**:

```js
// tailwind.config.js
export default {
    content: [
        // ... mevcut yollariniz
        './node_modules/@escalated-dev/escalated/src/**/*.vue',
    ],
}
```

Bu olmadan, Escalated arayuzu olusturulur ancak dugme arka planlari ve rozet renkleri gibi stiller eksik olur.

## Tema

Escalated varsayilan olarak bagimsiz bir duzen icinde olusturulur. Uygulamanizin tasarim sistemine entegre etmek icin `EscalatedPlugin` kullanin:

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

### Duzen Entegrasyonu

Uygulamanizin duzen bilesenini gecirin ve tum Escalated sayfalari otomatik olarak icinde olusturulur. Duzen bileseni bir `#header` yuvasi ve varsayilan yuva kabul etmelidir:

```vue
<!-- Duzeniniz bu yuvalari desteklemelidir -->
<template>
    <div>
        <nav>...</nav>
        <header><slot name="header" /></header>
        <main><slot /></main>
    </div>
</template>
```

Duzen saglanamazsa, Escalated kendi yerlesik gezinme cubugunu kullanir.

### Ozel CSS Ozellikleri

`theme` secenegi, kendi stillerinizde referans verebileceginiz ozel CSS ozelliklerini ayarlar:

| Ozellik | Varsayilan | Aciklama |
|----------|---------|-------------|
| `--esc-primary` | `#4f46e5` | Birincil eylem rengi |
| `--esc-primary-hover` | otomatik koyulastirma | Birincil uzerine gelme rengi |
| `--esc-radius` | `0.5rem` | Giris alanlari ve dugmeler icin kenar yaricapi |
| `--esc-radius-lg` | otomatik olcekleme | Kartlar ve paneller icin kenar yaricapi |
| `--esc-font-family` | miras | Yazi tipi ailesi gecersiz kilma |

### Cerceve Ornekleri

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

## Bu Depoda Neler Var

Escalated arayuzunu calistiran tum Vue 3 + Inertia.js bilesenleri. Bunlar Laravel, Rails, Django ve AdonisJS genelinde aynidir — backend cercevesi bunlari Inertia araciligiyla olusturur.

## 📸 Ekran Goruntuleri

> Ekran goruntuleri [component-screenshots](.github/workflows/screenshots.yml) is akisi araciligiyla Storybook'tan otomatik olarak olusturulur.

<p align="center">
  <strong>Yonetici Paneli (Karanlik)</strong><br/>
  <img src="../../docs/assets/escalated_admin_1.png" alt="Escalated Yonetici Paneli — kenar cubugu gezintisi, KPI kartlari, istatistikler ve bilet listesi ile karanlik mod" width="800" />
</p>

<p align="center">
  <strong>Yonetici Paneli (Acik)</strong><br/>
  <img src="../../docs/assets/escalated_admin_3.png" alt="Escalated Yonetici Paneli — kenar cubugu gezintisi, KPI kartlari, istatistikler ve bilet listesi ile acik mod" width="800" />
</p>

<p align="center">
  <strong>Bilet Kuyrugu</strong><br/>
  <img src="../../docs/assets/escalated_ticket_list.png" alt="Escalated Bilet Kuyrugu — filtreler, arama, toplu eylemler ve SLA gostergeleri ile temsilci bilet listesi" width="800" />
</p>

<p align="center">
  <strong>Temsilci Paneli</strong><br/>
  <img src="../../docs/assets/escalated_admin_2.png" alt="Escalated Temsilci Paneli — ust gezinme, istatistikler ve atanmis bilet kuyrugu" width="800" />
</p>

<p align="center">
  <strong>Bilet Detay Gorunumu</strong><br/>
  <img src="../../docs/assets/escalated_ticket_view.png" alt="Escalated Bilet Detay Gorunumu — konusma dizisi, yanit duzenleyici ve SLA zamanlayicili bilet kenar cubugu" width="800" />
</p>

### Sayfalar

**Musteri Portali** — Self-servis bilet yonetimi
- `pages/Customer/Index.vue` — Durum filtreleri ve arama ile bilet listesi
- `pages/Customer/Create.vue` — Dosya ekleri ile yeni bilet formu
- `pages/Customer/Show.vue` — Yanit dizisi ile bilet detayi

**Temsilci Panosu** — Bilet kuyrugu ve is akislari
- `pages/Agent/Dashboard.vue` — Istatistik ozeti ve son biletler
- `pages/Agent/TicketIndex.vue` — Filtrelenebilir bilet kuyrugu
- `pages/Agent/TicketShow.vue` — Kenar cubugu, dahili notlar, hazir yanitlarla tam bilet gorunumu

**Yonetici Paneli** — Sistem yapilandirmasi
- `pages/Admin/Reports.vue` — Analiz panosu
- `pages/Admin/Departments/` — Departman yonetimi (CRUD)
- `pages/Admin/SlaPolicies/` — SLA politika yonetimi
- `pages/Admin/EscalationRules/` — Yukseltme kurali olusturucu
- `pages/Admin/Tags/` — Etiket yonetimi
- `pages/Admin/CannedResponses/` — Hazir yanit sablonlari

### Paylasilan Bilesenler

Yukaridaki sayfalarda kullanilan yeniden kullanilabilir yapi bloklari.

| Bilesen | Aciklama |
|-----------|-------------|
| `StatusBadge` | Bilet durumu icin renkli rozet |
| `PriorityBadge` | Bilet onceligi icin renkli rozet |
| `TicketList` | Sayfalandirilmis bilet tablosu |
| `ReplyThread` | Kronolojik yanit gorunumu |
| `ReplyComposer` | Dosya yukleme ve hazir yanit ekleme ile yanit/not duzenleyici |
| `ActivityTimeline` | Bilet olaylarinin denetim gunlugu |
| `SlaTimer` | Ihlal/uyari durumlariyla SLA geri sayim |
| `TicketFilters` | Durum, oncelik, temsilci, departman filtre cubugu |
| `TicketSidebar` | Bilet detay kenar cubugu (durum, SLA, etiketler, aktivite) |
| `AssigneeSelect` | Temsilci atama acilir menusu |
| `TagSelect` | Coklu secim etiket secici |
| `FileDropzone` | Surukle-birak dosya yukleme |
| `AttachmentList` | Indirme baglantilari ile dosya eki gorunumu |
| `StatsCard` | Etiket, deger ve egilim ile metrik karti |
| `EscalatedLayout` | Gezinmeli ust duzey duzen (ana bilgisayar duzen enjeksiyonunu destekler) |
| `BulkActionBar` | Secili biletlerde toplu islemler icin arac cubugu |
| `QuickFilters` | Tek tikla filtre cipleri (Biletlerim, Atanmamis, Acil, SLA Ihlali) |
| `MacroDropdown` | Bir bilete cok adimli makrolari uygulamak icin acilir menu |
| `FollowButton` | Bir bileti takip etme/takibi birakma degistirme dugmesi |
| `SatisfactionRating` | Istege bagli yorum ile 1-5 yildiz CSAT derecelendirme girisi |
| `KeyboardShortcutHelp` | Tum mevcut klavye kisayollarini gosteren modal kaplama |
| `PinnedNotes` | Dizinin ustunde sabitlenmis dahili notlarin gorunumu |
| `PresenceIndicator` | Bir bileti kimin goruntuledigini gosteren gercek zamanli gosterge |

### Composables

| Composable | Aciklama |
|------------|-------------|
| `useKeyboardShortcuts` | Bilet eylemleri icin klavye kisayollarini kaydeder ve yonetir |

### Eklenti

| Disari Aktarma | Aciklama |
|--------|-------------|
| `EscalatedPlugin` | Duzen enjeksiyonu ve CSS tema ayari icin Vue eklentisi |

## Eklenti Gelistirme

Escalated, [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) ile olusturulan cerceve bagimsiz eklentileri destekler. Eklentiler TypeScript'te bir kez yazilir ve tum Escalated backend'lerinde calisir.

### Frontend Eklenti Sistemi Nasil Calisir

Frontend, Vue bilesenlerini kaydetmek icin `defineEscalatedPlugin()` kullanir — ozel yonetici sayfalari, bilet kenar cubugu widget'leri veya pano panelleri — eklenti aktif oldugunda otomatik olarak montajlanir.

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

### Backend'e Nasil Baglanir

Backend, TypeScript is mantigi islemek icin [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk)'dan `definePlugin()` kullanir — bilet yasam dongusu kancalarina abone olma, API endpointlerini aciga cikarma ve verileri kalici hale getirme. Frontend ve backend girisleri tek bir npm paketi olarak birlikte calisir.

```typescript
// backend girisi (index.ts)
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

### Hizli Ornek: Her Iki Giris Noktasi

Yayinlanmis bir eklenti paketi genellikle her ikisini de disari aktarir:

```
my-plugin/
  index.ts          ← backend: TypeScript mantigi icin definePlugin()
  frontend.ts       ← frontend: Vue bilesenleri icin defineEscalatedPlugin()
```

Backend cercevesi (Laravel, Rails, Django, AdonisJS) `index.ts`'yi [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) araciligiyla yukler. Vue uygulamasi `frontend.ts`'yi ice aktarir ve `app.use()` ile kaydeder.

### Eklenti Kurulumu

```bash
npm install @escalated-dev/plugin-slack
npm install @escalated-dev/plugin-jira
```

### Kaynaklar

- [Plugin SDK](https://github.com/escalated-dev/escalated-plugin-sdk) — Eklenti olusturma icin TypeScript SDK
- [Plugin Runtime](https://github.com/escalated-dev/escalated-plugin-runtime) — Eklentiler icin calisma zamani ana bilgisayari
- [Eklenti Gelistirme Kilavuzu](https://github.com/escalated-dev/escalated-docs) — Tam dokumantasyon

## Paket Bakimcilari Icin

Yeni bir backend entegrasyonu olusturuyorsaniz, bu paket npm'de mevcuttur:

```bash
npm install @escalated-dev/escalated
```

```js
// Eklentiyi ice aktar
import { EscalatedPlugin } from '@escalated-dev/escalated'

// Bireysel bilesenleri ice aktar
import { StatusBadge, SlaTimer } from '@escalated-dev/escalated'

// Veya Inertia cozumlemesi icin sayfalara dogrudan basvur
import CustomerIndex from '@escalated-dev/escalated/pages/Customer/Index.vue'
```

Peer bagimliliklari: `vue` ^3.3.0, `@inertiajs/vue3` ^1.0.0 || ^2.0.0

## Ekosistem

Bu, Escalated destek bilet sistemi icin paylasilan frontend'dir. Her buyuk cerceve icin backend paketleri mevcuttur:

- **[Escalated icin Laravel](https://github.com/escalated-dev/escalated-laravel)** — Laravel Composer paketi
- **[Escalated icin Rails](https://github.com/escalated-dev/escalated-rails)** — Ruby on Rails motoru
- **[Escalated icin Django](https://github.com/escalated-dev/escalated-django)** — Yeniden kullanilabilir Django uygulamasi
- **[Escalated icin AdonisJS](https://github.com/escalated-dev/escalated-adonis)** — AdonisJS v6 paketi
- **[Escalated icin Filament](https://github.com/escalated-dev/escalated-filament)** — Filament v3 yonetici paneli eklentisi
- **[Paylasilan Frontend](https://github.com/escalated-dev/escalated)** — Vue 3 + Inertia.js UI bilesenleri (buradasiniz)

## Lisans

MIT
