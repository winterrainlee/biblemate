# 레포 전체 코드 검토 결과 / 개선안 (v2.0.0)

- 작성일: 2026-01-29
- 검토 범위: client/src, server(Express), scripts
- 제외 범위: **/node_modules/**, client/dist, docs/assets/test-data, docs/temp (대용량/산출물 성격)

## 1) 결론 요약
현재 FE(React/Vite) + BE(Express) + SQLite 구조는 단순하고 이해하기 쉽습니다. 다만 서버가 sql.js 기반으로 DB를 다루는 방식(쓰기 시 전체 DB export→파일 저장) 때문에, 기능/데이터가 늘어날수록 **성능/안정성/데이터 무결성 리스크가 빠르게 커지는 설계**입니다.

가장 먼저 막아야 할 이슈는 아래 4가지입니다.
- (P0) 인증 우회 가능성(Host 헤더 기반 localhost 예외)
- (P0) 백업 복원 시 erse_range 유실
- (P0) /api/* 404가 SPA로 fallback될 가능성
- (P0) YYYY-MM-DD 날짜 파싱으로 인한 하루 밀림(타임존)

## 2) P0 (크리티컬) 이슈

### P0-1. 인증 우회 가능성 (Host 헤더 기반 localhost 예외)
- 위치: server/routes/auth.js:57
- 내용: eq.hostname === 'localhost' || '127.0.0.1'이면 인증을 스킵합니다.
- 위험: eq.hostname은 기본적으로 요청의 Host 헤더 기반이라(환경/프록시 설정에 따라 더 복잡) 외부에서 Host를 localhost로 보내는 방식으로 인증이 우회될 여지가 있습니다.
- 개선안(권장):
  - “로컬 개발 예외”는 NODE_ENV !== 'production' 기준으로 두거나,
  - eq.ip가 루프백인지(그리고 pp.set('trust proxy', ...) 포함)로 판별하는 방식으로 변경.
  - 최소한 Host 기반 예외는 제거 권장.

### P0-2. 백업 복원 시 erse_range 유실
- 위치: server/routes/backup.js:219
- 내용: erse_notes INSERT에 erse_range 컬럼이 포함되어 있지 않아, 백업에 값이 있어도 복원 시 저장되지 않습니다.
- 개선안: erse_notes import 구문에 erse_range를 포함(스키마에 이미 컬럼 존재).

### P0-3. /api/* 미매칭 GET이 SPA로 fallback될 수 있음
- 위치: server/index.js:89
- 내용: pp.get('*', ...)가 모든 GET을 client/dist/index.html로 반환합니다.
- 위험: /api/unknown 같은 미매칭 API가 404 JSON이 아니라 HTML을 반환할 수 있어, 클라이언트에서 “JSON 파싱 에러”가 발생하거나 디버깅이 어려워집니다.
- 개선안:
  - SPA fallback을 /api 제외 조건으로 제한(예: if (req.path.startsWith('/api')) return res.status(404).json(...)).

### P0-4. 날짜 파싱(UTC 파싱)로 인한 “하루 밀림” 가능
- 위험 패턴: 
ew Date('YYYY-MM-DD')
- 실제 위치 예시:
  - client/src/components/JournalStats.jsx:20
  - client/src/components/NotePreview.jsx:29
  - client/src/components/NoteEditor.jsx:90, client/src/components/NoteEditor.jsx:130
- 위험: 브라우저/OS 타임존에 따라 YYYY-MM-DD가 UTC 00:00로 해석되어 로컬 날짜가 전날로 보일 수 있습니다(미국/음수 오프셋에서 특히).
- 개선안(권장): date-fns 기반의 “date-only 파서” 유틸을 만들고 전부 교체.
  - 예: parse(dateStr, 'yyyy-MM-dd', new Date())를 공통 유틸로 제공.

## 3) P1 (높음) 성능/안정성 리스크

### P1-1. 쓰기마다 DB 전체를 동기식으로 저장(이벤트 루프 블로킹)
- 위치: server/db/init.js:68(db.export()), server/db/init.js:70(s.writeFileSync)
- 현상: 대부분의 write API가 매번 saveDB()를 호출합니다(예: server/routes/verse-notes.js:114, server/routes/highlights.js:44, server/routes/reading.js:67).
- 영향:
  - 요청마다 19MB 내외 DB 전체 export/동기 write → 응답 지연/프리즈
  - 중간 실패 시 DB 파일 손상 가능성
- 개선안:
  - (단기) saveDB()를 **디바운스/큐잉**하고, **원자적 저장(임시 파일→rename)** 적용
  - (단기) SIGTERM에서도 안전 종료/저장 처리 추가(현재는 exit, SIGINT만 처리: server/db/init.js:98, server/db/init.js:102)
  - (중기) 성경 DB와 유저 DB를 분리(유저 DB만 자주 저장)
  - (장기) sqlite3/etter-sqlite3 등 네이티브 드라이버로 전환

### P1-2. 중복 차트 로직(유지보수 비용 증가)
- 위치: client/src/pages/BibleChartPage.jsx, client/src/components/TrackerModal.jsx
- 내용: 읽은 장(챕터) 집계/OT·NT 통계 로직이 사실상 복제되어 있습니다.
- 개선안: “읽은 chapter set 계산”을 client/src/utils로 분리하고 두 곳에서 재사용.

## 4) P2 (중간) 정리/일관성 이슈

### P2-1. 읽기 로그(range) 처리의 일관성 부족
- 위치: client/src/components/ReadingProgress.jsx:18, client/src/components/ReadingProgress.jsx:34
- 내용: ReadingProgress는 log.chapter 중심으로 집계하여, 서버가 제공하는 chapter_from/chapter_to 범위 읽기 로그가 통계에 반영되지 않을 수 있습니다.
- 반면 BibleChartPage.jsx, TrackerModal.jsx는 범위를 확장하여 집계합니다.
- 개선안: 모든 집계를 동일한 유틸(범위 확장 포함)로 통일.

### P2-2. API/라우트 중복으로 인한 혼란
- 서버: server/routes/notes.js(free_notes 기반), server/routes/free-notes.js가 기능적으로 중복.
- 클라이언트: client/src/services/api.js는 /notes, client/src/services/journalApi.js는 /free-notes를 사용.
- 개선안: 한쪽으로 정리(예: /free-notes만 남기고 /notes는 deprecated).

### P2-3. 대형 컴포넌트(분리 필요)
- 후보:
  - client/src/components/BibleViewer.jsx (약 800줄): 네비게이션/스와이프/팝업/드래그/하이라이트/노트 CRUD/UI가 한 파일에 과밀
  - client/src/pages/Settings.jsx (약 579줄): 설정 + 백업/복원 + 모달 로직 혼재
- 개선안(예시):
  - BibleViewer → useVersePopup, VersePopup, HighlightPalette, useChapterNotes 등으로 분리
  - Settings → BackupSection, AuthSection, AppearanceSection 등 섹션 컴포넌트 분리

### P2-4. 잠재 버그: 잘못된 book 코드 사용 가능성
- 위치: client/src/components/BibleViewer.jsx:303
- 내용: const targetBook = book || bookName;에서 ookName(표시명)이 OSIS 코드가 아닐 수 있어 API 호출 실패 가능.
- 개선안: 	argetBook = book || currentBook처럼 “항상 OSIS 코드”로만 호출하도록 보장.

## 5) 개선 작업 제안(우선순위/단계)

### Phase 0 (핫픽스 성격, v2.0.1 권장)
1) 인증 예외 제거/재설계(Host 기반 예외 제거)
2) 백업 import에 erse_range 포함
3) /api 404 처리 후 SPA fallback 적용
4) 날짜 파싱 유틸 도입(
ew Date('YYYY-MM-DD') 제거)

### Phase 1 (안정화)
1) saveDB() 디바운스/원자 저장/종료 시그널(SIGTERM) 처리
2) 차트/트래커 통계 로직 공통화
3) 읽기 로그(range) 집계 유틸 공통화

### Phase 2 (리팩토링/정리)
1) BibleViewer.jsx 분리(훅/컴포넌트 단위)
2) Settings.jsx 분리(섹션 단위)
3) /notes vs /free-notes API 정리

## 6) 의사결정 포인트(DB 전략)
현재는 “유저 데이터 저장”이 발생할 때마다 “성경 본문 DB까지 포함된 전체 DB export 저장”이 발생하는 구조입니다.
- 선택지 A: sql.js 유지 + 저장 안정화(디바운스/원자 저장) (단기)
- 선택지 B: 성경 DB와 유저 DB 분리(sql.js 유지) (중기/가성비 좋음)
- 선택지 C: sqlite3 등 네이티브로 전환(정석/장기)

권장: A로 P0/P1부터 막고, 이후 B 또는 C로 2단계 전환.
