# PR: v3.0 — Existing Notes + Responsive Integration

**Branch**: `feature/v3.0-responsive-integration` → `feature/v3.0`
**Date**: 2026-09-09
**Version**: v3.0.0
**Status**: PR #9 생성 완료 / 리뷰 대기
**PR**: https://github.com/winterrainlee/biblemate/pull/9

## 1. 주요 변경 사항

- [x] Compact·Reading·Workspace의 높이, scroll owner, safe-area 계약 통합
- [x] Reflection Composer와 Existing Notes가 Workspace 공용 우측 작업면 사용
- [x] 현재 장 전체를 여는 상단 `기존 묵상 N개` 진입점 제공
- [x] 선택 구절과 저장 범위가 하나라도 겹치는 `관련 묵상 N개` 목록 제공
- [x] 기존 묵상 본문 이동·복사·수정·삭제와 전용 loading/error/empty 상태 연결
- [x] 모바일 7버튼 Context Toolbar와 관련 묵상 진입점 동시 유지
- [x] 641–720px Header 축약 및 Login dynamic viewport 보강

## 2. 검증 결과

- [x] 모델·navigation guard 테스트 16/16
- [x] ESLint
- [x] Vite production build — 2580 modules transformed
- [x] 임시 DB API 회귀 Harness 8/8
- [x] 원본 `server/data/bible.db` 보호 검사
- [x] 375×812, 375×500, 650×900, 899/900, 1280×900 구조 검증
- [x] iPhone + Tailscale 실기기 검수 및 사용자 승인
- [x] 검수 서비스·5174 포트·임시 DB 복제본 정리

## 3. Review Point

- 장 전체 목록과 선택 관련 목록이 각각 올바른 범위를 유지하는지
- `verse_range`의 연속·비연속 범위와 선택 구절의 교집합이 정확한지
- 선택을 닫은 뒤에도 열린 관련 목록이 선택 snapshot 기준을 유지하는지
- 삭제 후 filtered 목록의 다음 focus와 전체 목록 재조회가 충돌하지 않는지
- Compact overlay와 Workspace 패널에서 Composer·Toolbar가 동시에 경쟁하지 않는지
- root 높이와 실제 본문 scroll owner가 Safari 주소창·키보드 변화에서 유지되는지

## 4. 데이터 및 보안

- DB schema, API endpoint, backup 형식 변경 없음
- 자동 CRUD·backup 검증은 생성된 임시 DB에서만 수행
- 실기기 검수는 원본 DB 복제본을 Mac의 Tailscale 인터페이스에만 바인딩해 수행
- 검수 완료 후 서비스·복제본을 삭제하고 원본 DB SHA-256 무변경 확인
- 사용자 로컬 `server/data/bible.db` 변경은 PR에서 제외

## 5. 범위 확인

- Journal 전체 재설계, 검색·태그·Markdown·자동 저장 없음
- 모바일 외 미세 시각 문제는 사용자 승인 기준에 따라 후속 hotfix 가능
- 사용자 승인 후 원격 push 및 PR #9 생성 완료
