# Walkthrough v2.3.2 - Mobile Verse Selection Hotfix

- 작성일: 2026-06-28
- 브랜치: `master` hotfix
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.3.2-mobile-verse-selection-hotfix.md`
- 범위: 모바일 구절 선택 화면 공간 확보, 로그인 말씀 문구 보정, hotfix 배포 준비

## 1. 구현 요약

- 모바일 성경 헤더를 책/장/역본 행과 보조 액션 행 중심으로 압축했다.
- 읽음 상태를 제목 행의 `mobile-status-badge`로 옮겨 기존 별도 읽기 상태 행을 모바일에서 숨겼다.
- 구절 선택 팝업 표시 중 `selection-mode`, `selection-hidden` 클래스로 헤더와 하단 액션 바를 접어 선택 공간을 확보했다.
- 선택 팝업의 최대 높이 계산에 헤더 높이 변수를 포함해 겹침 위험을 줄였다.
- 로그인 화면 말씀 문구를 두 줄로 나누고 시편 출처를 추가했다.
- `.claude/` 로컬 작업 폴더가 Git에 올라가지 않도록 `.gitignore`에 추가했다.
- 앱 표시 버전과 package version을 v2.3.2로 맞췄다.

## 2. 변경 파일

- `client/src/components/BibleViewer.jsx`
- `client/src/components/BibleViewer.css`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/LoginPage.css`
- `.gitignore`
- `package.json`, `package-lock.json`
- `client/package.json`, `client/package-lock.json`
- `server/package.json`, `server/package-lock.json`
- `README.md`
- `client/src/pages/Settings.jsx`
- `docs/01-planning/roadmap.md`
- `docs/docs-index.md`
- `docs/02-specs/spec-v2.3.2.md`
- `docs/03-logs/dev-log-v2.3.2.md`
- `docs/04-releases/release-notes-v2.3.2.md`
- `docs/lessons.md`

## 3. 검증 결과

```bash
cd client && npm run lint
cd client && npm run build
git diff --check
git status --short --ignored
```

결과: 모두 성공.

- `npm run lint`: 성공
- `npm run build`: 성공
- `git diff --check`: 성공
- `git status --short --ignored`: `.claude/`가 ignore 상태로 표시됨

## 4. 배포 메모

- 브라우저 기반 모바일 실기기 QA는 이 단계에서 수행하지 않았다.
- `master` hotfix 커밋, `v2.3.2` 태그, GitHub Actions/Fly.io 배포 확인을 진행한다.
