# Walkthrough - v2.1.3 Ezekiel HAN Extractor Hardening

## 작업 일시
- 2026-03-09 (KST)

## 작업 목표
- 대한성서공회 읽기 페이지 기준 에스겔 추출 스크립트를 `HAN` 역본으로 고정하고, 파싱/검증/트랜잭션 안전성을 강화한다.
- 오염이 확인된 에스겔 27장을 우선 교정한다.

## 변경 파일
- `server/scripts/fix_ezekiel.js`

## 핵심 변경
1. 소스 역본 고정
- `version=GAE` -> `version=HAN`

2. 파서 안정화
- 절 번호 marker 기반 분할 파싱
- HTML entity decode + 태그 제거 + 공백 normalize
- 마지막 절 경계 절단(`</font></span>` 등) 추가

3. 안전성 강화
- 실행 경로 독립 DB 경로(`__dirname` 기준)
- 대상 책 코드 확정(`Ezek` 우선)
- 장별 절 연속성/빈 본문 검증
- 오염 패턴(`Ezekiel n:n`) 감지 시 중단
- 장별 트랜잭션 + `--dry-run`(롤백) 지원

4. 운영 옵션 추가
- `--from`, `--to`, `--delay-ms`, `--dry-run`

## 실행 로그
### 1) 문법 검증
```bash
node --check server/scripts/fix_ezekiel.js
```
- 결과: PASS

### 2) 27장 사전 확인
- 조회 결과(반영 전): 27:36에 27:37~39 내용 병합 오염 확인.

### 3) 27장 dry-run
```bash
node server/scripts/fix_ezekiel.js --dry-run --from=27 --to=27 --delay-ms=0
```
- 결과: PASS (`verses=36, updated=36, deletedExtra=0, mode=DRY`)

### 4) 27장 실제 반영
```bash
node server/scripts/fix_ezekiel.js --from=27 --to=27 --delay-ms=0
```
- 결과: PASS (`verses=36, updated=36, deletedExtra=0, mode=APPLY`)

### 5) 반영 후 DB 검증
- `count=36`
- `27:33` 정상
- `27:34` 정상
- `27:35` 정상
- `27:36` 정상 (하단 검색 문구/영문 참조 오염 제거)

## 결론
- 에스겔 27장의 본문 오염(구절 병합/하단 문구 혼입)이 제거되었고, HAN 기준 파싱 로직으로 교정 완료.
- 다음 단계로 1~48장 전체 적용 후, 계획된 66권 재임포트를 진행한다.

---

## 추가 실행: 에스겔 1~48장 전체 반영 (2026-03-09)

### 1) 전체 dry-run
```bash
node server/scripts/fix_ezekiel.js --dry-run --from=1 --to=48 --delay-ms=0
```
- 1차 시도: 24장에서 중단 (`expected=4, actual=6`)
- 원인: BSK 원문의 절 표기가 `4-5`, `2-3`처럼 범위 표기로 제공되는 장(24, 25) 존재
- 조치: 파서가 범위 표기를 확장 처리하도록 보강
- 재실행 결과: 1~48장 전 구간 PASS

### 2) 전체 apply
```bash
node server/scripts/fix_ezekiel.js --from=1 --to=48 --delay-ms=0
```
- 결과: 1~48장 전 구간 APPLY 성공

### 3) 사후 검증 (DB 직접 조회)
- `Ezek` 총 절 수: `1273`
- 샘플:
  - `16:34` 정상
  - `16:63` 정상
  - `27:36` 정상
  - `48:35` 정상

### 4) 범위 표기 처리 주의사항
- `24:4-5`, `25:2-3`은 원문 소스가 범위로 제공되어 현재는 동일 본문이 각 절에 반영됨.
- 이는 절 누락 방지를 위한 안전 처리이며, 필요 시 후속으로 해당 절 분리 교정(수동 correction) 가능.

---

## 추가 실행: 전체 66권 재임포트 + 에스겔 재반영 (2026-03-09)

### 1) 재임포트 실행
```bash
node scripts/import-bible.js
```
- 1차 실행 이슈: `bible-corrections.json` 517번째 항목(욥기 42장 마지막 절)에 `verse`, `version` 누락으로 보정 단계 실패.
- 조치: 해당 항목에 `verse: 17`, `version: "krv"` 추가.
- 2차 실행 결과: PASS
  - KRV: 30929 import
  - BBE: 31104 import
  - corrections: 547 적용 완료

### 2) 재임포트 후 에스겔 재반영
```bash
node server/scripts/fix_ezekiel.js --from=1 --to=48 --delay-ms=0
```
- 결과: 1~48장 APPLY 성공

### 3) 최종 검증
- KRV 책 수: `66`
- KRV 총 절 수: `30989`
- BBE 총 절 수: `31104`
- 에스겔 27장 확인:
  - `27:33` 정상
  - `27:34` 정상
  - `27:35` 정상
  - `27:36` 정상 (병합 오염 제거 유지)
