<p align="center"><sub>
  <a href="README.ar.md">العربية</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <b>Русский</b> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.zh-CN.md">简体中文</a>
</sub></p>

<p align="center">
  <a href="https://escalated.dev"><img src="../assets/readme/logo.png" width="72" height="72" alt="Escalated"></a>
</p>

<h1 align="center">Escalated</h1>

<p align="center">
  Тикеты поддержки прямо в вашем приложении.<br>
  Хелпдеск с открытым исходным кодом: SLA, правила эскалации, входящие для агентов и клиентский портал.
</p>

<p align="center">
  <a href="https://escalated.dev"><b>Сайт</b></a> ·
  <a href="https://escalated.dev/docs"><b>Документация</b></a> ·
  <a href="https://escalated.dev/cloud"><b>Cloud</b></a> ·
  <a href="../../CHANGELOG.md"><b>Список изменений</b></a>
</p>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/inbox-dark.png">
  <img src="../assets/readme/inbox-light.png" alt="Входящие агента в Escalated: сохранённые представления со счётчиками, обратный отсчёт SLA и приоритеты у каждого тикета" width="100%">
</picture>

## Что он умеет

<table>
  <tr>
    <td width="40%">
      <h3>Входящие, в которых агенты могут работать весь день</h3>
      Переписка, внутренние заметки, шаблоны ответов и таймеры SLA на одном экране, а горячие клавиши помогают быстро двигаться по очереди.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/ticket-dark.png">
        <img src="../assets/readme/ticket-light.png" alt="Тикет, открытый в рабочем пространстве агента, с редактором ответа">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/dashboard-dark.png">
        <img src="../assets/readme/dashboard-light.png" alt="Страница отчётов в админке со временем ответа, CSAT и нарушениями SLA">
      </picture>
    </td>
    <td width="40%">
      <h3>Наглядные SLA и правила эскалации</h3>
      Задайте цели по времени ответа и решения для каждого приоритета, автоматически эскалируйте тикеты, когда сроки срываются, и отслеживайте нарушения на странице отчётов.
    </td>
  </tr>
  <tr>
    <td width="40%">
      <h3>Готовый клиентский портал</h3>
      Клиенты создают тикеты, отвечают и проверяют статус прямо в вашем приложении, а рядом есть база знаний. Или встройте виджет на любой сайт.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/portal-dark.png">
        <img src="../assets/readme/portal-light.png" alt="Список тикетов в клиентском портале">
      </picture>
    </td>
  </tr>
</table>

## Быстрый старт

Этот пакет представляет собой общий фронтенд на Vue 3 + Inertia. Отдельно его не устанавливают: добавьте пакет для своего бэкенда, и этот интерфейс подключится вместе с ним.

<table>
  <tr>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-laravel"><b>Laravel</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-rails"><b>Rails</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-django"><b>Django</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-nestjs"><b>NestJS</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-adonis"><b>AdonisJS</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-symfony"><b>Symfony</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-phoenix"><b>Phoenix</b></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-go"><b>Go</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-dotnet"><b>.NET</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-spring"><b>Spring</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-wordpress"><b>WordPress</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-filament"><b>Filament</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-react-native"><b>React Native</b></a></td>
    <td align="center"><a href="https://github.com/escalated-dev/escalated-flutter"><b>Flutter</b></a></td>
  </tr>
</table>

## Подробнее

- [Все возможности](../features.md)
- [Начало работы с каждым бэкендом](../getting-started.md)
- [Интеграция с приложением: Tailwind, темы, встраивание админки](../host-integration.md)
- [Токены темы](../theming.md) · [Панель агента](../agent-panel.md) · [Встраивание виджета](../embedding-the-widget.md)
- [Страницы и компоненты этого пакета](../components.md)
- [Разработка плагинов](../plugin-development.md)
- [Для сопровождающих пакетов](../package-maintainers.md)
- [Участие в разработке](../../CONTRIBUTING.md)

## Лицензия

MIT. Copyright (c) Escalated.dev. Подробнее в файле [LICENSE](../../LICENSE).
