# Release Notes - v1.4.1

**Release Date**: 2026-01-12

## Summary
모바일 레이아웃 버그 수정 및 설정 페이지 UX 개선을 포함한 패치 릴리즈입니다.

---

## Bug Fixes 🐛
- **모바일 본문-묵상 영역 공백 버그 수정**
  - CSS padding/margin 조정으로 불필요한 공백 제거
  - BibleViewer 버튼 컨테이너 간격 최적화 (2rem → 1rem)
- **HTML 엔티티 표시 버그**: 이미 v1.3.1에서 해결된 것으로 확인

## UX Improvements ✨
- **설정 페이지 헤더 개선**
  - 뒤로가기 버튼 추가 (ArrowLeft)
  - 부제목 제거로 간결한 UI
- **설정 페이지 섹션 순서 조정**
  - "화면 표시 설정" 섹션을 최상단으로 이동
  - 자주 사용하는 기능에 빠르게 접근
- **테마 설정 섹션 제거**
  - 헤더 아이콘으로 접근 가능하여 중복 제거

## New Features 🎉
- **모바일 달력 숨김 옵션**
  - 설정 페이지에서 ON/OFF 토글 가능
  - 오늘 말씀에 집중할 수 있는 기능

---

## Files Changed
- `client/src/components/BibleViewer.jsx`
- `client/src/pages/ReadingDashboard.css`
- `client/src/pages/ReadingDashboard.jsx`
- `client/src/pages/Settings.jsx`
