# PR: SIGTERM 종료 + 레거시 API 정리

**Branch**: `feature/v2.1-backend-cleanup` → `feature/v2.1`
**Date**: 2026-02-23

## 1. 주요 변경 사항

- [x] `index.js` — SIGTERM/SIGINT graceful shutdown 핸들러 추가
- [x] `index.js` — 레거시 `/api/notes` 라우트 제거
- [x] `routes/notes.js` — 파일 삭제

## 2. 검증 결과

- [x] `npm.cmd run build` 성공 (3.03s)
- [ ] 수동 검증: Ctrl+C → "SIGINT received. Saving database..." 메시지 및 정상 종료
- [ ] 수동 검증: `/api/notes` → 404, `/api/free-notes` 정상 동작

## 3. Review Point

- `saveDB()`가 `writeFileSync` 기반이므로 시그널 핸들러에서 안전
- `server.close()` → 진행 중 요청 완료 후 종료 보장

## 4. Agent Review

모든 Sub-agent ✅ Pass (Security — 해당 없음, QA/Backend — graceful shutdown 검증 OK, UI/UX/Interaction/Frontend — 해당 없음)
