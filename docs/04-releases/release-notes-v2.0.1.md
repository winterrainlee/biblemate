# Release Notes v2.0.1 - Stability Hotfix (Phase 0)

- **배포일**: 2026-01-29
- **유형**: Patch (Hotfix)
- **관련 문서**: [implementation-plan-v2.0.1-phase0-stability.md](../01-planning/implementation-plans/implementation-plan-v2.0.1-phase0-stability.md)

---

## 📋 변경 사항 요약

이 버전은 v2.0.0 코드 리뷰에서 발견된 P0(크리티컬) 이슈 4건을 해결하는 안정화 핫픽스입니다.

### 🔒 보안 (Security)
- **P0-1**: Host 헤더 기반 `localhost` 인증 예외 제거
  - 기존: `req.hostname === 'localhost'` 조건으로 인증 우회 가능
  - 변경: `NODE_ENV` 기반 분기로 전환, 개발 환경 세션 TTL 30일
  - 환경변수: `DEV_SESSION_DAYS` (기본값 30)

### 🐛 버그 수정 (Bug Fixes)
- **P0-2**: 백업 복원 시 `verse_range` 유실 문제 해결
  - `server/routes/backup.js` INSERT 구문에 `verse_range` 컬럼 추가

- **P0-3**: `/api` 미매칭 GET 요청 JSON 404 반환
  - 기존: SPA fallback이 `/api/unknown`에도 HTML 반환
  - 변경: `/api/*` 미매칭 시 JSON 404 반환 후 SPA fallback 처리

- **P0-4**: date-only 파싱 유틸 도입 (타임존 하루 밀림 방지)
  - `new Date('YYYY-MM-DD')` → `parseDateOnly()` 유틸 적용
  - `date-fns` 기반 로컬 날짜 파싱으로 타임존 문제 해결

---

## 📁 변경 파일

### Backend (PR-A)
- `server/routes/auth.js` - 인증 로직 수정
- `server/routes/backup.js` - verse_range 추가
- `server/index.js` - API 404 처리, dev 바인딩

### Frontend (PR-B)
- `client/src/utils/dateOnly.js` - 날짜 파싱 유틸 (신규)
- `client/src/components/JournalStats.jsx` - 날짜 파싱 적용
- `client/src/components/NotePreview.jsx` - 날짜 파싱 적용
- `client/src/components/NoteEditor.jsx` - 날짜 파싱 적용
- `client/src/pages/JournalPage.jsx` - 날짜 파싱 적용

### Documentation
- `docs/lessons.md` - Section 11 추가 (v2.0.1 교훈)

---

## ✅ 테스트/검증

- [x] 로컬/모바일 접속 정상
- [x] /api 404 JSON 응답 확인
- [x] 백업 export→import 후 verse_range 보존 확인
- [x] 월별 통계/필터 정상 동작
- [ ] 타임존 하루 밀림 재현 케이스 확인 (추가 검증 필요)

---

## ⚠️ 주의사항

- dev 서버 기본 바인딩이 `127.0.0.1`입니다. LAN 접근이 필요하면 `BIND_HOST=0.0.0.0` 설정
- 세션은 메모리 기반이므로 서버 재시작 시 재로그인 필요
