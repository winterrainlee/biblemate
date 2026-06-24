# Release Notes v2.3.1

**배포일**: 2026-06-24  
**버전**: v2.3.1  
**상태**: 배포 완료

## 핵심 변경

- BibleMate 앱 아이콘과 파비콘을 사용자 제공 성경책 이미지 기준으로 정리했습니다.
- 브라우저 탭, 북마크, iOS 홈 화면, PWA manifest가 같은 이미지 계열을 사용하도록 아이콘 세트를 분리했습니다.
- SVG favicon 참조를 제거하고, `.ico` 및 PNG favicon을 명시했습니다.
- 앱 표시 버전과 package version을 v2.3.1로 갱신했습니다.

## 검증

- 아이콘 파일 타입과 크기 확인
- `favicon.ico` 내부 16/32/48 엔트리 확인
- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`

## 남은 확인

- 실제 모바일 홈 화면 설치 아이콘은 배포 후 기기에서 확인합니다.
