# 게스트 로그인 모드 제안서 (Codex Proposal)

## 목표
- 비밀번호가 설정된 환경에서도 게스트로 진입 가능
- 게스트 모드에서 작성한 노트/기록/하이라이트는 로컬 기기에만 저장
- 서버 데이터와 게스트 로컬 데이터는 분리 유지 (자동 병합 없음)

## 범위
- 포함: 게스트 진입 UX, 로컬 저장소, 읽기 전용 API 허용, 로컬 백업/복구
- 제외: 로컬 데이터 자동 병합/동기화, 다중 기기 동기화, 로컬 암호화

## 현 구조 요약 (영향 지점)
- 인증: `server/routes/auth.js`, `server/index.js`
- 노트/기록/하이라이트 저장: 서버 SQLite + `/api/*`
- 클라이언트 API 진입점: `client/src/services/api.js`
- 노트 편집: `client/src/components/NoteEditor.jsx`, `client/src/pages/ReadingDashboard.jsx`
- 백업/복구: `client/src/pages/Settings.jsx`

## 설계 방향
- 게스트는 서버 쓰기 API를 호출하지 않음 (클라이언트가 로컬 저장소로만 처리)
- 서버는 게스트에게 “읽기 전용 API”만 허용 (성경 조회/검색)
- 모드 상태는 `localStorage`에 저장하여 새로고침 후에도 유지

## 변경 계획

### 1) 서버: 게스트 읽기 전용 allowlist
- 파일: `server/routes/auth.js`
- 조치:
  - 인증 미통과 시에도 허용할 경로/메서드 allowlist 추가
  - 최소 허용: `GET /api/bible/*`, `GET /api/bible/search`, `GET /api/health`
  - 명시적으로 `POST/PUT/DELETE`는 모두 차단
- `GET /api/auth/status` 응답에 `guestAllowed: true` 추가

### 2) 클라이언트: 게스트 모드 진입 UX
- 파일: `client/src/pages/LoginPage.jsx`
- 조치:
  - 로그인 폼 아래에 “게스트로 계속” 버튼 추가
  - 클릭 시 `onGuest()` 콜백 호출
- 파일: `client/src/App.jsx`
- 조치:
  - `authState`에 `mode: 'user' | 'guest'` 추가
  - `localStorage`에 모드 저장/복원
  - `authRequired && !authenticated`이어도 `mode === 'guest'`이면 앱 진입 허용

### 3) 데이터 계층 분리 (핵심)
- 파일: `client/src/services/api.js`
- 조치:
  - 서버 API만 담당하도록 유지하거나, 새로운 데이터 클라이언트로 분리
- 신규(권장): `client/src/services/dataClient.js`
  - 인터페이스: `getNote/saveNote/deleteNote`, `getReadingLogs/add/remove`, `getHighlights/add/remove` 등
  - `mode === 'guest'`이면 `guestStore`를 사용
  - `mode === 'user'`이면 기존 `/api/*` 사용

### 4) 게스트 로컬 저장소 구현
- 신규: `client/src/services/guestStore.js`
- 저장 방식: IndexedDB (외부 라이브러리 없이 최소 구현)
- DB 스키마 (초안)
  - `notes` (key: date)
    - `{ date, content, created_at, updated_at }`
  - `readingLogs` (key: id, autoIncrement)
    - `{ id, date, book, chapter, verses_count, chapter_from? }`
  - `highlights` (key: id, autoIncrement)
    - `{ id, book, chapter, verse, style }`
- CRUD 함수는 `Promise` 기반으로 단순화

### 5) 화면별 적용
- `client/src/components/NoteEditor.jsx`
  - `api` 대신 `dataClient` 사용
  - 게스트 모드에서도 자동 저장 동작
- `client/src/pages/ReadingDashboard.jsx`
  - 읽기 로그/하이라이트 CRUD를 `dataClient`로 전환
- `client/src/pages/Notes.jsx`
  - `getNotes/addNote/updateNote/deleteNote`를 `dataClient`로 전환

### 6) 설정 화면: 게스트 백업/복구
- 파일: `client/src/pages/Settings.jsx`
- 조치:
  - 게스트 모드에서는 서버 `/api/backup/*` 대신 로컬 데이터 export/import 사용
  - Export: `guestStore` 데이터를 JSON으로 합쳐 다운로드
  - Import: JSON 검증 후 `guestStore`에 덮어쓰기

## 정책 결정
- 게스트 → 사용자 로그인 시 자동 병합 없음
- 필요 시 “게스트 백업 파일을 사용자 계정으로 가져오기” 경로를 별도 제공 (선택 사항)

## 테스트 체크리스트
- 비밀번호 설정 상태에서 “게스트로 계속” 진입 가능
- 게스트 모드에서 노트/읽기로그/하이라이트가 로컬에 저장됨
- 게스트 모드에서 서버 쓰기 API 호출하지 않음
- 게스트 모드에서 페이지 새로고침 후 데이터 유지
- 비게스트(사용자) 로그인 시 기존 서버 데이터 정상 동작
- 서버가 게스트에게 쓰기 요청을 401로 차단

## 예상 작업 순서
1. 서버 allowlist + `guestAllowed` 응답 추가
2. 게스트 모드 상태 관리 + 로그인 페이지 UI 추가
3. `guestStore` + `dataClient` 구현
4. 노트/읽기로그/하이라이트 호출부 교체
5. 설정 화면의 백업/복구 분기
6. 수동 테스트 및 UX 점검

## 난이도/소요
- 난이도: 중간
- 예상 소요: 1–3일 (로컬 백업/복구 포함 시 2–4일)

## 오픈 이슈
- 게스트 로컬 데이터 용량 한도/정책
- 로컬 데이터 삭제 안내 문구 필요 여부
- 게스트 배지/배너 등 UX 표시 수준
