# BibleMate v3.0 Reading Canvas 구현 계획

- 목표 버전: v3.0.0
- 작업: Reading Canvas prototype
- 기준 명세: `docs/02-specs/spec-v3.0.md`
- 상태: 초안 / 사용자 승인 전

## Goal

- 기능 연결보다 먼저 성경 본문 자체의 읽기 경험을 재설계하고, iPhone 13 mini / 1:1 Split View / Desktop Workspace 세 폭에서 사용 가능한 Reading Canvas prototype을 만든다.

## User Review Required

- [ ] 본문 최대 폭, 여백, 행간, 절 간격의 방향 승인
- [ ] 절 번호와 묵상 존재 표시 방식 승인
- [ ] 장/역본/Aa 컨트롤의 위치와 시각적 무게 승인
- [ ] Compact / Reading / Workspace에서 본문이 한 화면의 주역으로 보이는지 승인
- [ ] iPhone 13 mini 실기기에서 실제 읽기/스크롤/터치 검수 승인
- [ ] prototype 승인 전 Selection/Composer 구현으로 넘어가지 않음

## Proposed Changes

### `client/src/components/BibleViewer.jsx`

- 현재 Reading 화면의 시각 구조를 Reading Canvas 중심으로 단순화한다.
- 기존 구절 데이터 렌더링 로직은 최대한 재사용한다.
- 이번 단계에서는 기존 selection/action popup 로직을 새 인터랙션으로 완성하지 않는다.
- prototype 검증에 필요 없는 기능 추가를 하지 않는다.

### `client/src/components/BibleViewer.css`

- 큰 paper card, 과한 border/shadow를 제거하거나 축소한다.
- 본문 폭, 좌우 여백, 글자 크기, 행간, 절 간격, 절 번호를 재설계한다.
- 3-column 전제에서 벗어난 단일 Reading Canvas를 기본으로 만든다.
- 반응형 상태는 임시 기준값으로 Compact / Reading / Workspace를 검증한다.

### `client/src/components/Header.*` 또는 Reading Header

- 필요한 경우 Reading 중 전역 헤더의 시각적 무게를 축소한다.
- 본문보다 먼저 보이는 장식/조작을 만들지 않는다.

## Non-Goals

- Verse Selection 새 구현
- Context Toolbar 구현
- Reflection Composer 구현
- 새로운 역본/검색/통계 기능
- DB/API 변경
- Journal/Chart/Settings 전면 리디자인

## Verification Plan

### Automated Tests

- [ ] `cd client && npm run lint`
- [ ] `cd client && npm run build`

### Desktop / Emulation Verification

- [ ] 약 375px: iPhone 13 mini급 폭
- [ ] 약 600~700px: iPad/desktop 1:1 Split View급 폭
- [ ] 1000px 이상: Desktop Workspace
- [ ] Light mode
- [ ] Dark mode
- [ ] 긴 절/짧은 절 혼합 장에서 줄바꿈 확인
- [ ] 하이라이트 4색이 본문 가독성을 해치지 않는지 확인
- [ ] 기존 묵상 표시가 레이아웃을 깨뜨리지 않는지 확인
- [ ] 이전/다음 장 이동 등 기존 기능이 prototype 때문에 깨지지 않았는지 확인

### Real-device Verification — Required Gate

실기기 검수는 Desktop responsive emulation을 대체하지 않고 그 다음 단계로 수행한다.

개발 작업은 Codex Remote Control을 통해 원격으로 진행할 수 있다. 실기기 검수 시점에만 개발 머신에서 BibleMate를 외부 접근 가능하게 실행한다.

권장 절차:

1. 자동 검증과 Desktop/Emulation 검증을 먼저 통과한다.
2. 사용자가 실기기 검수를 요청하면 개발 서버를 `0.0.0.0`에서 접근 가능하도록 실행한다.
3. 개발 머신과 iPhone이 연결된 Tailscale 네트워크를 이용해 iPhone 13 mini에서 접속한다.
4. Reading Canvas 단계에서는 Tailscale HTTP 접근만으로도 기본 레이아웃/읽기/스크롤 검수가 가능하다.
5. Clipboard, PWA, secure-context API를 다루는 후속 feature에서는 필요 시 Tailscale HTTPS/Serve 환경을 사용한다.
6. 검수 완료 후 walkthrough에 사용 기기, 접근 방식, 관찰 결과와 사용자 승인 여부를 기록한다.

실기기 필수 확인 항목:

- [ ] iPhone 13 mini 실제 Safari/PWA에서 본문을 자연스럽게 읽을 수 있음
- [ ] 실제 safe-area에서 헤더/본문/하단 영역이 잘리지 않음
- [ ] 주소창 변화와 실제 viewport 높이 변화가 읽기 흐름을 깨뜨리지 않음
- [ ] 세로 스크롤이 자연스럽고 장 이동 제스처와 충돌하지 않음
- [ ] 구절 row의 실제 터치 감각과 오터치 가능성을 확인함
- [ ] 20~30분 읽기를 상정했을 때 행간, 절 간격, 좌우 여백이 편안함

### Verification Layers

```text
1. Automated
   lint / build
        ↓
2. Desktop Emulation
   375px / 600~700px / 1000px+
        ↓
3. Real Device
   iPhone 13 mini via Tailscale
        ↓
4. User Approval
        ↓
다음 feature 진행
```

## Prototype Acceptance Gate

다음 질문에 사용자가 긍정적으로 답하고 iPhone 13 mini 실기기 검수를 승인하기 전에는 다음 feature로 넘어가지 않는다.

> **이 화면에서 20~30분 동안 성경을 읽고 싶은가?**

Codex는 자동/에뮬레이션 검증만으로 이 게이트를 통과한 것으로 간주하지 않는다. 실기기 검수가 필요한 상태가 되면 개발 서버를 띄울 준비를 하고 사용자 검수를 기다린다.

---

## Agent Review

### 🧪 QA Engineer Review

- 세 기준 폭에서 동일 본문을 비교할 수 있도록 고정 검증 장을 정하는 것이 좋다.
- 기능 구현보다 시각 회귀를 보는 단계이므로 screenshot 기준점을 남기는 것을 권장한다.
- iOS 실기기 결과는 Desktop emulation과 별도 항목으로 walkthrough에 기록한다.

### 🎨 UI/UX Review

- 본문을 카드에서 꺼내는 것만으로 끝내지 말고, 한 줄 길이와 행간을 핵심 품질 지표로 삼아야 한다.
- 장 제목, 절 번호, 묵상 마커가 본문과 경쟁하지 않도록 위계를 낮춰야 한다.
- 최종 Reading Canvas 승인에는 실제 iPhone에서의 장시간 읽기 감각을 포함한다.

### ✨ Interaction Design Review

- 이번 단계에서는 선택 인터랙션을 확장하지 않고, 기존 클릭 가능성이 읽기 흐름을 방해하는지만 관찰한다.
- 이후 Selection 도입을 고려해 각 verse row의 hit area와 hover/active 피드백 공간은 남겨둔다.
- 실제 손가락 터치와 스크롤 감각은 실기기에서 확인한다.

### 💻 Frontend Review

- `BibleViewer.jsx`가 이미 많은 상태와 기능을 포함하므로 Reading Canvas 단계에서 대규모 컴포넌트 분리는 피한다.
- CSS 구조를 먼저 정리하고, 다음 feature에서 interaction state 분리를 검토하는 편이 안전하다.
- 실기기 검수 요청 시 Vite 개발 서버를 Tailscale에서 접근 가능한 방식으로 실행할 수 있도록 한다.

### 🔧 Backend Review

- 이번 작업은 frontend-only로 유지한다.
- API/DB 변경이 필요하다는 판단이 나오면 구현을 중단하고 별도 승인 대상으로 올린다.
