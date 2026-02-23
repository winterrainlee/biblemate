# Release Notes — v2.1.0

**Release Date**: 2026-02-23
**Branch**: `feature/v2.1` → `main`

---

## 🆕 New Features

### 📋 묵상 복사
- 묵상일지 `읽은 말씀` 헤더에 **묵상 복사** 버튼 추가
- 당일 묵상 전체(구절별 묵상, 자유 묵상, 오늘의 기도)를 1클릭으로 클립보드에 복사
- 복사 형식: `## YYYY-MM-DD 책 장` + `[발견한 하나님]` / `[자유 묵상]` / `[오늘의 기도]`
- 내용이 없는 섹션은 자동 생략
- iPhone Safari 클립보드 fallback(`execCommand`) 포함

### 📅 읽은 날짜 → 묵상일지 이동
- 성경 읽기 화면의 상단 읽음 상태바 및 하단 완료 메시지 클릭 시 해당 날 묵상일지로 자동 이동
- 날짜 타임존 이슈 방지: `parseDateInput` 유틸 적용

### ✏️ 구절별 묵상 수정 취소
- 묵상일지 인라인 편집에 **취소** 버튼 추가
- BibleViewer 팝업 묵상 모드에 **저장 + 취소** 버튼 쌍 배치
- BibleViewer 묵상 보기 모드에 **수정 / 삭제** 아이콘 추가

---

## 🐛 Bug Fixes

### 읽은 책 중복 집계 수정
- 같은 장을 여러 날 읽어도 통계에서 한 번만 카운트되도록 수정 (`bookChapters` Set 적용)

### 읽기 진도 Range 집계 통일
- `chapter_from/to` 범위를 활용한 진도 집계가 `ReadingProgress`와 `JournalStats`에서 일관되게 동작

### 모바일 스크롤/스와이프 충돌 수정
- Y축 이동이 X축보다 클 때 스와이프 무시 → 세로 스크롤 중 장/날짜 이동 방지
- `BibleViewer`, `JournalPage` 양쪽 적용

---

## ✨ UX Improvements

### 모바일 구절 묵상 보기 개선
- 팝업 모든 모드(menu, memo, view-notes)에서 헤더 구절 위치 표시 통일 (`verse_range` 우선)
- 구절 본문 인용 텍스트 표시 추가 (`Nanum Myeongjo` 이탤릭 스타일)

### 묵상일지 섹션 정렬 개선
- 섹션 제목과 수정/삭제/복사 버튼이 모든 섹션에서 수직 중앙 정렬

---

## 🔧 Backend Improvements

### Graceful Shutdown
- SIGTERM/SIGINT 수신 시 DB를 저장한 후 서버 종료 (`saveDB()` → `server.close()`)
- Fly.io 배포 환경의 롤링 업데이트 안정성 향상

### 레거시 API 제거
- v1.x 전용 `/api/notes` 라우트 및 `routes/notes.js` 삭제
- v2.0 이후 `/api/free-notes`, `/api/verse-notes`, `/api/prayers`로 완전 이전

---

## 📦 기타

- WEB 역본 업데이트 스크립트 수정 및 라이선스 정보 갱신
- `docs/lessons.md` 교훈 추가: Clipboard API & Copy UX (섹션 14)
