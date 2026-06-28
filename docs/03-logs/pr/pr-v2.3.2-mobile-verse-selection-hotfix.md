# PR: v2.3.2 - Mobile Verse Selection & Login Copy Hotfix

**Branch**: `master` hotfix  
**Date**: 2026-06-28  
**Version**: v2.3.2

## 주요 변경

- 모바일 성경 헤더를 2행 구성으로 압축
- 읽음/읽지 않음 상태를 책 제목 행의 `mobile-status-badge`로 통합
- `이 장의 묵상 보기`와 `Aa` 버튼을 `mobile-sub-actions` 행에 배치
- 구절 선택 팝업 표시 중 모바일 헤더와 하단 액션 바를 숨겨 선택 공간 확보
- 선택 팝업 높이 계산에 헤더 높이 변수를 반영
- 로그인 페이지 말씀 문구를 두 줄로 나누고 `(시편 119:105)` 출처 추가
- `.claude/`를 Git ignore 처리
- 앱 표시 버전과 package version을 v2.3.2로 갱신

## 검증

- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`
- `git status --short --ignored`

## 리뷰 포인트

- 모바일에서 구절 선택 시 팝업과 safe-area가 자연스럽게 맞물리는지 확인한다.
- 읽음 상태 뱃지 클릭 시 기존 묵상일지 이동 동작이 유지되는지 확인한다.
- `.claude/`는 로컬 작업 파일로만 유지하고 Git 추적 대상에 포함하지 않는다.
