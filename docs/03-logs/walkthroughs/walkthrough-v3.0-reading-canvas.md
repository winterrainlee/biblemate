# Walkthrough v3.0 - Reading Canvas

- 작성일: 2026-09-08
- 브랜치: `feature/v3.0-reading-canvas`
- 구현 기준 커밋: `3de2c81` 이후 작업 트리
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v3.0-reading-canvas.md`
- 관련 명세: `docs/02-specs/spec-v3.0.md`
- 현재 상태: **자동/에뮬레이션 검증 완료, iPhone 13 mini 실기기 검수 대기**

## 1. 구현 범위

- 기본 Reading 화면에서 기존 좌우 묵상 패널을 숨기고 본문을 단일 Reading Canvas로 정리했다.
- 본문의 큰 paper card, border, radius, shadow와 2단 조판을 제거했다.
- 본문 최대 폭을 Workspace에서 `46rem`, Reading 폭에서 `42rem`으로 제한했다.
- 절 행을 절 번호 gutter와 본문으로 나누고, 본문 크기·행간·절 간격·좌우 여백을 재조정했다.
- 기존 빨간 밑줄과 `📝` 중첩 표시를 제거하고 절 번호 옆의 작은 점으로 묵상 존재를 표시했다. 보이는 점은 작지만 기존 묵상 열기 버튼의 hit area는 `44×44px`다.
- 장/역본/Aa/읽음/묵상 조작의 면과 강조를 줄여 본문보다 먼저 보이지 않도록 했다.
- 기존 `이 장의 묵상` 시트를 모든 폭에서 접근 가능하게 유지했다. Compact에서는 bottom sheet, 넓은 폭에서는 중앙 modal로 표현한다.
- 전역 Header는 Reading 상태에서만 시각적 무게를 낮췄다.
- Verse Selection, Context Toolbar, Composer, Copy, API, DB는 변경하지 않았다.

## 2. 자동 검증

기준선과 구현 후 모두 다음 명령이 성공했다.

```bash
cd client
npm run lint
npm run build
```

최종 결과:

- ESLint: 성공, 오류/경고 없음
- Vite build: 성공, 2,573 modules transformed
- 빌드 산출물 생성: 성공

## 3. 반응형 및 시각 검증

고정 검증 장은 긴 절과 짧은 절이 섞인 에스겔 9장, 기존 데이터 검증 장은 묵상 5개와 하이라이트 1개가 함께 있는 에스겔 2장을 사용했다.

### 375×812 — Compact / iPhone 13 mini급

- Reading Canvas 폭 `337px`, 실제 본문 폭 약 `300.23px`
- 본문 `16.96px`, 행간 `33.58px`
- 가로 overflow 없음
- 양쪽 기존 묵상 패널 `display: none`
- 본문 첫 화면이 v2.3 기록의 약 `312.9px`보다 이른 약 `180~200px` 지점에서 시작
- Compact 하단의 이전/읽음/다음 기능 유지
- 묵상 5개 bottom sheet: `375px` 폭, 카드 5개 렌더, 가로 overflow 없음

스크린샷:

- [375px Light](../../assets/reading-canvas/reading-canvas-375-light.png)
- [375px Light — 묵상/하이라이트](../../assets/reading-canvas/reading-canvas-375-notes-highlight-light.png)
- [375px Dark — 묵상/하이라이트](../../assets/reading-canvas/reading-canvas-375-notes-highlight-dark.png)

### 650×900 — Reading / 1:1 Split View급

- Reading Canvas 폭 `590px`, 실제 본문 폭 약 `534.83px`
- 본문 `17.01px`, 행간 `34.02px`
- 단일 본문 유지, mobile bottom action bar 미표시
- 가로 overflow 없음

스크린샷:

- [650px Light](../../assets/reading-canvas/reading-canvas-650-light.png)

### 1280×900 — Workspace

- Reading Canvas 폭 `736px`, 실제 본문 폭 약 `680.83px`
- 본문 `18.14px`, 행간 `36.29px`
- `column-count: auto`, 양쪽 기존 묵상 패널 미표시
- 가로 overflow 없음
- `이 장의 묵상`은 `480px` 중앙 modal로 열리고 기존 카드 5개를 표시

스크린샷:

- [1280px Light](../../assets/reading-canvas/reading-canvas-1280-light.png)
- [1280px Dark — 묵상/하이라이트](../../assets/reading-canvas/reading-canvas-1280-notes-highlight-dark.png)

### Light / Dark와 기존 표시

- 에스겔 2장에서 묵상 점 5개와 하이라이트 행 1개 렌더 확인
- Light 하이라이트: `rgb(242, 220, 146)`
- Dark 하이라이트: `rgba(214, 176, 89, 0.45)`
- Dark 본문: `rgb(237, 229, 216)`
- Dark 하이라이트 합성 배경 대비 본문 대비율: 약 `4.94:1`로 WCAG AA 일반 텍스트 기준 통과
- 하이라이트와 묵상 점이 함께 있는 절에서도 충돌이나 본문 밀림 없음

## 4. 기존 Reading 기능 회귀

- Compact `다음`: 에스겔 2장 → 3장 이동 확인
- Compact `이전`: 에스겔 3장 → 2장 복귀 확인
- 장/책/역본 select의 기존 값과 변경 흐름 유지
- 묵상 점 클릭과 `이 장의 묵상` 접근 경로 유지
- 선택/하이라이트/복사/묵상 작성 로직은 이번 단계에서 변경하지 않음

## 5. 시각 QA

- Codex가 실제 스크린샷과 DOM/CSS 측정값을 직접 확인했다.
- 로컬 Gemma E4B는 375px Light/Dark에서 본문 clipping이나 bottom bar의 과도한 우세를 발견하지 않았다.
- E4B가 제기한 Dark 하이라이트 대비는 계산 결과 `4.94:1`로 검증했다.
- 로컬 Gemma 26B 2차 검토는 실기기 검수 전 blocker/major 이슈가 없다고 판단했다.
- 남은 prototype 판단 항목은 5×5px 묵상 점의 실제 발견성이다. 버튼 hit area는 44×44px이며 최종 감각은 실기기에서 확인한다.

## 6. 알려진 제한 / 범위 밖 신호

- 묵상이 없는 날짜의 기존 자유 묵상 조회가 `404`를 반환하고 console error로 기록된다. Reading Canvas 변경 전부터 존재하며 본문/묵상 시트 표시에는 영향을 주지 않았다. 이번 frontend-only 범위에서는 수정하지 않았다.
- Google Fonts는 네트워크 상태에 따라 fallback serif로 먼저 보일 수 있다.
- Desktop emulation은 실제 iOS Safari safe-area, 주소창 축소/확대, 손가락 스크롤 감각을 대신하지 않는다.

## 7. iPhone 13 mini 실기기 검수 준비

- 접근 방식: Tailscale HTTP
- 프론트엔드: 개발 머신 Tailscale IP의 Vite 서버
- 백엔드: `127.0.0.1:3001` 로컬 전용 유지
- API: 기존 Vite `/api` proxy 사용
- 검수 주소: `http://100.64.23.61:5173/`
- 프론트엔드와 `/api/health` 모두 HTTP 200 확인
- 확인 시점에 `iphone-13-mini`는 Tailscale offline 상태였으므로, 접속 전 iPhone의 Tailscale 연결이 필요하다.

## 8. 실기기 승인 게이트 — 미완료

아래 항목은 사용자 검수 후 기록한다.

### 2026-09-08 iPhone 13 mini 1차 확인

- Tailscale HTTP 주소가 실제 iPhone Safari에서 정상 표시됨.
- 사용자 피드백: “잘 보이고, 읽는 데는 지장이 없음.”
- 최초 확인 장은 에스겔 9장과 10장이었으며, 로컬 DB에 해당 장 묵상이 없어 점 표시와 묵상 목록이 보이지 않았음.
- Tailscale API 경로에서 에스겔 2장의 기존 묵상 5개(1, 3, 6, 8, 10절)와 5절 하이라이트 응답을 재확인함.
- 실제 iPhone에서 에스겔 2장으로 이동한 뒤 묵상 점·목록·하이라이트 표시를 추가 확인해야 함.

- [ ] 실제 iPhone 13 mini Safari/PWA safe-area 확인
- [ ] Safari 주소창 변화 중 viewport/스크롤 확인
- [ ] 실제 손가락 스크롤과 장 이동 제스처 충돌 확인
- [ ] 본문 크기, 행간, 절 간격, 좌우 여백의 20~30분 읽기 감각 확인
- [ ] 묵상 점 발견성과 `Aa`/장 선택 조작의 시각적 무게 확인
- [ ] 사용자 최종 질문 승인: **이 화면에서 20~30분 동안 성경을 읽고 싶은가?**

실기기 승인 전에는 Reading Canvas를 완료 처리하거나 다음 feature를 시작하거나 `feature/v3.0`에 병합하지 않는다.
