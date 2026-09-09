# PR Draft — v3.0 Isolated Regression Harness

- Base: `feature/v3.0`
- Head: `feature/v3.0-regression-harness`
- 제목: `test: add isolated v3 regression harness`

## 요약

- v2.x 데이터·API 계약을 임시 DB와 임의 localhost 포트에서 반복 검증합니다.
- 실제 사용자 DB는 자동 CRUD·backup/restore 대상으로 사용하지 않습니다.

## 주요 변경

- `npm run verify:v3-regression` 명령 추가
- reading log, 4색 highlight, verse/free note, prayer, settings 검증
- v3/v1.1 backup 호환, 잘못된 payload rollback, 구형 DB migration 검증
- 실패·signal 시 child process와 임시 fixture 정리

## 검증

- [x] Harness 2회 반복 실행 — 각 8/8
- [x] 원본 DB guard 통과
- [x] `node --check`
- [x] Client lint/build
- [x] Wave 1 임시 통합 worktree에서 8/8 재검증

## 후속 후보

- backup 지원 schema version 강제
- backup export app version 동기화
- highlight 역본 구분 계약 검토

