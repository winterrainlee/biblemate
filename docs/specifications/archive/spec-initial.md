# Bible Reading Mate - 프로젝트 명세서

## 📌 개요

**프로젝트명**: Bible Reading Mate  
**목적**: 매일 성경 말씀을 읽고, 묵상 노트를 기록하며, 읽기 진행 상황을 추적하는 개인용 웹앱  
**버전**: v1.0 (MVP)

---

## 🎯 핵심 기능

### 1. 말씀 읽기
- **지원 역본**: 개역개정, 새번역, ESV
- **말씀 범위 선택**: 책 > 장 범위 선택 (예: 말라기 1장~3장)
- **표시 방식**: 스크롤 가능한 본문 영역
- **역본 비교**: v1.0 제외 (향후 개발)

### 2. 하이라이트
- **적용 단위**: 성경 구절 (verse)
- **저장 방식**: 구절에 영구적으로 연결 (날짜와 무관)
- **색상 옵션** (3종):
  | 이름 | 스타일 |
  |------|--------|
  | 옅은 노랑 | `background: #FFF9C4` |
  | 옅은 빨강 | `background: #FFCDD2` |
  | 붉은 밑줄 | `border-bottom: 2px solid #E53935` (배경 없음) |

### 3. 날짜별 묵상 노트
- **저장 단위**: 날짜당 1개 노트
- **저장 위치**: 서버 DB (SQLite)
- **포맷**: v1.0 순수 텍스트, 향후 마크다운 지원 예정
- **기능**: 작성, 수정, 삭제

### 4. 읽기표 (Reading Tracker)
- **캘린더 뷰**: 월별 달력에 읽은 날짜 표시
- **날짜 클릭 시**:
  - 읽은 기록 있음 → 해당 말씀 범위 + 묵상 노트 자동 로드
  - 읽은 기록 없음 → 새로 입력 가능
- **읽은 장/절 체크**: 체크박스 또는 시각적 표시

### 5. 설정
- **다크 모드**: 토글 스위치
- **글꼴 크기 조절**: 작게 / 보통 / 크게
- **설정 저장**: LocalStorage

---

## 🖥️ UI/UX 설계

### 전체 레이아웃

#### 데스크톱 (1024px 이상)
```
┌─────────────────────────────────────────────────────────────┐
│  📖 Bible Reading Mate          [📊 읽기표] [🌙] [Aa]       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │ 📅 2026년 1월       │  │ 📖 말씀                       │ │
│  │ [    달력 그리드   ]│  │ ┌───────────────────────────┐ │ │
│  │  (읽은 날짜 표시)   │  │ │ 말라기 1장               │ │ │
│  │                     │  │ │ 1. 여호와께서 말라기를...│ │ │
│  │ ─────────────────── │  │ │ (하이라이트 가능)        │ │ │
│  │ 📍 오늘의 말씀       │  │ │ (스크롤)                 │ │ │
│  │ [말라기 ▼] [1-3장]  │  │ └───────────────────────────┘ │ │
│  │ [개역개정 ▼]        │  ├───────────────────────────────┤ │
│  │                     │  │ 📝 오늘의 묵상 (2026.01.04)   │ │
│  │ ─────────────────── │  │ ┌───────────────────────────┐ │ │
│  │ 📝 노트 미리보기     │  │ │ 텍스트 입력 영역          │ │ │
│  │ "오늘 말씀에서..."  │  │ └───────────────────────────┘ │ │
│  └─────────────────────┘  │              [💾 저장] [🗑️]  │ │
│                           └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 모바일 (768px 미만)
```
┌─────────────────────┐
│ 📖 Bible Reading    │
│     [📊] [🌙] [Aa]  │
├─────────────────────┤
│ 📅 1월 2026         │
│ [    달력 축소     ]│
├─────────────────────┤
│ [말라기▼] [1-3장]   │
│ [개역개정 ▼]        │
├─────────────────────┤
│ 📖 말씀             │
│ (스크롤 가능)       │
├─────────────────────┤
│ 📝 오늘의 묵상      │
│ [텍스트 입력]       │
│         [💾 저장]   │
└─────────────────────┘
```

### 디자인 톤
- **전체 분위기**: 차분한 톤 (베이지, 그린, 우드 계열)
- **라이트 모드**: 
  - 배경: `#FAF8F5` (따뜻한 흰색)
  - 텍스트: `#3E3E3E`
  - 포인트: `#5D8A66` (차분한 그린)
- **다크 모드**:
  - 배경: `#1A1A1A`
  - 텍스트: `#E8E6E3`
  - 포인트: `#7FB77E`

---

## 🗄️ 데이터 구조

### 성경 데이터 (JSON/SQLite)
```javascript
// bible_verses 테이블
{
  id: 1,
  book: "말라기",      // 책 이름
  book_en: "Malachi",  // 영문명
  chapter: 1,          // 장
  verse: 1,            // 절
  text_krv: "...",     // 개역개정
  text_nkrv: "...",    // 새번역
  text_esv: "..."      // ESV
}
```

### 읽기 기록
```javascript
// reading_logs 테이블
{
  id: 1,
  date: "2026-01-04",           // 날짜
  book: "말라기",
  start_chapter: 1,
  end_chapter: 3,
  version: "krv",                // 역본
  completed: true                // 완독 여부
}
```

### 묵상 노트
```javascript
// notes 테이블
{
  id: 1,
  date: "2026-01-04",
  content: "오늘 말씀에서...",
  created_at: "2026-01-04T21:00:00Z",
  updated_at: "2026-01-04T21:30:00Z"
}
```

### 하이라이트
```javascript
// highlights 테이블
{
  id: 1,
  book: "말라기",
  chapter: 1,
  verse: 3,
  color: "yellow",  // yellow | red | underline
  created_at: "2026-01-04T21:00:00Z"
}
```

### 설정 (LocalStorage)
```javascript
{
  theme: "light",       // light | dark
  fontSize: "medium",   // small | medium | large
  defaultVersion: "krv" // krv | nkrv | esv
}
```

---

## 🛠️ 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | React + Vite | SPA |
| 스타일 | Vanilla CSS | 커스텀 디자인 |
| 백엔드 | Node.js + Express | REST API |
| 데이터베이스 | SQLite | better-sqlite3 |
| 배포 (FE) | Vercel | 무료 티어 |
| 배포 (BE) | Railway / Render | 무료 티어 |

---

## 📁 프로젝트 구조

```
bible-reading-mate/
├── client/                 # React 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── BibleSelector.jsx
│   │   │   ├── BibleViewer.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   ├── HighlightPicker.jsx
│   │   │   └── ReadingTracker.jsx
│   │   ├── contexts/
│   │   │   └── AppContext.jsx
│   │   ├── hooks/
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── themes.css
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express 백엔드
│   ├── data/
│   │   └── bible.db       # SQLite 데이터베이스
│   ├── routes/
│   │   ├── bible.js
│   │   ├── notes.js
│   │   ├── readings.js
│   │   └── highlights.js
│   ├── index.js
│   └── package.json
├── scripts/
│   └── import-bible.js    # 성경 데이터 임포트 스크립트
└── README.md
```

---

## 🔌 API 설계

### 성경 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/bible/books` | 성경 책 목록 |
| GET | `/api/bible/:book/:chapter` | 특정 장의 모든 절 |
| GET | `/api/bible/:book/:startCh/:endCh?version=krv` | 장 범위 조회 |

### 노트 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notes/:date` | 특정 날짜 노트 조회 |
| POST | `/api/notes` | 노트 생성 |
| PUT | `/api/notes/:id` | 노트 수정 |
| DELETE | `/api/notes/:id` | 노트 삭제 |

### 읽기 기록 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/readings?month=2026-01` | 월별 읽기 기록 |
| GET | `/api/readings/:date` | 특정 날짜 기록 |
| POST | `/api/readings` | 읽기 기록 저장 |

### 하이라이트 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/highlights/:book/:chapter` | 특정 장 하이라이트 |
| POST | `/api/highlights` | 하이라이트 추가 |
| DELETE | `/api/highlights/:id` | 하이라이트 삭제 |

---

## 📋 개발 우선순위

### Phase 1: MVP (v1.0)
- [x] 프로젝트 설정 (Vite + Express)
- [ ] 성경 데이터 구축 및 임포트
- [ ] 기본 레이아웃 구현
- [ ] 달력 컴포넌트
- [ ] 말씀 뷰어 (역본 선택 포함)
- [ ] 묵상 노트 CRUD
- [ ] 읽기 기록 저장/조회
- [ ] 하이라이트 기능
- [ ] 다크 모드 / 글꼴 크기 조절
- [ ] 반응형 디자인

### Phase 2: 향후 개발
- [ ] 역본 비교 뷰
- [ ] 마크다운 노트 지원
- [ ] 읽기 플랜 (1년 성경읽기 등)
- [ ] 검색 기능
- [ ] 성경 읽기표 상세 통계
- [ ] 데이터 백업/복원

---

## ✅ 검증 계획

### 자동 테스트
- API 엔드포인트 테스트 (curl/Postman)
- 브라우저 테스트 (browser subagent)

### 수동 검증
- 데스크톱/모바일 반응형 확인
- 다크 모드 전환 확인
- 데이터 저장/로드 확인

---

## 📝 참고 사항

- 성경 데이터는 공개 자료를 활용하여 직접 구축
- 개인 사용 목적이므로 로그인/인증 불필요
- 설정값은 LocalStorage에 저장하여 서버 부하 감소
