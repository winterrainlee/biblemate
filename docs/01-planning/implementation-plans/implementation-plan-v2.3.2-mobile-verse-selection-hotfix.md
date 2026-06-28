# Implementation Plan v2.3.2 - Mobile Verse Selection Hotfix

- 작성일: 2026-06-28
- 버전: v2.3.2
- 브랜치: `master` hotfix
- 범위: 모바일 구절 선택 화면 공간 확보, 로그인 페이지 말씀 문구 보정, 배포 버전 정합

## 1. 배경

모바일 성경 읽기 화면에서 구절을 선택하면 상단 헤더와 하단 액션 바가 선택 팝업 공간을 압박한다. 또한 로그인 화면의 말씀 문구는 출처가 없어 문맥 정보가 부족하다. 이번 패치는 기존 v2.3 읽기/브랜드 방향을 유지하면서 모바일 선택 흐름과 첫 화면 문구만 좁게 보정한다.

## 2. 작업 범위

- `BibleViewer.jsx`
  - 모바일 헤더를 2행 중심 구조로 압축
  - 읽음/읽지 않음 상태를 `mobile-status-badge`로 책 제목 행에 통합
  - `묵상 보기`와 `Aa` 버튼을 `mobile-sub-actions` 컨테이너에 배치
  - 구절 선택 팝업 표시 중 `selection-mode`, `selection-hidden` 클래스 적용
- `BibleViewer.css`
  - 모바일 컨텍스트 행, 상태 뱃지, 보조 액션 스타일 추가
  - 선택 모드에서 헤더와 하단 액션 바를 접어 선택 영역 확보
  - 선택 팝업 최대 높이에 헤더 높이 변수를 반영
  - 절 스크롤 여백을 모바일 헤더 압축에 맞게 조정
- `LoginPage.jsx`, `LoginPage.css`
  - 시편 119:105 말씀을 두 줄로 나누고 출처 표기 추가
- 배포 준비
  - package/app 표시 버전을 v2.3.2로 갱신
  - hotfix 문서와 검증 기록 추가
  - `.claude/`를 Git 추적 대상에서 제외

## 3. 제외 범위

- 성경 선택 팝업의 기능 구조 변경
- 모바일 하단 액션 바의 버튼 구성 변경
- 인증/로그인 로직 변경
- DB/API/배포 인프라 변경

## 4. 검증 계획

- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`
- `git status --short --ignored`로 `.claude/` ignore 상태 확인

## 5. 배포 메모

`master` 기준 hotfix로 배포한다. 최종 commit/push/tag 후 GitHub Actions/Fly.io 배포 상태를 확인한다.
