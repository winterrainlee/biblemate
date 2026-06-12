# PR: v2.2 모바일 일지·읽기표·가독성 흐름

**Branch**: `feature/v2.2-mobile-ux` → `feature/v2.2`
**Date**: 2026-06-12

## 1. 주요 변경 사항

- [x] `JournalPage.jsx` — 날짜 텍스트 버튼화 및 날짜 선택 시트 추가
- [x] `JournalPage.jsx` — 오늘 버튼, 최근 기록 목록, 모바일 월간 요약 추가
- [x] `JournalPage.jsx` — 빈 상태 CTA를 `오늘 묵상 시작하기` 하나로 정리
- [x] `BibleViewer.jsx` — 모바일 `Aa` 본문 전용 글자 크기 설정 추가
- [x] `BibleChartPage.jsx` — `다음 안 읽은 장 읽기` 버튼 추가
- [x] `BibleChartPage.jsx` — 책 row 탭으로 해당 책의 다음 안 읽은 장 이동
- [x] `ReadingDashboard.jsx` — 읽기표에서 넘어온 pending Bible location 처리
- [x] 관련 CSS — 모바일 날짜 시트, 요약, 읽기표 CTA, 본문 가독성 컨트롤 스타일 추가

## 2. 검증 결과

- [x] `cd client && npm run lint` 성공
  - v2.2 통합 정리 후 warning 없음
- [x] `cd client && npm run build` 성공
- [x] iPhone Safari 실기기 수동 QA 통과 (2026-06-12)

## 3. 남은 작업

- 아이폰에서 날짜 선택 시트, 오늘 복귀, 빈 상태 CTA, `Aa`, 읽기표 진입점을 수동 검증한다.
- PR-C 통과 후 v2.2 문서 마감, dev-log/release-notes/lessons 정리로 넘어간다.
