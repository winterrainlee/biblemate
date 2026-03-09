# PR: 에스겔 HAN 추출 로직 안정화 및 전체 재반영 완료 (v2.1.3)

## 1. 주요 변경 사항
- `server/scripts/fix_ezekiel.js`를 전면 리팩터링했습니다.
- 대한성서공회 소스 역본을 `HAN`으로 고정했습니다.
- 절 marker 기반 파서 + 마지막 절 경계 절단 로직을 도입했습니다.
- 장별 무결성 검증(연속 절, 빈 본문, 오염 패턴)과 트랜잭션 롤백 보호를 추가했습니다.
- 실행 옵션(`--dry-run`, `--from`, `--to`, `--delay-ms`)을 추가했습니다.
- `bible-corrections.json`의 욥기 42장 보정 누락 필드를 수정해 전체 재임포트가 정상 완료되도록 정리했습니다.
- KRV/BBE 전체 66권 재임포트 후, 에스겔 1~48장을 동일 스크립트로 실제 반영했습니다.

## 2. 검증 결과
- [x] `node --check server/scripts/fix_ezekiel.js`
- [x] `node server/scripts/fix_ezekiel.js --dry-run --from=1 --to=48 --delay-ms=0`
- [x] `node scripts/import-bible.js`
- [x] `node server/scripts/fix_ezekiel.js --from=1 --to=48 --delay-ms=0`
- [x] DB 재조회로 `KRV 66권 / 30989절`, `BBE 66권 / 31104절` 확인
- [x] 샘플 대조: `겔 16:34`, `겔 16:63`, `겔 27:1`, `겔 27:33~36`, `겔 48:35` 정상 확인

## 3. 리스크/주의 사항
- 외부 HTML 구조가 변경되면 파서가 영향을 받을 수 있습니다.
- `24:4-5`, `25:2-3`처럼 원문이 범위 표기로 제공되는 절은 현재 동일 본문을 각 절에 확장 반영합니다.
- 운영 Fly.io 반영은 배포만으로 끝나지 않으며, 볼륨 DB 교체 또는 본문 테이블 패치 절차가 별도로 필요합니다.

## 4. 다음 단계 제안
1. 운영 DB 반영 전에 `/app/server/data/bible.db` 백업 및 사용자 데이터 row count 비교
2. 운영 반영 후 `/api/health`와 에스겔 샘플 API 재검증
3. 범위 표기 절(겔 24장, 25장) 수동 교정 필요 여부 후속 판단
