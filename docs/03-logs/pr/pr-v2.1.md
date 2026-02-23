# PR: v2.1 — UX 안정화 및 묵상일지 기능 강화

**Branch**: `feature/v2.1` → `main`
**Date**: 2026-02-23
**Version**: v2.1.0

---

## 1. 주요 변경 사항

### 🆕 신규 기능
- [x] **묵상 복사** (`JournalPage.jsx`) — 당일 묵상 전체를 1클릭으로 클립보드 복사. 모바일 Safari fallback 포함
- [x] **읽은 날짜 → 묵상일지 이동** (`ReadingDashboard.jsx`, `BibleViewer.jsx`) — 성경 읽기에서 완독 날짜 클릭 시 해당 날 묵상일지로 자동 이동
- [x] **구절별 묵상 수정 취소** (`JournalPage.jsx`, `BibleViewer.jsx`) — 인라인 편집 및 팝업 묵상 모드에 취소 버튼 추가

### 🐛 버그 수정
- [x] **읽은 책 중복 집계 수정** (`JournalStats.jsx`) — 같은 장을 여러 날 읽어도 한 번만 카운트
- [x] **Range 집계 통일** (`ReadingProgress.jsx`) — `chapter_from/to` 범위 올바르게 집계
- [x] **모바일 스크롤/스와이프 충돌** (`BibleViewer.jsx`, `JournalPage.jsx`) — Y축 이동이 크면 스와이프 무시

### ✨ UI/UX 개선
- [x] **모바일 구절 묵상 보기** (`BibleViewer.jsx`) — 팝업 내 구절 위치·본문 인용 텍스트 표시 통일
- [x] **섹션 헤더 수직 정렬** (`JournalPage.css`) — 제목과 액션 버튼 조합을 모든 섹션에서 일관되게 맞춤

### 🔧 백엔드 정리
- [x] **Graceful Shutdown** (`server/index.js`) — SIGTERM/SIGINT 시 DB 저장 후 종료
- [x] **레거시 API 제거** (`server/index.js`) — 미사용 `/api/notes` 라우트 및 `routes/notes.js` 삭제

### 📦 기타
- [x] WEB 역본 데이터 업데이트 스크립트 수정 및 라이선스 정보 갱신
- [x] `docs/lessons.md` 교훈 추가 (섹션 14: Clipboard API & Copy UX)

---

## 2. 검증 결과

| 항목 | 결과 |
|------|------|
| `npm run build` (vite) | ✅ 성공 (에러/경고 0) |
| 묵상 복사 — 데스크톱 Chrome | ✅ 확인 |
| 묵상 복사 — iPhone Safari | ✅ 확인 (fallback 동작) |
| 읽은 날짜 클릭 → 묵상일지 이동 | ✅ 확인 |
| 구절별 묵상 취소 버튼 | ✅ 확인 |
| 읽은 책 카운트 정확도 | ✅ 확인 |

---

## 3. Review Point

- **묵상 복사 버튼 노출 조건**: `todayLogs.length > 0`일 때만 `읽은 말씀` 헤더 내에 표시됨. 읽기 기록 없이 묵상만 있는 경우 버튼 미노출 (드문 케이스로 허용)
- **execCommand deprecation**: `document.execCommand('copy')`는 deprecated이지만, 현재 모든 브라우저가 지원하며 HTTPS 환경에서는 `navigator.clipboard`가 우선 사용됨
- **레거시 API 제거**: `/api/notes`는 v1.x 클라이언트에서 사용하던 엔드포인트로, v2.0 이후 미사용. 외부 연동 없음

---

## 4. Agent Review (기능별 PR 통합)

### 🔐 Security Review
**검토 결과**: ✅ Pass

- 복사 텍스트는 JSX 변수 렌더링 기반 — XSS 없음
- 레거시 API 제거 — 공격 표면 축소
- 신규 API 추가 없음

### 🧪 QA Review
**검토 결과**: ✅ Pass

- 빌드 0 에러/경고
- 빈 섹션 생략, Safari fallback, Range fallback 등 엣지케이스 처리 완료
- 기능별 PR에서 수동 검증 완료

### 🎨 UI/UX Implementation Review
**검토 결과**: ✅ Pass

- 기존 `section-header` + `section-actions` 패턴 일관 적용
- Nielsen 휴리스틱 #3(사용자 제어) — 취소 버튼 추가로 충족
- 버튼 위치·크기·색상 기존 디자인 시스템 준수

### ✨ Interaction Implementation Review
**검토 결과**: ✅ Pass

- `Copy → Check` 아이콘 전환 (200ms), 2초 후 복원
- 취소 동작 즉각 반응 (100ms 이내)

### 🔧 Backend Implementation Review
**검토 결과**: ✅ Pass

- Graceful shutdown: `saveDB()` → `server.close()` 순서 안전
- 레거시 라우트 제거 후 `/api/free-notes`, `/api/prayers`, `/api/verse-notes` 정상 동작

---

## 5. 관련 PR 목록

| PR 파일 | 기능 |
|---------|------|
| [pr-v2.1-copy-meditation.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-copy-meditation.md) | 묵상 복사 |
| [pr-v2.1-journal-navigation.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-journal-navigation.md) | 읽은 날짜 → 묵상일지 이동 |
| [pr-v2.1-verse-note-cancel.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-verse-note-cancel.md) | 구절별 묵상 취소 버튼 |
| [pr-v2.1-reading-count-fix.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-reading-count-fix.md) | 읽은 책 중복 집계 + Range 통일 |
| [pr-v2.1-mobile-swipe-fix.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-mobile-swipe-fix.md) | 모바일 스크롤/스와이프 충돌 |
| [pr-v2.1-mobile-verse-view.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-mobile-verse-view.md) | 모바일 구절 묵상 보기 개선 |
| [pr-v2.1-backend-cleanup.md](file:///c:/Users/winte/OneDrive/Documents/Antigravity/bible-reading-mate/docs/03-logs/pr/pr-v2.1-backend-cleanup.md) | Graceful shutdown + 레거시 API 제거 |
