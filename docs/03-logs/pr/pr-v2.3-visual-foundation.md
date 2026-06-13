# PR: v2.3 — Visual Foundation

**Branch**: `feature/v2.3-visual-redesign` → `feature/v2.3`
**Date**: 2026-06-12
**Version**: v2.3.0

## 주요 변경

- Paper & Ink 라이트 팔레트 적용
- Candlelight 다크 팔레트 적용
- `bg-elevated`, `primary-solid`, `primary-contrast`, `border-light` 토큰 추가
- radius, shadow, border 스케일 조정
- 하이라이트 4색을 라이트/다크 각각 새 방식으로 조정

## 검증

- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- `git diff --check` 성공
- 브라우저에서 라이트/다크 토큰 적용 확인

## 리뷰 포인트

- legacy hex 하이라이트는 DB 호환을 위해 렌더링 매핑으로 유지했다.
- 다크모드 채움 버튼은 `--pk-color-primary-solid`를 사용하고 금색은 강조색으로 분리했다.
