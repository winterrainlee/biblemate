# Walkthrough v2.3.0 - Reading Surface

- 작성일: 2026-06-12
- 브랜치: `feature/v2.3-visual-redesign`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.3.0-visual-redesign.md`
- 관련 명세: `docs/02-specs/spec-v2.3.md`
- 범위: PR-B. Reading Surface & Typography

## 1. 구현 요약

### VIS-101. 본문 세리프 전환

- Google Fonts import를 `Noto Serif KR`, `Gowun Batang`, `Noto Sans KR`, `Inter` 조합으로 정리했다.
- UI는 산세리프를 유지하고, 성경 본문은 `--pk-font-body`를 따르도록 분리했다.
- 기본 본문 글꼴은 `Noto Serif KR`로 설정했다.

### VIS-102. 본문 글꼴 설정

- 설정 화면에 `명조`, `고운바탕`, `고딕` 3가지 본문 글꼴 선택을 추가했다.
- 기존 `fontFamily` 설정과 호환되도록 `bibleFontFamily`와 `fontFamily` localStorage 값을 함께 유지한다.
- 설정 화면의 미리보기는 실제 본문 글꼴 변수를 따른다.

### VIS-103. 성경 본문 표면

- `.bible-text-grid`에 `--pk-color-bg-elevated` paper surface를 적용했다.
- 본문 최대 폭, 여백, column rule, shadow를 독서 화면에 맞게 조정했다.
- 절 번호는 작은 세리프 위첨자 느낌으로 낮췄다.
- 한글 faux italic을 제거하고 인용구도 본문 세리프 변수를 따르도록 정리했다.

## 2. 검증 결과

```bash
cd client
npm run lint
npm run build
```

결과: 모두 성공.

## 3. 브라우저 확인

데스크톱 확인:
- `.bible-text-grid` 배경: `rgb(255, 250, 242)`
- `.verse-content` font-family: `"Noto Serif KR", serif`
- `--pk-font-body`: `'Noto Serif KR', serif`

모바일 390×844 확인:
- 첫 구절 top: `312.9px`
- 하단 action bar top/bottom: `781.4px` / `844px`
- 표시 문구: `오늘 이어 읽기`, `이 장의 묵상`, `Aa`, `오늘의 말씀 완료`

## 4. 회귀 확인

- 데스크톱 3컬럼 구조 유지.
- 모바일 compact context bar, `Aa`, 하단 action bar 유지.
- 기존 highlight legacy hex 매핑 유지.
