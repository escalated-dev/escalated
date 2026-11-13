<p align="center"><sub>
  <a href="README.ar.md">العربية</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.ja.md">日本語</a> ·
  <b>한국어</b> ·
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
  앱에 바로 내장되는 지원 티켓.<br>
  SLA, 에스컬레이션 규칙, 상담원 받은편지함, 고객 포털을 갖춘 오픈 소스 헬프데스크입니다.
</p>

<p align="center">
  <a href="https://escalated.dev"><b>웹사이트</b></a> ·
  <a href="https://escalated.dev/docs"><b>문서</b></a> ·
  <a href="https://escalated.dev/cloud"><b>클라우드</b></a> ·
  <a href="../../CHANGELOG.md"><b>변경 내역</b></a>
</p>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/inbox-dark.png">
  <img src="../assets/readme/inbox-light.png" alt="Escalated 상담원 받은편지함: 개수가 표시된 저장된 보기, 모든 티켓의 SLA 카운트다운과 우선순위" width="100%">
</picture>

## 주요 기능

<table>
  <tr>
    <td width="40%">
      <h3>상담원이 하루 종일 일할 수 있는 받은편지함</h3>
      대화, 내부 메모, 미리 준비된 답변, SLA 타이머를 한 화면에 모았고, 키보드 단축키로 대기열을 빠르게 처리할 수 있습니다.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/ticket-dark.png">
        <img src="../assets/readme/ticket-light.png" alt="답장 작성기와 함께 상담원 작업 공간에 열린 티켓">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/dashboard-dark.png">
        <img src="../assets/readme/dashboard-light.png" alt="응답 시간, CSAT, SLA 위반을 보여 주는 관리자 보고서 페이지">
      </picture>
    </td>
    <td width="40%">
      <h3>한눈에 보이는 SLA와 에스컬레이션 규칙</h3>
      우선순위별로 응답 및 해결 목표를 설정하고, 목표를 놓치면 자동으로 에스컬레이션하며, 보고서 페이지에서 위반을 추적하세요.
    </td>
  </tr>
  <tr>
    <td width="40%">
      <h3>이미 만들어진 고객 포털</h3>
      고객은 앱에서 티켓을 열고, 답장하고, 상태를 확인할 수 있으며, 옆에는 지식 베이스가 있습니다. 또는 어떤 사이트에든 위젯을 삽입할 수 있습니다.
    </td>
    <td width="60%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/portal-dark.png">
        <img src="../assets/readme/portal-light.png" alt="고객 포털 티켓 목록">
      </picture>
    </td>
  </tr>
</table>

## 기능 목록

<table>
<tr>
<td width="33%" valign="top">

**상담원 작업 공간**
- 저장된 보기를 지원하는 필터형 대기열
- 빠른 필터: 내 티켓, 미배정, 긴급, SLA
- 일괄 작업과 매크로
- 내부 메모와 고정 메모
- 작성기 안의 미리 준비된 답변
- 키보드 단축키와 명령 팔레트

</td>
<td width="33%" valign="top">

**티켓 도구**
- 답장을 새 티켓으로 분리
- 프리셋과 자동 재개를 지원하는 스누즈
- 관심 있는 티켓 팔로우
- 드래그 앤 드롭 첨부 파일
- 전체 활동 타임라인

</td>
<td width="33%" valign="top">

**SLA와 에스컬레이션**
- 경고와 위반을 표시하는 SLA 카운트다운
- SLA 정책 관리
- 에스컬레이션 규칙 빌더
- 부서와 태그

</td>
</tr>
<tr>
<td width="33%" valign="top">

**고객 포털**
- 필터와 검색을 갖춘 티켓 목록
- 첨부 파일을 지원하는 새 티켓 양식
- 답장 스레드와 상태 추적
- 코멘트를 남길 수 있는 CSAT 평가
- 지식 베이스, 켜기 또는 끄기

</td>
<td width="33%" valign="top">

**실시간**
- Pusher, Reverb 또는 Soketi를 통한 실시간 업데이트
- 자동 폴링 대체
- 티켓을 함께 보고 있는 사람 표시
- 답장 중 충돌 경고

</td>
<td width="33%" valign="top">

**앱에 자연스럽게 통합**
- 기존 레이아웃 안에서 렌더링
- 색상, 모서리, 글꼴용 테마 토큰
- 관리자 화면을 기존 관리자 패널에 삽입 가능
- 어떤 사이트에도 넣을 수 있는 지원 위젯
- 페이지와 사이드바 위젯용 플러그인

</td>
</tr>
</table>

<p align="center"><sub><a href="../components.md">모든 페이지와 컴포넌트</a></sub></p>

<p align="center">
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3"></a>
  <a href="https://inertiajs.com"><img src="https://img.shields.io/badge/Inertia_1--3-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia 1, 2 and 3"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/Plugin_SDK_in_TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Plugin SDK in TypeScript"></a>
</p>

## 빠른 시작

이 패키지는 공유 Vue 3 + Inertia 프런트엔드입니다. 단독으로 설치하지 않습니다. 사용하는 백엔드용 패키지를 추가하면 이 UI가 함께 포함됩니다.

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

## 더 알아보기

- [전체 기능](../features.md)
- [백엔드별 시작하기](../getting-started.md)
- [앱과 통합하기: Tailwind, 테마, 관리자 화면 삽입](../host-integration.md)
- [테마 토큰](../theming.md) · [상담원 패널](../agent-panel.md) · [위젯 삽입하기](../embedding-the-widget.md)
- [이 패키지의 페이지와 컴포넌트](../components.md)
- [플러그인 개발](../plugin-development.md)
- [패키지 메인테이너용](../package-maintainers.md)
- [기여하기](../../CONTRIBUTING.md)

## 라이선스

MIT. Copyright (c) Escalated.dev. [LICENSE](../../LICENSE)를 참고하세요.
