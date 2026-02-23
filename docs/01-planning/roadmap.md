# 차기 작업 Roadmap
- 최신 배포 버전: v2.0.1
- 최신 배포일자: 2026년 1월 29일
- 목표 버전: v2.1.0
- 목표 개발일자: 2026년 3월
- 플로우 다이어그램: [flow-diagrams.md](flow-diagrams.md)

> ℹ️ **작업 절차 및 버전 관리 기준**은 [개발 방법론](dev-method.md) 문서를 참고하세요.

---

## 📋 라벨링 시스템

### 난이도 (Difficulty)
| 라벨 | 기준 |
|:---:|---|
| `🟢 Easy` | 단순 UI/CSS/텍스트 수정 (1시간 이내) |
| `🟡 Medium` | 컴포넌트 추가/수정, API 변경 (반나절~1일) |
| `🔴 Hard` | 아키텍처 변경, 외부 연동 (2일 이상) |

### 의존성 & 리스크
| 라벨 | 기준 |
|:---:|---|
| `🔗 의존: [항목명]` | 선행 작업이 완료되어야 시작 가능 |
| `⚠️ 리스크` | 기술적 불확실성, 외부 요인(라이선스, API 비용), 큰 변경 범위 |

---

## 🎯 v2.1.0 — UX 개선 & 안정화 (2026년 2월)

### P0 — 기능 추가 & UX 개선
- [x] `🟡 Medium` **모바일 스크롤/스와이프 충돌 수정**: 세로 스크롤 시 가로 스와이프 제스처 오인식 방지 (v2.1)
- [x] `🟢 Easy` **읽은 날짜 → 묵상일지 이동**: 성경 뷰어에서 읽은 날짜 클릭 시 해당일 묵상일지로 네비게이션 (v2.1)
- [x] `🟢 Easy` **모바일 구절 묵상 보기 개선**: 구절 선택 후 묵상 보기에 위치 및 구절 내용 표시 (v2.1)
- [x] `🟢 Easy` **읽은 책 중복 집계 수정**: 같은 장을 여러 날 읽어도 1장으로 집계 (묵상일지 사이드바) (v2.1)
- [ ] `🟡 Medium` **오늘의 묵상 전체 복사**: '읽은 말씀' 섹션 앞에 복사 버튼 추가 (발견한 하나님 / 자유묵상 / 오늘의 기도 템플릿)
- [x] `🟢 Easy` **구절별 묵상 수정 취소**: 수정 모드에서 취소/X 버튼 추가 (v2.1)

### P1 — 안정화
- [x] `🟢 Easy` **SIGTERM 종료 처리**: 서버 종료 시 안전한 DB 저장 보장 (v2.1)
- [x] `🟢 Easy` **읽기 로그 range 집계 통일**: ReadingProgress에서 chapter_from/to 범위 반영 (v2.1)
- [x] `🟢 Easy` **/notes 레거시 API 정리**: /notes vs /free-notes 엔드포인트 통합 (v2.1)

---

## Inbox items
> 💡 미분류 아이디어나 버그를 자유롭게 작성하세요. 정리 후 Categorized items로 이동됩니다.

*(현재 비어 있음)*

---

## Categorized items

### 📖 읽기 (Reading)
- `[Minor]` `🟡 Medium` **역본 대조 보기 (Parallel View)**: 한글/영어를 나란히 비교하며 읽기
- `[Minor]` `🟡 Medium` `⚠️ 리스크` **추가 역본 지원**: 개역개정, 새번역 ESV, NIV (라이선스 확보 필요)
- `[Minor]` `🟡 Medium` **고급 검색**: AND/OR 조건, 초성 검색, 검색 범위 지정

### 📝 노트 (Notes)
- `[Minor]` `🟡 Medium` **마크다운 노트 지원**: 볼드, 이탤릭, 리스트 등 텍스트 서식 지원

### 📊 진도 (Tracking)
- `[Minor]` `🟡 Medium` **독서 계획 (Reading Plans)**: 1년 1독, 맥체인 등 읽기표 템플릿 및 진도 체크
- `[Minor]` `🟡 Medium` **사이드바 Preview 확장**: 오늘 읽을 말씀(계획) + 읽은 말씀(진도) 통합 표시, 장기적으로 독서 계획 연계

### ⚙️ 설정 (Settings & General)
- `[Major]` `🔴 Hard` **다중 사용자 지원**: 로그인/프로필 도입 (가족 공유)

### 📚 게스트 모드 (Guest Mode)
- `[Major]` `🔴 Hard` `⚠️ 리스크` **게스트 로그인**: 홍보/체험 목적으로 비밀번호 없이 앱 전체 기능을 써볼 수 있는 모드 
  - 로컬 저장소(LocalStorage) 기반의 데이터 처리로 서버 데이터 오염 방지
  - 정식 사용자 전환 시 로컬 데이터 업로드 기능 필요 (아키텍처 변경 수반)

### 🤖 AI 기능 (Advanced - 추후 개발)
- `[Major]` `🔴 Hard` `⚠️ 리스크` **AI 묵상 도우미**: 사용자 질문에 AI가 답변, 대화 내용을 노트에 정리
  - API Key 등록 필요 (ChatGPT, Gemini, Claude, Grok 등)
  - 구절 선택 → "AI에게 질문" 옵션으로 진입
  - 대화 종료 시 요약 정리 후 노트에 자동 추가 가능
  - 데스크톱/태블릿/모바일 UI 최적화 필요

### 🔧 코드 품질 & 성능 (Backlog)
> GPT Codex v2.0.0 리뷰에서 도출된 P1/P2 이슈 (v2.1.0 미포함분)

#### 성능/안정성
- `[Patch]` `🟡 Medium` **saveDB 디바운스/원자 저장**: 쓰기마다 전체 DB export 방지, 임시파일→rename 패턴 적용
- `[Minor]` `🟡 Medium` **차트/통계 로직 공통화**: BibleChartPage, TrackerModal 중복 코드 유틸로 분리

#### 리팩토링
- `[Minor]` `🟡 Medium` **BibleViewer.jsx 분리**: 800줄 → 훅/컴포넌트 단위 분리 (VersePopup, HighlightPalette 등)
- `[Minor]` `🟡 Medium` **Settings.jsx 분리**: 섹션별 컴포넌트 분리 (BackupSection, AuthSection 등)

---

## ✅ Completed
> 배포 완료된 작업의 히스토리를 버전별로 기록합니다.

### v2.1.0 (2026-02-23) - UX Improvements & Backend Cleanup
- **UX**: 구절별 묵상 수정 취소 버튼 추가 (팝업 memo/view-notes 모드)
- **UX**: 성경 뷰어 내 읽은 날짜 클릭 시 묵상일지 탭 이동 및 날짜 동기화
- **UX**: 모바일 구절 묵상 팝업 내 위치 및 구절 내용 표시 (맥락 정보 강화)
- **FIX**: 읽은 책 중복 집계 수정 (Set 기반 고유 chapter) 및 range 집계 통일
- **FIX**: 모바일 세로 스크롤 시 가로 스와이프 오인식 방지
- **STABILITY**: 서버 종료 시(SIGTERM/SIGINT) DB 자동 저장 로직 구현
- **CLEANUP**: 레거시 `/api/notes` 엔드포인트 제거 및 `/api/free-notes` 통합
- **DOCS**: `lessons.md` 인코딩 복구 및 메타데이터 최신화

### v2.0.1 (2026-01-29) - Stability Hotfix (Phase 0)
- **SECURITY**: Host 헤더 기반 localhost 인증 예외 제거 (스푸핑 방지)
- **FEAT**: 개발 환경 세션 TTL 30일 (DEV_SESSION_DAYS 환경변수)
- **FIX**: 백업 복원 시 verse_range 유실 문제 해결
- **FIX**: /api 미매칭 GET 요청 JSON 404 반환 (SPA fallback 분리)
- **FIX**: date-only 파싱 유틸 도입 (타임존 하루 밀림 방지)

### v2.0.0 (2026-01-26) - Major UI/UX Overhaul & Meditation System
- **ARCH**: DB Schema V3 전환 (verse_notes, free_notes, prayers, settings 테이블 분리)
- **UX**: 상단 탭 기반 모드 분리 (성경 읽기 / 묵상일지)
- **UX**: 데스크톱 3-Column 레이아웃 (본문 + 구절별 묵상 실시간 표시)
- **FEAT**: 구절별 개별 묵상 작성 및 본문 내 시각적 표시 (📝)
- **FEAT**: 다중 역본 지원 (개역한글, WEB, BBE) 및 저작권 정보 정비
- **FEAT**: 사용자 설정 서버 동기화 (폰트 스타일, 글자 크기, 형광펜 이름)
- **FEAT**: 당일 읽기 기록 전용 '오늘 읽음' 버튼 도입
- **DESIGN**: Muted Cobalt Blue 다크 모드 테마 적용
- **DESIGN**: 모바일 적응형 네비게이션 및 본문 최적화, 사용자 경험 개선(모바일 제스처 페이지 이동, 묵상 있는 구절 클릭 시 모달로 묵상 표시 지원)
- **STABILITY**: V2/V3 스키마 호환 백업 및 복구 시스템 구축

### v1.4.1 (2026-01-12) - Bug Fixes & Settings UX
- **FIX**: 모바일 본문-묵상 영역 공백 버그 수정 (CSS padding/margin 조정)
- **FIX**: HTML 엔티티 표시 버그 확인 (이미 v1.3.1에서 해결)
- **UX**: 설정 페이지 헤더 변경 (뒤로가기 버튼, 부제목 제거)
- **UX**: 설정 페이지 섹션 순서 조정 (화면 표시 설정 최상단)
- **UX**: 테마 설정 섹션 제거 (헤더 아이콘으로 접근 가능)
- **FEAT**: 모바일 달력 숨김 옵션 추가

### v1.4.0 (2026-01-12) - UX Improvements & Security
- **Feat**: 성경 읽기표 페이지 신규 생성 (/chart) 및 필터 기능
- **Feat**: 화면 분할 리사이저 (데스크탑 좌우 조절, 모바일 집중모드 개선)
- **Feat**: 읽기 완료 버튼 개선 (Round Pill UI, Toast)
- **Security**: CORS 보안 (Allowed Origins) 적용
- **Improvement**: 사이드바 문구 수정 및 노트 에디터 반응형 개선

### v1.3.1 (2026-01-09) - Data Integrity
- **CRITICAL**: 욥기 구조적 오류(35:16~42장) 완전 복구 (원문 203구절 복원)
- **FIX**: 네트워크 수신 시 UTF-8 문자 깨짐(`\uFFFD`) 근본 해결 (Buffer 처리)
- **FIX**: HTML 엔티티(`&#x27;` 등) 디코딩 적용
- **DATA**: 전체 성경 데이터 무결성 확보 (Corrupted 0건)

### v1.3.0 (2026-01-08)
- **STABILITY**: 백업 파일 포맷 개선 (메타데이터 도입) 및 Import 안정성 강화
- **STABILITY**: 대용량 파일 제한(5MB) 및 데이터 무결성 검증 로직 적용
- **UX**: 백업 결과 및 에러 피드백을 모달 팝업으로 개선
- **UX**: 묵상 집중 모드에서 노트 에디터 Full Height 지원 (레이아웃 개선)

### v1.2.1 (2026-01-08) - Hotfix
- **BUG**: 백업(데이터 내보내기/가져오기) 기능 오류 수정
  - localhost 하드코딩 제거 → 상대 경로 사용
  - 인증 쿠키(credentials) 전송 추가
  - 데이터 import 후 saveDB() 호출 추가

### v1.1.0 (2026-01-06)
- Fly.io 클라우드 배포 및 영구 데이터 스토리지 구축
- 액세스 암호 보호 (Access Password Security)
- 데이터 백업 및 복구 (JSON Export/Import)
- 사이드바 컴팩트 모드 및 대시보드 블록 토글 (UX 최적화)

### v1.0 (2026-01-05)
- 초기 릴리즈: 성경 읽기, 묵상 노트, 읽기표, 다크모드, 반응형 UI
