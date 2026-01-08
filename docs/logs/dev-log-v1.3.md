# Bible Reading Mate v1.3 Development Log

## 개발 정보
- **시작일**: 2026-01-08
- **목표 버전**: v1.3.0

---

## 작업 기록

### 2026-01-08 (백업 안정성 강화)
- **내용**: [MINOR] 백업 안정성 강화 - app_version, schema_version, 필수 필드 검증
- **Retrospective**: 
  - GPT Codex의 proposal.md가 좋은 분석 기반이 되었음. 외부 분석 도구의 제안도 적극 검토하는 것이 효율적.
  - 버전 정의 전략(app_version vs schema_version)을 사전에 논의한 덕분에 구현 방향이 명확했음.
  - 하이브리드 방식(둘 다 포함)이 디버깅/지원 + 호환성 체크에 모두 유용함을 확인.
- **Troubleshooting**: 
  - 브라우저 테스트 에이전트가 파일 다운로드를 감지하지 못함 → 서버 로그(`Database saved`)로 정상 동작 확인.
  - 레거시 백업(`version: "1.1"`) 호환성을 위해 `parseSchemaVersion()` 함수로 버전 파싱 로직을 분리.
- **Lessons Learned**: 
  - 백업/복구 같은 데이터 관련 기능은 스키마 버전 관리가 필수. 초기부터 도입하면 향후 마이그레이션이 수월해짐.
  - 에러 응답에 `error_code`를 포함하면 클라이언트 측 에러 처리가 훨씬 깔끔해짐.
  - 필수 필드 정의를 상수로 선언하면 유지보수와 확장이 용이함.

---

## 이슈 및 해결
- (해당 버전에서 발생한 이슈 없음)
