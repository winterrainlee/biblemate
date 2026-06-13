# PR: v2.3 — Surrounding Screens & Microcopy

**Branch**: `feature/v2.3-visual-redesign` → `feature/v2.3`
**Date**: 2026-06-12
**Version**: v2.3.0

## 주요 변경

- 묵상 카드와 묵상일지 섹션을 메모지/기도 노트 문법으로 조정
- 헤더 로고와 탭 색상 무게를 낮추고 새 팔레트 적용
- 로그인 화면을 서재 컨셉 첫인상으로 재구성
- 파비콘 SVG 추가 및 PNG 앱 아이콘 교체
- 읽기표/진도/토스트/캘린더 상태 색상 토큰 정리
- 주요 마이크로카피를 v2.3 기준으로 교체

## 검증

- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- `git diff --check` 성공
- favicon `/logo.svg`, apple touch icon `/logo.png` 연결 확인
- 설정 화면 `BibleMate v2.3.0` 확인

## 리뷰 포인트

- 실제 iOS 홈 화면 설치 테스트는 수행하지 않았고, manifest와 icon 파일 연결까지 확인했다.
- `server/package.json`의 `npm run dev`는 `.env`가 없으면 실패하여 브라우저 검증은 `node index.js`로 서버를 실행했다.
