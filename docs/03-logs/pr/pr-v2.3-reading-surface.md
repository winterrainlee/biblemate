# PR: v2.3 — Reading Surface & Typography

**Branch**: `feature/v2.3-visual-redesign` → `feature/v2.3`
**Date**: 2026-06-12
**Version**: v2.3.0

## 주요 변경

- 성경 본문 기본 글꼴을 `Noto Serif KR`로 전환
- 설정 화면에 `명조`, `고운바탕`, `고딕` 본문 글꼴 선택 추가
- UI 글꼴과 본문 글꼴을 CSS 변수로 분리
- 성경 본문 영역에 paper surface, 읽기 폭, 여백, 세리프 절 번호 적용
- 인용구 faux italic 제거

## 검증

- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- 브라우저 확인: `.verse-content` font-family가 `"Noto Serif KR", serif`
- 모바일 390×844 확인: 첫 구절과 하단 action bar가 화면 안에 표시됨

## 리뷰 포인트

- 기존 `fontFamily` 서버 설정과 호환되도록 `bibleFontFamily` localStorage 키를 추가하되 `fontFamily`도 계속 저장한다.
- v2.2 모바일 `Aa` 본문 크기 설정은 유지했다.
