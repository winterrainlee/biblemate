# PR: v3.0 — Verse Selection

**Branch**: `feature/v3.0-verse-selection` → `feature/v3.0`
**Date**: 2026-09-09
**Version**: v3.0.0
**Status**: Ready — 모바일 우선 완료 기준 승인

## 1. 주요 변경 사항

- [x] 첫 구절 탭에서 중앙 popup 없이 Selection 상태 진입
- [x] 단일·비연속 다중 선택과 개별·전체 해제
- [x] 함수형 update, Number 정규화, Set 중복 제거와 오름차순 정렬
- [x] 책·장·역본 context가 바뀌면 이전 선택을 즉시 렌더·상태에서 제거
- [x] 기존 하이라이트 위에 선택 overlay와 안쪽 indicator를 별도 합성
- [x] 구절 선택과 묵상 마진 선을 sibling button으로 분리
- [x] native keyboard toggle, `aria-pressed`, persistent live status와 focus 복귀
- [x] 약 10px 이상 touch 이동 후 동일 구절의 합성 click 억제
- [x] Selection 상태에서 장 이동 swipe 판정 억제
- [x] 선택 개수·범위와 닫기만 제공하는 최소 selection bar

## 2. 검증 결과

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] working tree `git diff --check`
- [x] iPhone Safari + Tailscale HTTP 실기기 검수
- [x] 사용자 “정상 확인” 승인
- [ ] 375×812 / 650×900 / 1280×900 Desktop UI 검증 — 후속 hotfix 후보
- [ ] Desktop Enter/Space/Escape 및 focus 복귀 — 후속 hotfix 후보
- [ ] Light / Dark × 기존 하이라이트 4색 시각 검증 — 후속 hotfix 후보
- [x] 커밋 후 `git diff --check origin/feature/v3.0...HEAD`

## 3. Review Point

- 스크롤·flick 후 구절이 의도치 않게 선택되지 않는지
- 선택 시작·종료에서 읽던 위치와 본문 줄바꿈이 유지되는지
- 기존 하이라이트 색과 선택 상태를 동시에 식별할 수 있는지
- 묵상 마진 선과 구절 선택이 한 번의 입력에서 함께 실행되지 않는지
- 책·장·역본 전환 직후 이전 선택이 새 본문에 재사용되지 않는지
- Selection 단계가 Context Toolbar, Copy, Highlight 저장, Composer로 확장되지 않았는지

## 4. Agent Review

### 🔐 Security Review

- Critical 없음, Warning 없음.
- 신규 사용자 입력 처리, HTML 주입, 인증정보, API 또는 데이터 저장 경로 변경 없음.

### 🧪 QA Review

- Critical 없음, Warning 없음.
- touch click 억제, context 전환 race, 하단 scroll clamp, 검증 명령 범위 문제를 수정 후 재검토했다.
- lint/build/working-tree diff check와 iPhone 사용자 승인 기록을 확인했다.

### 🎨 UI/UX Implementation Review

- Critical 없음, Warning 없음.
- 선택 overlay와 기존 하이라이트를 별도 레이어로 합성하고, 선택 시작·종료에 따른 조건부 padding 변화를 제거했다.
- Desktop 3폭 및 Light/Dark × 4색 확인은 사용자 승인에 따라 후속 hotfix 후보로 이관했다.

### ✨ Interaction Implementation Review

- Critical 없음, Warning 없음.
- 이동 gesture의 target과 700ms 억제 범위를 기록해 지연 합성 click을 차단한다.
- persistent live status, native button/`aria-pressed`, Escape/닫기 후 focus 복귀를 구현했다.

### 🔧 Backend Implementation Review

- `server/`, DB, API service, schema 변경 없음.
- Selection은 현재 본문의 일시적인 client state로 유지한다.

## 5. 알려진 제한 / 후속 검증

- 이 세션에는 Browser 스킬이 요구하는 제어 런타임이 없어 자동 Desktop UI 조작을 수행하지 못했다.
- unit/e2e 테스트 러너가 없어 gesture와 키보드 회귀는 수동 검증에 의존한다.
- Highlight / Copy / 묵상 액션은 다음 Context Toolbar 단계에서 연결한다.
- 사용자는 모바일 정상 확인을 이번 feature의 완료 기준으로 승인했고, Desktop/키보드/테마 문제는 발견 시 hotfix로 처리한다.
- 커밋 후 base diff check는 PR 생성 전에 완료한다.

## 6. 범위 확인

- Context Toolbar 구현 없음
- Highlight 저장·삭제 흐름 변경 없음
- Copy 포맷 변경 없음
- Reflection Composer 신규 흐름 없음
- DB/API 변경 없음
- Responsive breakpoint 변경 없음
