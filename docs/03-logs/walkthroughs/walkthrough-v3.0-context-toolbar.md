# Walkthrough v3.0 - Context Toolbar + Highlight + Copy

- 날짜: 2026-09-09
- 브랜치: `feature/v3.0-context-toolbar`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v3.0-context-toolbar.md`
- 관련 명세: `docs/02-specs/spec-v3.0.md`
- 상태: 구현·자동 검증 및 모바일 실기기 승인 완료

## 1. 구현 결과

- 기존 선택 bar를 선택 상태 행과 7개 직접 액션을 가진 Context Toolbar로 확장
- 하이라이트 4색을 선택 전체에 명시적으로 적용하고 같은 색은 유지
- 사용자 1차 확인 후 `더보기`를 제거하고 하이라이트 지우개를 일곱 번째 직접 버튼으로 배치
- 단일·연속·비연속 선택 범위와 현재 역본을 포함하는 복사 포맷 적용
- 다중 절 본문은 절 번호를 붙여 오름차순으로 줄별 복사
- Clipboard API와 비보안 HTTP 환경용 textarea fallback 유지
- 액션 성공 시 Reading 복귀, 실패 시 서버 재동기화 후 선택 유지
- 선택 범위·결합 인용문을 기존 묵상 작성 popup에 전달
- 모든 toolbar 액션에 44×44px 이상 hit area, focus-visible, disabled, `aria-busy` 상태 적용

## 2. 데이터 및 실패 처리

- Context Toolbar가 현재 본문의 selection payload 하나를 Highlight / Copy / Reflection에 공유한다.
- 기존 Highlight API를 재사용하고 DB schema·backup 형식·batch endpoint는 변경하지 않았다.
- 여러 요청 중 일부가 실패해도 전체 요청 정산 후 서버 상태를 다시 불러온다.
- 실패 시 사용자의 선택을 유지해 같은 작업을 다시 시도할 수 있다.
- 비동기 처리 중 책·장·역본이 바뀌면 이전 문맥의 완료 응답이 새 Selection을 닫지 않는다.

## 3. 자동 검증

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] working tree `git diff --check`
- [ ] 커밋 후 `git diff --check origin/feature/v3.0...HEAD`

## 4. 모바일 실기기 검수

사용자 승인 B안에 따라 iPhone Safari 정상 확인을 이번 단계의 통합 게이트로 사용한다.

- [x] 단일 절과 다중 절에 네 가지 하이라이트 적용
- [x] 같은 색 유지, 혼합 색 덮어쓰기, 직접 노출된 하이라이트 지우개
- [x] 단일·연속·비연속 복사 결과의 범위·역본·본문 확인
- [x] 묵상 버튼의 선택 범위와 인용문 전달 확인
- [x] toolbar 버튼 크기, 홈 인디케이터, Safari 주소창 변화 확인
- [ ] 실패 시 선택 유지와 중복 실행 차단 확인
- [x] 사용자 최종 승인 (2026-09-09)

실패 상황은 실기기에서 인위적으로 유발하지 않았으며 구현 경계와 자동 검증으로 확인했다. Desktop 3폭·키보드·Light/Dark 조합은 후속 hotfix 후보이며 v3.0 Responsive 통합 회귀 범위는 유지한다.

검수 중 사용자 요청으로 지우개를 `더보기` 밖으로 이동했고, 7개 직접 버튼 배치를 재확인해 최종 승인했다. 검수 서버는 별도 종료 요청 전까지 macOS 임시 서비스로 유지한다.
