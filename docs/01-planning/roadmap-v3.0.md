# BibleMate v3.0 Development Roadmap

- 기준 버전: v2.3.3
- 목표 버전: v3.0.0
- 기획 승인일: 2026-09-08
- 기준 명세: [`../02-specs/spec-v3.0.md`](../02-specs/spec-v3.0.md)
- 상태: v3.0.0 배포 완료

> v3.0은 기능 확장이 아니라 성경 읽기 경험을 중심으로 프론트엔드 UX를 재설계하는 Major Release다.

---

## 제품 목표

> **읽고, 걸리는 말씀에 흔적을 남기고, 다시 읽는다.**

핵심 사용자 루프는 `Reading → Selection → Highlight / Copy / Reflection → Reading`이다.

새 기능을 많이 추가하는 대신, v2.x에서 축적된 기능을 이 루프에 맞춰 재배치하고 불필요한 UI 표면을 제거한다.

---

## P0 — Reading Foundation

### 1. Reading Canvas

- [x] `🔴 Hard` **본문 중심 Reading Canvas 재설계**
  - 큰 paper card, 과한 border/shadow 제거
  - 본문 폭, 여백, 글자 크기, 행간, 절 간격, 절 번호 재정의
  - 장/역본/Aa 컨트롤의 시각적 무게 축소
- [x] `🟡 Medium` **묵상 존재 표시 최소화**
  - 빨간 밑줄 + 📝 중첩 표현 제거
  - 점, 마진 마커, 얇은 표시선 중 prototype에서 결정
- [x] `🟡 Medium` **라이트/다크 Reading Canvas 검증**

### Prototype Gate

다음 폭에서 먼저 정적/최소 기능 prototype을 검증한다.

- 약 375px — iPhone 13 mini급
- 약 600~700px — iPad/desktop 1:1 Split View급
- 1000px 이상 — Desktop Workspace

**사용자 승인 전에는 Verse Selection 구현으로 넘어가지 않는다.**

---

## P0 — Responsive Architecture

### 2. Compact / Reading / Workspace

- [x] `🔴 Hard` **기기명 대신 사용 가능한 폭 기준으로 반응형 구조 재설계**
- [x] `🟡 Medium` **Compact `< 약 600px`**: 단일 본문 + 엄지 영역 중심 조작
- [x] `🟡 Medium` **Reading `약 600–899px`**: 외부 기록 앱과 1:1 병행 가능한 단일 본문
- [x] `🟡 Medium` **Workspace `약 900px 이상`**: 본문 + 필요 시 우측 묵상 패널
- [x] `🟡 Medium` **769~1024px 진입점 사각지대 제거**
- [x] `🟡 Medium` **기존 `묵상 | 본문 | 묵상` 3열 구조 제거**

> 정확한 breakpoint는 Reading Canvas prototype 이후 확정한다.

---

## P0 — Verse Interaction

### 3. Verse Selection

- [x] `🔴 Hard` **탭 기반 단일/다중 구절 선택 모델**
- [x] `🟡 Medium` 선택 추가/해제 및 비연속 선택
- [x] `🟡 Medium` Selection 상태에서 장 이동 스와이프 억제
- [x] `🟡 Medium` 선택 시 본문 위치 유지
- [x] `🟡 Medium` 주요 터치 hit area 44×44px 이상 확보

### 4. Context Toolbar

- [x] `🔴 Hard` **본문을 덮지 않는 Context Toolbar 도입**
- [x] `🟡 Medium` 하이라이트 4색 연결
- [x] `🟡 Medium` 묵상 Composer 진입
- [x] `🟡 Medium` 복사
- [x] `🟢 Easy` 더보기 없이 하이라이트 지우기 직접 노출

---

## P0 — Copy as Integration

### 5. 정확한 구절 복사

- [x] `🟡 Medium` 단일 절 출처 표기
- [x] `🟡 Medium` 연속 다중 절 범위 표기 (`1:3–5`)
- [x] `🟡 Medium` 비연속 다중 절 표기 (`1:3, 5`)
- [x] `🟢 Easy` 현재 역본명 포함
- [x] `🟡 Medium` 선택 범위와 실제 복사 본문 정합성 검증

기본 예시:

```text
[요한복음 1:3–5 · 개역한글]
...
```

Markdown/본문만 등 복사 포맷 선택 기능은 v3.0 필수 범위에서 제외한다.

---

## P0 — Reflection Composer

### 6. 묵상 작성 경험

- [x] `🔴 Hard` **Compact 전체 화면 Composer**
- [x] `🔴 Hard` **Workspace 우측 패널 Composer**
- [x] `🟡 Medium` 선택 구절/인용문 명확히 표시
- [x] `🟡 Medium` 작성 중 이탈 보호
- [x] `🟡 Medium` iOS 키보드 + safe-area 검증
- [x] `🟡 Medium` 기존 `verse_notes` API/데이터 재사용

---

## P1 — Existing Notes Integration

### 7. 이 장의 묵상

- [x] `🟡 Medium` 모든 폭에서 묵상 접근 경로 유지
- [x] `🟡 Medium` Workspace 우측 묵상 패널
- [x] `🟡 Medium` 패널 접기/펼치기
- [x] `🟡 Medium` 묵상 보기/수정/삭제 액션 재배치
- [x] `🟡 Medium` 본문 구절로 이동 동작 유지

---

## P1 — Visual System Cleanup

### 8. UI 표면 정리

- [x] `🟡 Medium` 중첩 card/surface 제거
- [x] `🟡 Medium` shadow 사용 위치 제한
- [x] `🟡 Medium` radius 사용 규칙 통일
- [x] `🟡 Medium` border보다 여백/타이포그래피 우선
- [x] `🟡 Medium` Header 시각적 무게 축소
- [x] `🟡 Medium` Reading과 Journal의 디자인 언어 정합

v2.3의 Paper & Ink / Candlelight 팔레트는 출발점으로 유지한다.

---

## P2 — Surrounding Screens

핵심 Reading Loop가 승인된 뒤 그 디자인 언어를 주변 화면으로 확장한다.

권장 순서:

1. [x] Journal
2. [x] Reading History / Chart
3. [x] Settings
4. [x] Login
5. [x] PWA / favicon / app icon 정합성 확인 — 기존 자산 유지, standalone 미세 차이는 hotfix 대상

---

## 명시적 Out of Scope

v3.0 핵심 재설계에 다음 기능을 섞지 않는다.

- 신규 AI 기능
- 신규 성경 역본
- 역본 대조 Parallel View
- 검색 기능 재설계
- Markdown 에디터
- 새로운 통계 시스템
- gamification / streak / 목표 기능
- 대규모 DB 스키마 변경
- 인증 시스템 재설계
- 백업 포맷 대규모 변경

---

## 개발 브랜치 구조

```text
master
  └── feature/v3.0
        ├── feature/v3.0-reading-canvas
        ├── feature/v3.0-verse-selection
        ├── feature/v3.0-context-toolbar
        ├── feature/v3.0-reflection-composer
        ├── feature/v3.0-responsive-layout
        └── feature/v3.0-visual-cleanup
```

각 작업 브랜치는 저장소 표준 워크플로우를 따른다.

```text
/feature
  ↓
implementation plan
  ↓
Agent Review
  ↓
사용자 승인
  ↓
구현
  ↓
walkthrough + 검증
  ↓
/pr
  ↓
feature/v3.0 통합
```

---

## 실제 구현 순서

1. [x] `v3.0-reading-canvas` — 기능 연결 전 Reading Canvas prototype
2. [x] 세 기준 폭에서 prototype 사용자 승인
3. [x] `v3.0-verse-selection` — Selection model만 먼저 검증
4. [x] `v3.0-context-toolbar` — Highlight / Copy 연결
5. [x] `v3.0-reflection-composer` — 묵상 작성 연결
6. [x] Existing Notes Integration
7. [x] Responsive 통합 / 회귀 — Compact / Reading / Workspace 최종 확정
8. [x] Visual System Cleanup
9. [x] 주변 화면 정리
10. [x] v2.x 데이터/기능 회귀 테스트
11. [x] v3.0 release 문서 및 배포

---

## Major Release 완료 기준

- [x] Reading → Selection → 흔적 남기기 → Reading 루프가 v2.3보다 짧고 안정적이다.
- [x] iPhone 13 mini급 폭 검증 완료.
- [x] iPad/desktop 1:1 Split View급 폭 검증 완료.
- [x] Desktop Workspace 검증 완료.
- [x] 기존 묵상/하이라이트/읽기 기록 보존.
- [x] Backup/Restore 호환성 유지.
- [x] 각 feature별 Implementation Plan / Walkthrough / PR 기록 완료.
- [x] 최종 lint/build 및 회귀 검증 완료.
- [x] `release-notes-v3.0.0.md` 최종 배포 상태 확정.

---

## 다음 작업

Reading Canvas부터 Existing Notes와 Responsive 통합까지 구현·자동 검증·iPhone 실기기 승인을 완료했다.

v3.0.0은 `master` commit/tag `1099e00`으로 배포를 완료했다. 이후에는 iPad 실제 Split View, Desktop keyboard, PWA standalone에서 발견되는 비차단 미세 문제만 v3.0.x hotfix 후보로 다룬다.
