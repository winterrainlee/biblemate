# PR: v2.2 모바일 성경 읽기 흐름

**Branch**: `feature/v2.2-mobile-ux` → `feature/v2.2`
**Date**: 2026-06-12

## 1. 주요 변경 사항

- [x] `BibleViewer.jsx` — 모바일 compact context bar와 본문 선택 바텀시트 추가
- [x] `BibleViewer.jsx` — 구절 액션을 바텀시트/묵상 우선 흐름으로 재정렬
- [x] `BibleViewer.jsx` — 📝 아이콘 탭 시 해당 구절 묵상 보기로 직접 연결
- [x] `BibleViewer.jsx` — 모바일 묵상 작성 전체 화면 오버레이 추가
- [x] `BibleViewer.jsx` — 작성 화면 상단에 선택 말씀 본문 표시
- [x] `BibleViewer.jsx` — 현재 장 묵상 목록 바텀시트 추가
- [x] `BibleViewer.jsx` — 모바일 하단 읽기 action bar 추가
- [x] `ReadingDashboard.jsx` — 구절 복사 toast 및 clipboard fallback 추가
- [x] `BibleViewer.css` — 모바일 바텀시트, 전체 화면 작성, 하단 action bar 스타일 추가

## 2. 검증 결과

- [x] `cd client && npm run lint` 성공
  - v2.2 통합 정리 후 warning 없음
- [x] `cd client && npm run build` 성공
- [x] Vite 페이지 응답 확인: `http://127.0.0.1:5173/`
- [x] API health proxy 확인: `http://127.0.0.1:5173/api/health`
- [x] 성경 본문 proxy 확인: `http://127.0.0.1:5173/api/bible/Gen/1?version=krv`
- [x] iPhone Safari 실기기 수동 QA 통과 (2026-06-12)

## 3. 남은 작업

- 아이폰에서 compact bar, 구절 바텀시트, 전체 화면 작성, 키보드/저장 버튼, 하단 action bar를 수동 검증한다.
- PR-C에서 묵상일지 날짜 선택 시트, 모바일 일지 요약, 읽기표 진입점, 본문 전용 가독성 설정을 진행한다.
