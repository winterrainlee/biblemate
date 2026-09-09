# BibleMate v3.0 Verse Selection 구현 계획

- 목표 버전: v3.0.0
- 작업: Verse Selection
- 기준 명세: `docs/02-specs/spec-v3.0.md`
- 기준 브랜치: `feature/v3.0`
- 작업 브랜치: `feature/v3.0-verse-selection`
- 상태: **구현·자동 검증 및 모바일 실기기 승인 완료**
- 구현계획 승인일: 2026-09-08

## Goal

- Reading Canvas의 읽기 흐름을 유지하면서, 구절을 한 번 탭해 단일·비연속 다중 선택하고 다시 탭해 해제할 수 있는 독립적인 Selection 모델을 만든다.

## User Review Required

> 아래 항목은 구현 전에 방향을 승인하고, 구현 후 실제 화면에서 다시 검수한다.

- [x] 첫 탭에서 본문 중앙 팝업을 열지 않고 선택 상태만 시작하는 방향
- [x] 선택된 구절을 배경과 왼쪽 인디케이터로 구분하되 기존 하이라이트 색은 보존하는 방향
- [x] 비연속 다중 선택을 허용하고, 다시 탭하면 해당 구절만 해제하는 방식
- [x] 마지막 선택을 해제하면 자동으로 Reading 상태로 돌아가는 방식
- [x] 이번 단계에는 Highlight / Copy / 묵상 액션을 연결하지 않고 최소 선택 상태·종료 UI만 제공하는 범위
- [x] Selection 중 묵상 마진 선을 누르면 선택을 종료하고 기존 묵상 상세만 여는 방식
- [x] iPhone 13 mini 실기기에서 탭과 세로 스크롤이 충돌하지 않는지 검수

## Selection State Contract

1. `selectedVerses`는 현재 장의 선택된 절 번호를 중복 없이 오름차순으로 보관한다.
2. 선택이 하나 이상이면 Selection 상태, 비어 있으면 Reading 상태다.
3. Reading 상태에서 구절을 탭하면 해당 구절 하나를 선택한다.
4. Selection 상태에서 다른 구절을 탭하면 비연속 여부와 관계없이 선택에 추가한다.
5. 선택된 구절을 다시 탭하면 해당 구절만 제거한다.
6. 마지막 구절이 제거되거나 닫기 동작을 수행하면 Reading 상태로 복귀한다.
7. 책·장·역본이 바뀌면 이전 본문에 대한 선택을 초기화한다.
8. Selection 상태에서는 장 이동 스와이프를 억제한다.
9. 선택된 구절의 인용문은 절 번호 오름차순으로 파생하며 별도 중복 상태로 관리하지 않는다.
10. 묵상 상세·작성 popup은 Selection과 독립된 overlay 상태다. 묵상 마진 선은 선택을 원자적으로 종료한 뒤 기존 묵상 상세만 연다.
11. 최소 선택 UI는 `n개 구절 선택됨 · 2, 5–6절` 상태와 닫기만 제공하는 non-modal bar이며, 후속 Context Toolbar의 골격으로 사용한다.

## Proposed Changes

### `client/src/components/BibleViewer.jsx`

- `isSelectionMode = selectedVerses.length > 0`을 Selection의 유일한 판별 기준으로 두고, `popup.visible`은 묵상 상세·작성 overlay 상태로 분리한다.
- `handleVerseClick`을 순수한 선택 토글 흐름으로 단순화하고 첫 탭의 중앙 popup 생성을 제거한다.
- 선택 토글은 함수형 상태 업데이트와 순수 helper를 사용한다. 절 번호를 `Number`로 정규화하고 `Set`으로 중복 제거한 뒤 오름차순으로 정렬한다.
- 실제 본문 로드 키인 `currentBook`, `currentChapter`, `currentVersion`이 바뀌는 즉시 선택과 진행 중인 touch 상태를 함께 초기화한다.
- Selection 또는 기존 overlay 상태에서는 장 이동 swipe 판정을 차단하고 touch 종료·취소 시 좌표 상태를 초기화한다. Selection 중에도 scroll과 tap을 구분하기 위한 이동량 추적은 유지한다.
- pointer/touch 시작점에서 약 10px 이상 이동한 gesture의 후속 click은 선택으로 처리하지 않는다. `preventDefault`나 `touch-action: none`으로 세로 스크롤을 막지 않는다.
- 이번 단계에서 필요한 선택 범위는 정렬된 절 번호에서 파생하고 popup state에 중복 저장하지 않는다. 선택 본문과 `selectedVerseItems`는 실제 소비자인 Context Toolbar 단계에서 파생한다.
- 최소 선택 bar에는 선택 개수/범위와 닫기만 제공하고 Highlight / Copy / 묵상 액션은 노출하지 않는다.
- 선택 bar가 나타날 때 포커스를 강제로 이동하지 않는다. 닫기와 Escape로 종료하면 마지막 조작 구절로 포커스를 복귀한다.
- 기존 묵상 마진 선은 Selection과 독립된 sibling control로 유지한다. 마진 선 진입 시 선택을 종료하고 묵상 상세를 열며, 상세 닫기 후 Reading으로 돌아간다.
- 기존 묵상 상세의 “구절 메뉴로 돌아가기”는 중앙 액션 메뉴로 복귀시키지 않고 Reading으로 닫는 흐름으로 정리한다.
- Selection 상태는 `BibleViewer` 내부에 유지한다. 다음 Context Toolbar가 상위 소유를 요구할 경우 `{ book, chapter, version, verseNumbers, verseItems }` 경계는 후속 계획에서 결정한다.

### `client/src/components/BibleViewer.css`

- inline 선택 스타일을 `.is-selected` 상태 class로 옮겨 Light / Dark 양쪽에서 일관되게 표현한다.
- 하이라이트 `background-color`는 유지하고, 선택은 pointer event가 없는 반투명 overlay와 row 안쪽 3px 인디케이터로 별도 합성한다.
- 묵상 마진 선은 row 바깥쪽, 선택 인디케이터는 row 안쪽에 두어 의미와 hit area를 분리한다.
- Compact / Reading / Workspace에서 선택 상태가 본문 줄바꿈과 절 간격을 바꾸지 않게 한다.
- 기존 모바일 헤더를 접는 `.selection-mode` 규칙을 새 Selection 상태에 재사용하지 않는다. 선택 시작·종료에도 헤더 높이와 본문 위치를 유지한다.
- Compact의 최소 선택 bar는 기존 하단 action bar 슬롯을 교체해 레이아웃 높이를 유지하고, 본문 하단 여백에 bar 실높이와 safe-area를 반영한다.
- 구절 row는 wrapper 아래에 구절 선택 button과 묵상 indicator button을 sibling으로 배치해 interactive control 중첩을 피한다.
- 선택 button은 `aria-pressed`, 명확한 accessible name, `:focus-visible`, Enter/Space 토글을 제공한다. 상태 문구는 `aria-live="polite"`로 알린다.
- 구절 선택 표면과 닫기 조작은 최소 44×44px 터치 영역을 확보한다.
- 터치 중 active 피드백이 선택 확정처럼 오인되지 않도록 짧고 절제된 상태 변화를 사용한다.
- hover 피드백은 hover 가능 환경에만 적용하고 `prefers-reduced-motion`에서는 선택 bar 전환 motion을 제거한다.

### 상태 전이

```text
Reading
  └─ 구절 탭 → Selection(1)
                    ├─ 미선택 구절 탭 → Selection(n+1)
                    ├─ 선택 구절 탭 → Selection(n-1)
                    ├─ 묵상 마진 선 → 선택 종료 → NoteDetail
                    ├─ 마지막 선택 해제 → Reading
                    ├─ 닫기/Escape → Reading + 마지막 조작 구절 focus
                    └─ 책/장/역본 변경 → Reading

NoteDetail
  └─ 닫기/뒤로 → Reading
```

## Non-Goals

- Context Toolbar 완성
- 하이라이트 적용·삭제 흐름 변경
- 복사 포맷 및 다중 절 복사 수정
- Reflection Composer 또는 기존 묵상 편집 흐름 변경
- 연속 범위 드래그 선택, 길게 누르기 선택, OS 텍스트 선택 재설계
- DB/API 또는 데이터 스키마 변경
- Responsive breakpoint 재설계
- Journal / Chart / Settings 변경

## Verification Plan

### Automated Checks

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check` (working tree)
- [x] `git diff --check origin/feature/v3.0...HEAD` (커밋 후)

현재 별도 unit/e2e 테스트 러너가 없으므로 선택 상태 전이는 브라우저 시나리오로 직접 검증한다. 테스트 기반을 새로 도입하는 것은 이번 feature 범위에 포함하지 않는다.

### Interaction Verification

- [ ] 첫 탭으로 단일 선택되고 중앙 popup이 열리지 않음
- [ ] 다른 절을 탭하면 비연속 다중 선택 가능
- [ ] 선택된 절을 다시 탭하면 해당 절만 해제됨
- [ ] 마지막 선택 해제와 닫기에서 Reading 상태로 복귀
- [ ] 책·장·역본 변경 후 이전 선택이 남지 않음
- [ ] 선택 구절 개수와 범위가 실제 선택 상태와 일치
- [ ] `[3]`은 `요한복음 1:3`, `[3,4,5]`는 `요한복음 1:3–5`, `[3,5,6,9]`는 `요한복음 1:3, 5–6, 9`로 표시
- [ ] 기존 4색 하이라이트 위에서도 선택 여부를 구분할 수 있고 원래 색이 보존됨
- [ ] 선택/해제만으로 `onHighlight` 또는 저장 API가 호출되지 않음
- [ ] 묵상 마진 선을 누르면 기존 묵상 상세가 열리고 구절 선택이 함께 토글되지 않음
- [ ] 묵상 상세 진입 시 기존 선택이 종료되고 상세 닫기 후 Selection이 다시 생기지 않음
- [ ] Selection 상태에서 장 이동 swipe가 발생하지 않음
- [ ] Reading 상태의 수평 swipe는 한 번만 장을 이동하며 구절을 함께 선택하지 않음
- [ ] 짧은 절·긴 절·묵상 표시 절에서 위/아래 스크롤 각 10회 동안 선택 0회
- [ ] 짧은 flick, 느린 scroll, horizontal swipe를 본문에서 시작해도 선택과 장 이동이 동시에 발생하지 않음
- [ ] `touchcancel` 또는 화면 밖 종료 후 다음 탭이 이전 gesture의 영향을 받지 않음
- [ ] 빠른 연속 탭에서도 중복 절 번호가 생기지 않고 같은 절 두 번 탭은 최종 해제 상태
- [ ] 키보드 포커스, Enter/Space, `aria-pressed`, 선택 상태 알림이 동작함
- [ ] Escape와 닫기로 전체 선택을 해제하고 마지막 조작 구절로 focus가 복귀함
- [ ] 선택되지 않은 본문 여백을 눌러도 선택이 임의로 종료되지 않음
- [ ] 첫 절·화면 중앙 절·화면 하단의 긴 절에서 선택 전후 scroll 위치, row 높이, 줄바꿈이 변하지 않음
- [ ] 선택 종료 후 모바일 헤더와 하단 읽기 action bar가 정상 상태를 유지함
- [ ] 빈 본문·로딩 중 Selection UI가 남지 않음

### Responsive / Theme Verification

아래 Desktop 검증은 2026-09-09 사용자 승인으로 이번 feature의 통합 차단 조건에서 제외하고, 이후 문제 발견 시 hotfix 후보로 유지한다.

- [ ] 375×812 Compact
- [ ] 650×900 Reading
- [ ] 1280×900 Workspace
- [ ] Light / Dark
- [ ] 짧은 절과 여러 줄짜리 긴 절
- [ ] 기존 묵상 표시가 있는 절과 하이라이트된 절
- [ ] Light / Dark × 기존 하이라이트 4색에서 원래 색, 선택 overlay, 두 인디케이터를 함께 식별 가능
- [ ] Compact ↔ Reading ↔ Workspace 폭 변경 시 선택 집합은 유지되고 UI만 재배치됨
- [ ] 최소 선택 bar가 마지막 절이나 iPhone 홈 인디케이터를 가리지 않음

### Real-device Verification — Required Gate

- [x] iPhone 13 mini Safari에서 일반 스크롤 중 오선택이 드묾
- [x] 한 손으로 단일·다중 선택과 개별 해제가 자연스러움
- [x] 선택 상태에서 주소창 변화와 safe-area 때문에 상태 UI가 가려지지 않음
- [x] 선택 때문에 읽던 위치가 이동하거나 본문 레이아웃이 흔들리지 않음
- [x] 사용자 최종 승인 (2026-09-09)

## Acceptance Gate

다음 질문에 사용자가 긍정적으로 답하고 실기기 검수를 승인해야 이 feature를 완료한다.

> **읽다가 마음에 걸린 절을 생각 없이 한 번 탭하고, 필요한 만큼 더 고르거나 바로 해제할 수 있는가?**

구현·검증 완료 후 `walkthrough-v3.0-verse-selection.md`와 PR 초안을 작성하고, 승인 후에만 `feature/v3.0`에 통합한다.

---

## Agent Review

### 🧪 QA Engineer Review

- Selection과 기존 묵상 popup을 분리하고, 마진 선 진입 시 선택 종료 → NoteDetail → Reading 전이를 고정했다.
- 책·장·역본 전환, 비동기 로딩, 빠른 연속 탭, touch cancel, 스크롤 20회 등 재현 가능한 회귀 시나리오를 추가했다.
- 선택 범위 표시 예시와 하이라이트 저장 API 비호출 조건을 acceptance 항목으로 명시했다.

### 🎨 UI/UX Review

- 선택 진입 시 기존 모바일 헤더를 접지 않고, 최소 선택 bar가 기존 하단 슬롯을 교체해 읽던 위치를 유지하도록 보완했다.
- 하이라이트와 선택 overlay, 묵상 마진 선과 선택 인디케이터를 서로 다른 시각 레이어와 위치로 분리했다.
- 세 폭과 Light / Dark × 4색 하이라이트에서 레이아웃 무점프와 동시 식별을 검증한다.

### ✨ Interaction Design Review

- 약 10px 이동 임계값으로 tap과 scroll을 구분하고, Selection 상태에서는 장 이동 swipe를 억제한다.
- 상태 bar에 선택 개수·범위와 닫기만 두며 자동 focus 이동 없이 `aria-live`로 상태를 알린다.
- Escape/닫기 후 마지막 조작 구절 focus 복귀, gesture cancel 초기화, 빠른 연속 탭 시나리오를 추가했다.

### 💻 Frontend Review

- `selectedVerses.length > 0`과 `popup.visible`의 책임을 분리하고 함수형 업데이트·숫자 정규화·순수 파생 데이터 원칙을 명시했다.
- 구절 선택 button과 묵상 indicator button을 sibling으로 구성해 중첩 interactive control을 피한다.
- Selection은 이번 단계에서 `BibleViewer` 내부에 유지하고 상위 상태 승격은 후속 Toolbar 계획으로 유보한다.

### 🔧 Backend Review

- Selection은 현재 장의 일시적인 client state이므로 DB/API/schema 변경이 필요 없음을 확인했다.
- 다중 하이라이트 요청의 batch·부분 실패 처리는 Context Toolbar 단계의 검토 대상으로 유지한다.
