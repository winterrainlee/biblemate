# Walkthrough v2.3.0 - Surrounding Screens

- 작성일: 2026-06-12
- 브랜치: `feature/v2.3-visual-redesign`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.3.0-visual-redesign.md`
- 관련 명세: `docs/02-specs/spec-v2.3.md`
- 범위: PR-C. Surrounding Screens & Microcopy

## 1. 구현 요약

### VIS-201. 묵상 카드/일지 정합

- 묵상 카드와 묵상일지 섹션을 `--pk-color-bg-elevated` 기반 메모지 표면으로 조정했다.
- 인용구와 묵상 본문은 `--pk-font-body`를 따른다.
- 성공/위험/토스트/캘린더 상태 색상을 새 토큰으로 교체했다.

### VIS-202. 헤더/로그인 첫인상

- 헤더 로고를 `BookOpen` 아이콘으로 조정하고, 브랜드 텍스트는 본문 세리프 계열을 사용한다.
- 로그인 화면은 크림 배경, 세리프 환영 문구, `BM` 마크, 성경 구절 한 줄로 재구성했다.

### VIS-203. 파비콘/앱 아이콘

- `client/public/logo.svg`를 추가했다.
- 기존 `client/public/logo.png`를 실제 PNG 1024×1024 RGBA 아이콘으로 교체했다.
- `client/index.html`은 SVG favicon과 PNG alternate/apple touch icon을 함께 연결한다.
- `manifest.json`에 PNG/SVG 아이콘과 v2.3 theme/background color를 반영했다.

### VIS-204. 마이크로카피

- `읽은 말씀` → `오늘 펼친 말씀`
- `구절별 묵상` → `마음에 머문 구절`
- `오늘의 기도` → `기도로 마무리`
- `묵상하기` → `이 말씀 묵상하기`
- `구절 복사` → `말씀 복사`
- `다음 안 읽은 장 읽기` → `다음 말씀 이어 읽기`
- `전체 진행도` → `말씀 여정`

## 2. 검증 결과

```bash
cd client
npm run lint
npm run build
git diff --check
```

결과: 모두 성공.

## 3. 브라우저 확인

- favicon link: `/logo.svg`
- apple touch icon: `/logo.png`
- `client/public/logo.png`: PNG image data, 1024 x 1024, RGBA
- 설정 화면 본문 글꼴 옵션: `명조`, `고운바탕`, `고딕`
- 설정 화면 버전: `BibleMate v2.3.0`

## 4. 제한 사항

- 실제 iOS 홈 화면 설치 테스트는 수행하지 않았다. 브라우저 DOM과 manifest/icon 파일 연결까지 확인했다.
