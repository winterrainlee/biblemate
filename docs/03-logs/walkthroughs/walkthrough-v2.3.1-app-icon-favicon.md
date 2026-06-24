# Walkthrough v2.3.1 - App Icon & Favicon

- 작성일: 2026-06-24
- 브랜치: `feature/v2.3-app-icon-favicon`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.3.1-app-icon-favicon.md`
- 범위: 앱 아이콘/파비콘 자산과 메타데이터 정리

## 1. 구현 요약

- 사용자 제공 성경책 이미지를 기준으로 브라우저/홈 화면용 아이콘 세트를 생성했다.
- `client/index.html`은 `.ico`, 32px PNG, 16px PNG, apple touch icon을 명시한다.
- `client/public/manifest.json`은 192×192, 512×512 PNG install icon을 참조한다.
- 기존 SVG favicon 참조는 제거했다.
- 앱 표시 버전과 package version을 v2.3.1로 맞췄다.

## 2. 생성 자산

- `client/public/logo.png`: 1024×1024 PNG
- `client/public/favicon.ico`: 16×16, 32×32, 48×48 PNG 엔트리 포함
- `client/public/favicon-16x16.png`: 16×16 PNG
- `client/public/favicon-32x32.png`: 32×32 PNG
- `client/public/apple-touch-icon.png`: 180×180 PNG
- `client/public/icon-192.png`: 192×192 PNG
- `client/public/icon-512.png`: 512×512 PNG

## 3. 검증 결과

```bash
file client/public/logo.png client/public/favicon.ico client/public/favicon-16x16.png client/public/favicon-32x32.png client/public/apple-touch-icon.png client/public/icon-192.png client/public/icon-512.png
sips -g pixelWidth -g pixelHeight client/public/logo.png client/public/favicon-16x16.png client/public/favicon-32x32.png client/public/apple-touch-icon.png client/public/icon-192.png client/public/icon-512.png
cd client
npm run lint
npm run build
git diff --check
```

결과: 모두 성공.

## 4. 확인된 연결

- favicon: `/favicon.ico`
- favicon PNG: `/favicon-32x32.png`, `/favicon-16x16.png`
- apple touch icon: `/apple-touch-icon.png`
- manifest icons: `/icon-192.png`, `/icon-512.png`
- 설정 화면 버전: `BibleMate v2.3.1`

## 5. 제한 사항

- 실제 모바일 홈 화면 설치 테스트는 수행하지 않았다. 파일 생성, HTML/manifest 연결, production build까지 확인했다.
