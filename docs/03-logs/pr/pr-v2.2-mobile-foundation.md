# PR: v2.2 모바일 안정화 기반

**Branch**: `feature/v2.2-mobile-ux` → `feature/v2.2`
**Date**: 2026-06-12

## 1. 주요 변경 사항

- [x] `client/index.html` — `lang="ko"`와 `viewport-fit=cover` 적용
- [x] `client/src/index.css` — dynamic viewport/safe-area CSS 변수 추가, 전역 `touch-action` 완화
- [x] `client/src/components/Layout.css` — root layout을 `100dvh`/`100svh` fallback 기반으로 정리
- [x] `client/src/components/Header.jsx`, `Header.css` — 주요 헤더 버튼 `aria-label`과 44px 터치 영역 적용
- [x] `client/src/components/BibleViewer.jsx`, `BibleViewer.css` — 입력/팝업 중 장 스와이프 guard, 이전/다음 버튼 접근성 및 44px 터치 영역 적용
- [x] `client/src/pages/JournalPage.jsx` — 자유 묵상/기도 작성 중 날짜 스와이프 guard 적용
- [x] `client/src/services/api.js` — legacy `/api/notes` 호출을 `/api/free-notes`로 정리
- [x] 모바일 UX 개선을 방해하던 미사용 import/핸들러/lint error 정리

## 2. 검증 결과

- [x] `cd client && npm run lint` 성공
  - v2.2 통합 정리 후 warning 없음
- [x] `cd client && npm run build` 성공
- [x] 인앱 브라우저 390×844 viewport에서 기본 성경 화면 로드 확인
- [x] 모바일 헤더/성경 이전·다음 버튼 44px 이상 터치 영역 확인
- [x] 긴 장 하단 스크롤 후 `오늘 읽음 표시하기` 버튼이 viewport 안에 보이는 것 확인
- [x] 아이폰 실기기 수동 검증 완료 (2026-06-12)

## 3. 남은 작업

- PR-B에서 모바일 성경 상단 압축, 구절 액션 바텀시트, 전체 화면 묵상 작성 오버레이를 구현한다.
- PR-B에서 읽음 표시를 하단 action bar로 이동해 긴 장에서도 1탭 흐름을 만든다.
- 실제 iOS Safari, iOS PWA standalone, Android Chrome에서 safe-area/키보드 수동 QA를 수행한다.
