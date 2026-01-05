# BibleMate - 구현 계획서 (Implementation Plan)

> **문서 작성일**: 2026-01-04  
> **기준 문서**: [spec-final.md](./spec/spec-final.md)

---

## 📋 목차
1. [개발 환경 설정](#1-개발-환경-설정)
2. [Phase 1: 데이터 레이어](#2-phase-1-데이터-레이어)
3. [Phase 2: 백엔드 API](#3-phase-2-백엔드-api)
4. [Phase 3: 프론트엔드 기본](#4-phase-3-프론트엔드-기본)
5. [Phase 4: 핵심 기능](#5-phase-4-핵심-기능)
6. [Phase 5: 부가 기능](#6-phase-5-부가-기능)
7. [Phase 6: 마무리](#7-phase-6-마무리)

---

## 🎨 UI 목업

### 데스크톱 레이아웃
![Desktop Mockup](./mockups/mockup-desktop.png)

### 모바일 레이아웃
![Mobile Mockup](./mockups/mockup-mobile.png)

---

## 1. 개발 환경 설정

### 1.1 프로젝트 초기화
- [x] 프로젝트 루트 구조 생성
  ```
  bible-reading-mate/
  ├── client/          # React + Vite
  ├── server/          # Express + SQLite
  ├── scripts/         # 데이터 임포트 스크립트
  └── docs/            # 문서 및 목업
  ```
- [x] `client/` - Vite + React 프로젝트 생성 (`npx create-vite@latest`)
- [x] `server/` - Express 프로젝트 생성, ~~better-sqlite3~~ **sql.js** 설치
- [x] Git 초기화 및 .gitignore 설정

### 1.2 개발 도구
- [x] ~~ESLint +~~ Prettier 설정
- [x] 동시 실행 스크립트 (concurrently)

**완료**: 2026-01-04

---

## 2. Phase 1: 데이터 레이어

### 2.1 OSIS 매핑 테이블 생성
- [x] `server/data/osis-mapping.json` 생성
  - 66권 한글/영문명 + 장 수
  - 형식: `{ "Gen": { "ko": "창세기", "en": "Genesis", "chapters": 50 }, ... }`
- [x] 검증: 장 수 합계 = 1,189장 확인

### 2.2 성경 데이터 임포트
- [x] 데이터 소스 다운로드
  - 개역한글: `thiagobodruk/bible` (ko_ko.json)
  - ~~OEB: `scrollmapper/bible_databases`~~ (추후 추가 가능)
- [x] `scripts/import-bible.js` 작성
  - JSON 파싱 → SQLite insert
  - 진행률 표시
- [x] 임포트 검증: **30,929절** 임포트 완료

### 2.3 DB 스키마 생성
- [x] `server/db/schema.sql` 작성
  - bible_verses, highlights, notes, reading_logs 테이블
- [x] `server/db/init.js` - sql.js 기반 마이그레이션 스크립트

### 2.4 영문 성경 임포트 (추가)
- [x] BBE(Bible in Basic English) 임포트 (31,104절)
  - WEB 소스 부재로 BBE 대체
  - API Versioning: `?version=bbe`

**완료**: 2026-01-04

---

## 3. Phase 2: 백엔드 API

### 3.1 Express 서버 기본 설정
- [x] `server/index.js` - 서버 엔트리포인트
- [x] CORS, JSON body parser 설정
- [x] 공통 응답 포맷 미들웨어 (`{ ok, data/error }`)

### 3.2 성경 API
- [x] `GET /api/bible/books` - 책 목록 (OSIS 매핑)
- [x] `GET /api/bible/:book/range?from=1&to=3&version=krv` - 장 범위 조회 및 검색

### 3.3 하이라이트 API
- [x] `GET /api/highlights?book=&from=&to=` - 범위 조회
- [x] `POST /api/highlights` - 추가/수정 (upsert)
- [x] `DELETE /api/highlights?book=&chapter=&verse=` - 삭제

### 3.4 노트 API
- [x] `GET /api/notes`
- [x] `POST /api/notes` (create)
- [x] `PUT /api/notes/:id` (update)
- [x] `DELETE /api/notes/:id`

### 3.5 읽기 기록 API
- [x] `GET /api/reading-logs`
- [x] `POST /api/reading-logs`
- [x] `GET /api/reading-logs?month=YYYY-MM` - 월별 조회

### 3.6 백업 API (미구현)
- [ ] `GET /api/backup/export` - JSON 다운로드
- [ ] `POST /api/backup/import` - 덮어쓰기 복원

**완료**: 2026-01-04

---

## 4. Phase 3: 프론트엔드 기본

### 4.1 디자인 시스템
- [x] CSS 변수 정의 (`client/src/index.css`)
  - 라이트/다크 테마 색상 (ThemeContext)
  - 폰트 크기 (동적 조절 지원)
- [x] 기본 레이아웃 컴포넌트

### 4.2 공통 컴포넌트
- [x] `Toast.jsx` -> `alert()` 및 UI 피드백으로 대체
- [x] `Modal.jsx` - 모달 다이얼로그
- [x] `Button.jsx` - 버튼 스타일 (CSS 클래스)

### 4.3 레이아웃
- [x] `Layout.jsx` - 반응형 레이아웃 (Header 통합)

### 4.4 상태 관리
- [x] `ThemeContext.jsx` - 전역 상태 (테마, 폰트)
  - 현재 날짜, 선택된 책/장 범위 (로컬 상태)
- [x] LocalStorage 연동

**완료**: 2026-01-04

---

## 5. Phase 4: 핵심 기능

### 5.1 달력 (Calendar)
- [x] `Calendar.jsx` - 월간 달력 컴포넌트
- [x] 읽은 날짜 표시 (API 연동)
- [x] 날짜 클릭 → 해당 날짜 로그 확인

### 5.2 성경 선택 (BibleSelector)
- [x] `BibleSelector.jsx` - 책/장 범위 선택
- [x] 책 드롭다운 (API 데이터 활용)
- [x] 장 네비게이션
- [x] 언어 토글 (한/영 BBE)

### 5.3 성경 뷰어 (BibleViewer)
- [x] `BibleViewer.jsx` - 본문 표시
- [x] 절 단위 렌더링
- [x] 하이라이트 표시 (API 연동)
- [x] 절 클릭 → 하이라이트 토글

### 5.4 하이라이트 (HighlightPicker)
- [x] 뷰어 내장 기능으로 구현 (HighlightPicker 별도 분리 안함)

### 5.5 묵상 노트 (NoteEditor)
- [x] `Notes.jsx` - 목록 및 CRUD (ModalEditor)
- [x] 저장/수정/삭제 기능

### 5.6 읽기 기록 (ReadingTracker)
- [x] 읽기 완료 버튼 (자동 저장)
- [x] 달력 연동

**완료**: 2026-01-04

---

## 6. Phase 5: 부가 기능

### 6.1 설정 (Settings)
- [x] `Settings.jsx` - 설정 페이지
- [x] 테마 토글 (라이트/다크/시스템)
- [x] 폰트 크기 조절
- [x] LocalStorage 저장

### 6.2 백업 (Backup)
- [ ] UI 미구현 (파일 복사 권장)

### 6.3 정보/라이선스
- [x] `README.md`에 기술

**완료**: 2026-01-04

---

## 7. Phase 6: 마무리

### 7.1 반응형 최적화
- [x] 데스크톱 (1024px+)
- [x] 태블릿 (768px~1023px)
- [x] 모바일 (~767px)

### 7.2 테스트
- [x] API 테스트 (scripts/test-api.js)
- [x] 브라우저 테스트 (수동 및 빌드 확인)

### 7.3 문서
- [x] README.md 작성

**완료**: 2026-01-04

---

## 📊 전체 예상 소요 시간

| Phase | 내용 | 예상 시간 |
|-------|------|----------|
| 1 | 개발 환경 설정 | 1시간 |
| 2 | 데이터 레이어 | 3-4시간 |
| 3 | 백엔드 API | 4-5시간 |
| 4 | 프론트엔드 기본 | 3-4시간 |
| 5 | 핵심 기능 | 8-10시간 |
| 6 | 부가 기능 | 3-4시간 |
| 7 | 마무리 | 2-3시간 |
| **합계** | | **24-31시간** |

---

## ✅ 검증 계획

### 자동 테스트
```bash
# API 테스트 (서버 실행 후)
curl http://localhost:3000/api/bible/Gen/range?from=1&to=1&version=krv
curl http://localhost:3000/api/reading-logs?month=2026-01
```

### 수동 검증 체크리스트
- [X] 책/장 선택 → 본문 로딩
- [X] 한/영 전환 → 위치 유지
- [X] 하이라이트 저장/삭제 → 새로고침 후 유지
- [X] 노트 자동 저장 → "저장됨" 표시
- [X] 노트 복사 → 클립보드 확인
- [X] 달력 날짜 클릭 → 해당 날짜 데이터 로드
- [X] 오늘 날짜 → 자동 저장
- [X] 과거 날짜 → 저장 버튼 필요
- [ ] Export → 파일 다운로드
- [ ] Import → 데이터 복원
- [X] 라이트/다크 테마 전환
- [X] 폰트 크기 변경
- [X] 모바일 반응형 확인

---

## 📁 최종 프로젝트 구조

```
bible-reading-mate/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Button.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── BibleSelector.jsx
│   │   │   ├── BibleViewer.jsx
│   │   │   ├── HighlightPicker.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   ├── ReadingTracker.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── BackupPanel.jsx
│   │   │   └── About.jsx
│   │   ├── contexts/
│   │   │   └── AppContext.jsx
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   ├── useDebounce.js
│   │   │   └── useLocalStorage.js
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   ├── themes.css
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── date.js
│   │   │   └── clipboard.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── data/
│   │   ├── bible.db
│   │   └── osis-mapping.json
│   ├── db/
│   │   ├── schema.sql
│   │   └── init.js
│   ├── routes/
│   │   ├── bible.js
│   │   ├── highlights.js
│   │   ├── notes.js
│   │   ├── readings.js
│   │   └── backup.js
│   ├── middleware/
│   │   └── response.js
│   ├── index.js
│   └── package.json
├── scripts/
│   └── import-bible.js
├── docs/
│   ├── mockup-desktop.png
│   └── mockup-mobile.png
├── spec-final.md
├── plan.md
└── README.md
```
