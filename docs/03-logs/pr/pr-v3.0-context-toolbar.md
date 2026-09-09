# PR: v3.0 — Context Toolbar + Highlight + Copy

**Branch**: `feature/v3.0-context-toolbar` → `feature/v3.0`
**Date**: 2026-09-09
**Version**: v3.0.0
**Status**: PR #5 리뷰 대기 — 모바일 우선 완료 기준 승인
**PR**: https://github.com/winterrainlee/biblemate/pull/5

## 1. 주요 변경 사항

- [x] 기존 최소 선택 bar를 상태 행 + 액션 행 Context Toolbar로 확장
- [x] 하이라이트 4색, 지우기, 묵상, 복사 7개 직접 버튼 배치
- [x] 모든 주요 액션에 44×44px 이상 hit area 적용
- [x] 선택 번호·본문·범위·역본을 단일 파생 payload로 통합
- [x] 다중 선택 전체에 색상을 명시적으로 설정하고 같은 색은 유지
- [x] 하이라이트 삭제를 독립된 지우개 액션으로 분리
- [x] 다중 API 처리 후 한 번 재조회하고 부분 실패 시 선택 유지
- [x] 단일·연속·비연속 복사 범위와 현재 역본 표시
- [x] Clipboard API와 Tailscale HTTP textarea fallback 지원
- [x] 선택 범위와 결합 인용문을 기존 묵상 작성 popup에 전달
- [x] 비동기 실행 중 문맥 변경과 중복 실행 방어

## 2. 검증 결과

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check origin/feature/v3.0...HEAD`
- [x] iPhone Safari + Tailscale HTTP 실기기 검수
- [x] 7개 직접 버튼 수정 후 사용자 재확인 및 최종 승인
- [ ] 375×812 / 650×900 / 1280×900 Desktop UI 검증 — 후속 hotfix 후보
- [ ] Desktop keyboard / Light / Dark 조합 — 후속 hotfix 후보
- [ ] API 부분 실패 수동 유발 — 구현 검토 및 서버 재동기화 경계로 확인

## 3. Review Point

- 기존 색이 섞인 다중 선택에 새 색이 모두 동일하게 적용되는지
- 같은 색 재선택이 삭제로 바뀌지 않는지
- 지우기가 선택한 하이라이트 절만 삭제하는지
- 복사 범위와 본문 순서가 같은 selection payload를 사용하는지
- HTTP fallback이 임시 textarea를 성공·실패 모두에서 제거하는지
- pending 상태에서 중복 실행과 Escape 종료가 차단되는지
- 문맥 변경 뒤 이전 비동기 응답이 새 본문 상태를 덮지 않는지
- Composer 재설계, DB schema, batch API가 이번 범위에 섞이지 않았는지

## 4. Review 결과

### Security

- Critical 없음, Warning 없음.
- 신규 HTML 주입, 인증정보, 권한 경로 변경이 없다.
- clipboard fallback은 고정된 임시 textarea를 사용하고 `finally`에서 제거한다.

### QA

- Critical 없음, Warning 없음.
- 사용자 모바일 승인, lint/build/base diff check를 완료했다.
- API 부분 실패를 실기기에서 인위적으로 유발하지 않았으며 해당 경로는 서버 재조회 후 선택 유지로 구현했다.

### UI/UX / Interaction

- Critical 없음, Warning 없음.
- iPhone 13 mini 폭에서 7개 버튼의 44px hit area와 safe-area를 유지했다.
- 단일 항목뿐인 `더보기`를 제거하고 지우개를 직접 노출하는 사용자 피드백을 반영했다.
- pending 상태에는 `aria-busy`, disabled, live status를 제공한다.

### Frontend / Backend

- Critical 없음, Warning 없음.
- Highlight / Copy / Reflection이 현재 문맥의 동일한 파생 selection payload를 사용한다.
- 기존 Highlight API를 재사용하며 server route, DB schema, backup/restore 계약 변경이 없다.

## 5. 알려진 제한 / 후속 검증

- 사용자 승인 B안에 따라 모바일 실기기 확인을 이번 feature의 통합 게이트로 사용한다.
- Desktop 3폭·keyboard·Light/Dark 문제는 발견 시 후속 hotfix로 처리한다.
- v3.0 전체 Responsive 통합 회귀 범위는 유지한다.
- 실패 요청의 실제 부분 저장 결과는 네트워크/API 오류 상황에서 추가 확인이 필요하다.
- Composer의 전체 화면·우측 패널·이탈 보호 재설계는 다음 Reflection Composer 단계다.

## 6. 범위 확인

- Reflection Composer UI 재설계 없음
- 복사 포맷 선택·Markdown·공유 sheet 없음
- Highlight batch endpoint 없음
- DB schema / backup 형식 변경 없음
- Responsive breakpoint 변경 없음
- 검수 중 변경된 `server/data/bible.db`는 사용자 로컬 데이터이며 PR에서 제외
