# Implementation Plan v2.0.1 - Phase 0 안정화(P0-1~P0-4)

- 작성일: 2026-01-29
- 목표: P0 이슈 4개를 **동일 버전(v2.0.1)**에서 모두 해결
- 진행 방식(결정사항): **구현 계획서는 1개**, 실제 구현/PR은 **2개로 분리**
  - PR-A (Backend): P0-1, P0-2, P0-3
  - PR-B (Frontend): P0-4

## 0) 배경 / 범위
### 해결 대상(P0)
- P0-1: 인증 우회 위험(Host/hostname 기반 localhost 예외)
- P0-2: 백업 복원 시 erse_range 유실
- P0-3: /api/* 미매칭 GET이 SPA fallback으로 HTML을 반환할 가능성
- P0-4: 
ew Date('YYYY-MM-DD')로 인한 날짜 하루 밀림(타임존)

### 비목표
- 인증 체계(계정/유저) 도입
- DB 엔진/전략 전환(sql.js → sqlite3 등)
- UI/UX 대규모 리디자인

## 1) 산출물(필수 문서 흐름)
- 구현 계획서: 본 문서(완료)
- 구현/검증 기록(walkthrough):
  - docs/03-logs/walkthroughs/walkthrough-v2.0.1-phase0-backend.md
  - docs/03-logs/walkthroughs/walkthrough-v2.0.1-phase0-frontend-date.md
- PR 초안:
  - docs/03-logs/pr/pr-v2.0.1-phase0-backend.md
  - docs/03-logs/pr/pr-v2.0.1-phase0-frontend-date.md
- dev-log/lessons 업데이트: 작업 완료 후

## 2) 구현/PR 분리 전략
### PR-A (Backend: P0-1~P0-3)
- 대상 파일(예상)
  - server/routes/auth.js
  - server/routes/backup.js
  - server/index.js
- 목표
  1) localhost 예외 제거(Host 헤더 기반 우회 가능성 제거)
  2) backup import에 erse_range 포함
  3) /api 미매칭 요청은 JSON 404로 처리하고, SPA fallback은 비-API만 처리

### PR-B (Frontend: P0-4)
- 대상 파일(예상)
  - client/src/utils/에 날짜 파싱 유틸 추가
  - client/src/components/JournalStats.jsx
  - client/src/components/NotePreview.jsx
  - client/src/components/NoteEditor.jsx
  - (추가 발견 시) 
ew Date('YYYY-MM-DD') 패턴이 있는 파일들
- 목표
  - 
ew Date(dateStr) 패턴 제거
  - date-only 문자열은 항상 “로컬 기준 date-only 파싱”으로 통일

## 3) 상세 설계

### 3.1 P0-1: 인증(개발 편의 + 보안 유지)
요구사항(사용자 결정):
- 데스크톱/모바일(동일 Wi-Fi) 테스트를 지원
- 개발 편의를 위해 **1회 로그인 후 오래 유지(30일)** 방식 선호
- 집에서만 개발(개발 서버를 외부에 열어둘 일 없음)

설계안(권장)
- hostname === localhost 예외는 제거
- 세션 만료 정책을 환경별로 분기
  - production: 기존 정책 유지(자정 만료)
  - development: 30일 TTL(예: DEV_SESSION_DAYS=30, 또는 상수)
- (선택) dev에서 서버는 기본 127.0.0.1 바인딩
  - 모바일 테스트는 Vite dev 서버(PC)로 접속하고, API는 Vite proxy(/api -> localhost:3001)로 호출

주의
- NODE_ENV 분기 적용 시 Docker/배포에서 NODE_ENV=production이 강제되는지 재확인(Dockerfile은 이미 ENV NODE_ENV=production).

### 3.2 P0-2: backup import erse_range 반영
- server/routes/backup.js에서 erse_notes INSERT 컬럼/바인딩에 erse_range 추가
- 스키마에 erse_range가 이미 존재하므로 DB 마이그레이션은 불필요

### 3.3 P0-3: API 404 vs SPA fallback
- server/index.js에서 SPA fallback을 /api 제외로 제한
- /api 미매칭은 JSON 404를 반환하도록 처리

### 3.4 P0-4: date-only 파싱 통일
- client/src/utils/dateOnly.js(예시) 유틸 추가
  - parseDateOnly(dateStr: 'yyyy-MM-dd') -> Date (로컬 기준)
  - ormatDateOnly(date: Date) -> 'yyyy-MM-dd' (필요 시)
- 영향을 받는 파일에서 
ew Date(dateStr) 제거

## 4) 테스트/검증 체크리스트

### PR-A (Backend)
- 인증
  - ACCESS_PASSWORD 설정 시: 로그인/로그아웃 정상
  - 세션 쿠키 만료가 dev/prod에서 의도대로 설정되는지 확인
  - 모바일에서 Vite 프론트 접속 시 인증이 반복적으로 풀리지 않는지 확인
- 백업
  - export → import 후 erse_range가 유지되는지 확인
- 라우팅
  - /api/health 정상
  - /api/없는엔드포인트가 HTML이 아니라 JSON 404를 반환하는지 확인

### PR-B (Frontend)
- 월별 통계/필터가 날짜 하루 밀림 없이 동작
- NotePreview/NoteEditor에서 표시 날짜가 로컬 기준으로 일관
- (가능하면) 미국/한국 타임존 환경에서도 일관(최소한 로컬에서 하루 밀림 재현 케이스가 사라지는지)

## 5) 롤백 계획
- PR-A 롤백: 인증/backup/api-fallback 변경을 원복(기존 behavior 복원)
- PR-B 롤백: date-only 유틸 적용 전으로 원복
- 순서 권장: PR-B는 PR-A와 독립적으로 롤백 가능

## 6) 작업 순서(권장)
1) PR-A 구현 → 로컬(dev)에서 브라우저/모바일 확인 → walkthrough 작성 → PR 초안 작성
2) PR-B 구현 → 날짜 관련 화면 확인 → walkthrough 작성 → PR 초안 작성
3) dev-log/lessons 업데이트

## 7) 기존 계획서 처리
- 이미 작성된 docs/01-planning/implementation-plans/implementation-plan-v2.0.1-auth-dev-session.md는 본 Phase 0 계획서(통합)로 **대체/흡수**됩니다.
  - 추적을 위해 삭제하지 않고 유지하되, 실제 실행은 본 문서를 기준으로 합니다.
