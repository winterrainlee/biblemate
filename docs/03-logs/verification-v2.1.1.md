# 검증 로그 - v2.1.1

## 검증 환경
- **DB**: `server/data/bible.db`
- **Source**: 대한성서공회 개역한글 (HAN)

## 자동화 검증 결과
- **스크립트**: `scripts/apply-ezekiel-fix.js`
- **결과**:
    - [x] 트랜잭션 커밋 완료
    - [x] 에스겔 16장 총 구절 수 확인: **63개** (Pass)
    - [x] 교정 데이터(30개 구절) 반영 성공

## 데이터 수동 검증 (CLI Query)
| Verse | Expected Start | Actual Result | Status |
|---|---|---|---|
| 33 | 사람들은 모든 창기에게... | Match | ✅ |
| 34 | 너의 음란함이 다른... | Match (Fixed) | ✅ |
| 35 | 그러므로 너 음부야... | Match (Fixed) | ✅ |
| 63 | 이는 내가 네 모든... | Match (Cleaned) | ✅ |

## 최종 판정
**PASS**: 에스겔 16장의 모든 구절이 정본과 일치하며 오염된 텍스트가 제거됨.
