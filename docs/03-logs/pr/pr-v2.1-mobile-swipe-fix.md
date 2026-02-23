# PR: 모바일 스크롤/스와이프 충돌 수정

**Branch**: `feature/v2.1-mobile-swipe-fix` → `feature/v2.1`
**Date**: 2026-02-23

## 1. 주요 변경 사항

- [x] `BibleViewer.jsx` — 스와이프 핸들러에 Y축 추적 추가 (distY > distX면 무시)
- [x] `JournalPage.jsx` — 동일 패턴 적용

## 2. 검증 결과

- [x] `npm.cmd run build` 성공 (3.10s)
- [ ] 수동 검증: 모바일에서 세로 스크롤 → 장/날짜 이동 발생하지 않음
- [ ] 수동 검증: 수평 스와이프 → 장/날짜 이동 정상

## 3. Agent Review

모든 Sub-agent ✅ Pass
