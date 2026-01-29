# PR 초안: v2.0.1 Phase0 Backend 안정화

## 개요
- 범위: P0-1(인증 우회 제거/Dev 세션 30일), P0-2(backup import verse_range 보존), P0-3(API 404 JSON 처리)
- 관련 계획서: docs/01-planning/implementation-plans/implementation-plan-v2.0.1-phase0-stability.md

## 변경 사항
1) 인증
- hostname 기반 localhost 예외 제거
- dev 환경 세션 TTL 30일(DEV_SESSION_DAYS, 기본 30)

2) 백업
- verse_notes import 시 verse_range 컬럼 포함

3) 라우팅
- /api/* 미매칭은 JSON 404 반환
- dev 기본 바인딩 127.0.0.1, BIND_HOST로 override 가능

## 변경 파일
- server/routes/auth.js
- server/routes/backup.js
- server/index.js

## 테스트/검증
- [x] 로컬/모바일 접속 정상(사용자 확인)
- [x] /api/없는엔드포인트가 JSON 404 반환 확인
- [x] 백업 export → import 후 verse_range 보존 확인
- [ ] dev 세션 TTL 30일 설정 확인 (DEV_SESSION_DAYS)

## 리스크/주의사항
- dev 서버 기본 바인딩이 127.0.0.1이므로 LAN에서 API 직접 접근 테스트가 필요하면 BIND_HOST=0.0.0.0 설정 필요
- 세션은 메모리 기반이므로 서버 재시작 시 재로그인 필요

## 롤백
- server/routes/auth.js의 dev TTL/localhost 예외 제거 부분 원복
- server/routes/backup.js의 verse_range 추가 부분 원복
- server/index.js의 API fallback 및 HOST 바인딩 변경 원복
