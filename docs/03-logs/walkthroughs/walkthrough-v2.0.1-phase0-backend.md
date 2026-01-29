# Walkthrough v2.0.1 - Phase0 Backend 안정화

- 작성일: 2026-01-29
- 범위: P0-1(인증), P0-2(backup), P0-3(API fallback)
- 관련 PR: docs/03-logs/pr/pr-v2.0.1-phase0-backend.md

## 1) 변경 사항 요약
- 인증: localhost 예외 제거, dev 세션 TTL 30일(DEV_SESSION_DAYS, 기본 30)
- 백업: verse_notes import 시 verse_range 유지
- 라우팅: /api 미매칭은 JSON 404 반환
- 바인딩: dev 기본 127.0.0.1, BIND_HOST로 override 가능

## 2) 검증 결과
- 로컬/모바일 접속: 정상(사용자 확인)
- /api 404 JSON 응답: 확인 완료 (JSON 404 응답)
- 백업 export→import 후 verse_range 보존: 확인 완료
- dev 세션 TTL 30일: 설정값 기준 확인(실시간 만료 테스트는 미실행)

## 3) 추가 확인 필요
- 백업 복원 시 verse_range가 유지되는지 실제 데이터로 검증

## 4) 비고
- 세션은 메모리 기반이므로 서버 재시작 시 재로그인 필요

