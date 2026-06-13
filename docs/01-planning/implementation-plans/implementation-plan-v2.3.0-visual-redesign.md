# Implementation Plan v2.3.0 - Visual Redesign

- 작성일: 2026-06-12
- 승인일: 2026-06-12
- 통합 브랜치: `feature/v2.3`
- 작업 브랜치: `feature/v2.3-visual-redesign`
- 기준 제안서: `docs/01-planning/proposal-visual-redesign.md`
- 기준 명세: `docs/02-specs/spec-v2.3.md`
- 상태: 구현 및 1차 검증 완료

---

## 0. 목표

BibleMate v2.3.0은 기능과 레이아웃 구조를 유지하면서, 앱의 시각 정체성을 "나만의 서재에서 읽는 성경"으로 전환한다.

이번 작업의 핵심 목표는 아래 5가지다.

1. 전역 토큰을 Paper & Ink / Candlelight 팔레트로 교체한다.
2. 성경 본문을 세리프 기반의 독서 화면으로 만들고, UI 도구와 시각 위계를 분리한다.
3. 묵상 카드와 일지를 조용한 메모지/기도 노트 문법으로 정리한다.
4. 기능 중심 문구를 묵상 흐름에 맞는 존댓말 마이크로카피로 바꾼다.
5. 파비콘/앱 아이콘을 새 시각 언어와 일관되게 리디자인한다.
6. v2.2 모바일 UX와 데스크톱 3컬럼 경험은 그대로 보존한다.

## 1. 비목표

- DB 스키마/API 계약 변경은 하지 않는다.
- 성경 선택, 구절 액션, 묵상 작성, 읽기표 진입 동작은 변경하지 않는다.
- 상단 select 3개를 제목형 컨트롤 하나로 압축하지 않는다.
- 전역 하단 탭바, PWA, 오프라인 기능은 다루지 않는다.
- CSS 프레임워크나 디자인 시스템 라이브러리를 도입하지 않는다.
- 종이 노이즈 텍스처는 기본 구현에서 제외한다. 필요 시 별도 승인 후 추가한다.

## 2. 산출물

준비 완료:
- 기준 제안서: `docs/01-planning/proposal-visual-redesign.md`
- 기준 명세: `docs/02-specs/spec-v2.3.md`
- 구현 계획서: 본 문서
- 개발 로그 자리: `docs/03-logs/dev-log-v2.3.md`
- 릴리즈 노트 자리: `docs/04-releases/release-notes-v2.3.0.md`

구현 후 작성:
- Walkthrough: `docs/03-logs/walkthroughs/walkthrough-v2.3.0-visual-foundation.md`
- Walkthrough: `docs/03-logs/walkthroughs/walkthrough-v2.3.0-reading-surface.md`
- Walkthrough: `docs/03-logs/walkthroughs/walkthrough-v2.3.0-surrounding-screens.md`
- PR 초안: `docs/03-logs/pr/pr-v2.3-visual-foundation.md`
- PR 초안: `docs/03-logs/pr/pr-v2.3-reading-surface.md`
- PR 초안: `docs/03-logs/pr/pr-v2.3-surrounding-screens.md`
- 작업 완료 후 업데이트: `docs/03-logs/dev-log-v2.3.md`, `docs/04-releases/release-notes-v2.3.0.md`, `docs/lessons.md`, `docs/docs-index.md`, `docs/01-planning/roadmap.md`

## 3. 구현/PR 분리 전략

### PR-A. Visual Foundation

진행 상태: 2026-06-12 구현 및 1차 검증 완료.

대상 티켓:
- VIS-001 라이트/다크 디자인 토큰 교체
- VIS-002 `--pk-color-bg-elevated`, `--pk-color-primary-solid` 신규 토큰 추가
- VIS-003 radius, border, shadow 스케일 조정
- VIS-004 하이라이트 4색 팔레트 조정
- VIS-005 Tailwind blue/green/red 계열 하드코딩 색상 토큰화

예상 대상 파일:
- `client/src/index.css`
- `client/src/**/*.css`

구현 방향:
- 기존 `--pk-*` 변수 체계를 유지한다.
- 라이트 모드는 `#FAF6EF`, `#F3EDE2`, `#FFFAF2`, `#3D3529`, `#8B5E3C` 중심으로 정리한다.
- 다크 모드는 `#211C16`, `#2B251D`, `#332C22`, `#EDE5D8`, `#C9A36B`, `#9A6B43` 기준을 적용한다.
- 직접 박힌 `#3b82f6`, `#22c55e`, `#ef4444` 등은 역할에 맞는 토큰으로 치환한다.

완료 기준:
- 라이트/다크에서 기존 파란 SaaS 인상이 사라진다.
- primary 채움 버튼의 텍스트 대비가 유지된다.
- 하이라이트 4색 위 본문 가독성이 유지된다.
- `npm run lint`, `npm run build`를 실행하고 결과를 walkthrough에 기록한다.

### PR-B. Reading Surface & Typography

진행 상태: 2026-06-12 구현 및 1차 검증 완료.

대상 티켓:
- VIS-101 Google Fonts에 `Noto Serif KR`, `Gowun Batang` 400/700 추가
- VIS-102 성경 본문 기본 글꼴을 `Noto Serif KR`로 전환
- VIS-103 설정 화면에 본문 글꼴 선택 추가
- VIS-104 절 번호, 장 제목, 본문 줄간격, `word-break: keep-all` 적용
- VIS-105 본문 paper surface, 읽기 폭, 여백, 컬럼 구분선, hover 효과 조정

예상 대상 파일:
- `client/src/index.css`
- `client/src/components/BibleViewer.jsx`
- `client/src/components/BibleViewer.css`
- `client/src/pages/Settings.jsx`
- `client/src/pages/Settings.css`
- `client/src/contexts/ThemeContext.jsx`

구현 방향:
- 본문 글꼴 설정은 기존 글자 크기 설정과 같은 사용자 설정 흐름을 따른다.
- CSS 변수 기반으로 `--pk-font-body` 또는 동등한 본문 전용 변수를 적용한다.
- 기존 v2.2 모바일 `Aa` 본문 크기 기능은 보존한다.
- 성경 본문 영역은 주변보다 한 단계 밝은 paper surface로 만든다.

완료 기준:
- 본문 기본값이 세리프이고, 설정에서 명조/고운바탕/고딕 전환이 가능하다.
- 모바일과 데스크톱 모두 첫 화면에서 본문이 시각적 주인공이다.
- 데스크톱 3컬럼과 모바일 바텀시트/하단 action bar가 회귀하지 않는다.

### PR-C. Surrounding Screens & Microcopy

진행 상태: 2026-06-12 구현 및 1차 검증 완료.

대상 티켓:
- VIS-201 묵상 카드와 노트 에디터 메모지 문법 적용
- VIS-202 묵상일지 섹션/빈 상태 마이크로카피 교체
- VIS-203 헤더 로고, 탭, 버튼 시각 무게 축소
- VIS-204 로그인 페이지 첫인상 리디자인
- VIS-205 파비콘/앱 아이콘 리디자인 및 연결 확인
- VIS-206 읽기표, 대시보드, 차트, 캘린더 팔레트 정합
- VIS-207 구절 액션 문구와 우선순위 시각 정리

예상 대상 파일:
- `client/src/components/Header.jsx`
- `client/src/components/Header.css`
- `client/src/components/NoteEditor.jsx`
- `client/src/components/NoteEditor.css`
- `client/src/components/NotePreview.jsx`
- `client/src/pages/JournalPage.jsx`
- `client/src/pages/JournalPage.css`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/LoginPage.css`
- `client/index.html`
- `client/public/logo.png`
- `client/public/manifest.json`
- `client/src/pages/ReadingDashboard.jsx`
- `client/src/pages/ReadingDashboard.css`
- `client/src/pages/BibleChartPage.jsx`
- `client/src/pages/BibleChartPage.css`
- `client/src/components/Calendar.css`
- `client/src/components/ReadingProgress.jsx`

구현 방향:
- 문구는 제안서 §3.4를 기준으로 존댓말 톤을 유지한다.
- 묵상 카드는 left-border 알림 문법을 줄이고, 미색 배경과 옅은 테두리 중심으로 정리한다.
- 헤더는 구조 변경을 최소화하되, 제안서에서 허용한 `···` 메뉴화 범위는 실제 컴포넌트 상태를 보고 적용한다.
- 파비콘/앱 아이콘은 작은 크기에서 읽히는 단순 실루엣을 우선하고, 성경책/책갈피/잉크색 이니셜 중 하나로 좁혀 구현한다.

완료 기준:
- 묵상 카드와 묵상일지가 데이터/알림 박스보다 기도 노트처럼 보인다.
- 로그인 첫 화면에서 v2.3 컨셉이 즉시 드러난다.
- 브라우저 탭, 북마크, apple touch icon에서 새 아이콘이 적용된다.
- 기능 식별성이 떨어질 정도의 과한 은유는 사용하지 않는다.

### PR-D. Verification & Documentation

진행 상태: 2026-06-12 구현 및 1차 검증 완료. 실제 iOS 홈 화면 설치 아이콘 확인은 배포 전 추가 QA로 남김.

대상 티켓:
- VIS-301 라이트/다크 × 데스크톱/모바일 스크린샷 점검
- VIS-302 WCAG AA 대비 점검
- VIS-303 v2.2 모바일 핵심 흐름 회귀 점검
- VIS-304 walkthrough, PR 초안, dev-log, release-notes, lessons 업데이트

검증 기준:
- `cd client && npm run lint`
- `cd client && npm run build`
- 데스크톱 1280 이상
- 모바일 390×844
- 라이트/다크 모드
- 성경 읽기, 구절 액션, 묵상 작성, 묵상일지, 읽기표, 설정, 로그인, 파비콘/앱 아이콘

## 4. 승인 필요 결정점

구현 전 승인 필요 항목은 2026-06-12 사용자 승인으로 해소했다.

구현 중 아래 항목은 필요 시 즉시 중지하고 별도 선택지를 제시한다.

- 헤더 `···` 메뉴화가 단순 스타일 조정 범위를 넘어 네비게이션 동작 변경이 되는 경우. 이번 구현에서는 구조 변경 없이 보류했다.
- Google Fonts 로딩이 성능 또는 네트워크 정책상 문제가 되어 지연 로딩/번들링 선택이 필요한 경우.
- 종이 노이즈 텍스처를 적용할지 결정해야 하는 경우. 이번 구현에서는 보류했다.
- contrast 기준을 맞추기 위해 제안서 색상값을 조정해야 하는 경우.

## 5. 작업 순서

1. PR-A Visual Foundation
   - 토큰 교체
   - 하드코딩 색상 토큰화
   - 하이라이트 색상 조정
   - walkthrough 작성
2. PR-B Reading Surface & Typography
   - 폰트 import/변수 정리
   - 성경 본문 타이포그래피
   - 본문 글꼴 설정
   - paper surface 적용
   - walkthrough 작성
3. PR-C Surrounding Screens & Microcopy
   - 묵상 카드/일지/노트 에디터
   - 헤더/로그인/파비콘
   - 대시보드/읽기표/캘린더/차트 팔레트
   - 마이크로카피 교체
   - walkthrough 작성
4. PR-D Verification & Documentation
   - 4조합 스크린샷 점검
   - contrast 및 회귀 점검
   - PR 초안, dev-log, release-notes, lessons, docs-index, roadmap 마감

## 6. 롤백 전략

- 토큰 교체는 `client/src/index.css` 중심으로 되돌릴 수 있게 PR-A를 분리한다.
- 폰트 설정은 기존 산세리프 선택지를 유지해 사용자 설정에서 즉시 회피할 수 있게 한다.
- 구조 변경이 필요한 헤더 작업은 PR-C에 격리하고, 기능 동작 변경으로 커지면 별도 버전으로 분리한다.
- 마이크로카피는 문자열 치환 중심이라 필요 시 개별 되돌림이 가능하게 커밋 범위를 작게 유지한다.
