# Bible Reading Mate v2.0 Specification

- 최초 생성일: 2026-01-24
- 최신 수정일: 2026-01-25

## 개요
- 버전: v2.0.0 (Major Release)
- 목표: **"말씀 집중 모드와 묵상일지 모드 분리 및 구절별 묵상 시스템 도입"**
- 상태: **구현 완료 (Completed)**

---

## 용어 표준 (Terminology)

> [!IMPORTANT]
> 문서 간 일관성을 위한 명칭 표준

| 구분 | 말씀 집중 모드 | 묵상일지 모드 |
|------|---------------|--------------|
| **UI 라벨** | 성경 읽기 | 묵상일지 |
| **라우트** | `/bible` | `/journal` |
| **컴포넌트** | `BiblePage` | `JournalPage` |

---

## 핵심 변경사항 요약

| 분류 | 항목 | 내용 |
|------|------|------|
| **아키텍처** | DB 스키마 | 날짜별 → 구절별 묵상 시스템으로 전환 |
| **UI/UX** | 화면 분리 | 말씀 집중 모드 / 묵상일지 모드 탭 분리 |
| **레이아웃** | 3-Column | 데스크탑: 양쪽 사이드바 + 중앙 본문 (2단) |
| **기능** | 묵상 유형 | 구절별 묵상 + 자유묵상 + 오늘의 기도 |

---

## 데이터 모델 기준 (핵심 정의)

> [!IMPORTANT]
> 혼란 방지를 위한 데이터 저장 및 조회 기준 명세

| 항목 | 기준 | 설명 |
|------|------|------|
| **성경 읽기 기록** | 장(Chapter) 기준 | 동일 장을 여러 날 읽을 수 있음 (날짜별 로그 각각 저장) |
| **구절별 묵상** | 구절(Verse) + 날짜 | 동일 구절에 여러 날 묵상 작성 가능 |
| **묵상일지 표시** | 날짜(Date) 기준 | 선택한 날에 작성된 묵상만 표시 |

### 화면별 데이터 조회 로직

```
[말씀 집중 모드 - BiblePage]
├── 본문 영역: 선택한 책/장의 구절 표시
├── 사이드바: 해당 장의 모든 구절별 묵상 (날짜 무관, 최신순 정렬)
└── 📝 표시: 해당 구절에 묵상이 1개 이상 존재하면 표시

[묵상일지 모드 - JournalPage]
├── 읽은 말씀: 해당 날짜의 reading_logs
├── 구절별 묵상: 해당 날짜에 작성된 verse_notes만
├── 자유 묵상: 해당 날짜의 free_notes
└── 오늘의 기도: 해당 날짜의 daily_prayers
```

### 예시 시나리오

1. **같은 구절을 여러 날 묵상**: 시편 23:1을 1월 20일, 1월 24일에 각각 묵상
   - `verse_notes`에 2개 레코드 저장 (date가 다름)
   - 말씀 집중 모드: 둘 다 사이드바에 표시 (날짜순)
   - 묵상일지 1월 20일: 1월 20일 묵상만 표시
   - 묵상일지 1월 24일: 1월 24일 묵상만 표시

2. **같은 장을 여러 날 읽기**: 시편 23장을 1월 20일, 1월 24일에 각각 읽음
   - `reading_logs`에 2개 레코드 저장
   - 읽기표: 해당 장 완독 표시 (읽은 날짜 중 최신)

---

## v2.0 기능 범위

### 🔴 P0: 필수 기능

| ID | 항목 | 설명 |
|----|------|------|
| **DB1** | 구절별 묵상 테이블 | [x] `verse_notes` 테이블 신설 |
| **DB2** | 자유묵상 테이블 | [x] 기존 `notes` → `free_notes` 마이그레이션 |
| **DB3** | 오늘의 기도 테이블 | [x] `daily_prayers` 테이블 신설 |
| **API1** | 구절별 묵상 API | [x] CRUD 엔드포인트 |
| **API2** | 자유묵상/기도 API | [x] CRUD 엔드포인트 |
| **UI1** | 탭 네비게이션 | [x] 상단 `성경 읽기` / `묵상일지` 탭 |
| **UI2** | 2단 본문 뷰어 | [x] CSS Multi-column 기반 본문 표시 |
| **UI3** | 양쪽 사이드바 | [x] 좌: 전반부 구절 묵상, 우: 후반부 구절 묵상 |
| **UI4** | 묵상일지 페이지 | [x] 날짜별 구절묵상 + 자유묵상 + 기도 통합 뷰 |
| **UI5** | 구절별 묵상 표시 | [x] 📝 이모지로 묵상 존재 구절 표시 |
| **UI6** | 묵상 작성 팝업 | [x] 구절 본문 + 텍스트 입력 통합 모달 |
| **UI7** | 모바일 레이아웃 | [x] 단일 컬럼 + 탭 기반 UI |

### 🟡 P1: 권장 기능

| ID | 항목 | 설명 |
|----|------|------|
| **UX1** | 하이라이트 4색 팔레트 | [x] 노랑, 빨강, 초록, 파랑 |
| **UX2** | 구절 클릭 메뉴 | [x] 하이라이트 / 묵상 작성 선택 |
| **UX3** | 편집/삭제 아이콘 | [x] 묵상일지 각 항목에 인라인 액션 |

### 🟢 P2: 선택 기능

| ID | 항목 | 설명 |
|----|------|------|
| **M1** | 자유묵상 → 구절묵상 이전 | [x] 기존 묵상을 구절에 연결하는 기능 (마이그레이션 스크립트로 처리) |
| **M2** | 모바일 제스처 | [x] 좌우 스와이프 날짜/장 이동 (묵상일지 및 성경 뷰어 적용) |

### ✨ 추가 구현된 기능 (v2.0+)

| 항목 | 설명 |
|------|------|
| **하이라이트 라벨 커스텀** | 4가지 색상에 대해 사용자 지정 라벨(예: 관찰, 적용) 설정 가능 |
| **지우개 툴** | 팝업 메뉴 내 전용 아이콘을 통한 하이라이트 삭제 UX 개선 |
| **묵상 작성일(created_at) 보존** | 묵상 수정 시에도 최초 작성일을 유지하여 데이터 무결성 확보 |
| **고급 정렬 및 필터링** | 묵상일지에서 실제 작성일 기준 필터링 및 성경 순서(앞장 정렬) 지원 |
| **다중 구절 선택 묵상** | 여러 구절을 한꺼번에 선택하여 범위 묵상으로 저장하는 기능 |
| **자동 마이그레이션 스크립트** | 과거 백업 데이터를 V2 스키마에 맞춰 자동 보정하는 도구 제공 |
| **로컬 개발자 편의** | localhost 환경에서 인증 절차 자동 건너뛰기 기능 적용 |
| **설정 서버 저장** | 형광펜 라벨 등 사용자 설정을 서버에 저장하여 기기 간 동기화 지원 |

---

## DB 스키마 변경

### 신규 테이블

```sql
-- 1. 구절별 묵상
CREATE TABLE verse_notes (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,           -- 묵상한 날짜 (YYYY-MM-DD)
    book TEXT NOT NULL,           -- OSIS book code
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    UNIQUE(date, book, chapter, verse)
);

-- 2. 자유 묵상 (기존 notes 대체)
CREATE TABLE free_notes (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
);

-- 3. 오늘의 기도
CREATE TABLE daily_prayers (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
);

-- 4. 사용자 설정 (형광펜 라벨 등)
CREATE TABLE user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);
```

### 마이그레이션 전략

**notes → free_notes 이관**:
- 필드 매핑:
  - `notes.date` → `free_notes.date`
  - `notes.content` → `free_notes.content`
  - `notes.created_at` → `free_notes.created_at` (히스토리 보존)
  - `notes.updated_at` → `free_notes.updated_at`
- 중복 날짜: 기존 테이블에 UNIQUE 제약이므로 발생 불가
- 실패 시: 트랜잭션 롤백, 원본 `notes` 테이블 보존
- 검증: 이관 전후 레코드 수 및 날짜별 데이터 일치 여부 확인

**백업 JSON 호환성**:
- v1.x 백업 import 시: `notes` → `free_notes` 자동 변환
- v2.x 백업 export 시: `schema_version: 3`, 새 테이블 포함
- `schema_version`: 2 → 3

---

## API 엔드포인트

### 신규 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/verse-notes?date=YYYY-MM-DD` | 날짜별 구절 묵상 목록 |
| `GET` | `/api/verse-notes/:book/:chapter` | 해당 장의 모든 묵상 |
| `GET` | `/api/verse-notes/chapter/:book/:chapter` | 묵상 존재 구절 목록 (📝 표시용) |
| `POST` | `/api/verse-notes` | 구절 묵상 생성 (UPSERT - 같은 날 같은 구절이면 수정) |
| `DELETE` | `/api/verse-notes/:id` | 구절 묵상 삭제 |
| `GET` | `/api/prayers/:date` | 날짜별 기도 |
| `POST` | `/api/prayers` | 기도 저장 |
| `GET` | `/api/free-notes/:date` | 자유 묵상 조회 |
| `POST` | `/api/free-notes` | 자유 묵상 저장 |

**에러 응답 표준**:
- HTTP Status: 4xx, 5xx
- Body: `{ "code": "ERROR_CODE", "message": "사용자 메시지" }`

### 기존 API (v1.x 유지)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET/POST` | `/api/reading-logs` | 읽기 기록 CRUD |
| `GET/POST/DELETE` | `/api/highlights` | 하이라이트 CRUD |
| `GET` | `/api/auth/status` | 인증 상태 조회 |
| `GET/POST` | `/api/backup` | 백업/복구 (v2.0 스키마 지원) |

### 기존 API 변경

| 경로 | 변경 |
|------|------|
| `/api/notes` | Deprecated (마이그레이션 후 제거) |
| `/api/backup` | 새 테이블 포함하도록 수정 |

---

## 설정 페이지 변경

| 항목 | v1.4 | v2.0 |
|------|------|------|
| 화면 표시 설정 (말씀/묵상 ON/OFF) | ✅ | ❌ (탭 분리로 불필요) |
| 모바일 달력 숨김 | ✅ | ✅ 유지 |
| 기본 화면 설정 | ❌ | ✅ 신규 (시작 시 말씀읽기/묵상일지 선택) |

### UI 상태 처리 정책
- **Loading**: 장 로드 시 스켈레톤 UI 표시
- **Empty**:
  - 묵상일지 데이터 없음: "작성된 묵상이 없습니다" 안내 + 작성 버튼 표시
- **Error**: API 호출 실패 시 Toast 메시지 표시
- **Long Content**: 3줄 이상 시 '더보기' 버튼 표시 (클릭 시 전체 보기)
- **모바일 헤더**: 좁은 폭 대응을 위해 탭 명칭 축소 (`[성경]`, `[묵상]`)

---

## 비기능 요구사항

### 성능
- 장 로드 시 구절별 묵상 존재 여부 조회: < 100ms
- 2단 레이아웃 렌더링: < 300ms

### 호환성
- 반응형 breakpoint: 768px (데스크톱/모바일 분기)
- 기존 데이터 무손실 마이그레이션

### 타임존 정책
- **서버 저장**: UTC 기준
- **클라이언트 표시**: 사용자 로컬 타임존 (KST 등)
- **날짜 문자열**: ISO 8601 (`YYYY-MM-DD`), 서버에서 UTC 자정 기준 계산
- **세션 만료**: 서버 UTC 자정(00:00:00) 기준

### 인덱스 설계
```sql
-- 장별 묵상 조회 최적화
CREATE INDEX idx_verse_notes_chapter ON verse_notes(book, chapter);

-- 날짜별 묵상 조회 최적화
CREATE INDEX idx_verse_notes_date ON verse_notes(date);
```

---

## 마일스톤

| 순서 | 항목 | 난이도 | 이유 | 예상 기간 |
|:---:|:---|:---:|:---|:---:|
| **1** | **DB 스키마 + 마이그레이션** | ⭐⭐⭐ | 모든 기능의 기반. 기존 데이터 보존(Risk)이 가장 중요하므로 최우선 진행. | 1일 |
| **2** | **API 엔드포인트 구현** | ⭐⭐ | 프론트엔드 연동을 위한 데이터 파이프라인 구축. 테스트 용이. | 1일 |
| **3** | **묵상일지 모드 (JournalPage)** | ⭐⭐ | 상대적으로 UI가 단순하며, 핵심 CRUD 기능을 가장 먼저 검증하기 좋음. | 2-3일 |
| **4** | **구절별 묵상 표시 (📝)** | ⭐ | 본문 렌더링 로직의 기초. 구절 매칭 로직 선행 구현. | 0.5일 |
| **5** | **말씀 집중 모드 (BiblePage)** | ⭐⭐⭐⭐⭐ | **최고 난이도**. 2단 컬럼 + 양쪽 사이드바 동적 배치 알고리즘 구현 및 최적화 필요. | 3-4일 |
| **6** | **하이라이트 4색 확장** | ⭐ | 독립적인 기능으로, 핵심 로직에 영향을 덜 주므로 후순위 배정. | 0.5일 |
| **7** | **통합 테스트 + 버그 수정** | ⭐⭐ | 전체 기능 연동 테스트 및 엣지 케이스 수정. | 1일 |

**예상 총 기간**: 8-10일

---

## 참고 문서
- [architecture-v2.0.md](./architecture-v2.0.md)
- [layout-v2.0.md](./layout-v2.0.md)
