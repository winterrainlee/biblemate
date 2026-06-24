# Dev Log - v2.3.1

## 개요

- **목표**: 사용자 제공 성경책 이미지를 기준으로 앱 아이콘/파비콘 자산 정리
- **작성일**: 2026-06-24
- **작업 브랜치**: `feature/v2.3-app-icon-favicon`
- **상태**: 구현 및 배포 준비 완료

---

## 변경 내역

- `client/public/logo.png`를 제공 이미지 기반 1024×1024 PNG로 교체
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` 추가
- `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` 추가
- `client/index.html`의 favicon/apple touch icon 링크를 PNG/ICO 중심으로 정리
- `client/public/manifest.json`의 아이콘을 192/512 PNG install icon으로 정리
- root/client/server package version과 설정 화면/README 표시 버전을 v2.3.1로 갱신

## 검증

- `file client/public/logo.png client/public/favicon.ico client/public/favicon-16x16.png client/public/favicon-32x32.png client/public/apple-touch-icon.png client/public/icon-192.png client/public/icon-512.png`
- `sips -g pixelWidth -g pixelHeight ...`
- `node -e`로 `favicon.ico` 내부 16/32/48 아이콘 엔트리 확인
- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- `git diff --check` 성공

## 남은 확인

- 실제 iOS/Android 홈 화면 설치 후 아이콘 표시 확인은 배포 후 기기 QA로 남긴다.

## 배포 준비 (2026-06-24)

- `master`와 `origin/master`가 동기화되어 있음을 확인했다.
- `v2.3.1` 태그가 아직 없음을 확인했다.
- 기존 `feature/v2.3` 통합 브랜치는 v2.3.0 시점 브랜치이므로, 이번 패치는 현재 배포선인 `master`에 기능 브랜치를 병합해 배포한다.
