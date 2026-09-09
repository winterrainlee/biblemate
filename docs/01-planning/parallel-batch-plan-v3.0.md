# BibleMate v3.0 병렬 구현 및 단일 검수 배치 계획

- 작성일: 2026-09-09
- 기준 브랜치: `feature/v3.0`
- 상태: **Wave 1 구현·리뷰·통합 완료 / Wave 2 계획 대기**
- 목표: 독립 작업을 병렬로 진행하되 검수 서버는 최종 통합 후 한 번만 실행한다.

## 실행 구조

### Wave 1 — 병렬 구현

1. 핵심 트랙: `feature/v3.0-reflection-composer`
2. 주변 화면 트랙: `feature/v3.0-visual-cleanup`
3. 회귀 기반 트랙: `feature/v3.0-regression-harness`

세 트랙은 각각 별도 Implementation Plan, Walkthrough, PR을 유지한다. 중간에는 검수 서버를 열지 않고 lint/build, 순수 모델 검증, 임시 DB/API 검증만 수행한다.

### Wave 2 — 핵심 트랙 순차 확장

- Reflection Composer의 상태·편집 계약이 `feature/v3.0`에 통합된 뒤 `feature/v3.0-existing-notes`를 시작한다.
- Existing Notes는 별도 Implementation Plan 승인을 받은 뒤 구현한다.
- 주변 화면과 회귀 기반 트랙은 이 기간에도 독립적으로 진행할 수 있다.

### Wave 3 — 최종 통합

- Composer, Existing Notes, Visual Cleanup, Regression Harness를 `feature/v3.0`에 통합한다.
- 통합 결과를 기준으로 Responsive 통합 Implementation Plan을 작성·승인받아 Header/Layout/공유 폭 문제를 한 번 정리한다.
- 자동 검증이 모두 통과한 뒤에만 최종 검수 서버를 실행한다.

### Wave 4 — 검수 서버 1회

- 임시 검수 DB와 5174/Tailscale 프런트엔드를 사용한다.
- Composer, Existing Notes, Visual Cleanup, Responsive, v2.x 회귀를 한 세션에서 확인한다.
- 사용자 승인 후 서버와 임시 DB를 제거하고 원본 DB 무변경을 확인한다.

## 파일 소유권

| 트랙 | 소유 파일 | 수정 금지/통합 전용 |
|---|---|---|
| Composer | `ReflectionComposer*` 신규, `BibleViewer*`, 필요 시 `ReadingDashboard.jsx` | Journal/Chart/Settings/Login 시각 정리 |
| Visual Cleanup | `LoginPage*`, `BibleChartPage*`, `Settings*`, `ReadingProgress*`, `JournalStats*`, 제한된 `JournalPage*` | `BibleViewer*`, `ReadingDashboard*`, `Calendar*`, API/server |
| Regression Harness | 신규 `server/scripts/verify-v3-regression.js`와 격리 fixture | production UI, 원본 `server/data/bible.db` |
| Existing Notes | 후속 `ChapterNotesPanel*`, `BibleViewer*`, 묵상 목록/편집 연결 | 주변 화면 시각 정리 |
| Responsive 통합 | `Header*`, `Layout*`, `index.css`, 통합 폭 조정 | 기능 계약 변경 |

전역 CSS 클래스 충돌을 피하기 위해 Visual Cleanup은 페이지 루트 하위 selector 또는 페이지별 prefix를 사용한다. `.nav-btn`, `.book-name`, `.note-date`, `.editor-actions`, `.stat-*`, `.progress-*` 같은 공용 이름을 새로 만들지 않는다.

## 원본 데이터 보호

- 현재 `server/data/bible.db`의 검수 중 변경은 사용자 로컬 데이터이므로 보존하고 모든 커밋에서 제외한다.
- 자동 CRUD와 backup/restore 검증은 `DB_PATH`가 가리키는 임시 DB에서만 수행한다.
- 최종 검수 서버도 원본 DB 대신 임시 복제본을 사용한다.
- 시작/종료 시 원본 DB SHA-256와 Git 상태를 비교하고 개인 묵상 내용은 로그에 출력하지 않는다.

## 통합 자동 게이트

- 각 트랙 lint/build/diff check
- Composer 순수 모델: snapshot, range, quote 직렬화, payload, dirty 비교
- 임시 DB: verse note 생성·수정·삭제, reading log 중복 방지, 4색 highlight, settings, backup/restore
- Visual Cleanup 금지 파일 및 전역 class 충돌 검사
- 통합 후 375 / 650 / 1280px 구조·overflow·Light/Dark 확인
- 원본 DB hash/status 불변 확인

## 최종 실기기 검수 순서

1. Reading / Verse Selection / 7버튼 Context Toolbar 회귀
2. 신규 묵상 작성, 키보드, safe-area, 이탈 보호
3. 기존 묵상 보기·수정·삭제, 마진 표시, 본문 이동
4. Journal 자유 묵상·기도·날짜 이동
5. Chart 필터와 이어 읽기
6. Settings 표시 설정·백업/복구
7. Login 입력·오류·loading
8. 새로고침 후 지속성 및 Reading 복귀

## 승인 게이트

Wave 1의 세 개별 계획은 2026-09-09 사용자 승인을 받았다. Existing Notes와 Responsive 통합은 각 선행 결과를 반영한 별도 계획 승인 후 시작한다.
