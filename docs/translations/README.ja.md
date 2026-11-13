<p align="center"><sub>
  <a href="README.ar.md">العربية</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <b>日本語</b> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.zh-CN.md">简体中文</a>
</sub></p>

<p align="center">
  <a href="https://escalated.dev"><img src="../assets/readme/logo.png" width="72" height="72" alt="Escalated"></a>
</p>

<h1 align="center">Escalated</h1>

<p align="center">
  アプリに組み込める、サポートチケット。<br>
  SLA、エスカレーションルール、エージェント用受信トレイ、顧客ポータルを備えたオープンソースのヘルプデスクです。
</p>

<p align="center">
  <a href="https://escalated.dev"><b>ウェブサイト</b></a> ·
  <a href="https://escalated.dev/docs"><b>ドキュメント</b></a> ·
  <a href="https://escalated.dev/cloud"><b>クラウド</b></a> ·
  <a href="../../CHANGELOG.md"><b>変更履歴</b></a>
</p>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/inbox-dark.png">
  <img src="../assets/readme/inbox-light.png" alt="Escalated のエージェント受信トレイ: 件数付きの保存済みビュー、各チケットの SLA カウントダウンと優先度" width="100%">
</picture>

## できること

<table>
  <tr>
    <td width="40%">
      <h3>エージェントが一日中作業できる受信トレイ</h3>
      会話、内部メモ、定型返信、SLA タイマーを 1 つの画面にまとめ、キーボードショートカットでキューを次々と処理できます。
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/ticket-dark.png">
        <img src="../assets/readme/ticket-light.png" alt="返信エディタ付きでエージェントワークスペースに開いたチケット">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/dashboard-dark.png">
        <img src="../assets/readme/dashboard-light.png" alt="応答時間、CSAT、SLA 違反を表示する管理画面のレポートページ">
      </picture>
    </td>
    <td width="40%">
      <h3>目に見える SLA とエスカレーションルール</h3>
      優先度ごとに応答と解決の目標を設定し、遅れたら自動でエスカレーションし、違反はレポートページで追跡できます。
    </td>
  </tr>
  <tr>
    <td width="40%">
      <h3>最初から用意された顧客ポータル</h3>
      顧客はあなたのアプリからチケットを作成し、返信し、ステータスを確認できます。横にはナレッジベースもあります。ウィジェットを任意のサイトに埋め込むこともできます。
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/portal-dark.png">
        <img src="../assets/readme/portal-light.png" alt="顧客ポータルのチケット一覧">
      </picture>
    </td>
  </tr>
</table>

## クイックスタート

このパッケージは共有の Vue 3 + Inertia フロントエンドです。単体ではインストールしません。お使いのバックエンド用のパッケージを追加すると、この UI も一緒に導入されます。

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

## 詳しく見る

- [すべての機能](../features.md)
- [各バックエンドでのはじめ方](../getting-started.md)
- [アプリへの統合: Tailwind、テーマ設定、管理画面の埋め込み](../host-integration.md)
- [テーマトークン](../theming.md) · [エージェントパネル](../agent-panel.md) · [ウィジェットの埋め込み](../embedding-the-widget.md)
- [このパッケージのページとコンポーネント](../components.md)
- [プラグイン開発](../plugin-development.md)
- [パッケージメンテナー向け](../package-maintainers.md)
- [コントリビュート](../../CONTRIBUTING.md)

## ライセンス

MIT。Copyright (c) Escalated.dev。詳しくは [LICENSE](../../LICENSE) をご覧ください。
