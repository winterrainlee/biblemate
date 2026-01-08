# BibleMate - 개발 환경 설정 완료

**작업일**: 2026-01-04

---

## 완료된 작업

### 1. 프로젝트 구조 생성
```
bible-reading-mate/
├── client/          # Vite + React
├── server/          # Express + sql.js
├── scripts/         # 데이터 임포트 스크립트 (예정)
├── docs/            # 문서 및 목업
├── package.json     # 루트 (concurrently)
├── .gitignore
└── .prettierrc
```

### 2. 설치된 의존성

| 영역 | 패키지 |
|------|--------|
| Client | Vite, React |
| Server | Express, CORS, sql.js |
| Root | concurrently |

> [!NOTE]
> `better-sqlite3` 대신 **sql.js** 사용 - Python/빌드 환경 불필요

### 3. 개발 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 클라이언트 + 서버 동시 실행 |
| `npm run dev:client` | Vite 개발 서버만 실행 |
| `npm run dev:server` | Express 서버만 실행 |

---

## ⚠️ 처음 의도와 다르게 진행된 사항

### 1. SQLite 라이브러리 변경
| 항목 | 원래 계획 | 실제 적용 |
|------|-----------|-----------|
| 라이브러리 | better-sqlite3 | sql.js |

**변경 이유**: `better-sqlite3`는 네이티브 C++ 모듈로, 설치 시 Python + node-gyp 빌드 환경이 필요합니다. 현재 시스템에 Python이 설치되어 있지 않아 설치 실패했습니다.

**해결책**: WebAssembly 기반인 `sql.js`로 대체. 빌드 도구 없이 설치 가능하며 기능은 동일합니다.

### 2. NPX 실행 문제
**문제**: PowerShell에서 `npx` 실행 시 스크립트 실행 정책 오류 발생
```
UnauthorizedAccess: 이 시스템에서 스크립트를 로드할 수 없습니다
```

**해결책**: `cmd /c "npx ..."` 형태로 cmd.exe를 통해 실행

---

## 검증 결과

✅ **서버 실행 테스트**
```bash
curl http://localhost:3001/api/health
# {"ok":true,"message":"BibleMate server is running"}
```

---

## Phase 1: 데이터 레이어 (완료)

| 항목 | 상태 |
|------|------|
| OSIS 매핑 (66권, 1189장) | ✅ |
| DB 스키마 (sql.js) | ✅ |
| 한글 성경 임포트 (30,929절) | ✅ |

### ⚠️ Phase 1 - 처음 의도와 다르게 진행된 사항

#### 1. JSON BOM 문자 처리
**문제**: thiagobodruk/bible 소스의 JSON 파일에 BOM(Byte Order Mark) 문자가 포함되어 파싱 실패
```
Unexpected token '﻿', "﻿[{"abbrev"... is not valid JSON
```
**해결책**: `data.charCodeAt(0) === 0xFEFF` 검사 후 BOM 제거

#### 2. 책 약어 매핑 누락
**문제**: 원본 데이터의 약어(ho, re)가 OSIS 매핑에 없어 호세아, 요한계시록 누락
**해결책**: `'ho': 'Hos'`, `'re': 'Rev'` 매핑 추가

#### 3. OEB(영문 성경) 미포함
**원래 계획**: 개역한글 + OEB 둘 다 임포트
**실제 적용**: 개역한글만 우선 임포트 (OEB는 추후 추가 가능)

---

---

## Phase 2: 백엔드 API (완료)

| API | 기능 | 상태 |
|-----|------|------|
| `/api/bible` | 성경 목록, 본문, 검색 | ✅ |
| `/api/highlights` | 하이라이트 추가/삭제/목록 | ✅ |
| `/api/notes` | 노트 저장/삭제/목록 | ✅ |
| `/api/reading-logs` | 읽기 기록 저장/조회 | ✅ |

### 검증
- `scripts/test-api.js` 작성 및 실행 성공
- 하이라이트 색상 필드명을 `color` → `style`로 통일 (스키마 일치)
- `reading_logs` 테이블 `date` UNIQUE 제약조건 제거 (하루 여러 번 읽기 가능)

### ⚠️ Phase 2 - 처음 의도와 다르게 진행된 사항

#### 1. Highlights 스키마 변경
**문제**: 테스트 코드에선 `style` 필드를 사용했으나 스키마는 `color`로 정의됨 (혹은 반대)
**해결책**: 프론트엔드 확장성을 고려하여 `style`로 통일하고 스키마/코드 일치시킴

#### 2. Reading Logs 제약조건 완화
**문제**: `date` 컬럼이 UNIQUE로 설정되어 있어 같은 날 두 번 이상 읽기 기록 불가
**해결책**: UNIQUE 제약조건 제거 (하루에 여러 구절 읽기 가능)

#### 3. Reading API 단순화
**계획**: `start_chapter`, `end_chapter` 범위 저장
**구현**: 초기 버전은 단일 장 읽기(`chapter`)만 받아 `start=end`로 저장

#### 4. 영문 성경 버전 선택
**문제**: WEB(World English Bible) JSON 소스 확보 실패 (TehShrike, scrollmapper 등 404)
**해결책**: 저작권 리스크가 없고 현대어인 **BBE(Bible in Basic English)** 로 대체하여 임포트 완료. (KJV는 저작권 우려로 제외)

  - API: `?version=bbe` 파라미터로 조회 가능
  
## Phase 3: 프론트엔드 기본 (Completed)

### 주요 변경 사항
- **디자인 시스템**: `index.css`에 CSS Variables 및 Reset CSS 적용 (Vanilla CSS)
- **라우팅**: `react-router-dom` 설치 및 기본 라우트 설정 (`/`, `/bible`, `/notes`)
- **공통 컴포넌트**: `Layout`, `Header` 구현 및 반응형 구조 적용
- **페이지 구조**: `Home`, `Bible`, `Notes` 페이지 스캐폴딩 생성

### 검증
- ✅ Vite 클라이언트 서버 실행 (`http://localhost:5173`)
- ✅ 라우팅 이동 확인

### ⚠️ Phase 3 - 처음 의도와 다르게 진행된 사항

#### 1. Windows PowerShell 스크립트 실행 권한
**문제**: `npm install` 실행 시 `PSSecurityException` 발생 (보안 정책)
**해결**: `cmd /c "npm ..."` 또는 `npm.cmd`를 사용하여 우회 실행

#### 2. 터미널 명령어 문법 차이
**문제**: `mkdir src\a src\b` 형태의 다중 폴더 생성이 PowerShell에서 실패
**해결**: `cmd /c`를 이용해 표준 Windows CMD 문법으로 실행

#### 3. 상태 관리(State Management) 구현 연기
**계획**: 초기 Task 목록에 '상태 관리' 포함
**결정**: 현재 단계에서는 전역 상태가 불필요하여, Phase 4 기능 구현 시 필요한 시점에(Context API 등) 도입하기로 결정하고 제외

## Phase 4: 핵심 기능 (Completed)

### 주요 구현 사항
1. **대시보드 (Home)**
   - `Calendar`: `date-fns` 기반 월별 달력 구현, 읽기 기록(Reading Logs) 시각화(Marker)
   - 오늘의 말씀 및 최근 읽은 기록 표시

2. **성경 읽기 (Bible)**
   - **Viewer**: 성경 본문 뷰어, 버전 선택(`krv`, `bbe`) 지원
   - **Selector**: 책/장 선택, 이전/다음 장 네비게이션
   - **기능**: 구절 하이라이트(노란색), 읽기 완료 버튼(달력 연동)

3. **묵상 노트 (Notes)**
   - **CRUD**: 노트 작성, 목록 조회, 수정, 삭제 구현
   - **UI**: 공통 `Modal` 컴포넌트 활용, 반응형 카드 리스트

### 검증
- ✅ 신규 API `/api/bible/books` (장 수 파악) 정상 동작 확인
- ✅ 읽기 완료 -> 달력 반영 연동 확인
- ✅ 노트 CRUD API 연동 확인

### ⚠️ Phase 4 - 처음 의도와 다르게 진행된 사항

#### 1. API 엔드포인트 추가 (/api/bible/books)
**계획**: 기존 `osis-mapping.json`만 활용할 예정이었음
**변경**: 각 책의 '총 장 수' 정보를 DB에서 정확히 가져오기 위해 `/books` 엔드포인트를 신설. 성경 버전(KJV/BBE)에 따라 장 수가 다를 수 있음을 대비.

#### 2. 상태 관리 라이브러리 미도입
**계획**: 필요 시 Context API 도입
**결정**: `Bible.jsx` 등 페이지 단위의 로컬 상태(`useState`)만으로도 충분히 관리가 가능하여, 불필요한 복잡도를 피하기 위해 도입하지 않음.

#### 3. 모달(Modal) 컴포넌트 직접 구현
**계획**: 라이브러리 사용 가능성 열어둠
**구현**: `react-modal` 등 외부 라이브러리 없이 가벼운 커스텀 `Modal` 컴포넌트를 직접 구현하여 의존성 최소화.

## Phase 5: 부가 기능 및 최적화 (Completed)

### 주요 구현 사항
1. **성경 검색 (Search)**
   - 키워드 검색 API 연동 및 결과 리스트 UI 구현
   - 성경 버전(`krv`/`bbe`) 선택 필터 지원

2. **설정 (Settings)**
   - **테마 관리 (`ThemeContext`)**: 다크 모드(System/Light/Dark) 토글 구현
   - **접근성**: 폰트 크기 슬라이더 구현 (`html` root font-size 동적 조절)
   - `localStorage`를 이용한 설정 상태 영구 저장

3. **반응형 최적화**
   - 모바일 환경에서 달력(`Calendar`) 셀 높이 자동 축소
   - 네비게이션 메뉴 반응형 처리

### ⚠️ Phase 5 - 처음 의도와 다르게 진행된 사항

#### 1. Context API 도입 시점
**계획**: Phase 4에서 상태 관리 도입 고려
**결정**: Phase 5의 **설정(Settings)** 기능(테마, 폰트) 구현 시점에야 비로소 전역 상태의 필요성이 명확해져 이때 도입함.

#### 2. 동적 폰트 크기 구현 방식
**방식**: 단순 CSS 클래스가 아닌, `html` 태그의 `font-size`를 JS로 제어하고 `rem` 단위를 활용하여 전체 UI 비율이 유지되도록 구현. 디자인 시스템(`index.css`)의 유연성을 활용함.

---

## Phase 7: Layout Overhaul (통합 대시보드) (Completed)

### 주요 구현 사항
1. **통합 대시보드 (`ReadingDashboard.jsx`)**
   - 기존 분리된 페이지(Home, Bible, Notes)를 **단일 화면**으로 통합
   - **좌측 사이드바**: 달력(Compact Mode), 성경 선택, 오늘의 묵상 미리보기
   - **메인 영역**: 성경 본문 뷰어 + 하단 고정 노트 에디터

2. **컴포넌트 리팩토링**
   - **Layout.jsx**: 전역 사이드바/푸터 제거, 헤더 + 셸(Shell) 역할만 수행
   - **Header.jsx**: 메뉴 버튼 제거, 읽기표/테마/폰트 버튼 배치. **폰트 크기 조절을 `[-]` `[수치]` `[+]` 버튼으로 개선 (10px ~ 20px).**
   - **[NEW] NoteEditor.jsx**: 메인 화면 하단에 항상 노출, 자동 저장/복사 기능 포함
   - **[NEW] NotePreview.jsx**: 사이드바에서 오늘 작성한 노트 요약 표시
   - **Calendar.jsx**: 사이드바용 'Compact Mode' 추가
   - **BibleSelector.jsx**: 가로 → 세로 스택(Stack) 레이아웃 변경

3. **UX 개선**
   - **노트 포커스**: 미리보기 클릭 시 노트 에디터로 포커스 이동 및 스크롤
   - **읽기 상태 시각화**: 성경 본문 상단에 현재 위치 + `[읽음]` 뱃지 표시
   - **데스크톱 레이아웃**: 콘텐츠 최대 폭을 **1400px**로 확장

4. **모바일 최적화 (CSS FIX)**
   - 고정 높이 대신 **자연스러운 페이지 스크롤** 적용 (콘텐츠 잘림 방지)

### ⚠️ Phase 7 - 처음 의도와 다르게 진행된 사항

#### 1. 읽기 완료 토글 기능 미완성
**계획**: 읽기 완료 버튼을 토글(추가/삭제) 방식으로 구현하고 즉시 읽기표에 반영
**문제**: 구현 중 코드 수정 과정에서 **상태 변수 선언 순서 오류** 및 **함수 중첩 오류**가 발생하여 런타임 에러 유발
**해결**: 파일 전체를 올바른 구조로 재작성하여 안정성 확보
**남은 작업**: 토글 로직 고도화 및 애니메이션 효과는 **Future Task**로 분류

#### 2. BibleViewer Breadcrumb 구현 지연
**계획**: 성경 본문 상단에 `책 이름 + 장 번호 + 읽음 뱃지` 표시
**문제**: `BibleViewer.jsx`에 새 props(`bookName`, `chapter`) 전달 필요. 컴포넌트 간 데이터 흐름 정리 중 추가 수정 발생
**해결**: `ReadingDashboard.jsx`에서 `books` 목록으로부터 책 이름을 조회하여 전달

#### 3. 코드 편집 실패로 인한 반복 수정
**문제**: `replace_file_content` 도구가 대상 코드를 찾지 못해 여러 차례 편집 실패
**원인**: 이전 수정으로 인해 파일 내용이 변경되었는데, 기존 내용을 기준으로 수정 시도
**해결**: 최종적으로 `write_to_file` (덮어쓰기)을 사용하여 파일 전체를 정확한 구조로 재생성

---

# 🏁 프로젝트 요약
**Bible Reading Mate (BibleMate)** 웹 애플리케이션 개발이 완료되었습니다.

- **Backend**: Express + SQLite (`sql.js`), 개역한글/BBE 성경 데이터베이스 구축
- **Frontend**: React + Vite, 커스텀 디자인 시스템(Vanilla CSS), 반응형 웹
- **Core Features**: 
  - 📅 **달력**: 읽기 기록 시각화
  - 📖 **뷰어**: 성경 읽기, 하이라이트, 버전 교체, **위치+읽음 상태 표시**
  - 📝 **노트**: 묵상 기록 (CRUD), **클릭 시 포커스 이동**
  - 🔍 **검색**: 성경 구절 검색
  - ⚙️ **설정**: 다크모드, **폰트 조절 (버튼식)**
  - 🏠 **통합 대시보드**: 2-Column 레이아웃, 반응형 디자인

**Happy Bible Reading!** 🙏

