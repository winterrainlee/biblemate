# Walkthrough v2.3.0 - Visual Foundation

- 작성일: 2026-06-12
- 브랜치: `feature/v2.3-visual-redesign`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.3.0-visual-redesign.md`
- 관련 명세: `docs/02-specs/spec-v2.3.md`
- 범위: PR-A. Visual Foundation

## 1. 구현 요약

### VIS-001. 디자인 토큰 교체

- 라이트 모드를 Paper & Ink 팔레트로 교체했다.
- 다크 모드를 Candlelight 팔레트로 교체했다.
- `--pk-color-bg-elevated`, `--pk-color-primary-solid`, `--pk-color-primary-contrast`, `--pk-color-border-light`를 추가했다.

### VIS-002. 형태와 표면 정리

- radius 스케일을 상향했다.
- border와 shadow를 따뜻한 잉크/갈색 알파 계열로 조정했다.
- legacy 변수(`--primary-color`, `--bg-secondary` 등)를 새 토큰에 매핑했다.

### VIS-003. 하이라이트 팔레트 조정

- 라이트 모드는 색연필 느낌의 저채도 4색으로 조정했다.
- 다크 모드는 rgba 오버레이 4색으로 조정했다.
- 기존 DB에 저장된 legacy hex 하이라이트는 렌더링 시 CSS 변수로 매핑되도록 유지했다.

## 2. 검증 결과

```bash
cd client
npm run lint
```

결과: 성공.

```bash
cd client
npm run build
```

결과: 성공.

```bash
git diff --check
```

결과: 성공.

## 3. 브라우저 확인

환경:
- Vite: `http://localhost:5173/`
- API: `http://127.0.0.1:3001`

확인 값:
- 라이트 primary: `#8B5E3C`
- 라이트 bg: `#FAF6EF`
- 라이트 elevated: `#FFFAF2`
- 다크 bg: `#211C16`
- 다크 elevated: `#332C22`
- 다크 primary: `#C9A36B`
- 다크 primary solid: `#9A6B43`

## 4. 제한 사항

- `server/package.json`의 `npm run dev`는 `.env`가 없으면 종료되어, 검증 서버는 `node index.js`로 실행했다.
