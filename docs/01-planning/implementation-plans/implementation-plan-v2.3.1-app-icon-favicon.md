# Implementation Plan v2.3.1 - App Icon & Favicon

- 작성일: 2026-06-24
- 승인일: 2026-06-24
- 통합/배포 브랜치: `master`
- 작업 브랜치: `feature/v2.3-app-icon-favicon`
- 상태: 구현 및 배포 준비 완료

---

## 0. 목표

제공된 성경책 이미지 하나를 기준으로 BibleMate의 브라우저 파비콘, PWA manifest 아이콘, iOS 홈 화면 아이콘을 같은 시각 자산으로 정리한다.

## 1. 비목표

- 화면 UI, 라우팅, API, DB 스키마는 변경하지 않는다.
- 새 로고를 생성형 이미지로 다시 만들지 않는다.
- 배포 환경 설정과 Fly.io 설정은 변경하지 않는다.

## 2. 대상 파일

- `client/public/logo.png`
- `client/public/favicon.ico`
- `client/public/favicon-16x16.png`
- `client/public/favicon-32x32.png`
- `client/public/apple-touch-icon.png`
- `client/public/icon-192.png`
- `client/public/icon-512.png`
- `client/index.html`
- `client/public/manifest.json`
- 버전/문서 파일: `package.json`, `client/package.json`, `server/package.json`, lockfile, README, roadmap, docs-index, dev-log, release notes, walkthrough, PR 초안, lessons

## 3. 구현 방향

1. 원본 이미지를 정사각형 PNG 세트로 리샘플링한다.
2. HTML은 `.ico`와 16/32 PNG favicon, apple touch icon을 명시한다.
3. Manifest는 installable app에서 쓰는 192/512 PNG 아이콘을 명시한다.
4. 기존 `logo.svg`는 더 이상 favicon/manifest에서 참조하지 않는다.
5. 앱 표시 버전은 v2.3.1로 맞춘다.

## 4. 검증 기준

- 생성된 아이콘 파일의 타입과 크기를 확인한다.
- `client/index.html`과 `client/public/manifest.json`의 참조 경로가 실제 파일과 일치한다.
- `cd client && npm run build`를 실행한다.
- `git diff --check`를 실행한다.

## 5. 롤백 전략

- 아이콘 자산과 HTML/manifest 변경은 모두 `client/public` 및 `client/index.html`에 격리되어 있어 이전 커밋으로 되돌리기 쉽다.
- 버전/문서 업데이트는 v2.3.1 관련 항목만 되돌린다.
