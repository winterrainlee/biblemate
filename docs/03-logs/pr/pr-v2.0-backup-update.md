# PR: 백업 시스템 고도화 (V2 스키마 지원)

## 1. 주요 변경 사항
- [x] **백업 API 업데이트 (Schema V2)**
  - `verse_notes`, `free_notes`, `daily_prayers` 테이블 추가 지원
  - Import 시 기존 데이터를 안전하게 초기화(Transaction) 후 복원하는 로직 구현
- [x] **검증 도구 추가**
  - `verify_backup.js`: 백업 파일 구조 검증 스크립트
  - `clear_db.js`: 테스트용 DB 초기화 스크립트
- [x] **설정 페이지(Client) 호환성 확인**
  - `Settings.jsx`에서 V2 백업 파일 Import/Export 정상 동작 확인

## 2. 검증 결과
- [x] `verify_backup.js` 통과 (JSON 구조 및 필수 필드 확인)
- [x] 수동 검증: DB 초기화 -> 백업 파일 Import -> 클라이언트 데이터 복구 확인 완료

## 3. Review Point
- `backup.js`의 `validateEntity` 함수에서 필드 유효성 검사 로직이 적절한지 확인 부탁드립니다.
- 복원(Import) 시 기존 데이터를 `DELETE` 후 `INSERT` 하는 방식이 V2 스키마의 무결성을 해치지 않는지 검토가 필요합니다.
