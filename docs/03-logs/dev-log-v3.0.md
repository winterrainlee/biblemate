# 개발 로그 - v3.0

## 개요

- **버전**: v3.0.0
- **기간**: 2026-09-08 ~ 진행 중
- **목표**: 성경 읽기와 묵상 기록의 핵심 경험을 실제 사용 흐름 중심으로 재구성
- **통합 브랜치**: `feature/v3.0`
- **현재 작업 브랜치**: `feature/v3.0-context-toolbar`

## 변경 내역

### 2026-09-08

#### [Feature] Reading Canvas

- `client/src/components/BibleViewer.css`: 큰 paper card와 3컬럼 전제를 걷어내고 실제 가용 폭별 단일 Reading Canvas, 본문 폭·행간·절 간격·절 번호 위계를 구성
- `client/src/components/BibleViewer.jsx`: 기존 데이터/API와 선택 로직을 유지하면서 모바일 본문 선택·장의 묵상·Aa 접근 구조와 묵상 마진 표시를 최소 JSX 변경으로 연결
- `client/src/components/Header.css`, `Header.jsx`: Reading 화면에서 전역 헤더와 조작부의 시각적 무게 축소
- `client/src/pages/ReadingDashboard.css`: Reading Canvas 중심 레이아웃으로 보조 패널 전제 완화
- 사용자 피드백에 따라 위첨자형 절 번호와 인접한 묵상 점을 본문 기준선 번호 + 왼쪽 마진 선으로 수정
- PR 리뷰에서 절 번호·묵상선 대비, 클릭 우선순위, Compact 조작 영역과 기본 dialog semantics 보강

#### [Feature] Verse Selection — 구현 및 자동 검증

- 구절 첫 탭에서 중앙 액션 popup을 열지 않고 단일·비연속 다중 선택 상태만 시작하도록 분리
- 함수형 상태 업데이트, 절 번호 정규화, 중복 제거와 오름차순 정렬 적용
- 기존 하이라이트 색 위에 선택 overlay와 안쪽 인디케이터를 별도 합성
- 구절 선택 button과 묵상 마진 button을 sibling control로 분리하고 `aria-pressed`, focus 표시, 상태 알림 추가
- 약 10px 이상 touch 이동 시 선택 click을 억제하고 Selection 상태의 장 이동 swipe 차단
- 선택 개수·범위와 닫기만 제공하는 최소 selection bar 추가
- 책·장·역본 변경, Escape, 닫기, 묵상 상세 진입 시 선택 상태 정리
- 사용자 요청에 따라 검수 서버와 수동·실기기 검수는 아직 실행하지 않음

## 이슈 및 해결

- **이슈**: Tailscale 검수 서버에서 묵상 표시가 보이지 않는 것으로 인식됨
- **원인**: 최초 검수 장에 로컬 묵상 데이터가 없었음
- **해결**: 기존 묵상·하이라이트가 함께 있는 장으로 데이터/API와 레이아웃을 교차 검증

- **이슈**: 절 번호와 묵상 점의 의미가 시각적으로 뭉치고 절 번호가 약해 보임
- **해결**: 세 시안을 비교한 뒤 사용자 선택 C안인 기준선 절 번호 + 왼쪽 마진 선을 반영

## 검증 결과

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check origin/feature/v3.0...HEAD`
- [x] 375×812 / 650×900 / 1280×900 Light 검증
- [x] Light / Dark 및 하이라이트 4색 대비 검증
- [x] 이전·다음 장, 기존 묵상 열기, 하이라이트 레이아웃 회귀 확인
- [x] iPhone 13 mini Safari + Tailscale HTTP 실기기 검수 및 사용자 승인
- [x] Verse Selection 구현 후 `cd client && npm run lint`
- [x] Verse Selection 구현 후 `cd client && npm run build`
- [x] Verse Selection working tree `git diff --check`
- [ ] Verse Selection 브라우저 반응형·실기기 검수

## 다음 계획

- Reading Canvas는 PR #3, Verse Selection은 PR #4로 `feature/v3.0` 통합 완료
- 다음 작업은 Context Toolbar + Highlight + Copy 구현계획 작성 및 사용자 승인
- 구현계획 승인 전에는 다음 기능 코드를 수정하지 않음
- Responsive 최종 확정은 핵심 Reading 흐름 연결 후 통합 회귀 단계에서 수행

### 2026-09-09

#### [Verification] Verse Selection iPhone 실기기 검수

- Tailscale HTTP 검수용 Vite 서버를 별도 포트로 실행하고 frontend/API HTTP 200 확인
- iPhone Safari에서 단일·비연속 다중 선택, 개별·전체 해제, 스크롤 오선택 방지, 선택 중 장 swipe 억제 확인
- 기존 하이라이트 합성, 선택 bar 위치, 묵상 마진 선 진입, 책·장·역본 전환 시 초기화 항목 정상 확인
- 사용자 정상 확인 후 검수용 서버 종료
- 기존 localhost 전용 frontend/backend 프로세스는 유지

#### [Review] Verse Selection PR 준비

- Security / QA / UI·UX / Interaction / Frontend / Backend 리뷰 수행
- 최초 리뷰에서 touch 후속 click, context 전환 race, 본문 accessible name, persistent live status, 조건부 하단 padding 문제 발견
- target + 700ms click 억제, context key 이중 gate, `aria-label` 제거, 상시 live region, 고정 하단 여백 구조로 수정
- 재검토 결과 Critical 0건, Warning 0건
- Browser 제어 런타임이 없어 Desktop 3폭·키보드·Light/Dark 시각 검증은 PR 전 게이트로 유지
- 사용자 결정으로 Verse Selection은 모바일 실기기 승인을 완료 기준으로 확정하고 Desktop 관련 문제는 후속 hotfix 후보로 이관

#### [Integration] Verse Selection

- GitHub PR #4를 merge commit 방식으로 `feature/v3.0`에 병합
- 병합 커밋: `f19cd764`
- 모바일 우선 완료 범위와 Desktop 후속 hotfix 후보 기록을 그대로 유지
- 통합 브랜치로 복귀했으며 다음 기능은 별도 구현계획 승인 후 시작

#### [Feature] Context Toolbar + Highlight + Copy — 구현 및 자동 검증

- 사용자 B안 승인에 따라 iPhone 모바일 승인을 통합 게이트로 확정하고 Desktop 조합은 후속 hotfix 후보로 기록
- 기존 최소 선택 bar를 선택 상태 행과 하이라이트 4색·묵상·복사 액션 행을 가진 Context Toolbar로 확장
- 선택 번호·본문·범위·역본을 하나의 파생 payload로 구성해 모든 액션이 같은 대상을 사용하도록 정리
- 같은 색 재선택이 삭제로 동작하지 않도록 다중 명시 적용과 별도 하이라이트 지우기 흐름으로 분리
- 다중 API 완료 후 하이라이트를 한 번 재조회하며 부분 실패 시 선택을 유지하고 서버 상태를 재동기화
- 단일·연속·비연속 범위와 현재 역본을 포함하는 복사 포맷 및 HTTP textarea fallback 연결
- 선택 범위와 결합 인용문을 기존 묵상 작성 popup으로 전달하되 Composer 재설계는 다음 단계로 유지
- `npm run lint`, `npm run build`, working tree `git diff --check` 통과
- 사용자 요청 전까지 검수 서버는 실행하지 않고 iPhone 실기기 검수 대기
- 1차 모바일 확인 후 사용자 승인으로 단일 항목뿐인 `더보기`를 제거하고 지우개를 포함한 7개 직접 버튼으로 조정
