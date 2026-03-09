# implementation-plan-v2.1.3-ezekiel-han-extractor-hardening.md

## 1) 작업 목적
- 1차: 에스겔서(KRV) 본문이 정본과 불일치하는 문제를 해결하기 위해, 대한성서공회 읽기 페이지 기반 추출 로직을 `HAN` 기준으로 고정하고 파싱 안정성을 강화한다.
- 2차: 에스겔서 수정 검증 완료 후, 동일 기준으로 전체 성경 66권 재임포트를 수행해 데이터 정합성을 통일한다.

## 2) 배경 문제
- 기존 스크립트(`server/scripts/fix_ezekiel.js`)는 `version=GAE`를 사용하고 있어 기준 역본이 불명확함.
- 정규식이 HTML 마크업 구조에 과도하게 의존하여 절 누락/밀림 리스크가 큼.
- 대상 책 코드 탐색(`LIKE '%ez%'`)이 비결정적이라 오작동 가능성이 있음.
- 추출 결과 검증 없이 `DELETE`가 실행되어 데이터 손실 위험이 존재함.
- Fly.io 운영 환경은 `/app/server/data`가 볼륨 마운트이며, 현재 entrypoint는 `bible.db`가 **없을 때만** seed DB를 복사하므로 일반 배포만으로는 운영 DB가 갱신되지 않음.
- `sql.js` 특성상 서버 프로세스 메모리 DB가 종료 시점에 파일로 저장되므로, 운영 중 외부에서 DB 파일을 덮어쓰면 반영이 소실될 수 있음.

## 3) 범위 (In-Scope)
- `server/scripts/fix_ezekiel.js` 리팩터링
- `HAN` 기준 URL로 수정
- HTML 파싱 안정화(절 번호/본문 추출 로직 보강)
- DB 대상 책 코드 결정 로직 고정(`Ezek` 우선, 안전 fallback)
- 장 단위 검증(연속 절 번호, 최소 절 수, 추출 실패 시 롤백)
- 안전한 업데이트(검증 통과 시에만 UPDATE/DELETE)
- 전체 66권 재임포트 실행 절차 수립 및 적용(에스겔 수정 검증 통과 후)
- 재임포트 후 샘플링 검증(구약/신약 대표 구절, 장/절 수)
- 실행/검증 로그 문서 추가

## 4) 비범위 (Out-of-Scope)
- 프론트엔드 UI/UX 변경
- 다른 역본(BBE/WEB) 데이터 재작성

## 5) 구현 전략
1. URL 상수 변경
- `version=HAN&book=ezk`로 고정.

2. 파서 강화
- 단일 취약 정규식 대신, 절 번호 span을 기준으로 안전 분할 후 본문 텍스트 정제.
- HTML 태그 제거 + 공백/개행 normalize.

3. DB 대상 고정
- `book='Ezek' AND version='krv'` 존재 여부 선검증.
- 미존재 시 명확한 에러로 종료(묵시적 fallback 제거).

4. 무결성 검증
- 각 장에서 추출된 절 번호가 1부터 연속인지 확인.
- 절 개수 0 또는 비연속 시 해당 장 업데이트 중단 및 롤백.

5. 업데이트 안전장치
- 장별 트랜잭션.
- 검증 통과 장만 업데이트.
- `DELETE verse > lastVerse`는 검증 통과 시에만 수행.

6. 전체 66권 재임포트
- 에스겔 수정 결과 확인 후 `scripts/import-bible.js`로 KRV/BBE 기본 임포트 재실행.
- `server/data/bible-corrections.json` 적용으로 기존 보정사항 유지.
- 임포트 완료 후 KRV 기준 총 구절 수/책 수 점검 및 샘플 대조.

7. Fly.io 운영 DB 반영 계획
- 전제: 현재 Dockerfile/entrypoint는 `if [ ! -f /app/server/data/bible.db ]` 조건에서만 seed 복사.
- 따라서 `flyctl deploy`만으로는 기존 볼륨 DB가 업데이트되지 않으므로, 운영 반영은 **앱 프로세스 중지 상태**에서 수행.
- 권장 절차:
  1) 로컬에서 최종 `server/data/bible.db` 생성 및 검증(66권/샘플 구절/교정 반영).
  2) 운영 머신 중지(또는 무중단이 필요하면 maintenance 머신 전환 후 원 머신 중지).
  3) 볼륨의 기존 DB 백업(`bible.db.bak-YYYYMMDD-HHMM`).
  4) 검증된 DB를 운영 볼륨 경로(`/app/server/data/bible.db`)로 교체.
  5) 머신 재기동 후 헬스체크(`/api/health`) 및 성경 샘플 API 검증.
  6) 이상 시 즉시 백업 DB로 롤백.
- 보존 원칙:
  - 사용자 생성 데이터(노트/형광펜/로그) 포함 DB인 경우, 교체 전후 테이블 row count 비교를 수행.
  - 필요 시 “본문 테이블만 업데이트”하는 마이그레이션/패치 스크립트를 별도 준비해 사용자 데이터 유실 리스크를 줄임.

## 6) 검증 계획
- 스크립트 dry-run 모드 추가 또는 로그 강화로 장별 수집/갱신 개수 확인.
- DB 쿼리로 에스겔 1~48장 절 수 확인.
- 샘플 구절 대조: 겔 16:34, 16:63, 27:1, 27:36.
- 66권 재임포트 후 검증:
- KRV 책 수 66권 확인.
- KRV 총 구절 수(표준 카운트 기준) 확인.
- 대표 샘플 대조(창 1:1, 시 23:1, 마 1:1, 계 22:21, 겔 27:1/36).
- Fly.io 반영 후 운영 검증:
- `/api/health` 정상 응답 확인.
- 운영 API에서 샘플 구절 본문 대조(겔 27:36 포함).
- 사용자 데이터 핵심 테이블 row count 비교(반영 전/후).

## 7) 산출물
- 코드: `server/scripts/fix_ezekiel.js`
- 코드: `scripts/import-bible.js`(필요 시 검증/로그 보강)
- 검증 기록: `docs/03-logs/walkthroughs/walkthrough-v2.1.3-ezekiel-han-extractor-hardening.md`
- PR 초안: `docs/03-logs/pr/pr-v2.1.3-ezekiel-han-extractor-hardening.md`
- 로그/교훈 업데이트: `docs/03-logs/dev-log-v2.1.md`, `docs/lessons.md`

## 8) 리스크 및 대응
- 외부 HTML 구조 변경: 파서 다중 패턴/검증 실패 즉시 중단.
- 네트워크 응답 실패: 재시도 및 실패 장 skip 금지(중단)로 데이터 일관성 유지.
- 운영 DB 직접 수정 위험: 트랜잭션 + 사전 존재 검증 + 상세 로그.
- 66권 재임포트 시 기존 수동 교정 덮어쓰기 위험: 임포트 직후 corrections 재적용 및 샘플 검증으로 방지.
- Fly.io 볼륨 DB 미반영 위험: 배포와 별개로 운영 DB 교체/패치 단계를 명시적으로 수행.
- 프로세스 종료 시점 덮어쓰기 위험(sql.js): 운영 반영 시 앱 프로세스 중지 후 DB 작업, 재기동 후 즉시 검증.
