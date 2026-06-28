# 차기 작업 Roadmap
- 최신 배포 버전: v2.3.2
- 최신 배포일자: 2026년 6월 28일
- 목표 버전: v2.3.2
- 목표 개발일자: 2026년 6월
- 플로우 다이어그램: [flow-diagrams.md](flow-diagrams.md)

> ℹ️ **작업 절차 및 버전 관리 기준**은 [개발 방법론](dev-method.md) 문서를 참고하세요.

---

## 🎯 v2.3.2 — Mobile Verse Selection & Login Copy Hotfix (2026년 6월)

### 기준 문서
- [Implementation Plan v2.3.2 Mobile Verse Selection Hotfix](implementation-plans/implementation-plan-v2.3.2-mobile-verse-selection-hotfix.md)

### P0 — Patch Hotfix
- [x] `🟢 Easy` **모바일 성경 헤더 압축**: 읽음 상태 뱃지를 책 제목 행에 통합하고 묵상/Aa 액션을 한 줄로 배치
- [x] `🟢 Easy` **구절 선택 공간 확보**: 선택 모드에서 모바일 헤더와 하단 액션 바를 접어 팝업 공간 확보
- [x] `🟢 Easy` **로그인 말씀 문구 정리**: 시편 119:105 문구를 두 줄로 나누고 출처 표기 추가
- [x] `🟢 Easy` **배포 준비 정리**: v2.3.2 버전/문서/검증 기록 업데이트

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

## 🎯 v2.3.1 — App Icon & Favicon (2026년 6월)

### 기준 문서
- [Implementation Plan v2.3.1 App Icon & Favicon](implementation-plans/implementation-plan-v2.3.1-app-icon-favicon.md)

### P0 — Brand Asset Patch
- [x] `🟢 Easy` **제공 이미지 기반 아이콘 세트 생성**: logo, favicon, apple touch icon, manifest icon 생성
- [x] `🟢 Easy` **HTML/manifest 연결 정리**: SVG favicon 참조 제거, PNG/ICO 중심 연결
- [x] `🟢 Easy` **버전/문서 정합**: v2.3.1 표시 버전, dev-log, walkthrough, PR 초안, release notes 업데이트

---

## 🎯 v2.3.0 — Visual Redesign: 나만의 서재에서 읽는 성경 (2026년 6월)

### 기준 문서
- [Visual Redesign Proposal](proposal-visual-redesign.md)
- [Project Spec v2.3](../02-specs/spec-v2.3.md)
- [Implementation Plan v2.3.0 Visual Redesign](implementation-plans/implementation-plan-v2.3.0-visual-redesign.md)

### P0 — Visual Foundation
- [x] `🟡 Medium` **디자인 토큰 교체**: Paper & Ink / Candlelight 팔레트, bg-elevated, primary-solid, radius, border, shadow 정리
- [x] `🟡 Medium` **하드코딩 색상 토큰화**: Tailwind blue/green/red 계열 hex를 역할 기반 토큰으로 치환
- [x] `🟢 Easy` **하이라이트 팔레트 조정**: 라이트는 색연필 톤, 다크는 rgba 오버레이 방식 적용

### P1 — Reading Surface & Typography
- [x] `🟡 Medium` **본문 세리프 전환**: `Noto Serif KR` 기본값, `Gowun Batang`/고딕 선택 옵션 제공
- [x] `🟡 Medium` **본문 글꼴 설정 추가**: 기존 본문 크기 설정 흐름과 함께 localStorage/설정 상태 연동
- [x] `🟡 Medium` **성경 본문 paper surface 적용**: 본문 폭, 여백, 절 번호, 컬럼 구분선, hover 효과를 독서 화면에 맞게 조정

### P2 — Surrounding Screens & Microcopy
- [x] `🟡 Medium` **묵상 카드/일지 메모지 문법 적용**: 파란 left-border와 대시보드 카드 느낌 완화
- [x] `🟡 Medium` **헤더와 로그인 첫인상 정리**: 로고/탭/버튼 시각 무게 축소, 크림 배경과 세리프 환영 문구 적용
- [x] `🟢 Easy` **파비콘/앱 아이콘 리디자인**: 브라우저 탭과 apple touch icon을 v2.3 팔레트와 서재 컨셉에 맞게 교체
- [x] `🟢 Easy` **마이크로카피 교체**: `오늘 펼친 말씀`, `마음에 머문 구절`, `이 말씀 묵상하기` 등 존댓말 톤 정리
- [x] `🟡 Medium` **대시보드/읽기표/캘린더/차트 팔레트 정합**: 기능 구조 유지, 색상과 표면만 v2.3 기준에 맞춤

### P3 — Verification & Documentation
- [x] `🟡 Medium` **라이트/다크 × 데스크톱/모바일 점검**: 4조합 스크린샷, contrast, focus ring, 하이라이트 가독성, 파비콘/앱 아이콘 표시 확인
- [x] `🟡 Medium` **v2.2 모바일 UX 회귀 확인**: safe-area, 바텀시트, 전체 화면 묵상 작성, 하단 action bar, `Aa` 설정 유지
- [x] `🟢 Easy` **문서 마감**: walkthrough, PR 초안, dev-log, release notes, lessons 업데이트

---

## 🎯 v2.2.0 — Mobile UX Redesign (2026년 6월)

### 기준 문서
- [Mobile UX Final Adjustment v2](../02-specs/mobile-ux-final-adjustment-v2.md)
- [Implementation Plan v2.2.0 Mobile UX](implementation-plans/implementation-plan-v2.2.0-mobile-ux.md)

### P0 — 모바일 안정화 기반
- [x] `🔴 Hard` **viewport/safe-area/키보드 안정화**: iOS Safari, PWA standalone, Android Chrome에서 하단 잘림과 저장 버튼 가림 방지
- [x] `🟡 Medium` **입력 중 전환 보호**: 묵상 작성 중 스와이프, 날짜 변경, 장 변경, 탭 전환으로 인한 내용 유실 방지
- [x] `🟡 Medium` **모바일 접근성 기본 정리**: 주요 아이콘 버튼 `aria-label`, 44px 터치 타깃, 오터치 방지

### P1 — 성경 읽기 핵심 흐름
- [x] `🔴 Hard` **모바일 성경 상단 압축**: 책/장/역본 선택을 compact context bar와 바텀시트로 재구성
- [x] `🔴 Hard` **구절 액션 바텀시트 + 묵상 작성 전체 화면**: 묵상하기 우선, 키보드 안전 저장, 다중 구절 선택 명시화
- [x] `🟡 Medium` **현재 장 묵상 모바일 복구**: `이 장의 묵상 n개` 진입점과 묵상 목록 시트 제공
- [x] `🟡 Medium` **하단 읽기 액션 바**: 이전 장, 오늘 읽음 표시, 다음 장, 묵상일지 이동을 safe-area 위에 배치

### P2 — 묵상일지/읽기표/가독성
- [x] `🟡 Medium` **묵상일지 날짜 선택 시트**: 날짜 탭 → 달력 시트, 오늘 복귀, 과거 묵상 회고 동선 복구
- [x] `🟢 Easy` **빈 상태 CTA 정리**: 자유 묵상/기도 작성 버튼 반복 제거
- [x] `🟡 Medium` **본문 전용 가독성 설정**: 앱 전체 root font-size와 성경 본문 표시 설정 분리
- [x] `🟡 Medium` **읽기표 진입점화**: `다음 안 읽은 장 읽기`와 책 row 기반 이동 제공

### P3 — 유지보수 기반
- [x] `🟡 Medium` **탭 상태/URL 유지 전략**: 최소 localStorage 유지, 라우트 분리는 후속 결정
- [x] `🟡 Medium` **죽은 코드와 lint 정리**: 모바일 개선 대상 컴포넌트 혼선을 줄이고 기존 lint 오류 처리

---

## 🎯 v2.1.0 — UX 개선 & 안정화 (2026년 2월)

### P0 — 기능 추가 & UX 개선
- [x] `🟡 Medium` **모바일 스크롤/스와이프 충돌 수정**: 세로 스크롤 시 가로 스와이프 제스처 오인식 방지 (v2.1)
- [x] `🟢 Easy` **읽은 날짜 → 묵상일지 이동**: 성경 뷰어에서 읽은 날짜 클릭 시 해당일 묵상일지로 네비게이션 (v2.1)
- [x] `🟢 Easy` **모바일 구절 묵상 보기 개선**: 구절 선택 후 묵상 보기에 위치 및 구절 내용 표시 (v2.1)
- [x] `🟢 Easy` **읽은 책 중복 집계 수정**: 같은 장을 여러 날 읽어도 1장으로 집계 (묵상일지 사이드바) (v2.1)
- [x] `🟡 Medium` **오늘의 묵상 전체 복사**: '읽은 말씀' 섹션 앞에 복사 버튼 추가 (발견한 하나님 / 자유묵상 / 오늘의 기도 템플릿)
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

### v2.3.2 (2026-06-28) - Mobile Verse Selection & Login Copy Hotfix
- **MOBILE**: 모바일 성경 헤더를 2행 구성으로 압축하고 읽음 상태를 제목 행 뱃지로 통합
- **UX**: 구절 선택 중 모바일 헤더와 하단 액션 바를 숨겨 선택 팝업 공간 확보
- **COPY**: 로그인 화면 말씀 문구에 줄바꿈과 `(시편 119:105)` 출처 표기 추가
- **DOCS**: v2.3.2 구현 계획, walkthrough, PR 초안, dev-log, release notes 업데이트

### v2.3.1 (2026-06-24) - App Icon & Favicon
- **BRAND**: 사용자 제공 성경책 이미지 기반 앱 아이콘/파비콘 세트 정리
- **PWA**: manifest install icon을 192/512 PNG로 연결
- **DOCS**: v2.3.1 구현 계획, walkthrough, PR 초안, dev-log, release notes 업데이트

### v2.3.0 (2026-06-13) - Visual Redesign
- **DESIGN**: Paper & Ink 라이트 팔레트와 Candlelight 다크 팔레트 적용
- **READABILITY**: 성경 본문 기본 글꼴을 `Noto Serif KR`로 전환하고 명조/고운바탕/고딕 본문 글꼴 선택 추가
- **READING**: 성경 본문 영역에 paper surface, 세리프 절 번호, 넓은 줄간격, 따뜻한 hover/selection 적용
- **JOURNAL**: 묵상 카드와 묵상일지를 메모지/기도 노트 문법으로 정리
- **BRAND**: 헤더, 로그인 화면, favicon, apple touch icon, manifest 색상을 서재 컨셉으로 정합
- **COPY**: `오늘 펼친 말씀`, `마음에 머문 구절`, `기도로 마무리`, `이 말씀 묵상하기`, `말씀 복사`, `말씀 여정` 마이크로카피 적용
- **DOCS**: v2.3 명세, 구현 계획, walkthrough, PR 초안, dev-log, release notes 업데이트

### v2.2.0 (2026-06-12) - Mobile UX Redesign
- **MOBILE**: viewport/safe-area/dynamic viewport 기반 정리 및 입력 중 스와이프 guard 보강
- **UX**: 모바일 성경 상단 compact context bar와 본문 선택 바텀시트 추가
- **UX**: 구절 액션을 묵상 우선 바텀시트로 재구성하고, 묵상 작성 전체 화면 오버레이 제공
- **UX**: 선택한 말씀 본문을 묵상 작성 화면 상단에 항상 표시
- **UX**: 현재 장 묵상 목록 바텀시트와 하단 읽기 action bar 추가
- **JOURNAL**: 묵상일지 날짜 선택 시트, 오늘 복귀, 최근 기록, 모바일 월간 요약 추가
- **TRACKING**: 읽기표에서 `다음 안 읽은 장 읽기`와 책 row 기반 이동 제공
- **READABILITY**: 성경 본문 전용 `Aa` 글자 크기 조절 추가
- **DOCS**: v2.2 모바일 UX 명세, 구현 계획, walkthrough, PR 초안, dev-log, release notes 업데이트

### v2.1.0 (2026-02-23) - UX Improvements & Backend Cleanup
- **UX**: 구절별 묵상 수정 취소 버튼 추가 (팝업 memo/view-notes 모드)
- **UX**: 성경 뷰어 내 읽은 날짜 클릭 시 묵상일지 탭 이동 및 날짜 동기화
- **UX**: 모바일 구절 묵상 팝업 내 위치 및 구절 내용 표시 (맥락 정보 강화)
- **FIX**: 읽은 책 중복 집계 수정 (Set 기반 고유 chapter) 및 range 집계 통일
- **FIX**: 모바일 세로 스크롤 시 가로 스와이프 오인식 방지
- **STABILITY**: 서버 종료 시(SIGTERM/SIGINT) DB 자동 저장 로직 구현
- **CLEANUP**: 레거시 `/api/notes` 엔드포인트 제거 및 `/api/free-notes` 통합
- **DOCS**: `lessons.md` 인코딩 복구 및 메타데이터 최신화

### v2.1.3 (2026-03-09) - Ezekiel Data Hotfix
- **DATA**: 대한성서공회 `HAN` 기준으로 에스겔 추출 스크립트 전면 보강
- **DATA**: 에스겔 1~48장 전체 재반영 및 27장 본문 병합 오염 제거
- **DATA**: KRV/BBE 66권 전체 재임포트 및 corrections 547건 재적용
- **FIX**: `bible-corrections.json` 욥기 42장 correction 누락 필드 보완
- **DOCS**: 구현 계획서, walkthrough, PR 초안, 릴리즈 노트, dev-log, lessons 업데이트

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
