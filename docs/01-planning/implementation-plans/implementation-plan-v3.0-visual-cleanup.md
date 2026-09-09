# BibleMate v3.0 Surrounding Screens Visual Cleanup 구현 계획

- 작업 브랜치: `feature/v3.0-visual-cleanup`
- 병렬 트랙: 주변 화면 Wave 1
- 상태: **구현·리뷰·통합 완료 (PR #7)**
- 선행 조건: Reading Canvas 시각 원칙 승인 완료

## Goal

- Journal, Chart, Settings, Login을 Reading 화면과 같은 제품 언어로 정리하되 기능·데이터 흐름은 바꾸지 않는다.
- 핵심 Composer 트랙의 파일과 전역 자산을 잠가 병렬 충돌을 방지한다.

## File Ownership

- 독점 수정: `BibleChartPage.jsx/css`, `LoginPage.jsx/css`, `Settings.jsx/css`, `ReadingProgress.jsx/css`, `JournalStats.jsx/css`
- 조건부 수정: `JournalPage.jsx/css`의 shell·날짜·빈 상태·자유 묵상·기도 영역
- 수정 금지: `BibleViewer*`, `ReadingDashboard*`, `Calendar*`, `NoteEditor*`, `NotePreview*`, API/service/server
- 통합 단계 전용: `Header*`, `Layout*`, `index.css`, `App.jsx`, theme/tab context
- Journal의 `editingVerseNote`, `.verse-notes-*`, 묵상 수정·삭제·복사 영역은 Existing Notes 트랙에 남긴다.

## Proposed Changes

1. 페이지별 root namespace/prefix를 먼저 적용해 전역 class 충돌을 제거한다.
2. Login과 Chart의 반복 카드·그림자와 헤더 시각 무게를 줄인다.
3. Settings inline style을 의미 있는 class로 이동하고 기능 handler는 유지한다.
4. Journal shell·날짜·빈 상태·자유 묵상·기도·보조 통계를 정리한다.
5. 말씀·묵상 본문은 serif, 조작 UI는 sans-serif 원칙을 유지한다.
6. 모바일 주요 action은 44px 이상, 기능 의미와 문구는 변경하지 않는다.

## Non-Goals

- Header/Layout/전역 token 변경
- Journal의 구절 묵상 목록·편집 재설계
- Calendar 내부 구조 변경
- 기능 추가, API 변경, 브랜드 자산 교체

## Verification

- lint/build/diff check
- diff에 수정 금지 파일이 없는지 확인
- `.nav-btn`, `.book-name`, `.note-date`, `.editor-actions`, `.stat-*`, `.progress-*` 충돌 재검색
- iPhone Journal 날짜 이동·오늘·자유 묵상·기도 작성/취소/저장
- Chart 필터와 이어 읽기, 375px 가로 overflow 없음
- Settings 하이라이트 이름·글꼴·크기·백업/복구·로그아웃 접근
- Login 키보드·오류·loading 상태
- Reading 복귀 시 Header·본문·Context Toolbar 시각 회귀 없음

## 통합 경계

Header/Layout과 Journal 구절 묵상 영역은 이 브랜치에서 건드리지 않고, Existing Notes 및 Responsive 통합 이후 한 번만 정합한다.
