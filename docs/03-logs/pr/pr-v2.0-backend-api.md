# PR: V2.0 Backend API 구현

## 1. 주요 변경 사항

### DB 스키마 및 마이그레이션
- [x] 신규 테이블 추가: `verse_notes`, `free_notes`, `daily_prayers`
- [x] 인덱스 추가: `idx_verse_notes_chapter`, `idx_verse_notes_date`
- [x] 마이그레이션 로직: `notes` → `free_notes` 자동 이관
- [x] 백업/복구 시스템 V2 스키마 지원

### Backend API 엔드포인트
- [x] `server/routes/verse-notes.js`: 구절별 묵상 CRUD API
  - `GET /api/verse-notes?date=YYYY-MM-DD`
  - `GET /api/verse-notes/chapter/:book/:chapter`
  - `GET /api/verse-notes/:book/:chapter`
  - `POST /api/verse-notes` (UPSERT)
  - `DELETE /api/verse-notes/:id`
- [x] `server/routes/free-notes.js`: 자유 묵상 CRUD API
  - `GET /api/free-notes/:date`
  - `POST /api/free-notes` (UPSERT)
  - `DELETE /api/free-notes/:date`
- [x] `server/routes/prayers.js`: 오늘의 기도 CRUD API
  - `GET /api/prayers/:date`
  - `POST /api/prayers` (UPSERT)
  - `DELETE /api/prayers/:date`
- [x] `server/index.js`: 신규 라우트 등록

## 2. 검증 결과
- [x] `npm run dev` 실행 확인 (서버 정상 기동)
- [x] `node server/scripts/verify-v2.js` 마이그레이션 테스트 Pass
- [x] API 수동 테스트 Pass
  - verse-notes: 생성, 조회, UPSERT, 삭제 ✅
  - free-notes: 생성, 조회, 삭제 ✅
  - prayers: 생성, 조회, 삭제 ✅
  - backup/export: V2 스키마 export ✅

## 3. Review Point
- **UPSERT 동작**: `verse-notes`는 `(date, book, chapter, verse)` 조합이 같으면 수정, `free-notes`와 `prayers`는 `date`가 같으면 수정됩니다.
- **Legacy 호환성**: V1 백업 파일 import 시 `notes`가 `free_notes`로 자동 변환됩니다.
- **기존 API 영향 없음**: `/api/notes` (legacy)는 유지되지만 Deprecated 상태입니다.

## 4. 관련 문서
- [spec-v2.0.md](../02-specs/spec-v2.0.md)
- [dev-log-v2.0.md](./dev-log-v2.0.md)
