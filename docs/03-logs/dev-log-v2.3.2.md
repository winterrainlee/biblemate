# Dev Log - v2.3.2

## 개요

- **목표**: 모바일 구절 선택 화면 공간 확보와 로그인 말씀 문구 보정
- **작성일**: 2026-06-28
- **작업 브랜치**: `master` hotfix
- **상태**: 배포 완료

---

## 변경 내역

- `BibleViewer.jsx` 모바일 헤더를 2행 구조로 압축
- 읽음/읽지 않음 상태를 `mobile-status-badge`로 책 제목 행에 통합
- 모바일 `묵상 보기`와 `Aa` 버튼을 `mobile-sub-actions` 행에 나란히 배치
- 구절 선택 팝업 표시 중 헤더에 `selection-mode`, 하단 액션 바에 `selection-hidden` 클래스 적용
- `BibleViewer.css`에 모바일 컨텍스트 행, 상태 뱃지, 선택 모드 숨김 스타일 추가
- 선택 팝업 최대 높이에 `--pk-header-height`를 반영하고 `scroll-margin-top`을 6rem으로 조정
- 로그인 화면 말씀 문구를 두 줄로 나누고 `(시편 119:105)` 출처 표기 추가
- `.claude/`를 `.gitignore`에 추가
- root/client/server package version과 설정 화면/README 표시 버전을 v2.3.2로 갱신

## 검증

- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`
- `git status --short --ignored`

## 남은 확인

- 실제 모바일 기기에서 구절 선택 팝업의 체감 높이와 하단 safe-area 동작은 배포 후 기기 QA로 확인한다.
