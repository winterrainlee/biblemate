# BibleMate v3.0 격리 회귀 검증 기반 구현 계획

- 작업 브랜치: `feature/v3.0-regression-harness`
- 병렬 트랙: 검증 기반 Wave 1
- 상태: **구현계획 승인 / 구현 중**
- 원칙: 실제 사용자 DB를 읽기 전용 확인 외에는 사용하지 않는다.

## Goal

- v2.x 데이터·API 계약을 deterministic 임시 DB에서 자동 검증하고, 최종 검수 서버를 한 번만 열 수 있는 사전 신뢰도를 만든다.

## Proposed Changes

- 신규 `server/scripts/verify-v3-regression.js`
- Node 기본 assert/fetch/child_process와 기존 sql.js만 사용하며 새 test framework는 추가하지 않는다.
- `os.tmpdir()` 아래 `mkdtemp`로 fixture DB와 고유 API 포트를 만든다.
- `DB_PATH=<temp>/fixture.db`, `BIND_HOST=127.0.0.1`로 격리 서버를 실행하고 항상 종료·정리한다.
- 고정된 비개인 fixture: 성경 최소 본문, 단일/범위 reading log, 4색 highlight, 단일/범위 verse note, free note, prayer, highlight label setting.
- 원본 DB는 시작/종료 SHA-256와 Git 상태만 비교하며 개인 데이터 내용은 출력하지 않는다.

## Automated Coverage

- health, books, chapter/version 조회
- reading log 단일/범위 저장·중복 방지·삭제
- highlight 4색 저장·색 교체·삭제
- verse note 날짜/장/exists 조회, `verse_range`, UPSERT, reading log 자동 생성·중복 방지, 삭제 후 reading log 유지
- free note, prayer, settings JSON round-trip
- backup schema v3 export/import와 v1.1 `notes → free_notes` 호환
- 잘못된 backup payload 400과 transaction rollback 후 count 불변
- 구형 DB migration에서 table/column과 데이터 유지

## Safety Contract

- `server/data/bible.db`에 write/delete/import 금지
- 기존 `server/scripts/verify-v2.js`는 고정 경로 파일을 사용하므로 참고만 하고 실행하지 않는다.
- 모든 CRUD와 restore는 temp DB에서만 수행한다.
- 실패·signal·timeout에서도 child process와 temp directory를 정리한다.

## Known Follow-ups

- backup의 `SUPPORTED_SCHEMA_VERSIONS`가 실제 차단에 쓰이지 않는 문제
- backup export의 `APP_VERSION` 고정값
- highlight가 역본을 구분하지 않는 현행 계약

이 항목들은 현재 계약 회귀와 분리해 결함 또는 릴리즈 hotfix 후보로 기록한다.

## Verification

- harness 전체 PASS와 실패 시 non-zero exit
- 같은 fixture에서 반복 실행 가능
- 원본 DB hash/status 불변
- client lint/build 및 git diff check
- 개인 데이터가 stdout/stderr에 노출되지 않음
