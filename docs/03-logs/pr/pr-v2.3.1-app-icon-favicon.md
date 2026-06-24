# PR: v2.3.1 - App Icon & Favicon

**Branch**: `feature/v2.3-app-icon-favicon` → `master`  
**Date**: 2026-06-24  
**Version**: v2.3.1

## 주요 변경

- 제공 이미지 기반으로 `logo.png`를 교체
- 브라우저용 `favicon.ico`, 16/32 PNG favicon 추가
- iOS 홈 화면용 `apple-touch-icon.png` 추가
- PWA manifest용 192/512 PNG 아이콘 추가
- `index.html`과 `manifest.json`의 아이콘 참조를 PNG/ICO 중심으로 정리
- 앱 표시 버전과 package version을 v2.3.1로 갱신

## 검증

- `file`/`sips`로 아이콘 파일 타입과 크기 확인
- `favicon.ico` 내부 16/32/48 엔트리 확인
- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- `git diff --check` 성공

## 리뷰 포인트

- 실제 iOS/Android 홈 화면 설치 아이콘 확인은 배포 후 기기 QA에서 확인한다.
- 기존 `client/public/logo.svg`는 더 이상 HTML/manifest에서 참조하지 않는다.
- 기존 `feature/v2.3` 통합 브랜치는 v2.3.0 시점 브랜치이므로, 이번 패치 배포는 현재 배포선인 `master`를 기준으로 병합한다.
