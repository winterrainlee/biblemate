# BibleMate v3.0 Specification — Reading First

- 작성일: 2026-09-08
- 목표 버전: v3.0.0
- 기준 버전: v2.3.3
- 상태: 승인됨 / 구현 준비

---

## 1. 개요

BibleMate v3.0은 기능을 추가하는 버전이 아니라, v2.x에서 축적된 기능을 성경 읽기 경험 중심으로 다시 배열하는 Major Release다.

제품의 핵심 정의는 다음과 같다.

> **읽고, 걸리는 말씀에 흔적을 남기고, 다시 읽는다.**

BibleMate는 통계 앱이나 범용 노트 앱이 아니라, 개인이 성경을 읽다가 마음에 남는 구절에 표시와 묵상을 남기고 다시 읽는 도구를 지향한다.

v3.0의 목표는 다음 5가지다.

1. 성경 본문을 화면의 주인공으로 만들고, 조작 UI는 읽는 동안 최대한 물러나게 한다.
2. 구절 선택 → 표시/복사/묵상 → 다시 읽기의 흐름을 짧고 안정적으로 만든다.
3. iPhone 13 mini급 작은 화면과 iPad/데스크톱 1:1 분할 화면을 1급 사용 환경으로 취급한다.
4. 카드, 그림자, pill, 중첩 surface를 줄여 시각적 복잡성과 이른바 AI-generated UI 인상을 제거한다.
5. 기존 사용자 데이터와 백엔드/API 구조는 가능한 한 유지하면서 프론트엔드 UX 구조를 재설계한다.

---

## 2. 핵심 사용자 루프

```text
앱을 연다
  ↓
이어서 성경을 읽는다
  ↓
마음에 걸리는 구절을 탭한다
  ↓
표시한다 / 복사한다 / 묵상을 남긴다
  ↓
선택을 닫고 계속 읽는다
  ↓
장을 마친다
```

모든 기능은 이 루프를 방해하지 않는 한에서 존재한다.

읽기표, 통계, 과거 묵상, 설정, 백업은 중요하지만 Reading Loop 바깥의 보조 기능으로 취급한다.

---

## 3. 제품 디자인 원칙

### 3.1 본문이 인터페이스다

- 성경 본문을 커다란 카드 안에 넣지 않는다.
- 기본 화면 자체를 읽기 표면으로 취급한다.
- 본문 주변의 장식보다 글자 크기, 행간, 절 간격, 한 줄 길이, 여백을 우선한다.

### 3.2 읽는 동안 UI는 물러난다

- 기능을 항상 노출하지 않는다.
- 사용자가 구절을 선택했을 때만 관련 도구를 보여준다.
- 선택 또는 기록 때문에 본문 위치가 크게 이동하지 않아야 한다.

### 3.3 선택은 가볍게, 기록은 명확하게

- 구절은 탭으로 선택한다.
- 텍스트 드래그는 기본 선택 방식으로 사용하지 않는다.
- 하이라이트와 복사는 짧은 동작으로 끝난다.
- 묵상 작성처럼 입력 집중이 필요한 작업만 별도 Composer 상태를 사용한다.

### 3.4 화면 종류가 아니라 사용 가능한 폭에 반응한다

- `mobile / tablet / desktop` 기기 분류를 설계의 기준으로 삼지 않는다.
- 실제 BibleMate가 확보한 콘텐츠 폭을 기준으로 레이아웃을 바꾼다.
- iPad Pro라도 Split View에서 폭이 좁으면 Compact 또는 Reading 상태로 동작해야 한다.

### 3.5 장식보다 사용자의 흔적을 디자인한다

- 카드, 그림자, 둥근 모서리보다 하이라이트, 묵상 표시, 읽은 흔적의 표현을 우선한다.
- 기록이 있다는 사실은 읽기를 방해하지 않는 작은 시각 신호로 표현한다.

### 3.6 한 화면에 하나의 주역을 둔다

- Reading 상태의 주역은 성경 본문이다.
- Selection 상태의 주역은 선택된 구절이다.
- Composer 상태의 주역은 사용자의 묵상 입력이다.
- 여러 기능이 동시에 같은 시각적 무게를 갖지 않게 한다.

---

## 4. 핵심 인터랙션 상태

v3.0 성경 읽기 UX는 화면 페이지보다 상태를 중심으로 설계한다.

### 4.1 Reading

기본 상태다.

- 화면의 대부분을 성경 본문이 차지한다.
- 책/장/역본과 `Aa` 같은 최소한의 문맥 조작만 노출한다.
- 기존 양쪽 묵상 사이드바는 기본 Reading 상태에서 제거한다.
- 하이라이트와 묵상 존재 표시는 본문 자체에 조용히 남는다.

예시:

```text
요한복음 1장          개역한글    Aa

1  태초에 말씀이 계시니라 이 말씀이
   하나님과 함께 계셨으니 이 말씀은
   곧 하나님이시니라

2  그가 태초에 하나님과 함께 계셨고

3• 만물이 그로 말미암아 지은 바 되었으니
   지은 것이 하나도 그가 없이는 된 것이
   없느니라
```

`•` 같은 작은 표시는 해당 구절에 묵상이 있음을 나타내는 예시다. 최종 형태는 prototype에서 결정한다.

### 4.2 Selection

사용자가 구절을 탭하면 진입한다.

- 첫 탭에서 팝업이 본문 중앙을 덮지 않는다.
- 선택 구절은 배경색 또는 좌측 인디케이터로 표시한다.
- 다른 구절을 탭하면 선택에 추가한다.
- 선택된 구절을 다시 탭하면 선택에서 제거한다.
- 비연속 다중 선택을 허용한다.
- 선택 상태에서 Context Toolbar가 나타난다.

Context Toolbar 기본 액션:

1. 하이라이트 4색
2. 하이라이트 지우기
3. 묵상
4. 복사

모바일에서는 위 7개 액션을 `더보기` 없이 직접 노출한다.

### 4.3 Composer

묵상을 작성하거나 수정할 때 사용하는 집중 상태다.

Compact에서는 전체 화면 Composer를 사용한다.

Workspace에서는 Reading을 유지한 채 우측 패널 Composer를 사용할 수 있다.

동일한 데이터와 기능을 사용하고, 표현만 사용 가능한 폭에 따라 달라진다.

---

## 5. 반응형 레이아웃

정확한 breakpoint 값은 구현 prototype 검증 후 확정한다. 아래 값은 초기 기준이다.

| 상태 | 초기 기준 폭 | 기본 구조 |
|---|---:|---|
| Compact | `< 600px` | 본문 단독 + 선택 시 하단 도구막대 |
| Reading | `600–899px` | 넓은 단일 본문, 외부 기록 앱과 병행하기 좋은 구조 |
| Workspace | `≥ 900px` | 본문 + 필요 시 묵상/기록 패널 |

### 5.1 Compact

대표 환경:

- iPhone 13 mini
- 좁은 모바일 브라우저
- 좁은 앱 창

원칙:

- 한 손 터치를 우선한다.
- 주요 터치 타깃은 44px 이상으로 한다.
- 선택 도구는 하단 엄지 영역에 둔다.
- 묵상 작성은 키보드와 safe-area를 고려한 전체 화면 Composer를 사용한다.

### 5.2 Reading

대표 환경:

- iPad Pro 1:1 Split View
- 데스크톱에서 BibleMate 창을 절반가량 사용
- 중간 폭 브라우저

원칙:

- BibleMate 내부에서 다시 2~3열로 나누지 않는다.
- 단일 본문 읽기 경험을 유지한다.
- 외부 Notes, Obsidian 등 기록 앱과 병행 사용하기 좋게 한다.
- `이 장의 묵상` 진입점은 폭에 관계없이 접근 가능해야 한다.

### 5.3 Workspace

대표 환경:

- 넓은 데스크톱 브라우저
- iPad/데스크톱 전체 화면

원칙:

- 본문을 기본 주역으로 유지한다.
- 묵상 패널은 필요할 때만 열고 닫을 수 있다.
- 기존처럼 장의 앞/뒤 절을 기준으로 묵상을 양쪽 패널에 임의 분할하지 않는다.
- 권장 구조는 `본문 2/3 + 묵상 패널 1/3`이다.

---

## 6. Reading Canvas 기준

v3.0의 첫 구현 대상은 Reading Canvas다.

다른 기능을 연결하기 전에 실제 본문 읽기 경험부터 검증한다.

### 필수 검증 요소

- 본문 최대 폭
- 글자 크기
- 행간
- 절 간격
- 절 번호 크기와 위치
- 한 줄 길이
- 좌우 여백
- 장/역본 선택의 시각적 무게
- 라이트/다크 가독성
- 하이라이트 4색 위 본문 가독성

### Surface 원칙

기본 레이어는 다음 세 단계 이하를 지향한다.

```text
배경
본문
현재 활성 도구
```

다음 패턴은 기본값으로 사용하지 않는다.

```text
배경 → 큰 카드 → 작은 카드 → 버튼 면 → 팝업
```

그림자는 실제로 다른 표면 위에 떠 있어야 하는 요소에만 사용한다.

---

## 7. 구절 선택 및 터치 기준

### 7.1 선택 모델

- 구절 row 전체를 탭 가능한 영역으로 사용한다.
- 첫 탭: 단일 선택 시작.
- 추가 탭: 선택 추가.
- 선택된 절 재탭: 선택 해제.
- 선택이 0개가 되면 Reading 상태로 복귀.
- 비연속 선택을 허용한다.

### 7.2 터치 타깃

- 주요 버튼 최소 터치 영역: 44×44px.
- 색상 선택 버튼도 실제 hit area는 44×44px 이상을 확보한다.
- 시각 아이콘은 작게 보여도 hit area는 별도로 확보할 수 있다.
- 묵상 존재 표시 자체를 작은 24~28px 버튼으로 만들지 않는다.

### 7.3 스와이프

- 장 이동 스와이프는 유지 가능하다.
- 세로 스크롤과 충돌하지 않아야 한다.
- Selection 또는 Composer 상태에서는 장 이동 스와이프를 억제한다.

---

## 8. 하이라이트

- 기존 4색 사용자 하이라이트 체계는 유지한다.
- 하이라이트는 별도 카드나 badge가 아니라 본문 위 흔적으로 표현한다.
- 선택 후 색을 누르면 즉시 적용하고 Reading 상태로 복귀하는 것을 기본 흐름으로 한다.
- 사용자 정의 하이라이트 이름은 기존 설정/데이터를 유지한다.

---

## 9. 묵상 표시 및 작성

### 9.1 본문 표시

현재의 빨간 밑줄 + `📝` 아이콘 중첩 표현은 제거 대상이다.

묵상 존재 여부는 다음 중 하나처럼 작은 신호로 표현한다.

- 절 번호 옆 점
- 얇은 좌측 표시선
- 작은 마진 마커

최종 표현은 Reading Canvas prototype에서 결정한다.

### 9.2 묵상 작성

- Selection → 묵상 → Composer 순서로 진입한다.
- 선택한 구절 범위와 인용문을 명확히 표시한다.
- 작성 중 이탈 시 내용 유실을 방지한다.
- Compact와 Workspace에서 입력 컴포넌트/데이터 모델은 공유한다.

---

## 10. 복사

v3.0에서는 복사를 핵심 인터랙션으로 격상한다.

외부 기록 앱과의 1:1 분할 사용을 지원하기 위한 핵심 연결 기능이다.

### 기본 출력 규칙

단일 절:

```text
[요한복음 1:3 · 개역한글]
만물이 그로 말미암아...
```

연속 다중 절:

```text
[요한복음 1:3–5 · 개역한글]
...
```

비연속 다중 절:

```text
[요한복음 1:3, 5 · 개역한글]
...
```

### v3.0 필수 조건

- 실제 선택 범위를 출처에 정확히 표시한다.
- 현재 역본을 출처에 포함한다.
- 현재 다중 선택이 첫 절 하나로 축약되는 문제를 수정한다.

### 후속 확장 후보

- 본문만
- 인용 + 출처
- Markdown

위 출력 포맷 선택 기능은 v3.0 필수 범위에는 포함하지 않는다.

---

## 11. 넓은 화면의 묵상 패널

기존 `묵상 | 성경 | 묵상` 3열 구조는 제거한다.

기존 구조는 장의 중간 절을 기준으로 묵상을 좌/우 패널에 나누지만, 이 분할은 정보 구조상의 의미가 없다.

Workspace에서는 다음 구조를 기본으로 한다.

```text
┌────────────────────┬────────────┐
│                    │ 이 장의 묵상 │
│     성경 본문       │            │
│                    │ 요 1:3     │
│                    │ ...        │
│                    │            │
└────────────────────┴────────────┘
```

- 묵상 패널은 접을 수 있다.
- Reading이 기본 상태다.
- 패널을 닫으면 본문이 자연스럽게 넓어진다.

---

## 12. 시각 언어 정리

v2.3의 Paper & Ink / Candlelight 방향은 유지할 수 있다.

다만 v3.0에서는 토큰보다 **사용 규칙**을 더 중요하게 본다.

### 12.1 색

- 기본 본문: 종이/잉크 계열
- 주요 액션: primary 갈색
- 완료 상태: 녹색
- 사용자 표시: 4색 하이라이트

나머지 색은 최소화한다.

### 12.2 컨테이너

정보 구분 우선순위:

```text
여백 → 타이포그래피 → 얇은 구분선 → 면 → 카드/그림자
```

정보가 다르다는 이유만으로 자동으로 둥근 카드를 만들지 않는다.

### 12.3 Radius / Shadow

- radius는 기능적 이유가 있을 때만 사용한다.
- 모든 패널과 버튼에 같은 큰 radius를 반복하지 않는다.
- shadow는 modal, sheet, floating toolbar 등 실제 elevation이 필요한 곳에 제한한다.

### 12.4 Typography

- UI 글꼴과 본문 글꼴 분리 원칙은 유지한다.
- 본문은 세리프 중심으로 검증한다.
- 조작 도구는 산세리프 중심을 유지한다.
- 장 제목과 절 번호는 본문과 자연스럽게 연결되되 과도하게 장식하지 않는다.

---

## 13. v3.0 포함 범위

### P0 — Reading Foundation

- Reading Canvas 재설계
- Compact / Reading / Workspace 반응형 구조
- 기존 3컬럼 독서 구조 제거
- 본문 타이포그래피/여백/절 표시 재설계
- iPhone 13 mini급 뷰포트 검증
- iPad/데스크톱 1:1 분할 폭 검증

### P0 — Verse Interaction

- 탭 기반 단일/다중 구절 선택
- 선택 상태 시 Context Toolbar
- 44px 이상 터치 영역
- 하이라이트 연결
- 다중 구절 복사 출처 수정
- 역본 포함 복사

### P0 — Reflection Composer

- Compact 전체 화면 Composer
- Workspace 우측 패널 Composer
- 작성 중 이탈 보호
- 기존 묵상 데이터/API 재사용

### P1 — Existing Notes Integration

- 상단 `기존 묵상`에서 현재 장 전체 기록 접근
- 선택 메뉴 `관련 묵상`에서 선택 구절과 하나라도 범위가 겹치는 기록만 표시
- 묵상 존재 표시 단순화
- 넓은 화면 묵상 패널
- 묵상 보기/수정/삭제 액션 재배치

### P1 — Visual System Cleanup

- 중복 카드/그림자 제거
- border/radius/shadow 사용 규칙 통일
- header 시각 무게 축소
- Reading과 Journal의 시각 언어 정합

### P2 — Surrounding Screens

- Journal
- Reading History / Chart
- Settings
- Login
- PWA/브랜드 자산 정합성 확인

---

## 14. v3.0 제외 범위

아래 기능은 v3.0 핵심 UX 재설계와 섞지 않는다.

- 신규 AI 기능
- 성경 검색 기능 재설계
- 신규 성경 역본 추가
- 라이선스가 필요한 역본 도입
- 역본 대조 Parallel View
- Markdown 에디터 도입
- 새로운 통계 시스템
- 새로운 gamification / streak / 목표 기능
- 대규모 DB 스키마 재설계
- 인증 시스템 재설계
- 백업 포맷의 대규모 변경

필요하면 v3.1 이후 별도 Minor 범위로 검토한다.

---

## 15. 데이터 및 백엔드 원칙

v3.0은 frontend UX major redesign이다.

- 기존 `reading_logs`, `verse_notes`, `highlights`, `free_notes`, `daily_prayers`, `user_settings` 데이터를 유지한다.
- 기존 사용자 기록이 마이그레이션 없이 유지되는 것을 우선한다.
- 기존 API 계약을 가능한 한 유지한다.
- UI 재구성 때문에 DB 스키마를 변경하지 않는다.
- 데이터 모델 변경이 꼭 필요해지면 별도 승인 게이트를 둔다.

---

## 16. 구현 단위와 권장 순서

v3.0 전체를 하나의 feature로 구현하지 않는다.

권장 통합 브랜치 구조:

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

권장 구현 순서:

1. Reading Canvas prototype
2. Compact / Reading / Workspace 폭 검증
3. Verse Selection
4. Context Toolbar + Highlight + Copy
5. Reflection Composer
6. Existing Notes Integration
7. Responsive 통합 회귀 테스트
8. Surrounding Screens Visual Cleanup
9. v2.x 데이터/기능 회귀 테스트
10. v3.0 release 준비

각 단계는 별도 Implementation Plan, Walkthrough, PR 초안을 갖는다.

### Verse Selection 검증 예외 (2026-09-09 승인)

- 현재 개발 환경에서는 모바일 검수를 우선하며, Verse Selection 단계는 iPhone Safari 실기기 정상 확인을 완료 조건으로 사용한다.
- 375 / 650 / 1280px Desktop emulation, Desktop keyboard, Light / Dark × 하이라이트 4색 조합은 이 단계의 통합 차단 조건에서 제외한다.
- 이후 Desktop 환경에서 문제가 확인되면 v3.0 개발 중 후속 보완 또는 별도 hotfix로 처리한다.
- 이 예외는 Verse Selection 단계에만 적용하며, v3.0 전체 Responsive 통합 회귀 기준을 제거하지 않는다.

### Context Toolbar 검증 예외 (2026-09-09 승인)

- Context Toolbar + Highlight + Copy 단계도 iPhone Safari 실기기 정상 확인을 통합 완료 조건으로 사용한다.
- 375 / 650 / 1280px Desktop emulation, Desktop keyboard, Light / Dark 조합은 이 단계의 통합 차단 조건에서 제외한다.
- 이후 Desktop 환경에서 문제가 확인되면 v3.0 개발 중 후속 보완 또는 별도 hotfix로 처리한다.
- 이 예외는 Context Toolbar 단계에 한정하며, v3.0 전체 Responsive 통합 회귀 기준은 유지한다.

### 병렬 구현 및 단일 검수 배치 (2026-09-09 승인)

- B안에 따라 Reflection Composer, Surrounding Screens Visual Cleanup, 격리 회귀 Harness를 Wave 1에서 병렬 진행한다.
- `BibleViewer*`를 함께 사용하는 Reflection Composer와 Existing Notes Integration은 같은 핵심 트랙에서 순차 진행한다.
- Header/Layout/공유 폭 정리는 선행 트랙 통합 후 Responsive 통합 단계에서 한 번 수행한다.
- 각 기능의 Implementation Plan, Walkthrough, PR 승인 게이트는 유지한다.
- 중간 검증은 lint/build와 임시 DB 기반 자동 검증으로 수행하고, 사용자 검수 서버는 최종 통합 후 한 번만 연다.
- 자동 CRUD, backup/restore, 최종 검수 서버는 원본 `server/data/bible.db`가 아닌 임시 DB를 사용한다.
- 세부 실행·파일 소유권은 `docs/01-planning/parallel-batch-plan-v3.0.md`를 따른다.

---

## 17. Prototype 승인 게이트

첫 구현 단계는 기능 개발보다 Reading Canvas prototype을 우선한다.

고정 성경 본문 또는 기존 API 데이터를 이용해 최소 화면을 만든다.

다음 세 폭을 반드시 검증한다.

1. 약 375px — iPhone 13 mini급
2. 약 600~700px — iPad/데스크톱 1:1 분할급
3. 1000px 이상 — Workspace

이 단계에서는 다음 질문에 답해야 한다.

> **이 화면에서 20~30분 동안 성경을 읽고 싶은가?**

Desktop responsive emulation만으로 승인하지 않는다. iPhone 13 mini 실기기에서 실제 읽기/스크롤/터치 검수를 거쳐 사용자 승인을 받아야 한다.

사용자 승인 전에는 Selection / Composer 등 다음 단계 구현으로 넘어가지 않는다.

---

## 18. 수용 기준

### Reading

1. 기본 화면에서 성경 본문이 모든 조작 UI보다 먼저 시각적으로 인식된다.
2. 본문을 감싼 큰 floating card가 없어도 읽기 영역이 명확하다.
3. iPhone 13 mini급 폭에서 좌우 여백, 행간, 절 간격이 무너지지 않는다.
4. iPad/desktop 1:1 분할 폭에서 desktop 전용 다열 UI가 강제로 나타나지 않는다.
5. 769~1024px 같은 중간 폭에서도 묵상 접근 경로가 사라지지 않는다.

### Selection

6. 구절 한 번 탭으로 선택이 시작된다.
7. 여러 절을 추가/해제할 수 있다.
8. 선택 때문에 본문이 큰 폭으로 점프하거나 가려지지 않는다.
9. 모든 주요 터치 액션의 hit area가 44px 이상이다.

### Highlight / Copy

10. 하이라이트는 2회 이내의 명시적 터치로 적용 가능하다.
11. 여러 절 복사 시 출처 범위가 정확하다.
12. 복사 출처에 현재 역본이 표시된다.

### Composer

13. Compact에서는 키보드가 저장 액션을 가리지 않는다.
14. Workspace에서는 본문과 묵상 입력을 함께 볼 수 있다.
15. 작성 중 실수로 화면을 벗어나도 내용이 즉시 유실되지 않는다.

### Data / Regression

16. 기존 묵상, 하이라이트, 읽기 기록이 그대로 조회된다.
17. 기존 Backup/Restore 데이터 호환성을 깨뜨리지 않는다.
18. v2.x의 장 이동, 읽음 표시, 묵상 수정/삭제가 기능적으로 회귀하지 않는다.

---

## 19. 검증 기준

### 자동 검증

- `cd client && npm run lint`
- `cd client && npm run build`
- 기존 서버/API 테스트 유지

### Desktop / Emulation 검증

필수 뷰포트:

- iPhone 13 mini급 폭
- iPad Pro 1:1 Split View급 폭
- Desktop Workspace 폭

필수 상태:

- Reading
- 단일 Selection
- 연속 다중 Selection
- 비연속 다중 Selection
- Highlight
- Copy
- Composer
- 기존 묵상 보기/수정/삭제
- 읽음 표시
- 이전/다음 장 이동

필수 환경:

- Light / Dark
- Desktop browser

### 실기기 검수 — 필수

실기기 검수는 Desktop responsive emulation을 대체하지 않고 그 다음 단계로 수행한다.

개발 작업은 Codex Remote Control을 통해 원격으로 진행할 수 있다. 실기기 검수가 필요한 시점에만 개발 머신에서 BibleMate 개발 서버를 외부 접근 가능하게 실행한다.

기본 검수 경로:

```text
Codex Remote Control로 개발
        ↓
자동 검증
        ↓
Desktop responsive emulation
        ↓
개발 서버 외부 접근 실행
        ↓
Tailscale
        ↓
iPhone 13 mini 실제 Safari/PWA 검수
        ↓
사용자 승인
```

운영 원칙:

- 개발 서버는 검수 시점에 `0.0.0.0`에서 접근 가능하도록 실행한다.
- 개발 머신과 iPhone이 연결된 Tailscale 네트워크를 기본 실기기 연결 경로로 사용한다.
- Reading Canvas처럼 레이아웃/읽기/스크롤 중심 검수는 Tailscale HTTP 접근으로 충분하다.
- Clipboard, PWA, 기타 secure-context API를 검증하는 feature에서는 필요 시 Tailscale HTTPS/Serve를 사용한다.
- 실기기 검수 결과는 각 feature walkthrough에 기기, 접근 방식, 관찰 결과, 사용자 승인 여부와 함께 기록한다.
- Codex는 자동 검증과 emulation만으로 실기기 검수 게이트를 통과했다고 간주하지 않는다.

실기기에서 특히 확인할 항목:

- 실제 safe-area
- Safari 주소창 변화에 따른 viewport 높이
- 실제 손가락 터치 hit area
- 세로 스크롤과 장 이동 스와이프 충돌
- Composer 단계의 iOS 키보드와 저장 버튼 가림
- PWA standalone 모드에서의 레이아웃 차이
- 장시간 읽을 때 본문 폭, 행간, 절 간격의 체감

---

## 20. Major Release 완료 정의

v3.0은 화면이 새로워졌다는 이유만으로 완료하지 않는다.

다음 조건을 모두 충족해야 한다.

1. 핵심 사용자 루프 `읽기 → 선택 → 흔적 남기기 → 계속 읽기`가 v2.3보다 짧고 안정적이다.
2. iPhone 13 mini와 1:1 Split View가 보조 환경이 아니라 실제 검증 대상에 포함된다.
3. 성경 본문이 디자인의 주역이고 UI 장식은 보조 역할을 한다.
4. 기존 사용자 데이터가 유지된다.
5. v3.0에 필요하지 않은 신규 기능을 추가하지 않는다.
6. 각 기능 브랜치의 implementation plan, walkthrough, PR 기록이 완성된다.
7. 주요 모바일 feature가 iPhone 13 mini 실기기 검수와 사용자 승인을 통과한다.
8. 최종 회귀 검증과 release notes가 완료된다.

---

## 21. 다음 단계

v3.0 Scope는 사용자 승인을 받았다.

다음 순서로 진행한다.

1. `feature/v3.0` 통합 브랜치를 기준으로 개발한다.
2. 첫 작업 `feature/v3.0-reading-canvas`의 Implementation Plan을 승인한다.
3. Reading Canvas prototype을 구현한다.
4. Desktop/emulation 검증 후 Tailscale을 통해 iPhone 13 mini 실기기 검수를 수행한다.
5. Reading Canvas 사용자 승인 후 다음 feature로 진행한다.

**구현 계획 승인 전에는 애플리케이션 코드를 수정하지 않는다.**
