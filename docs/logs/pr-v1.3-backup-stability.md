# PR: 백업 안정성 강화 (Backup Stability Enhancement)

## 개요
`feature/v1.3-backup-stability` → `feature/v1.3`

백업 기능의 안정성과 호환성을 강화하여 데이터 무결성을 보장합니다.

## 변경 사항

### 🔧 Server (`server/routes/backup.js`)
- **백업 포맷 개선**: `version: "1.1"` → `app_version` + `schema_version` 하이브리드 방식
- **필수 필드 검증**: Import 시 `reading_logs`, `notes`, `highlights`의 필수 필드 검증
- **에러 응답 표준화**: `error_code` 필드 추가 (`INVALID_FORMAT`, `UNSUPPORTED_SCHEMA`, `INVALID_SCHEMA`, `IMPORT_FAILED`)
- **하위 호환성**: 레거시 백업 (`version: "1.1"`)을 `schema_version: 1`로 간주하여 정상 처리

### 🎨 Client (`client/src/pages/Settings.jsx`)
- **에러 메시지 개선**: 에러 코드별 상세 한글 메시지 표시
- **JSON 파싱 에러 처리**: 잘못된 파일 선택 시 명확한 안내

### 📝 Documentation
- `docs/specifications/spec-v1.3.md` 신규 생성

## 새 백업 포맷

```json
{
  "app_version": "1.3.0",
  "schema_version": 1,
  "exported_at": "2026-01-08T...",
  "data": { ... }
}
```

## 에러 코드

| 코드 | 상황 |
|------|------|
| `INVALID_FORMAT` | JSON 파싱 실패 또는 data 객체 누락 |
| `UNSUPPORTED_SCHEMA` | 지원하지 않는 schema_version |
| `INVALID_SCHEMA` | 필수 필드 누락 |
| `IMPORT_FAILED` | 데이터베이스 오류 |

## 테스트 결과
- [x] 로컬 테스트: 백업 Export 정상 작동 (서버 로그 확인)
- [x] 레거시 백업 Import 호환성: `version: "1.1"` 포맷 정상 처리

## 관련 이슈
- GPT Codex `proposal.md` 제안 반영
- v1.2.1 핫픽스 후속 안정성 보강

## Checklist
- [x] spec 문서 작성 완료
- [x] 코드 구현 완료
- [x] 로컬 테스트 완료
- [ ] 사용자 최종 확인
