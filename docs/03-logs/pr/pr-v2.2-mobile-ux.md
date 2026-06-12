# PR: v2.2 — 모바일 UX 재설계

**Branch**: `feature/v2.2-mobile-ux` → `feature/v2.2`
**Date**: 2026-06-12
**Version**: v2.2.0

---

## 1. 주요 변경 사항

### 모바일 안정화 기반
- [x] `viewport-fit=cover`, safe-area CSS 변수, `100dvh/100svh` fallback 적용
- [x] 입력/팝업/시트 조작 중 장·날짜 스와이프 오작동 방지
- [x] 주요 모바일 버튼의 `aria-label`과 44px 터치 영역 보강
- [x] legacy `/api/notes` 호출을 `/api/free-notes`로 정리

### 모바일 성경 읽기 흐름
- [x] 성경 상단을 compact context bar로 압축
- [x] 역본/책/장 변경을 모바일 바텀시트로 이동
- [x] 구절 액션을 바텀시트로 전환하고 `묵상하기`를 첫 액션으로 배치
- [x] 모바일 묵상 작성 전체 화면 오버레이 추가
- [x] 선택한 말씀 본문을 작성 화면 상단에 항상 표시
- [x] 📝 아이콘 탭 시 해당 구절 묵상 목록으로 직접 이동
- [x] 현재 장 묵상 목록 바텀시트 추가
- [x] 이전/읽음 표시/다음/묵상일지 이동 하단 action bar 추가

### 모바일 묵상일지·읽기표·가독성
- [x] 묵상일지 날짜 선택 시트, 오늘 버튼, 최근 기록 목록 추가
- [x] 모바일 월간 요약 추가
- [x] 빈 상태 CTA를 `오늘 묵상 시작하기` 하나로 정리
- [x] 성경 본문 전용 `Aa` 글자 크기 조절 추가
- [x] 읽기표 `다음 안 읽은 장 읽기` 버튼 추가
- [x] 책 row 탭으로 해당 책의 다음 안 읽은 장 이동

### 문서
- [x] 모바일 UX 최종 조정안 v2 저장
- [x] v2.2 구현 계획서 작성
- [x] PR-A/PR-B/PR-C walkthrough 작성
- [x] PR-A/PR-B/PR-C 초안 작성
- [x] v2.2 dev-log, release notes, lessons 업데이트

---

## 2. 검증 결과

| 항목 | 결과 |
|------|------|
| `cd client && npm run lint` | ✅ 성공, warning 없음 |
| `cd client && npm run build` | ✅ 성공 |
| `git diff --check` | ✅ 성공 |
| iPhone Safari PR-A 수동 QA | ✅ 통과 |
| iPhone Safari PR-B 수동 QA | ✅ 통과 |
| iPhone Safari PR-C 수동 QA | ✅ 통과 |

---

## 3. Review Point

- 데스크탑 3컬럼 성경 읽기 경험은 유지하고, 모바일에서만 compact bar, 바텀시트, 전체 화면 작성, 하단 action bar를 활성화했다.
- 묵상 작성 전체 화면 오버레이는 사용자 결정에 따라 B안으로 확정했고, 선택한 말씀 본문을 항상 표시한다.
- 읽기표 장 셀 전체를 버튼화하지 않고 `다음 안 읽은 장 읽기`와 책 row 진입점으로 접근성 리스크를 줄였다.
- 전역 하단 탭바, 오프라인/PWA 서비스 워커, 묵상 대상일/작성일 분리는 후속 결정 항목으로 남겼다.
- 배포 전 통합 정리에서 기존 hook dependency warning 6개를 해소했다.

---

## 4. 관련 문서

| 문서 | 설명 |
|------|------|
| [mobile-ux-final-adjustment-v2.md](../../02-specs/mobile-ux-final-adjustment-v2.md) | v2.2 모바일 UX 최종 조정안 |
| [implementation-plan-v2.2.0-mobile-ux.md](../../01-planning/implementation-plans/implementation-plan-v2.2.0-mobile-ux.md) | 구현 계획 |
| [walkthrough-v2.2.0-mobile-foundation.md](../walkthroughs/walkthrough-v2.2.0-mobile-foundation.md) | PR-A 검증 기록 |
| [walkthrough-v2.2.0-mobile-bible-flow.md](../walkthroughs/walkthrough-v2.2.0-mobile-bible-flow.md) | PR-B 검증 기록 |
| [walkthrough-v2.2.0-mobile-journal-chart.md](../walkthroughs/walkthrough-v2.2.0-mobile-journal-chart.md) | PR-C 검증 기록 |
| [dev-log-v2.2.md](../dev-log-v2.2.md) | v2.2 개발 로그 |
| [release-notes-v2.2.0.md](../../04-releases/release-notes-v2.2.0.md) | v2.2.0 릴리즈 노트 |

---

## 5. 관련 커밋

- `c22e9ce` feat: add mobile UX foundation
- `b0c7fc3` feat: redesign mobile bible flow
- `74ce224` feat: improve mobile journal and chart flow
- `14d4d5a` docs: finalize v2.2 mobile ux notes
