# Walkthrough v2.2.0 - Mobile Foundation

- 작성일: 2026-06-12
- 브랜치: `feature/v2.2-mobile-ux`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.2.0-mobile-ux.md`
- 관련 명세: `docs/02-specs/mobile-ux-final-adjustment-v2.md`
- 범위: PR-A. Mobile Foundation

## 1. 구현 요약

### MOB-001. viewport와 safe-area 정리

- `client/index.html`
  - `html lang`을 `ko`로 변경했다.
  - viewport meta에 `viewport-fit=cover`를 추가했다.
- `client/src/index.css`
  - `--pk-viewport-height`, `--pk-safe-area-*`, `--pk-header-height` CSS 변수를 추가했다.
  - `100svh`, `100dvh` 지원 브라우저에서 동적 viewport 높이를 사용하도록 fallback 체계를 추가했다.
  - 전역 `touch-action: pan-y`를 해제해 확대/제스처 접근성 제한 가능성을 줄였다.
- `client/src/components/Layout.css`
  - 루트 레이아웃 높이를 `var(--pk-viewport-height)` 기반으로 변경했다.
  - 상단/좌우 safe-area padding을 적용했다.
- `client/src/pages/ReadingDashboard.css`
  - 대시보드 컨테이너가 `100vh - 60px`에 직접 묶이지 않도록 조정했다.
- `client/src/pages/BibleChartPage.css`, `client/src/pages/Settings.css`
  - nested viewport에서 하단 잘림을 줄이도록 `min-height`를 정리했다.

### MOB-002/MOB-003. 입력 중 제스처 보호 기반

- `client/src/components/BibleViewer.jsx`
  - 구절 팝업이 열려 있거나 버튼/입력/링크/textarea/시트 영역에서 터치가 시작되면 장 이동 스와이프를 시작하지 않도록 보호했다.
- `client/src/pages/JournalPage.jsx`
  - 자유 묵상 또는 기도 입력 중에는 날짜 이동 스와이프를 시작하지 않도록 보호했다.
  - 버튼/입력/링크 등 인터랙션 타깃에서 시작한 터치를 날짜 스와이프로 해석하지 않도록 했다.

### MOB-004. 기본 접근성 및 모바일 방해 요소 정리

- `client/src/components/Header.jsx`
  - 읽기표, 글자 크기 조절, 테마, 설정 버튼에 `aria-label`을 추가했다.
- `client/src/components/Header.css`, `client/src/components/BibleViewer.css`
  - 모바일 헤더 탭/아이콘 버튼과 성경 이전/다음 버튼의 터치 영역을 44px 이상으로 맞췄다.
- `client/src/components/BibleViewer.jsx`
  - 성경 이전/다음 버튼에 명시적 `aria-label`을 추가했다.
- `client/src/services/api.js`
  - legacy `/api/notes` 호출을 `/api/free-notes`로 정리했다.
  - 404 응답을 자유 묵상 없음으로 처리할 수 있도록 error status를 보존했다.
- `client/src/components/Layout.jsx`
  - 현재 도달하지 않는 tracker modal 연결을 제거해 헤더 props와 layout dead code를 줄였다.
- lint 실패를 만들던 미사용 import, 미사용 핸들러, 도달 불가 참조를 정리했다.

## 2. 검증 결과

### 자동 검증

```bash
cd client
npm run lint
```

결과: 성공. PR-A 시점에 남아 있던 hook dependency 경고 6개는 v2.2 통합 정리에서 해소했다.

```bash
cd client
npm run build
```

결과: 성공.

### 브라우저 검증

검증 환경:
- 로컬 서버: `http://127.0.0.1:3001`
- Vite 클라이언트: `http://127.0.0.1:5173`
- 인앱 브라우저 viewport: 390×844

확인 결과:
- 앱이 `BibleMate`로 정상 로드된다.
- 루트 레이아웃은 390×844 viewport에서 `--pk-viewport-height: 100dvh`를 사용한다.
- `.layout-container`, `.app-main`, `.dashboard-container`가 viewport 하단까지 맞춰진다.
- 모바일에서 `dashboard-sidebar`는 `display: none`으로 본문을 침범하지 않는다.
- 헤더 탭, 읽기표, 다크 모드, 설정, 이전 장, 다음 장 버튼이 44px 이상 터치 영역을 가진다.
- 읽기표, 다크 모드, 설정, 이전 장, 다음 장 버튼은 명시적 `aria-label`을 가진다.
- 긴 장에서 하단으로 스크롤했을 때 `오늘 읽음 표시하기` 버튼이 viewport 안에 보인다.

### 수동 QA 필요 항목

아래 항목은 실제 iOS/Android viewport 또는 브라우저 에뮬레이션으로 추가 확인이 필요하다.

- iPhone Safari: 하단 토스트와 홈 인디케이터 겹침 여부 — 2026-06-12 사용자 수동 검증 완료
- iOS PWA standalone: 상단/하단 safe-area 적용 여부
- Android Chrome: 주소창/키보드 resize 상황에서 입력 영역이 과도하게 밀리지 않는지
- iPad mini portrait: 레이아웃 전환 경계에서 읽기표/설정 화면 하단 잘림 여부

## 3. PR-A 완료 판단

- `viewport-fit=cover`, dynamic viewport, safe-area 변수 기반이 들어갔다.
- 입력 중 스와이프 오작동을 줄이는 1차 guard가 들어갔다.
- 주요 헤더 아이콘 버튼명이 화면 리더에 노출되도록 개선했다.
- legacy `/api/notes` 잔여 호출을 정리했다.
- `npm run lint`와 `npm run build`가 실패 없이 완료된다.

PR-B는 이 기반 위에서 모바일 성경 상단 압축, 구절 액션 바텀시트, 전체 화면 묵상 작성 오버레이, 현재 장 묵상 시트, 하단 읽기 action bar를 진행한다.
