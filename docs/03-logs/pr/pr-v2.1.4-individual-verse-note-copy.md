# PR: v2.1.4 - 개별 구절 묵상 복사

## 주요 변경 사항
- [x] 구절별 묵상 카드 액션에 복사 아이콘 추가
- [x] 액션 순서 `복사 → 수정 → 삭제` 적용
- [x] 개별 복사 시 묵상 내용만 클립보드에 저장
- [x] 클릭한 카드만 2초간 `Check` 아이콘으로 전환
- [x] 전체 복사와 개별 복사의 클립보드 fallback 로직 공용화

## 검증
- [x] `npm run build` (`client`)
- [x] 백엔드 API 변경 없음
- [x] DB 스키마 변경 없음

## Review Point
- 개별 복사 포맷은 사용자 선택에 따라 구절/날짜 없이 내용만 복사한다.
- `navigator.clipboard`가 불가능한 환경에서는 기존과 동일하게 `execCommand('copy')` fallback을 사용한다.
