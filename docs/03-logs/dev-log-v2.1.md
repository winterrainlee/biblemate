# Dev Log - v2.1

## 개요
- **목표**: UX 개선 + 안정성/코드 품질 향상
- **기간**: 2026-02 ~

---

## Feature ① 구절별 묵상 수정 취소 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `JournalPage.jsx` | +1 | 인라인 편집 취소 버튼 추가 |
| `BibleViewer.jsx` | +76 -31 | 팝업 memo 저장+취소, view-notes 수정/삭제 |
| `roadmap.md` | +32 -9 | v2.1 계획 반영 |

### 주요 결정
- 팝업 저장 버튼 레이블: "묵상 저장하기" → "저장" (취소 버튼과 나란히 배치 위해 축약)
- view-notes 모드에 수정/삭제 추가: ⑤번(모바일 구절 묵상 보기 개선)과 별도로, 편집 기능은 ①에서 우선 구현

---

## Feature ② 읽은 책 중복 집계 + Range 통일 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `JournalStats.jsx` | 로직 변경 | `bookChapters` Set으로 중복 제거 + range 처리 |
| `ReadingProgress.jsx` | 로직 변경 | `flatMap`으로 `chapter_from/to` 범위 확장 (2곳) |

### 주요 결정
- 같은 장을 여러 날 읽어도 1장으로만 카운트 (Set 기반 고유 chapter)
- `log.chapter` fallback 유지로 레거시 데이터 호환

---

## Feature ③ SIGTERM 종료 + 레거시 API 정리 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `server/index.js` | 수정 | SIGTERM/SIGINT graceful shutdown 추가, `/api/notes` 제거 |
| `server/routes/notes.js` | 삭제 | 레거시 API 파일 삭제 (`/api/free-notes`로 대체) |

### 주요 결정
- `saveDB()`는 `writeFileSync` 기반이므로 시그널 핸들러에서 안전하게 호출 가능
- `server.close()` 이후 `process.exit(0)` — 진행 중 요청 완료 후 종료

---

## Feature ④ 모바일 스크롤/스와이프 충돌 수정 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `BibleViewer.jsx` | 로직 변경 | Y축 추적 추가, `distY > distX`면 스와이프 무시 |
| `JournalPage.jsx` | 로직 변경 | 동일 패턴 적용 |

### 주요 결정
- `touchStart`/`touchEnd`를 `{ x, y }` 객체로 변경
- 세로 이동이 가로 이동보다 크면 스크롤로 판정하여 스와이프 무시

---

## Feature ⑤ 모바일 구절 묵상 보기 개선 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `BibleViewer.jsx` | +6 | `view-notes` 헤더에 구절 위치 + 본문 텍스트 표시 |
| `BibleViewer.css` | +15 | `.view-notes-verse-text` 인용 스타일 추가 |
| `Modal.jsx` | -1 | `bottom: 0` duplicate key 제거 (빌드 경고 수정) |

### 주요 결정
- 헤더: `기록된 묵상 (N개)` → `{bookName} {chapter}:{popupVerseRef} 묵상` 형식으로 모든 팝업 모드(menu, memo, view-notes) 통일
- `popupVerseRef`: 다중 구절 선택 또는 기존 묵상 범위가 있는 경우 `verse_range`를 우선 표시하도록 공통 로직 적용 (데스크톱 사이드바와 일관성 유지)
- 헤더 아래에 `popup.verseText`를 이탤릭 인용 스타일(`Nanum Myeongjo`)로 표시
- `max-height: 80px` + `overflow-y: auto`로 긴 구절 처리
- `popup.verseText`가 비어 있으면 렌더링 생략 (조건부 렌더링)

---

## Feature ⑥ 읽은 날짜 클릭 시 묵상일지 탭 이동 (2026-02-23)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `ReadingDashboard.jsx` | +12 -1 | `handleNavigateToJournal` 추가 및 `BibleViewer` 연동 |
| `BibleViewer.jsx` | +21 -2 | 상단 상태바 클릭 이벤트 및 하단 "기록 보기" 링크 추가 |
| `dateOnly.js` | - | (`parseDateInput`) 날짜 파싱 유틸 활용 |
| `roadmap.md` | - | Feature 33번(P0) 완료 표시 및 난이도 하향 (Easy) |

### 주요 결정
- **상단 클릭 영역**: "읽음 (날짜)" 텍스트 전체에 `pointer` 커서와 클릭 핸들러를 부여하여 발견성을 높임
- **하단 클릭 영역**: 기존 성공 메시지는 간결하게 유지하고 별도의 "(기록 보기)" 링크를 추가하여 버튼과 분리된 CTA 제공
- **날짜 동기화**: `targetDate`가 '오늘'인 경우 `new Date()`를, 그 외에는 `parseDateInput`을 사용하여 타임존 오차 없이 해당 날짜의 묵상일지가 로드되도록 처리
- **UX**: 읽지 않은 상태(`isCompleted === false`)에서는 상단 헤더 클릭을 비활성화하여 오동작 방지

---

## Feature ⑦ 에스겔 HAN 추출 안정화 + 66권 재임포트 (2026-03-09)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `server/scripts/fix_ezekiel.js` | 전면 리팩터링 | HAN 고정, 파서 보강, 트랜잭션/검증/옵션 추가 |
| `server/data/bible-corrections.json` | 수정 | 욥기 42장 correction 누락 필드 보완 |
| `server/data/bible.db` | 갱신 | 66권 재임포트 + 에스겔 1~48장 재반영 결과 |
| `docs/01-planning/implementation-plans/implementation-plan-v2.1.3-ezekiel-han-extractor-hardening.md` | 신규 | 2.1.3 구현 계획 문서 |
| `docs/03-logs/walkthroughs/walkthrough-v2.1.3-ezekiel-han-extractor-hardening.md` | 신규 | 실행/검증 기록 |
| `docs/03-logs/pr/pr-v2.1.3-ezekiel-han-extractor-hardening.md` | 신규 | PR 초안 |
| `docs/04-releases/release-notes-v2.1.3.md` | 신규 | 2.1.3 릴리즈 노트 |

### 주요 결정
- 대한성서공회 소스 역본을 `version=HAN`으로 고정해 기준 불일치를 제거.
- 절 번호 marker 기반 파싱으로 HTML 구조 의존도를 낮춤.
- 마지막 절(장 끝)에서 하단 UI 텍스트가 섞이지 않도록 경계 절단 로직 추가.
- 장별 연속 절/빈 텍스트/오염 패턴 검증 실패 시 즉시 중단 및 롤백.
- `24:4-5`, `25:2-3` 같은 범위 표기는 절 누락 방지 우선 원칙으로 동일 본문을 각 절에 확장 반영.
- 전체 성경 재임포트 중 발견된 욥기 42장 correction 스키마 누락(`verse`, `version`)을 즉시 보정해 파이프라인을 정상화.
- 최종적으로 KRV/BBE 66권 재임포트 후 에스겔 1~48장 전체 반영과 샘플 검증까지 완료.
