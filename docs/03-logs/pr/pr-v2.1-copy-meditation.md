# PR: 묵상 복사 기능 구현

## 1. 주요 변경 사항

- [x] 묵상일지 전체 복사 버튼 추가 (`JournalPage.jsx`)
- [x] 복사 텍스트 템플릿 구현 (날짜+읽은말씀 헤더, [발견한 하나님] / [자유 묵상] / [오늘의 기도] 섹션)
- [x] Mobile Safari 클립보드 fallback 구현 (`navigator.clipboard` → `execCommand('copy')`)
- [x] 구절 묵상 복사 양식 변경: `구절\n→ 내용` → `내용 (구절)` (Content-first)
- [x] 복사 버튼 UI 개선: `읽은 말씀` 헤더 내 우측 정렬, 수직 정렬 맞춤
- [x] `docs/lessons.md` 교훈 추가 (섹션 14)

## 2. 검증 결과

- [x] `vite build` 빌드 성공 (에러/경고 0)
- [x] 데스크톱 Chrome — 묵상 복사 정상 동작 확인
- [x] iPhone Safari — 복사 정상 동작 확인 (fallback 덕분)
- [x] 빈 섹션 생략 확인 (내용 없는 항목은 복사 텍스트에서 제외)
- [x] 복사 후 `묵상 복사` → `복사됨` + 초록 아이콘 전환 확인

## 3. Review Point

- **클립보드 fallback**: `window.isSecureContext`가 false인 환경(HTTP)에서는 execCommand를 사용. Fly.io는 HTTPS이므로 프로덕션에서는 항상 `navigator.clipboard` 사용 예상.
- **읽은 말씀이 없는 날**: `todayLogs.length === 0`이면 복사 버튼이 미노출됨. 단, 해당 날에 묵상만 있고 읽기 기록이 없는 케이스는 드뭄.

## 4. Agent Review

### 🔐 Security Review

**검토 결과**: ✅ Pass

- 백엔드 API 변경 없음 — 신규 취약점 표면 없음
- 복사 텍스트는 `textContent` 기반 조합 (XSS 위험 없음)
- `document.execCommand`는 deprecated이나, 클립보드 접근 제한 환경의 fallback으로 허용 가능 (민감 데이터 미포함)

| 심각도 | 유형 | 설명 |
|--------|------|------|
| 🟢 Info | execCommand deprecation | fallback 전용, 삭제 예정이나 현재 브라우저 지원 유지 중 |

### 🧪 QA Review

**검토 결과**: ✅ Pass

| 항목 | 상태 |
|------|------|
| 빌드 통과 | ✅ |
| 빈 섹션 처리 | ✅ |
| Safari fallback | ✅ |
| 아이콘 상태 전환 | ✅ |

- 읽기 기록 없이 묵상만 있는 날 복사 버튼 미노출 케이스는 Review Point에 기록

### 🎨 UI/UX Implementation Review

**검토 결과**: ✅ Pass (계획 대비 구현 일치)

- 버튼 위치: 계획(읽은 말씀 앞) → 구현(읽은 말씀 헤더 내부) — 사용자 요청으로 개선됨
- `section-header` + `section-actions` 기존 패턴 재사용 → 디자인 일관성 유지
- 수직 정렬: `section-title` margin-bottom을 `section-header`로 이동, 모든 섹션 개선

### ✨ Interaction Implementation Review

**검토 결과**: ✅ Pass

| 요소 | 구현 |
|------|------|
| Trigger | 버튼 탭/클릭 |
| Feedback | `Copy → Check` 아이콘 전환 + 초록색 `copied` 클래스 |
| Loops | `setTimeout 2000ms` 후 복원 |
| Transition | `200ms ease` |

### 🔧 Backend Implementation Review

**검토 결과**: ✅ Pass (변경 없음)

- 백엔드 코드 미변경, 기존 API 데이터를 프론트에서 가공
