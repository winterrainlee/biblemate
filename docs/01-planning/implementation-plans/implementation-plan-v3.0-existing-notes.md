# BibleMate v3.0 Existing Notes Integration 구현 계획

- 작성일: 2026-09-09
- 작업 브랜치: `feature/v3.0-existing-notes`
- 기준 브랜치: `feature/v3.0`
- 상태: **구현·자동 검증 완료 / 통합 검수 대기**
- 선행 조건: Reflection Composer PR #6 통합 완료

## Goal

- 과거에 남긴 묵상이 본문 옆에 조용히 존재하고, 필요할 때 `이 장의 묵상`에서 바로 확인·수정·삭제할 수 있게 한다.
- 화면 폭이 달라도 같은 목록·상태·데이터 갱신 계약을 사용한다.
- 기존 `verse_notes` 데이터와 API를 그대로 사용하며 DB migration 없이 통합한다.

## 사용자가 경험할 흐름

```text
성경을 읽는다
  → 묵상이 있는 절의 왼쪽 표시 또는 ‘이 장의 묵상’을 누른다
  → 현재 장의 묵상 목록을 본다
  → 묵상을 읽거나 해당 절로 이동한다
  → 필요하면 복사·수정·삭제한다
  → 목록과 본문 표시가 즉시 같은 상태로 갱신된다
```

## 폭별 화면 동작

| 폭 | 표시 방식 | 읽기 흐름 |
|---|---|---|
| Compact `<600px` | 하단에서 올라오는 묵상 시트 | 본문을 가린 뒤 닫으면 읽던 위치로 복귀 |
| Reading `600–899px` | 본문 위 묵상 dialog | 단일 본문 구조를 유지하고 필요할 때만 표시 |
| Workspace `≥900px` | 본문 2/3 + 우측 묵상 패널 1/3 | 본문과 목록을 함께 보며 패널을 열고 닫음 |

- 묵상이 0개여도 `이 장의 묵상` 진입점을 비활성화하지 않고 empty state를 보여준다.
- 묵상 마진 표시를 누르면 해당 묵상이 열린 상태로 목록에 표시되고, 키보드 focus도 그 항목으로 이동한다.
- Workspace에서 Composer를 열면 묵상 패널과 동시에 경쟁하지 않고 같은 우측 영역을 Composer에 넘긴다.

## State Contract

```text
chapterNotesState
  contextKey: book:chapter
  items
  status: idle | loading | refreshing | error
  requestId

notesSurface
  open
  selectedNoteId
  returnVerse
  pendingDeleteId
```

- 장별 묵상 조회는 `refreshChapterNotes()` 한 경로로 통합한다.
- 응답의 `contextKey`와 `requestId`가 현재 값과 다르면 오래된 결과를 적용하지 않는다.
- 작성·수정·삭제가 성공하면 화면 상태를 먼저 확정한 뒤 목록 재조회 실패를 저장/삭제 실패로 되돌리지 않는다.
- 삭제 성공 시 해당 항목과 본문 마진 표시를 즉시 제거하고, 백그라운드 재조회로 서버 상태를 확인한다.
- `verse_range` 묵상은 첫 절을 본문 anchor로 사용하고 카드에는 전체 범위를 표시한다.

## Proposed Changes

### 신규 컴포넌트

- `client/src/components/ChapterNotesPanel.jsx`
- `client/src/components/ChapterNotesPanel.css`
- 필요 시 목록 정렬·범위 표시·상태 전환을 위한 순수 utility/test

### `BibleViewer.jsx`

- 기존 좌/우 묵상 sidebar dead JSX를 제거한다.
- floating 묵상 popup과 모바일 전용 목록의 중복 렌더링을 `ChapterNotesPanel` 하나로 통합한다.
- 모든 폭에서 접근 가능한 `이 장의 묵상 N개` trigger를 제공한다.
- 마진 표시 → 특정 묵상 선택, 카드 → 본문 절 이동, 수정 → 기존 Reflection Composer edit session을 연결한다.
- 복사·수정·삭제 후 toast와 focus 복귀를 일관되게 처리한다.
- 조회·저장·삭제 후 같은 `refreshChapterNotes()` 경로를 사용한다.

### 스타일

- 카드·그림자를 최소화하고 참조 구절, 작성일, 묵상 본문, 보조 액션 순서로 위계를 둔다.
- Compact action은 44px 이상으로 유지한다.
- 긴 묵상, 다중 구절 범위, 빈 상태, loading/error가 가로 overflow를 만들지 않게 한다.

## 삭제 및 오류 처리

- 삭제는 대상 구절 범위를 포함한 확인 문구를 보여준다.
- DELETE 실패 시 항목을 유지하고 실패 toast를 표시한다.
- DELETE 성공 후 refresh 실패는 삭제 실패로 표시하지 않으며 이미 제거된 항목을 되살리지 않는다.
- 목록 최초 조회 실패는 기존 목록을 거짓 empty state로 바꾸지 않고 재시도 경로를 제공한다.
- 수정 중 dirty draft 이탈 보호는 Reflection Composer의 공용 navigation guard를 그대로 사용한다.

## Accessibility

- overlay는 dialog/modal 의미와 focus trap, Escape 닫기를 제공한다.
- Workspace 패널은 non-modal complementary region으로 제공한다.
- 선택된 묵상은 `aria-current` 또는 동등한 상태로 전달한다.
- icon action은 복사·수정·삭제의 accessible name을 유지한다.
- 패널을 닫거나 본문으로 이동하면 원래 trigger 또는 대상 절로 focus를 복원한다.

## Non-Goals

- JournalPage의 전체 재설계
- 묵상 검색·정렬 옵션·태그
- 여러 묵상의 병합
- Markdown/자동 저장
- DB schema, API endpoint, backup format 변경
- Header/Layout 및 최종 Responsive 통합 수정

## Automated Verification

- 목록 정렬, `verse_range` 표시, 선택 항목 판정 순수 테스트
- 현재 장 전환과 겹친 오래된 조회 응답 무시
- 삭제 성공/실패/삭제 후 refresh 실패 상태 테스트
- 묵상 0개·1개·다수, 같은 첫 절의 여러 날짜 기록 렌더 계약
- 기존 Composer edit payload의 날짜·범위 보존 테스트 재실행
- navigation guard 테스트 재실행
- `npm run lint`, `npm run build`, `git diff --check`
- `npm run verify:v3-regression`으로 CRUD·backup 회귀 8개 재실행

## 최종 통합 검수에 묶을 항목

- iPhone에서 빈 장과 묵상 여러 개인 장의 시트 열기·닫기
- 마진 표시 → 해당 카드 → 본문 절 이동
- 기존 묵상 수정 후 중복 없이 같은 기록이 갱신되는지
- 삭제 취소/실패/성공과 본문 표시 동기화
- 긴 묵상과 다중 범위 카드의 스크롤
- Composer, 7버튼 Context Toolbar, Journal 결과 확인과 함께 한 번의 검수 서버 세션에서 확인

## 완료 조건

1. 기존 묵상 데이터가 migration 없이 전부 조회된다.
2. 모든 폭에서 `이 장의 묵상` 접근 경로가 유지된다.
3. 보기·본문 이동·복사·수정·삭제가 한 목록에서 동작한다.
4. 저장·삭제·장 전환의 비동기 응답이 목록과 마진 표시를 되돌리지 않는다.
5. 자동 검증을 통과하고 최종 통합 검수 대기 상태가 된다.
