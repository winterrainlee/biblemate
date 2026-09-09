# BibleMate v3.0 Context Toolbar + Highlight + Copy 구현 계획

- 목표 버전: v3.0.0
- 작업: Context Toolbar + Highlight + Copy
- 기준 명세: `docs/02-specs/spec-v3.0.md`
- 기준 브랜치: `feature/v3.0`
- 작업 브랜치: `feature/v3.0-context-toolbar`
- 상태: **구현·자동 검증 및 모바일 실기기 승인 완료**
- 작성일: 2026-09-09
- 구현계획 승인일: 2026-09-09

## Goal

- Verse Selection에서 고른 말씀을 읽던 자리에서 바로 하이라이트하거나 복사하고, 묵상 작성으로 넘길 수 있는 Context Toolbar를 완성한다.
- 하이라이트 적용과 복사는 짧고 예측 가능하게 끝내며, 성공 후 Reading 상태로 복귀한다.
- 선택 범위·본문·역본을 하나의 파생 데이터로 다뤄 단일·연속·비연속 선택 결과가 서로 어긋나지 않게 한다.

## User Review Required

> 아래 방향은 구현 전에 승인하고, 구현 후 iPhone 실기기에서 다시 검수한다.

- [x] 현재 하단 선택 bar를 상태 행 + 액션 행의 Context Toolbar로 확장
- [x] 액션 행에 하이라이트 4색, 지우기, 묵상, 복사를 직접 노출해 구절 선택 후 한 번의 추가 터치로 실행
- [x] 사용자 추가 승인에 따라 `더보기`를 제거하고 지우개를 일곱 번째 직접 버튼으로 배치 (2026-09-09)
- [x] 색상 버튼은 선택 전체를 해당 색으로 **설정**하고, 같은 색을 다시 눌러도 지우지 않음
- [x] 하이라이트 지우기는 선택 중 실제 하이라이트가 있는 절에만 적용
- [x] 하이라이트·복사 성공 시 선택을 닫고 Reading으로 복귀, 실패 시 선택을 유지해 재시도
- [x] 복사 본문은 단일 절은 본문만, 다중 절은 각 줄 앞에 절 번호를 붙이는 형식
- [x] 묵상 버튼은 선택 범위와 인용문을 기존 작성 popup에 전달하되 Composer 재설계는 다음 단계로 유지
- [x] B안 승인: iPhone 모바일 승인을 통합 게이트로 사용하고 Desktop 조합은 후속 hotfix 후보로 유지

## Interaction Contract

### Context Toolbar

1. `selectedVerses.length > 0`일 때 기존 최소 선택 bar 자리에 Context Toolbar가 나타난다.
2. 첫 행에는 선택 개수·범위와 닫기를 배치한다.
3. 둘째 행에는 하이라이트 4색, 지우기, 묵상, 복사까지 7개 버튼을 배치한다.
4. 모든 액션은 실제 hit area 44×44px 이상을 확보한다.
5. 선택이 바뀌면 선택 개수·범위와 액션 대상이 같은 렌더에서 함께 갱신된다.
6. 액션 실행 중에는 중복 실행을 막고 `aria-busy`와 비활성 상태를 제공한다.
7. 닫기와 Escape는 저장 없이 선택만 해제하고 마지막 조작 구절로 focus를 복귀한다.

### Highlight

1. 색상 버튼은 선택된 모든 절을 선택한 색으로 설정한다.
2. 이미 같은 색인 절은 유지하고, 다른 색인 절은 새 색으로 바꾼다.
3. 색상 재선택을 삭제 동작으로 사용하지 않는다. 삭제는 독립된 지우개 버튼으로만 수행한다.
4. 지우기는 선택 중 하이라이트가 존재하는 절만 대상으로 하며, 대상이 없으면 비활성화한다.
5. 성공하면 하이라이트 목록을 한 번 다시 동기화하고 선택을 닫는다.
6. 일부 요청을 포함해 하나라도 실패하면 서버 상태를 다시 불러오고 선택을 유지하며 오류 toast를 보여준다.
7. 실행 도중 책·장·역본이 바뀌면 이전 문맥의 완료 응답이 새 본문의 선택을 닫지 않도록 문맥 key를 확인한다.

### Copy

1. 복사 대상은 현재 문맥의 `activeSelectedVerses`와 `verses`에서 절 번호 오름차순으로 파생한다.
2. 출처 범위는 연속 구간에 en dash(`–`), 비연속 구간에 쉼표를 사용한다.
3. 출처에는 책 표시 이름, 장, 실제 선택 범위, 현재 역본 표시명을 포함한다.
4. 출력 형식은 아래로 고정하며 이번 단계에서 포맷 선택 UI를 추가하지 않는다.

단일 절:

```text
[요한복음 1:3 · 개역한글]
만물이 그로 말미암아...
```

연속·비연속 다중 절:

```text
[요한복음 1:3, 5–6 · 개역한글]
3 만물이 그로 말미암아...
5 빛이 어둠에 비취되...
6 하나님께로서 보내심을 받은...
```

5. Clipboard API를 우선 사용하고 비보안 HTTP 검수 환경에서는 기존 textarea fallback을 유지한다.
6. 복사 성공 시 success toast 후 선택을 닫고, 실패 시 error toast와 선택 상태를 유지한다.

### Reflection Handoff

1. 묵상 버튼은 선택 첫 절을 대표 절로, 전체 선택 범위를 `verse_range`로 사용한다.
2. 인용문은 선택된 모든 본문을 절 번호 순으로 결합해 기존 작성 popup에 전달한다.
3. 작성 popup이 열린 동안 선택 데이터는 제출에 필요한 범위 정보로 유지한다.
4. 저장 성공 시 기존처럼 선택과 popup을 함께 닫는다.
5. Compact 전체 화면 Composer, Workspace 우측 패널, 이탈 보호 개선은 다음 Reflection Composer 작업으로 남긴다.

## Derived Selection Data

`BibleViewer` 안에서 다음 값을 별도 state로 복제하지 않고 현재 props/state로부터 파생한다.

```text
selectionContext = { book, bookName, chapter, version, versionLabel }
selectedVerseNumbers = [3, 5, 6]
selectedVerseItems = [{ verse: 3, text: "..." }, ...]
selectedVerseRange = "3, 5–6"
```

- `selectedVerseItems`는 현재 `verses`에 실제 존재하는 선택만 포함한다.
- 선택 번호와 본문 데이터가 일치하지 않으면 액션을 실행하지 않고 선택을 유지한다.
- Context Toolbar, Highlight, Copy, Reflection handoff가 같은 파생 데이터를 공유한다.

## Proposed Changes

### `client/src/components/BibleViewer.jsx`

- 현재 `verse-selection-bar`를 상태 행과 액션 행을 가진 Context Toolbar markup으로 확장한다.
- 선택된 절 번호, 본문 항목, 범위, 현재 역본 표시명을 하나의 selection payload로 파생한다.
- 색상 4개를 native button으로 제공하고 사용자 정의 하이라이트 이름을 accessible label과 보조 텍스트에 반영한다.
- 지우기, 묵상, 복사, 닫기 버튼과 pending/error 상태를 연결한다.
- 하이라이트 적용·삭제는 새 다중 처리 callback에 selection payload를 넘긴다.
- 복사는 구조화된 payload를 `onCopyCitation`에 넘기고 성공한 경우에만 선택을 닫는다.
- 묵상 버튼은 기존 popup state에 대표 절, 범위, 결합 인용문을 설정한다. Composer 내부 UI는 재설계하지 않는다.
- popup 안에 남은 구형 `menu` 하이라이트·복사 UI의 도달 불가능한 경로를 정리한다.
- 실행 중 문맥 변경, 빠른 중복 탭, unmount 후 완료 응답에 대한 상태 갱신을 방어한다.
- persistent `aria-live="polite"`를 유지하고 실행 오류는 기존 toast 경로를 사용한다.

### `client/src/components/BibleViewer.css`

- 선택 bar를 두 행 Context Toolbar로 확장하되 본문 줄바꿈과 현재 scroll 위치를 바꾸지 않는다.
- Compact에서는 safe-area 위 고정 하단 toolbar, Reading/Workspace에서는 본문 폭을 넘지 않는 floating toolbar로 표현한다.
- 색상 swatch의 시각 크기와 44px hit area를 분리한다.
- 긴 비연속 범위는 한 줄 말줄임 처리하되 accessible name에는 전체 범위를 제공한다.
- pending, focus-visible, hover 가능 환경, disabled, reduced-motion 상태를 정의한다.
- toolbar 실높이에 맞춰 본문 하단 여백을 확보해 마지막 절과 홈 인디케이터가 가려지지 않게 한다.

### `client/src/pages/ReadingDashboard.jsx`

- 단일 toggle 중심 `handleHighlight`를 다중 명시 적용·삭제 callback으로 분리한다.
- 대상별 API 요청을 완료한 뒤 `loadHighlights()`를 한 번만 호출한다.
- 같은 색은 유지하고 삭제는 별도 callback에서만 실행한다.
- 부분 실패 시 최종 서버 상태를 다시 동기화하고 오류를 상위로 전달한다.
- `handleCopyCitation`이 구조화된 payload를 받아 정확한 범위·역본·다중 본문을 포맷하도록 변경한다.
- Clipboard API와 HTTP fallback을 한 경로에서 처리하고 성공·실패를 Promise로 반환한다.

### `client/src/services/api.js` / `server/`

- 기존 `POST /highlights`, `DELETE /highlights/:id` 계약을 재사용한다.
- DB schema, backup/restore 형식, 신규 batch endpoint는 추가하지 않는다.
- 다중 요청의 일부 실패는 frontend 재조회 + 선택 유지 정책으로 수습한다.

## State Transition

```text
Selection
  ├─ 색상 → ApplyingHighlight → 성공: Reading / 실패: Selection
  ├─ 지우기 → RemovingHighlight → 성공/실패 처리
  ├─ 복사 → Copying → 성공: Reading / 실패: Selection
  ├─ 묵상 → ExistingComposer(selection payload)
  └─ 닫기/Escape → Reading + focus restore
```

## Non-Goals

- Reflection Composer의 전체 화면/우측 패널 재설계 및 이탈 보호 변경
- 하이라이트 사용자 정의 색상 또는 5번째 색상 추가
- 복사 포맷 선택, Markdown 옵션, 공유 sheet
- 연속 범위 드래그 선택 또는 OS 텍스트 선택 재설계
- 하이라이트 batch API와 DB transaction 추가
- DB schema, backup/restore 형식 변경
- Responsive breakpoint 재설계
- Journal / Chart / Settings 변경

## Verification Plan

### Automated Checks

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check`
- [ ] `git diff --check origin/feature/v3.0...HEAD` (커밋 후)

별도 unit/e2e 테스트 러너가 없으므로 순수 포맷 helper와 상태별 동작은 브라우저 시나리오로 검증한다. 테스트 기반 신규 도입은 이번 범위에 포함하지 않는다.

### Highlight Verification

- [ ] 단일 선택 후 색상 터치로 해당 색이 적용되고 Reading으로 복귀
- [ ] 연속·비연속 다중 선택 전체에 같은 색 적용
- [ ] 같은 색이 이미 있는 절은 삭제되지 않고 유지
- [ ] 서로 다른 기존 색이 섞인 선택도 모두 새 색으로 변경
- [ ] 지우기는 하이라이트가 있는 선택 절만 삭제하고 대상이 없으면 비활성
- [ ] 빠른 연속 실행 중 중복 API 요청 방지
- [ ] API 성공 시 한 번 재조회, 일부/전체 실패 시 재조회·선택 유지·오류 toast
- [ ] 실행 도중 문맥 변경 시 이전 응답이 새 본문 UI를 닫지 않음

### Copy Verification

- [ ] 단일 절이 `[책 장:절 · 역본]` + 줄바꿈 + 본문으로 복사됨
- [ ] `[3,4,5]`가 `3–5`, `[3,5,6]`이 `3, 5–6`으로 표시됨
- [ ] 다중 본문이 절 번호 오름차순으로 한 줄씩 복사됨
- [ ] 개역한글 / WEB / BBE 표시명이 현재 역본과 일치
- [ ] HTTPS Clipboard API와 Tailscale HTTP textarea fallback 성공 경로 확인
- [ ] 성공 시 선택 종료와 toast, 실패 시 선택 유지와 오류 toast
- [ ] 빈 선택 또는 본문 불일치 상태에서 잘못된 복사 실행 없음

### Toolbar / Reflection Verification

- [ ] iPhone 13 mini에서 모든 주요 액션 hit area 44×44px 이상
- [ ] toolbar가 마지막 절과 홈 인디케이터를 가리지 않음
- [ ] 선택 변경 시 개수·범위·액션 대상이 즉시 일치
- [ ] 긴 비연속 범위에서도 toolbar가 화면 밖으로 넘치지 않음
- [ ] 묵상 버튼이 대표 절, 전체 범위, 선택 인용문을 기존 Composer에 전달
- [ ] 기존 Composer 저장 시 `verse`와 `verse_range`가 정확하고 선택이 종료됨
- [ ] Escape/닫기 후 마지막 선택 구절로 focus 복귀
- [ ] pending 상태가 보조기기에 전달되고 중복 실행이 차단됨

### Responsive / Theme Verification

- [ ] 375×812 Compact
- [ ] 650×900 Reading
- [ ] 1280×900 Workspace
- [ ] Light / Dark × 기존 하이라이트 4색
- [ ] 폭 변경 시 선택과 toolbar 액션 유지

2026-09-09 사용자 승인에 따라 이번 단계는 iPhone 모바일 승인을 통합 게이트로 사용한다. Desktop 조합은 후속 hotfix 후보로 남기며 v3.0 전체 Responsive 통합 회귀 범위는 유지한다.

### Real-device Verification — Required Gate

- [x] iPhone Safari에서 하이라이트 4색, 지우기, 묵상, 복사, 닫기를 한 손으로 누르기 쉬움
- [x] toolbar가 주소창 변화와 safe-area에서 가려지지 않음
- [x] 하이라이트 적용 후 원래 읽던 위치에서 계속 읽을 수 있음
- [x] HTTP fallback 복사 결과가 외부 기록 앱에 정확히 붙여넣어짐
- [x] 7개 직접 버튼 재배치 사용자 확인
- [x] 사용자 최종 승인 (2026-09-09)

## Acceptance Gate

> **선택한 말씀을 읽던 자리에서 바로 표시하거나 정확한 출처와 함께 복사하고, 곧바로 다시 읽을 수 있는가?**

구현·검증 완료 후 `walkthrough-v3.0-context-toolbar.md`와 PR 초안을 작성하고, 승인 후에만 `feature/v3.0`에 통합한다.

## Risks and Mitigations

- **다중 API 부분 실패**: 완료 후 서버 재조회, 오류 toast, 선택 유지로 재시도 가능하게 한다.
- **혼합 색 선택의 토글 모호성**: 색상은 명시적 설정, 삭제는 별도 액션으로 분리한다.
- **선택 데이터와 본문 불일치**: 문맥 key와 실제 verse item 개수를 실행 직전에 검증한다.
- **작은 화면 toolbar 과밀**: 상태 행과 7개 액션 행을 분리하고 iPhone 13 mini 폭에서 44px hit area를 먼저 확보한다.
- **기존 Composer 범위 침범**: 이번에는 payload 전달만 연결하고 레이아웃·이탈 보호는 다음 계획으로 제한한다.
