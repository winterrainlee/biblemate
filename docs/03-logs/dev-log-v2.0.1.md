# BibleMate v2.0.1 개발 로그

- 작성일: 2026-01-29
- 범위: Phase0 안정화(P0-1~P0-4)

## 변경 요약
### Backend (PR-A)
- 인증 localhost 예외 제거, dev 세션 TTL 30일(DEV_SESSION_DAYS, 기본 30)
- 백업 import 시 verse_range 보존
- /api 미매칭 JSON 404, dev 기본 바인딩 127.0.0.1

### Frontend (PR-B)
- date-only 파싱 유틸 추가
- new Date('YYYY-MM-DD') 제거 및 유틸 적용

## 검증 요약
- /api 404 JSON 응답 확인 완료
- 백업 export 파일에서 verse_range 포함 확인 완료
- date-only 유틸 기본 파싱 결과 확인(스크립트)

## 미확인 항목
- 날짜 하루 밀림 재현 케이스 정상 표시
