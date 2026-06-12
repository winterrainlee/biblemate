# Implementation Plan v2.2.0 - 모바일 UX 재설계

- 작성일: 2026-06-11
- 승인일: 2026-06-12
- 작업 브랜치: `feature/v2.2-mobile-ux`
- 통합 브랜치: `feature/v2.2`
- 기준 명세: `docs/02-specs/mobile-ux-final-adjustment-v2.md`
- 상태: PR-A 완료 / PR-B 완료 / PR-C 완료 / 문서 마감 대기

## 0. 목표

BibleMate 모바일을 "오늘 말씀을 바로 읽고, 마음에 닿은 구절을 한 번에 붙잡고, 기록을 잃지 않고, 다시 쉽게 돌아보는 손 안의 개인 묵상 도구"로 재정렬한다.

이번 v2.2.0 작업의 핵심 목표는 아래 4가지다.

1. 모바일 브라우저 기반 안정화: safe-area, 키보드, 내부 스크롤, 토스트/하단 액션 잘림 문제를 먼저 해결한다.
2. 구절 묵상 작성 흐름 재설계: 모바일 중앙 팝업을 바텀시트/전체 화면 작성 흐름으로 대체한다.
3. 모바일 묵상 접근성 복구: 데스크탑 3컬럼의 "현재 장 묵상 패널" 가치를 모바일 전용 시트로 되살린다.
4. 읽기/회고/진도 흐름 연결: 성경 읽기 하단 액션, 묵상일지 날짜 이동, 읽기표의 다음 읽기 진입점을 연결한다.

## 1. 비목표

- 전역 하단 탭바 도입 확정은 하지 않는다. 먼저 성경 읽기 전용 하단 action bar를 검증한다.
- 오프라인/PWA 서비스 워커는 이번 1차 범위에서 제외한다.
- `묵상 대상일`과 `작성일` 분리 같은 DB 스키마 변경은 제외한다.
- 읽기표의 모든 장 셀을 44px 버튼으로 키우는 방식은 1차 범위에서 제외한다.
- 데스크탑 3컬럼 경험을 축소하거나 제거하지 않는다.

## 2. 산출물

- 기준 명세: `docs/02-specs/mobile-ux-final-adjustment-v2.md`
- 구현 계획서: 본 문서
- 구현/검증 기록:
  - `docs/03-logs/walkthroughs/walkthrough-v2.2.0-mobile-foundation.md`
  - `docs/03-logs/walkthroughs/walkthrough-v2.2.0-mobile-bible-flow.md`
  - `docs/03-logs/walkthroughs/walkthrough-v2.2.0-mobile-journal-chart.md`
- PR 초안:
  - `docs/03-logs/pr/pr-v2.2-mobile-foundation.md`
  - `docs/03-logs/pr/pr-v2.2-mobile-bible-flow.md`
  - `docs/03-logs/pr/pr-v2.2-mobile-journal-chart.md`
- 작업 완료 후 업데이트:
  - `docs/03-logs/dev-log-v2.2.md`
  - `docs/04-releases/release-notes-v2.2.0.md`
  - `docs/lessons.md`
  - `docs/docs-index.md`
  - `docs/01-planning/roadmap.md`

## 3. 구현/PR 분리 전략

### PR-A. Mobile Foundation

진행 상태: 2026-06-12 구현 및 1차 검증 완료.

대상 티켓:
- MOB-001 viewport와 safe-area 정리
- MOB-002 키보드 대응 레이어 만들기
- MOB-003 입력 중 스와이프/탭 전환 보호
- MOB-004 기본 접근성 정리
- MOB-402 죽은 코드/lint 정리 중 모바일 개선을 막는 항목

예상 대상 파일:
- `client/index.html`
- `client/src/index.css`
- `client/src/components/Layout.css`
- `client/src/components/Layout.jsx`
- `client/src/components/Header.jsx`
- `client/src/components/Header.css`
- `client/src/pages/ReadingDashboard.jsx`
- `client/src/pages/ReadingDashboard.css`
- `client/src/pages/JournalPage.jsx`
- `client/src/pages/JournalPage.css`
- `client/src/pages/BibleChartPage.css`
- `client/src/pages/Settings.css`
- `client/src/services/api.js`

구현 방향:
- viewport meta에 `viewport-fit=cover` 적용을 검토한다.
- `100vh` 의존을 `100dvh`/`100svh`/fallback 조합으로 바꾼다.
- safe-area CSS 변수를 정의하고 토스트, 하단 action bar, 바텀시트에 사용한다.
- textarea 포커스/편집 상태에서는 장·날짜 스와이프를 비활성화한다.
- 저장 대상 book/chapter/date를 작성 UI 오픈 시점에 고정할 수 있는 상태 구조를 준비한다.
- `/api/notes` 잔여 호출처럼 콘솔 오류를 만드는 모바일 UX 방해 요소를 우선 정리한다.
- 주요 아이콘 버튼에 `aria-label`과 44px 터치 영역을 적용한다.

완료 기준:
- iPhone Safari/PWA/Android Chrome에서 하단 버튼과 토스트가 safe-area 안에 보인다.
- 입력 중 좌우 스와이프로 날짜/장이 바뀌지 않는다.
- Lighthouse 또는 접근성 검사에서 주요 버튼명이 노출된다.
- `npm run build` 성공.
- `npm run lint`는 가능한 한 통과시키되, 남기는 항목이 있으면 walkthrough에 명시한다.

### PR-B. Mobile Bible Flow

진행 상태: 2026-06-12 구현, 자동 검증, 아이폰 실기기 수동 QA 완료.

대상 티켓:
- MOB-101 모바일 성경 상단 압축
- MOB-102 구절 액션 바텀시트
- MOB-103 구절 묵상 작성 전체 화면
- MOB-104 현재 장 묵상 모바일 복구
- MOB-105 하단 읽기 액션 바

예상 대상 파일:
- `client/src/components/BibleViewer.jsx`
- `client/src/components/BibleViewer.css`
- `client/src/components/BibleSelector.jsx`
- `client/src/components/BibleSelector.css`
- `client/src/pages/ReadingDashboard.jsx`
- `client/src/pages/ReadingDashboard.css`
- 신규 컴포넌트 후보:
  - `client/src/components/MobileBottomSheet.jsx`
  - `client/src/components/MobileBottomSheet.css`
  - `client/src/components/MobileBibleActionBar.jsx`
  - `client/src/components/MobileBibleActionBar.css`
  - `client/src/components/VerseMeditationComposer.jsx`
  - `client/src/components/VerseMeditationComposer.css`

구현 방향:
- 모바일에서 현재 본문 선택 UI를 `책 장 · 역본 ▼` compact bar로 압축한다.
- 상세 책/장/역본 선택은 바텀시트로 연다.
- 구절 탭 시 중앙 fixed 팝업 대신 바텀시트를 연다.
- 액션 우선순위는 `묵상하기` → `묵상 보기` → `하이라이트` → `복사` 순서로 둔다.
- 📝 아이콘 탭은 묵상 보기로 직접 연결한다.
- 묵상 작성은 모바일에서 전체 화면 작성 오버레이로 열고, 선택한 말씀 내용을 상단에 표시하며, 저장 버튼을 키보드/safe-area 위에 고정한다.
- 현재 장 묵상은 `이 장의 묵상 n개` 진입점을 통해 1탭 이내로 연다.
- 모바일 하단 action bar에 `이전 장`, `오늘 읽음 표시`, `다음 장`을 배치하고, 읽음 완료 후 `묵상일지 보기`를 제공한다.

완료 기준:
- 390×844 화면 첫 진입에서 첫 구절이 fold 안에 보인다.
- 구절 탭 후 1탭 안에 묵상 작성 화면에 들어간다.
- 묵상 작성 화면에서 사용자가 선택한 말씀 본문이 보여야 한다.
- 📝가 있는 구절에서 기존 묵상 보기까지 1탭이다.
- 현재 장의 전체 묵상을 모바일에서 1탭 이내로 볼 수 있다.
- 장 끝까지 내리지 않아도 읽음 표시가 가능하다.
- 데스크탑 3컬럼 사이드바 경험은 유지된다.

### PR-C. Mobile Journal & Chart Flow

진행 상태: 2026-06-12 구현, 자동 검증, 아이폰 실기기 수동 QA 완료.

대상 티켓:
- MOB-201 날짜 선택 시트와 오늘 버튼
- MOB-202 모바일 일지 요약
- MOB-203 빈 상태 CTA 정리
- MOB-301 본문 전용 가독성 설정
- MOB-302 읽기표를 진입점으로 만들기
- MOB-304 탭 상태와 URL 정리 중 최소 유지 전략

예상 대상 파일:
- `client/src/pages/JournalPage.jsx`
- `client/src/pages/JournalPage.css`
- `client/src/components/Calendar.jsx`
- `client/src/components/Calendar.css`
- `client/src/components/JournalStats.jsx`
- `client/src/components/ReadingProgress.jsx`
- `client/src/pages/BibleChartPage.jsx`
- `client/src/pages/BibleChartPage.css`
- `client/src/contexts/TabContext.jsx`
- `client/src/contexts/ThemeContext.jsx`
- `client/src/App.jsx`

구현 방향:
- 묵상일지 날짜 텍스트를 탭 가능한 컨트롤로 만들고 달력 시트를 연다.
- 과거 날짜에서 `오늘`로 1탭 복귀할 수 있게 한다.
- 빈 상태 CTA는 `오늘 묵상 시작하기` 중심으로 단순화한다.
- 모바일 일지에 `이번 달 읽은 장`, `묵상한 날`, `최근 작성한 묵상` 같은 가벼운 요약을 추가한다.
- 성경 본문 전용 글자 크기/줄간격 설정을 앱 전체 root font-size와 분리한다.
- 모바일 성경 화면에 `Aa` 빠른 가독성 버튼을 검토한다.
- 읽기표 상단에 `다음 안 읽은 장 읽기` 버튼을 추가한다.
- 책 row 탭 시 해당 책의 다음 안 읽은 장으로 이동한다.
- activeTab은 최소 localStorage에 유지하고, `/bible`/`/journal` 라우트 분리는 별도 결정 지점으로 남긴다.

완료 기준:
- 묵상일지에서 3주 전 날짜로 2탭 이내 이동한다.
- 과거 날짜에서 오늘로 1탭 복귀한다.
- 빈 상태에서 같은 성격의 CTA가 반복되지 않는다.
- 본문 글자 크기를 키워도 헤더/버튼 레이아웃이 무너지지 않는다.
- 읽기표에서 다음 읽을 장으로 1탭 이동한다.
- 새로고침 후 마지막 사용 탭이 예측 가능하게 유지된다.

## 4. 데이터/상태 설계 원칙

- 구절 묵상 저장 대상은 작성 UI 오픈 시점의 `book`, `chapter`, `verse`, `verse_range`, `date`로 고정한다.
- 입력 중 navigation guard는 최소 3가지 전환을 막거나 확인한다.
  - 장 변경
  - 날짜 변경
  - 성경/묵상 탭 전환
- 자동 임시 저장은 우선 local component state 또는 localStorage draft로 시작하고, 서버 저장 draft는 이번 범위에서 제외한다.
- 하이라이트/묵상/읽기 로그 API 계약은 가능한 한 유지한다.
- API 최적화(MOB-303)는 v2.2.0 안에서 안전하게 가능한 범위만 적용하고, 장 단위 API 확장은 별도 계획으로 분리 가능하다.

## 5. 검증 계획

### 자동 검증

- `npm run build` at `client`
- `npm run lint` at `client`
- 필요한 경우 API 변경 없음 확인용 서버 smoke:
  - `/api/health`
  - `/api/bible/:book/:chapter`
  - `/api/verse-notes/:book/:chapter`
  - `/api/reading-logs`

### 수동 QA 매트릭스

| 환경 | 필수 확인 |
|---|---|
| iPhone SE급 375×667 Safari | 하단 action bar, 키보드, 첫 구절 fold |
| iPhone 13 mini 또는 390×844급 Safari | safe-area, 바텀시트, 스와이프 |
| iOS PWA standalone | 상태바/홈 인디케이터 겹침 |
| Android Chrome 412×915 | 키보드 resize, 하단 바 |
| iPad mini/11인치 portrait | 태블릿 세로 경계, 읽기표 접근 |
| 1024폭 tablet/desktop 경계 | 사이드바 전환 자연스러움 |
| Desktop ≥1280 | 기존 3컬럼 경험 유지 |

### 핵심 플로우

1. 오늘 이어 읽기
   - 앱 진입 → 이어 읽기 맥락 확인 → 첫 구절 fold 안 표시
2. 구절 묵상 작성
   - 구절 탭 → 바텀시트 → 묵상하기 → 키보드 입력 → 저장
3. 기존 묵상 보기
   - 📝 탭 → 묵상 목록 → 수정/복사/본문 복귀
4. 입력 중 스와이프 보호
   - 자유 묵상/구절 묵상 입력 중 좌우 스와이프 → 날짜/장 변경 방지 또는 보호 안내
5. 과거 묵상 회고
   - 날짜 선택 시트 → 3주 전 이동 → 오늘 복귀
6. 읽기표에서 읽기 시작
   - 읽기표 → 다음 안 읽은 장 읽기 → 성경 읽기 화면 이동

## 6. 작업 순서

1. PR-A: 모바일 안정화 기반
   - viewport/safe-area
   - 키보드/입력 guard
   - 접근성/잔여 API 오류 정리
   - walkthrough 작성
2. PR-B: 성경 읽기 핵심 흐름
   - compact context bar
   - 바텀시트/작성 화면
   - 현재 장 묵상 시트
   - 하단 action bar
   - walkthrough 작성
3. PR-C: 묵상일지/읽기표/가독성
   - 날짜 선택 시트
   - 모바일 일지 요약
   - 빈 상태 CTA
   - 읽기표 진입점
   - 본문 전용 가독성 설정
   - walkthrough 작성
4. 문서 마감
   - PR 초안 작성
   - dev-log/release-notes/lessons/docs-index/roadmap 업데이트

## 7. 승인 필요 결정점

구현 전 또는 구현 중 아래 결정이 필요하면 중지하고 사용자에게 선택지를 제시한다.

1. 모바일 묵상 작성 UI 형태 — 2026-06-12 사용자 승인 완료
   - A안: 90% 높이 바텀시트
   - B안: 전체 화면 작성 페이지/오버레이
   - 확정: B안. 단, 작성 화면에는 사용자가 선택한 말씀 내용을 반드시 표시한다.
2. activeTab URL 전략 — 2026-06-12 사용자 승인 완료
   - A안: localStorage 유지
   - B안: `/bible`, `/journal` 라우트 분리
   - 확정: v2.2.0에서는 A안으로 리스크를 줄이고, v2.3에서 라우트 분리를 검토한다.
3. 현재 장 묵상 표시 방식 — 2026-06-12 사용자 승인 완료
   - A안: `이 장의 묵상 n개` 바텀시트
   - B안: 본문 사이 1줄 미리보기
   - 확정: A안. 읽기 몰입을 덜 해친다.
4. lint 정리 범위 — 2026-06-12 사용자 승인 완료
   - A안: 모바일 개선과 충돌하는 lint만 정리
   - B안: 전체 lint 통과까지 정리
   - 확정: PR-A에서 전체 lint 통과를 목표로 하되, 범위가 커지면 사용자 승인 후 분리한다.

## 8. 롤백 계획

- PR-A 롤백: safe-area/viewport/입력 guard 변경을 되돌리고 기존 모바일 UI 유지.
- PR-B 롤백: 모바일 전용 바텀시트/action bar 컴포넌트를 제거하고 기존 중앙 팝업 흐름으로 복귀.
- PR-C 롤백: 날짜 시트/읽기표 진입점/가독성 설정만 원복 가능하도록 기능 단위 커밋을 유지.

## 9. 완료 정의

v2.2.0 모바일 UX 1차 완료는 아래 조건을 모두 만족해야 한다.

- iOS Safari와 Android Chrome에서 하단 잘림이 없다.
- 묵상 작성 중 키보드가 저장 버튼을 가리지 않는다.
- 구절 선택 후 묵상 작성까지 1탭이다.
- 📝가 있는 구절에서 기존 묵상 보기까지 1탭이다.
- 현재 장의 전체 묵상을 모바일에서 볼 수 있다.
- 입력 중 스와이프로 날짜/장이 바뀌어 내용이 유실되지 않는다.
- 묵상일지에서 날짜 점프와 오늘 복귀가 가능하다.
- 주요 터치 타깃은 44px 이상이다.
- 읽기표 접근 경로가 모든 모바일·태블릿 폭에서 존재한다.
- 최소 기기 매트릭스 수동 QA를 통과한다.
- 데스크탑 ≥1280에서 기존 3컬럼 경험이 유지된다.
