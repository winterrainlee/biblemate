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
- Context Toolbar + Highlight + Copy PR 생성 및 `feature/v3.0` 통합
- 다음 Reflection Composer는 별도 구현계획 작성·승인 후 시작
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

#### [Verification] Context Toolbar iPhone 실기기 승인

- Tailscale HTTP 환경에서 하이라이트 적용·지우기, 복사 범위·역본, 묵상 전달, safe-area와 읽기 복귀 확인
- 사용자 1차 확인 후 7개 직접 버튼으로 수정하고 동일 검수 서버에서 재확인
- 사용자 최종 승인 완료
- Desktop 3폭·키보드·Light/Dark 조합은 승인된 B안에 따라 후속 hotfix 후보로 유지

#### [Integration] Context Toolbar + Highlight + Copy

- GitHub PR #5를 merge commit 방식으로 `feature/v3.0`에 병합
- 병합 커밋: `32e1e73`
- 검수용 5174 macOS 임시 서비스를 제거하고 포트 종료 확인
- 다음 작업 착수 전 Reflection Composer, Existing Notes, Visual Cleanup, 회귀 검증의 병렬 가능 범위를 의존성 기준으로 재검토

#### [Planning] B안 병렬 구현 및 단일 검수 배치

- 사용자 승인에 따라 Reflection Composer, Surrounding Screens Visual Cleanup, 격리 회귀 Harness를 Wave 1 병렬 트랙으로 구성
- `BibleViewer*` 상태 계약을 공유하는 Reflection Composer → Existing Notes는 핵심 트랙 내부에서 순차 진행
- Header/Layout/공유 CSS는 선행 기능 통합 후 Responsive 통합 단계에서만 수정하도록 파일 소유권 고정
- 각 트랙 세부 Implementation Plan을 작성하고 코드 구현 전 승인 게이트로 설정
- 중간에는 검수 서버를 열지 않고 lint/build와 임시 DB 검증을 수행하며, 최종 통합 후 한 번의 실기기 검수 세션으로 묶기로 결정
- 원본 `server/data/bible.db`는 사용자 검수 데이터로 보존하고 모든 자동 CRUD·backup/restore에서 제외
- 사용자 Wave 1 세부 계획 승인 후 세 트랙을 각각 독립 브랜치·worktree에서 병렬 착수

#### [Implementation] Wave 1 병렬 구현 완료

- Reflection Composer `7394f00`: 선택 snapshot, 작성·수정 공용 Composer, dirty/save/stale response 보호, 순수 모델 테스트 5건 추가
- Visual Cleanup `381b406`: Chart/Login/Settings/Journal 보조 화면을 허용된 파일 범위에서 정리하고 전역 CSS class를 페이지별 namespace로 격리
- Regression Harness `15379bf`: 임시 DB·임의 포트에서 v2.x API·백업·마이그레이션 8개 회귀 묶음을 자동 검증
- 세 커밋을 임시 detached worktree에 결합해 lint, production build, Composer 5/5, Regression 8/8 통과 확인
- 원본 `server/data/bible.db`와 사용자 검수 서버는 사용하지 않음
- Reflection Composer PR #6, Visual Cleanup PR #7, Regression Harness PR #8 생성; 모두 `feature/v3.0` 대상이며 병합 대기

#### [Review & Integration] Wave 1

- PR #6 리뷰에서 전역 화면 전환 시 dirty draft 유실, 저장 성공 후 refresh 실패의 거짓 실패 표시, stale context 적용 문제를 발견하고 `6f28cfe`에서 수정
- PR #7 리뷰에서 필터/notebook 탭의 선택 상태와 로그인 입력 accessible name을 보강하고 `a4e7c21`에서 수정
- PR #8 리뷰에서 임시 포트 선점 재시도와 rollback 전체 데이터 비교를 보강하고 `06eeebf`에서 수정
- PR #8 → #7 → #6 순으로 `feature/v3.0`에 merge commit 병합
- 병합 커밋: PR #8 `c19cfd7`, PR #7 `aa316c4`, PR #6 `074fcc8`
- 통합 브랜치에서 lint, production build, Composer/navigation guard 테스트 9/9, 임시 DB 회귀 Harness 8/8 재통과
- 사용자 검수 서버는 실행하지 않았으며 원본 `server/data/bible.db`의 기존 로컬 변경을 유지

#### [Planning] Existing Notes Integration

- Reflection Composer 통합 계약을 기준으로 기존 묵상 목록·마진 표시·본문 이동·수정·삭제의 단일 흐름을 설계
- Compact 시트, Reading dialog, Workspace 우측 패널이 같은 `ChapterNotesPanel`과 장별 refresh 상태를 공유하도록 계획
- 작성·수정·삭제 성공과 후속 목록 refresh 실패를 분리하고 context/request guard로 오래된 응답 적용을 차단
- DB/API schema 변경 없이 기존 `verse_notes`와 격리 Regression Harness를 재사용
- 구현계획 문서 작성 완료, 애플리케이션 코드 수정 전 사용자 승인 대기
- 사용자 구현계획 승인 후 `feature/v3.0-existing-notes` 독립 브랜치 착수

#### [Implementation] Existing Notes Integration

- 사용자 계획 승인에 따라 `feature/v3.0-existing-notes` 독립 브랜치에서 구현
- Compact 하단 시트, Reading modal dialog, Workspace 우측 1/3 패널이 같은 `ChapterNotesPanel`과 목록 상태를 사용하도록 통합
- 묵상 0개 진입, 마진 표시에서 대상 카드 선택, 본문 절 이동, 복사·Reflection Composer 수정·삭제를 한 흐름으로 연결
- 장 context와 최신 request가 일치하는 조회만 적용하고, 삭제 성공 시 항목·마진 표시를 먼저 제거한 뒤 백그라운드 재조회 실패와 삭제 실패를 분리
- 조회 오류는 기존 목록을 보존하며 최초 실패는 거짓 빈 상태 대신 재시도 화면을 표시
- 모델/navigation guard 테스트 15/15, ESLint, production build, 임시 DB 회귀 Harness 8/8 통과
- 사용자 검수 서버는 열지 않았고 원본 `server/data/bible.db` 보호 검사 통과
- Responsive 통합 이후 Composer·7버튼 Toolbar·Journal 결과와 함께 한 번의 실기기 검수 세션에서 확인 예정

#### [Planning] Responsive 통합

- Existing Notes 완료 결과를 포함해 Header, Layout, ReadingDashboard와 핵심 Reading surface의 breakpoint·높이·overflow 접점을 재점검
- 기능 breakpoint는 Compact `<600px`, Reading `600–899px`, Workspace `≥900px`로 유지하고 Header 640px·legacy Dashboard 768px 규칙은 Bible mode 범위에서 충돌만 해소하도록 계획
- Compact의 safe-area·키보드·7버튼, Reading의 단일 본문·modal, Workspace의 본문 2/3 + 공용 우측 작업면을 통합 검증 대상으로 확정
- 사용자 결정에 따라 iPhone Safari를 필수 승인 게이트로 유지하고 650px·1280px은 자동 구조 검증하되 모바일 무관 미세 문제는 hotfix 이관 가능
- 자동 검증 완료 전 검수 서버를 열지 않고 최종 한 세션에서 Composer, Existing Notes, 주변 화면과 지속성을 함께 확인
- 구현계획 문서 작성 완료, 코드 수정 전 사용자 승인 대기

#### [Implementation & Verification] Responsive 통합

- 사용자 계획 승인 후 `feature/v3.0-responsive-integration` 브랜치에서 viewport 높이, safe-area, scroll owner와 flex 최소 크기 계약을 통합
- `html/body/#root → Layout → Dashboard → BibleViewer`의 높이·overflow 연결을 명시하고 실제 본문을 주 스크롤 영역으로 고정
- Compact 본문 하단 여백과 scroll padding을 기본 읽기 bar/7버튼 Toolbar 높이에 맞추고 작은 높이에서도 Toolbar 자체 스크롤과 Composer 저장 액션을 유지
- Composer와 Existing Notes가 Workspace에서 `300–420px` 공용 우측 작업면 폭, 전체 높이, 독립 스크롤을 공유하도록 정리
- 641–720px Header는 축약 라벨과 모바일 읽기표 버튼을 사용해 전체 라벨·전역 글자 조절의 overflow를 방지
- Login은 dynamic viewport 높이와 내부 세로 스크롤을 사용해 전역 root overflow 계약에서도 작은 화면 내용이 잘리지 않게 보강
- 자동 브라우저 검수 중 `isolation`이 전체 화면 Composer를 앱 Header 아래 stacking context에 가두는 문제를 발견해 해당 격리를 제거하고 상단 제목·닫기 영역 복구 확인
- 375×812, 375×500, 650×900, 899/900 경계, 1280×900에서 가로 overflow 0, modal/panel 전환, 공용 패널 300/420px, 최소 44px 7버튼, 빈 묵상 장을 확인
- 최대 전역 글자 20px, Dark mode, 하이라이트 4색, 긴 묵상·다중 범위에서도 가로 overflow 없음 확인
- 모델/navigation guard 테스트 15/15, ESLint, production build, 임시 DB 회귀 Harness 8/8과 원본 DB 보호 검사 통과
- 자동 검사용 `127.0.0.1:5188` 서버와 synthetic fixture·브라우저 탭을 종료·삭제했으며 사용자용 5174/Tailscale 검수 서버는 열지 않음
