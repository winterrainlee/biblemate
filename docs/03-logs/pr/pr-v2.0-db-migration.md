# PR: V2.0 DB Schema & Migration

## 🚀 Key Changes
- **DB Schema**:
  - `verse_notes` (구절별 묵상), `free_notes` (자유 묵상), `daily_prayers` (오늘의 기도) 테이블 추가.
  - 관련 인덱스(`idx_verse_notes_lookup` 등) 추가.
- **Migration**:
  - `server/db/migration.js` 모듈 구현.
  - 앱 시작 시(`initDB`) 기존 `notes` 데이터를 감지하여 `free_notes`로 자동 이관.
- **Backup/Import**:
  - V2 신규 테이블 백업/복구 지원.
  - 구버전 백업 파일(`notes` 포함) Import 시 `free_notes`로 자동 마이그레이션 로직 추가.
- **Testing**:
  - `server/scripts/verify-v2.js`: 자동화된 마이그레이션 검증 스크립트 작성.
  - `init.js`: 테스트용 DB 경로(`process.env.DB_PATH`) 지원 추가.

## 🧪 Verification
- **Automated Test**: `node server/scripts/verify-v2.js` 실행 -> **PASS**
  - Legacy DB Migration 성공 확인.
  - Backup Import Logic 성공 확인.
- **Results**: 상세 결과는 [`docs/verification-v2.0.md`](./docs/verification-v2.0.md) 참조.

## 📝 Notes
- 기존 `notes` 테이블은 삭제하지 않고 데이터 보존을 위해 남겨두었습니다 (Deprecated).
- `verify-v2.js`는 ESM 호이스팅 이슈 방지를 위해 `await import()`를 사용합니다.
