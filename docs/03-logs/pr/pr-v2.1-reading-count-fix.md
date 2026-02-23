# PR: 읽은 책 중복 집계 + Range 통일

**Branch**: `feature/v2.1-reading-count-fix` → `feature/v2.1`
**Date**: 2026-02-23

## 1. 주요 변경 사항

- [x] `JournalStats.jsx` — 이번 달 읽은 책 카운트를 **고유 chapter Set**으로 변경 (중복 제거)
- [x] `ReadingProgress.jsx` — `getProgress`/`calcTotalProgress`에서 `chapter_from/to` 범위 올바르게 처리

### 변경 파일 요약
| 파일 | 변경 | 설명 |
|------|------|------|
| `JournalStats.jsx` | 로직 변경 | `bookChapters` Set으로 중복 제거 + range 처리 |
| `ReadingProgress.jsx` | 로직 변경 | `flatMap`으로 range 확장 (2곳) |

## 2. 검증 결과

- [x] `npm.cmd run build` 성공 (3.06s)
- [ ] 수동 검증: 같은 장 다중 날 읽기 → 1장 카운트 확인
- [ ] 수동 검증: 범위 읽기(1~3장) → ReadingProgress에서 3장 반영 확인

## 3. Review Point

- `JournalStats`의 `allReadChapters`(전역 완독체크)는 기존과 동일, `bookChapters`(이번 달 카운트)만 새로 추가
- `ReadingProgress`의 `log.chapter` fallback으로 레거시 데이터 호환

## 4. Agent Review

### 🔐 Security Review
**검토 결과**: ✅ Pass — 해당 없음

### 🧪 QA Review
**검토 결과**: ✅ Pass — `chapter_from || chapter` fallback으로 레거시 호환

### 🎨 UI/UX Implementation Review
**검토 결과**: ✅ Pass — UI 변경 없음, 숫자만 정확해짐

### ✨ Interaction Implementation Review
**검토 결과**: ✅ Pass — 해당 없음

### 🔧 Backend Implementation Review
**검토 결과**: ✅ Pass — 백엔드 변경 없음
