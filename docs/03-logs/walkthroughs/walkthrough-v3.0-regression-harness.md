# BibleMate v3.0 격리 회귀 Harness Walkthrough

- 작업 브랜치: `feature/v3.0-regression-harness`
- 검증일: 2026-09-09
- 검수 서버: 실행하지 않음
- 사용자 DB: 읽기 전용 hash/stat/Git 상태 비교만 수행

## 구현 결과

- `server/scripts/verify-v3-regression.js`를 추가했다.
- 실행마다 `os.tmpdir()` 아래에 새 디렉터리와 fixture DB를 생성한다.
- OS가 배정한 고유 포트를 예약한 뒤 `127.0.0.1`에만 격리 API 서버를 열고, 조기 종료나 포트 충돌 시 최대 3회 새 포트로 재시도한다.
- 자식 서버에는 `DB_PATH=<temp>/fixture.db`를 명시하고, 종료·실패·signal 시 자식 프로세스와 temp 디렉터리를 정리한다.
- 실행 전후 `server/data/bible.db`의 SHA-256, inode/size, Git porcelain 상태를 비교한다.
- 개인 데이터 대신 `2099-*` 날짜와 고정된 비개인 fixture만 사용한다.
- `npm run verify:v3-regression` 명령을 추가했다.

## 자동 검증 범위

1. health, 역본별 books/chapter/range 조회
2. reading log 단일·범위 저장, 중복 방지, 삭제
3. 4색 highlight 저장, 색 교체, 삭제
4. verse note 날짜·장·exists 조회, `verse_range`, UPSERT
5. verse note 저장 시 reading log 자동 생성·중복 방지 및 note 삭제 후 log 유지
6. free note, prayer, highlight label setting JSON round-trip
7. backup schema v3 export/import
8. v1.1 `notes`의 `free_notes` 호환 import
9. 잘못된 payload 400 및 import transaction 실패 500 후 전체 사용자 데이터 snapshot rollback
10. 구형 DB의 v2 tables/`verse_range`/settings migration과 기존 note 보존

## 검증 명령과 결과

### Harness 반복 실행

```bash
cd server
npm run verify:v3-regression
npm run verify:v3-regression
```

두 실행 모두 동일하게 성공했다.

```text
PASS health/bible
PASS reading logs
PASS highlights
PASS verse notes
PASS free notes/prayers/settings
PASS backup compatibility/rollback
PASS legacy migration
PASS original database guard (server/data/bible.db)
PASS 8 regression checks
```

### 정적 검증 및 클라이언트 회귀

```bash
node --check server/scripts/verify-v3-regression.js
git diff --check
cd client && npm run lint
cd client && npm run build
```

- Node 문법 검사: PASS
- diff whitespace 검사: PASS
- ESLint: PASS
- Vite production build: PASS (`2573 modules transformed`)

## 안전성 확인

- harness가 사용하는 DB 경로와 저장소의 `server/data/bible.db` 경로가 같으면 즉시 실패한다.
- 원본 DB 보호 검사는 정상 종료뿐 아니라 검증 suite 실패 후 `finally`에서도 수행된다.
- fixture DB는 매 실행 새로 만들어져 이전 실행 결과가 다음 실행에 영향을 주지 않는다.
- API 서버는 각 실행 종료 시 SIGTERM으로 닫혔고, 사용자 검수용 Vite 서버는 열지 않았다.

## 별도 후속 후보

- `SUPPORTED_SCHEMA_VERSIONS`가 import 차단에 사용되지 않는 현행 문제
- backup export의 `APP_VERSION`이 `2.0.0`으로 고정된 문제
- highlight 데이터가 역본을 구분하지 않는 현행 계약
- 실패·signal·timeout cleanup 경로의 자동 fault-injection 검증

위 항목들은 production 계약 변경 또는 별도 fault-injection 설계가 필요해 후속 작업으로 분리했다.
