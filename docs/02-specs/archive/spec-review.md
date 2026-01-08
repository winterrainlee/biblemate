# BibleMate (Bible Reading Mate) - 프로젝트 명세서 (리뷰 반영본)

## Review Log
- Draft: Claude Opus 4.5 (2026-01-04)
- 1차 Review: GPT 5.2 thinking extended (2026-01-04)
- 2차 Review: Gemini 2.5 Pro (2026-01-04)
- 3차 Review: GPT 5.2 + Gemini 2.5 Pro 통합 (2026-01-04)

---

## 📌 개요
- **프로젝트명**: BibleMate (Bible Reading Mate)
- **목적**: 매일 성경 말씀을 읽고, 날짜별 묵상 노트를 기록하며, 읽기 진행 상황(달력)을 추적하는 **개인용 웹앱**
- **버전**: v1.0 (MVP)
- **시간 기준**: `Asia/Seoul` 고정 (날짜 계산/저장 기준)

### 핵심 원칙 (v1.0)
- 기능은 **단순하게**, 데이터는 **미리 튼튼하게**
- 성경 본문은 **절(verse) 단위로 저장**
- "영어 역본"은 **해석 보조** 목적: 기록(읽기표)에는 **역본을 저장하지 않음**
- v1.0은 **온라인 전용** (오프라인 지원은 v1.1+에서 고려)

---

## ✅ 결정 사항 (확정)

### 본문/역본
- **한국어**: 『성경전서 개역한글판』 (저작권 자유)
  - 앱 내 **출처(성명표시권) 표기** 필수
  - 본문 텍스트는 **내용/형식/제호 동일성 유지**(무단 변경/절삭/개변 금지)
- **영어**: Open English Bible (**OEB**) 1종 (CC0, 저작권 자유)
- **향후 계획**: 라이선스 확보 후 개역개정, ESV 등 추가 예정
- 기본 로딩은 **한국어(개역한글)**, 한/영 전환은 **현재 위치(책/장/절) 유지**

### 성경 데이터 소스
- **개역한글**: [`thiagobodruk/bible`](https://github.com/thiagobodruk/bible) (ko_ko.json)
- **OEB**: [`scrollmapper/bible_databases`](https://github.com/scrollmapper/bible_databases)
- **임포트 전략**: JSON 다운로드 → `scripts/import-bible.js`로 SQLite에 일괄 insert
- **원천 고정**: 사용한 데이터셋 커밋 SHA 또는 릴리스 버전을 문서에 기록

### 데이터 Import 검증 체크리스트
- **샘플 대조**: 대표 구절로 원문 완전 일치 확인
  - 창 1:1, 시 23:1, 사 53:5, 마 5:3, 요 3:16, 롬 8:28
- **무단 변형 금지**: 공백/줄바꿈 정리 외 본문 단어/구두점/절 구분 변경 금지
- **오탈자 방지**: (version, book, chapter, verse) 키 중복/누락 검출
  - 각 권의 장 수/절 수 기본 검증

### 범위/식별
- 성경 **66권(구약+신약)** 지원 (외경 제외)
- 책 식별자는 **표준 코드(OSIS)로 내부 키 고정**
  - 화면 표시(한글/영문)는 매핑 테이블로 처리
- **OSIS 매핑 테이블** 생성 필요:
  ```json
  {
    "Gen": { "ko": "창세기", "en": "Genesis", "chapters": 50 },
    "Exod": { "ko": "출애굽기", "en": "Exodus", "chapters": 40 },
    ...
  }
  ```

### 진행 기록(읽기표)
- **날짜당 1개**만 저장 (같은 날짜에 다시 저장하면 덮어씔)
- 기록에는 **역본을 저장하지 않음**
- 읽기 범위는 **같은 책 안에서 '장 범위'만 허용** (책을 넘기는 범위는 v1.x 이후)
- 날짜 기준은 **Asia/Seoul**로 고정
- **저장 규칙**:
  - **오늘 날짜**: 책/장 범위를 선택하면 **자동 저장** (2-3초 디바운스)
  - **과거 날짜**: 덮어쓰기 방지를 위해 **저장 버튼**을 눌러야만 저장
  - **기록 삭제**: 잘못 저장된 날짜를 되돌릴 수 있는 삭제 버튼 제공

### 묵상 노트
- **날짜당 1개** (date가 고유키, upsert)
- **자동 저장 + 수동 저장**: 타이핑 멈추면 자동 저장, 저장 버튼도 제공
- "저장됨" 피드백 표시
- **클립보드 복사**: 저장 버튼 옆에 복사 버튼 제공 (공유 목적)
  - 복사 포맷: 날짜 + 읽은 범위 + 노트 내용
  ```
  [💾 저장] [📋 복사]
  
  // 복사 시 클립보드 내용 예시:
  📅 2026-01-04 (말라기 1-3장)
  
  오늘 말씀에서 하나님의 사랑을 다시 느꼈다...
  ```

### 하이라이트
- **구절당 0~1개** (색/스타일 변경 시 업데이트로 덮어쓰기)
- 한/영 **공통 공유** (같은 구절이면 언어 전환해도 같은 하이라이트 보임)
- 스타일은 **3종 고정**: `yellow | red | underline`
- **삭제**: 별도 삭제 버튼 제공
  ```
  [노랑] [빨강] [밑줄] [🗑️ 삭제]
  ```

### 앱 초기 상태
- **마지막 읽던 위치 복원** (LocalStorage)
- 첫 방문 시 기본값: **창세기 1장**

### 사용자/배포
- **단일 사용자**
- 다른 사람이 쓰려면 **자기 호스팅**(깃허브 패키지로 배포) 전제

### 백업
- v1.0에서 **Export/Import 지원**
- **백업 범위**: 사용자 데이터만 (notes, highlights, reading_logs)
  - `bible_verses`(본문 DB)는 용량이 크고 재생성 가능하므로 백업에서 제외
- Import는 **완전 덮어쓰기(리셋 후 복원)**
- **Import 안전장치 (권장 UX)**:
  1. Import 버튼 클릭 → 먼저 Export 실행 (사용자 로컬에 백업 파일 저장)
  2. "덮어쓰기(리셋 후 복원)" 확인 모달 표시
  3. `/api/backup/import` 실행
- 날짜 포맷은 `YYYY-MM-DD`
- Export 파일명 규칙: `biblemate-backup-YYYY-MM-DD.json`

### 에러 처리
- **가벼운 에러**: 토스트 메시지 (하단에 잠깐 표시)
- **심각한 에러** (데이터 손실 위험): 모달 알림

### API 스타일
- 기능별 **REST 엔드포인트**로 분리

---

## 🎯 핵심 기능 (v1.0)

### 1) 말씀 읽기
- **지원 역본**: 한국어(개역한글), 영어(OEB)
- **말씀 범위 선택**: 책(OSIS) > 장 범위 선택 (예: `Mal 1~3`)
- **한/영 전환**: 현재 위치 유지한 채로 즉시 전환 가능
- **표시 방식**: 스크롤 가능한 본문 영역(절 단위 렌더링)

**완료 조건(수락 기준)**
- 책/장 범위를 선택하면 해당 본문이 로딩되고, 절 단위로 표시된다.
- 한/영 전환 시 동일한 절 위치를 유지한다.

### 2) 하이라이트
- 절 단위로 클릭 → 스타일 선택(`yellow/red/underline`) 또는 삭제 → 저장
- 동일 구절에 다시 선택하면 **업데이트(덮어쓰기)**
- 한/영 전환해도 같은 구절이면 같은 하이라이트가 표시됨

**완료 조건**
- 새로고침/재접속 후에도 하이라이트가 유지된다.
- 동일 구절에 다른 스타일을 고르면 이전 스타일이 교체된다.
- 삭제 버튼으로 하이라이트를 제거할 수 있다.

### 3) 날짜별 묵상 노트
- 날짜별로 1개의 노트를 작성/수정/삭제
- 날짜를 바꾸면 해당 날짜 노트를 로드(없으면 빈 상태)
- **자동 저장** (타이핑 멈춤 후 2-3초) + **수동 저장 버튼**
- **클립보드 복사**: 복사 버튼 클릭 시 현재 노트 내용을 클립보드에 복사

**완료 조건**
- 특정 날짜에 작성한 노트가 같은 날짜에 다시 들어왔을 때 그대로 로드된다.
- 자동 저장 시 "저장됨" 피드백이 표시된다.
- 복사 버튼 클릭 시 "복사됨" 토스트가 표시된다.

### 4) 읽기표(Reading Tracker)
- 월간 달력에 **읽은 날짜**를 표시
- 날짜 클릭 시, 그 날짜에 저장된 **책/장 범위**를 로딩
- 기록이 없으면 "기록 없음" 상태 표시
- **저장 규칙 (사고 방지)**:
  - **오늘 날짜**: 책/장 범위 변경 시 **자동 저장** (2-3초 디바운스)
  - **과거 날짜**: **저장 버튼**을 눌러야만 기록 변경 (탐색 중 덮어쓰기 방지)
  - **기록 삭제**: 삭제 버튼으로 잘못 저장된 날짜 되돌리기 가능

**완료 조건**
- 읽기 기록을 저장하면 달력에 표시된다.
- 달력에서 날짜를 누르면 해당 범위가 로딩된다.
- 오늘 날짜는 자동 저장, 과거 날짜는 저장 버튼을 눌러야 저장된다.
- 삭제 버튼으로 기록을 삭제할 수 있다.

### 5) 설정
- 테마: `light | dark`
- 글자 크기: `small | medium | large`
- 마지막 읽던 위치(책/장 범위/스크롤/언어) 자동 저장
- 첫 방문 시 기본값: 창세기 1장

---

## 🖥️ UI/UX 설계 (요약)

### 전체 레이아웃
- 상단: 날짜 선택(달력/오늘), 책/장 범위 선택, 언어 토글(한/영)
- 본문: 절 리스트(하이라이트 표시)
- 사이드/하단 패널: 묵상 노트(날짜별) + 저장/복사 버튼
- 설정: 테마/글자 크기, 데이터 백업(Export/Import), 정보(출처/라이선스)

### 필수 화면 상태
- `No Record`(읽기 기록 없음)
- `Loading`(본문 로딩)
- `Error`(본문/저장 실패) - 토스트 또는 모달로 표시
- `Saved`(저장 완료) - 토스트로 피드백

---

## 🗄️ 데이터 모델 (SQLite)

> v1.0은 단일 사용자이므로 user_id 없음.  
> 날짜(date)는 **Asia/Seoul** 기준으로 생성된 `YYYY-MM-DD` 문자열.

### 테이블 1) bible_verses (본문)
- 절 단위 저장
- OSIS 책 코드 + 장 + 절로 식별

```sql
CREATE TABLE IF NOT EXISTS bible_verses (
  version TEXT NOT NULL CHECK (version IN ('krv', 'oeb')),
  book    TEXT NOT NULL,              -- OSIS code (예: Gen, Exod, Matt, 1Cor ...)
  chapter INTEGER NOT NULL,
  verse   INTEGER NOT NULL,
  text    TEXT NOT NULL,

  PRIMARY KEY (version, book, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_bible_lookup
ON bible_verses (version, book, chapter);
```

### 테이블 2) highlights (하이라이트)
- 구절당 0~1개 (덮어쓰기)
- 한/영 공통 공유: version 컬럼 없음

```sql
CREATE TABLE IF NOT EXISTS highlights (
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('yellow','red','underline')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  PRIMARY KEY (book, chapter, verse)
);
```

### 테이블 3) notes (묵상 노트)
- 날짜당 1개 (date가 PK)

```sql
CREATE TABLE IF NOT EXISTS notes (
  date TEXT PRIMARY KEY,          -- YYYY-MM-DD (Asia/Seoul)
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 테이블 4) reading_logs (읽기 기록)
- 날짜당 1개, 역본 저장 안 함

```sql
CREATE TABLE IF NOT EXISTS reading_logs (
  date TEXT PRIMARY KEY,          -- YYYY-MM-DD (Asia/Seoul)
  book TEXT NOT NULL,
  start_chapter INTEGER NOT NULL,
  end_chapter INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### LocalStorage (설정/마지막 위치)
```json
{
  "theme": "light",
  "fontSize": "medium",
  "preferredLanguage": "krv",
  "lastPosition": {
    "language": "krv",
    "book": "Mal",
    "startChapter": 1,
    "endChapter": 2,
    "scrollAnchor": "Mal-1-3"
  }
}
```

---

## 🔌 API 설계 (REST)

### 공통 응답 포맷(권장)
- 성공
```json
{ "ok": true, "data": {} }
```
- 실패
```json
{ "ok": false, "error": { "code": "BAD_REQUEST", "message": "..." } }
```

---

## 1) 성경 API
### GET /api/bible/:book/range?from=1&to=3&version=krv
- `book`: OSIS 코드
- `version`: `krv | oeb` (기본값 `krv`)
- `from`, `to`: 장 범위(동일 책 내)

**Response 예시**
```json
{
  "ok": true,
  "data": {
    "version": "krv",
    "book": "Mal",
    "from": 1,
    "to": 3,
    "verses": [
      { "chapter": 1, "verse": 1, "text": "..." },
      { "chapter": 1, "verse": 2, "text": "..." }
    ]
  }
}
```

---

## 2) 하이라이트 API
### GET /api/highlights?book=Mal&from=1&to=3
- 범위 내 하이라이트 일괄 로드(렌더링 최적화용)

### PUT /api/highlights
- body: `{ "book": "Mal", "chapter": 1, "verse": 3, "style": "yellow" }`
- 없으면 생성, 있으면 업데이트(덮어쓰기)

### DELETE /api/highlights?book=Mal&chapter=1&verse=3
- 해당 구절 하이라이트 삭제

---

## 3) 노트 API (date = PK)
### GET /api/notes/:date
### PUT /api/notes/:date
- body: `{ "content": "..." }`
- upsert

### DELETE /api/notes/:date

---

## 4) 읽기 기록 API (date = PK)

> 프론트 정책: **오늘 날짜**는 범위 변경 시 `PUT /api/reading-logs/:date`를 자동 호출
> **과거 날짜**는 저장 버튼/편집 모드에서만 호출

### GET /api/reading-logs/:date
### PUT /api/reading-logs/:date
- body: `{ "book": "Mal", "startChapter": 1, "endChapter": 3 }`
- 날짜당 1개, upsert

### DELETE /api/reading-logs/:date
- 해당 날짜의 읽기 기록 삭제

### GET /api/reading-logs?month=2026-01
- 달력 표시용: 해당 월의 기록 날짜 목록 + 범위 요약

---

## 5) 백업 API
### GET /api/backup/export
- 현재 데이터를 하나의 JSON으로 내보내기
- 서버는 `Content-Disposition`으로 파일 다운로드 유도  
  파일명: `biblemate-backup-YYYY-MM-DD.json`

**Export JSON 포맷**
```json
{
  "meta": {
    "app": "BibleMate",
    "schemaVersion": 1,
    "exportedAt": "2026-01-04T00:00:00+09:00",
    "timezone": "Asia/Seoul"
  },
  "notes": [
    { "date": "2026-01-04", "content": "..." }
  ],
  "highlights": [
    { "book": "Mal", "chapter": 1, "verse": 3, "style": "yellow" }
  ],
  "readingLogs": [
    { "date": "2026-01-04", "book": "Mal", "startChapter": 1, "endChapter": 3 }
  ]
}
```

### POST /api/backup/import
- import는 **완전 덮어쓰기**
- Import 전 **자동 백업** 생성 (서버 측에서 `backup-before-import-YYYY-MM-DD.json` 저장)
- body: multipart file upload 또는 raw JSON (택1)
- 처리 순서(권장): 자동 백업 → 유효성 검사 → 트랜잭션 시작 → 테이블 초기화 → 삽입 → 커밋

---

## 🛠️ 기술 스택 (권장)
- Frontend: React + Vite
- Backend: Node.js + Express
- DB: SQLite
- 스타일: CSS variables + 간단한 테마 토글(라이트/다크)

---

## 📋 개발 우선순위

### Phase 1: MVP (v1.0)
1. OSIS 매핑 테이블 생성 (66권 한글/영문명 + 장 수)
2. 성경 데이터 임포트 스크립트 (`scripts/import-bible.js`)
3. DB 스키마/마이그레이션
4. 성경 본문 로딩 API + 범위 로딩 UI
5. 하이라이트 저장/로드 (삭제 포함)
6. 노트 저장/로드 (자동 저장 + 수동 저장)
7. 읽기 기록 자동 저장 + 달력 표시
8. Export/Import (Import 전 자동 백업)
9. 설정(테마/글자 크기) + 마지막 위치 저장

### Phase 2: 향후 개발 (v1.1+)
- 오프라인 지원 (Service Worker + IndexedDB)
- 개역개정, ESV 등 추가 역본 (라이선스 확보 후)
- 절(verse) 단위 진행 체크(체크박스/진행률)
- 책을 넘기는 범위 읽기 기록
- 다중 하이라이트(겹치기)
- 다중 사용자/로그인
- 검색(구절/키워드)
- 통독 계획 템플릿/알림

---

## ✅ 검증 계획

### 자동 테스트(최소)
- API: 노트/하이라이트/읽기 기록 upsert & delete
- Backup: export → import → 동일성 검증
- Import 전 자동 백업 생성 확인

### 수동 검증
- 데스크톱/모바일 반응형 확인
- 라이트/다크 모드 전환 확인
- 한/영 전환 시 위치 유지 확인
- 날짜별 저장/로드(달력 포함) 확인
- Import 덮어쓰기 동작 확인
- 자동 저장 + "저장됨" 피드백 확인
- 에러 발생 시 토스트/모달 표시 확인

---

## 📝 라이선스/출처 표기 (앱 내 '정보/라이선스' 화면에 포함)
- 한국어 본문: 『성경전서 개역한글판』 (대한성서공회)  
  - 출처 표기(성명표시권) 준수  
  - 본문 동일성 유지(무단 변경/절삭/개변 금지)
- 영어 본문: Open English Bible (OEB, CC0)  
  - 프로젝트 라이선스/출처 표기를 앱 내에 명시
