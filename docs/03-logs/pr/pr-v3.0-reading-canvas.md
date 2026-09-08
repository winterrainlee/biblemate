# PR: v3.0 — Reading Canvas

**Branch**: `feature/v3.0-reading-canvas` → `feature/v3.0`
**Date**: 2026-09-08
**Version**: v3.0.0
**Status**: 사용자 실기기 승인 완료 / 통합 승인 대기

## 1. 주요 변경 사항

- [x] 큰 paper card, 강한 border/shadow와 3컬럼 전제를 제거하고 단일 Reading Canvas 구성
- [x] 실제 가용 폭 기반 Compact / Reading / Workspace 반응형 적용
- [x] 본문 최대 폭, 좌우 여백, 글자 크기, 행간과 절 간격 재조정
- [x] 절 번호를 본문 기준선에 배치하고 기존 묵상은 왼쪽 마진 선으로 분리
- [x] 장·역본·Aa·읽기 상태 조작부의 시각적 무게 축소
- [x] 기존 묵상·하이라이트·장 이동과 데이터/API 계약 유지
- [x] PR 리뷰 후 절 번호·묵상선 대비, 클릭 우선순위, 44px 조작 영역과 기본 dialog semantics 보강

## 2. 검증 결과

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check origin/feature/v3.0...HEAD`
- [x] 375×812 — Compact / iPhone 13 mini급
- [x] 650×900 — Reading / iPad·desktop 1:1 Split View급
- [x] 1280×900 — Desktop Workspace
- [x] Light / Dark 및 4색 하이라이트 대비 확인
- [x] 긴 절과 짧은 절이 섞인 실제 장 줄바꿈 확인
- [x] 기존 묵상 표시·상세 열기와 하이라이트 레이아웃 확인
- [x] 이전/다음 장 이동 회귀 확인
- [x] iPhone 13 mini Safari 실기기 검수 및 사용자 최종 승인

상세 증거는 [Reading Canvas Walkthrough](../walkthroughs/walkthrough-v3.0-reading-canvas.md)를 기준으로 한다.

## 3. Review Point

- 본문이 앱 chrome보다 먼저 읽히는지
- 375 / 650 / 1280px에서 한 줄 길이와 좌우 여백이 자연스러운지
- 절 번호와 묵상 마진 선의 위계·간격·클릭 동작이 분명한지
- 이번 diff가 Verse Selection, Composer, Copy, Journal/Chart/Settings, DB/API로 확장되지 않았는지

## 4. Agent Review

### 🔐 Security Review

- Critical 없음.
- 신규 사용자 입력 HTML 주입, 인증정보, 토큰 또는 비밀키 없음.
- 공개 문서의 Tailscale 주소는 익명화했다.
- 실제 사용 날짜가 보이는 데스크톱 Dark 검증 이미지는 PR 대상에서 제거했다.
- 나머지 검증 이미지는 묵상 본문을 노출하지 않지만 기존 기록의 개수 등 비민감 UI 메타데이터는 포함한다.

### 🧪 QA Review

- Critical 없음.
- `lint`, build, diff check 모두 통과.
- 구현계획·진행표·Walkthrough의 완료 상태를 동기화했다.
- 4색 하이라이트는 CSS 매핑과 대비 계산을 교차 검증했다. Light `7.74~8.87:1`, Dark `4.94~8.45:1`.
- 자동 UI 테스트 스크립트가 없어 상호작용 회귀는 브라우저 및 실기기 수동 검증 기록에 의존한다.

### 🎨 UI/UX Implementation Review

- Critical 없음.
- 단일 컬럼, `42rem/46rem` 최대 폭과 세 기준 폭에서 본문 중심 위계가 구현계획과 일치한다.
- 리뷰에서 발견한 절 번호 및 묵상선 대비를 보강했다. 절 번호 Light/Dark `4.89/7.60:1`, 묵상선 Light/Dark `3.17/4.63:1`.
- 최종 C안의 375px Light/Dark 증거를 남겼다.

### ✨ Interaction Implementation Review

- Critical 없음.
- Compact의 장 묵상과 Aa 조작 영역을 `44px`로 보강했다.
- 절 번호를 묵상선 hit area보다 위에 배치해 번호는 기존 절 선택, 선은 기존 묵상 상세 열기로 동작함을 확인했다.
- 본문 선택·장 묵상·Aa 시트에 dialog semantics, 초기 닫기 포커스와 Escape 닫기를 추가했다.
- 완전한 focus trap은 구현하지 않았다. Reading Canvas의 모바일 중심 범위에서는 Warning으로 남기고 후속 접근성 통합 시 검토한다.

### 🔧 Backend Implementation Review

- `server/`, DB·SQL, API service, package/lockfile 변경 없음.
- API 요청, 묵상 저장·삭제와 하이라이트 데이터 처리 로직 변경 없음.
- 데이터/API 계약과 마이그레이션 위험 없음.

## 5. 알려진 제한

- 묵상이 없는 날짜의 자유 묵상 조회 `404` console error는 선행 이슈이며 이번 변경의 회귀가 아니다.
- Google Fonts는 네트워크 상태에 따라 fallback serif로 먼저 보일 수 있다.
- 자동화된 unit/e2e UI 테스트가 없어 수동 회귀 기록을 기준으로 한다.
- 시트의 완전한 키보드 focus trap은 후속 접근성 통합 검토 대상으로 남긴다.

## 6. 범위 확인

- Verse Selection 새 구현 없음
- Context Toolbar, Reflection Composer, Copy 개선 없음
- Journal / Chart / Settings 전면 재설계 없음
- DB/API 변경 없음
- 다음 v3.0 feature 선행 구현 없음
- 이 PR 준비 과정에서 push, 원격 PR 생성, `feature/v3.0` 병합을 수행하지 않음
