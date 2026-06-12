# Dev Log - v2.2

## 개요
- **목표**: 모바일 UX 재설계 및 개인 묵상 핵심 흐름 복구
- **기간**: 2026-06-12
- **브랜치**: `feature/v2.2-mobile-ux`

---

## PR-A. Mobile Foundation (2026-06-12)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `client/index.html` | 수정 | `lang="ko"`, `viewport-fit=cover` 적용 |
| `client/src/index.css` | 수정 | dynamic viewport/safe-area CSS 변수 추가 |
| `Layout.css`, `ReadingDashboard.css`, `BibleChartPage.css`, `Settings.css` | 수정 | 모바일 하단 잘림과 nested viewport 안정화 |
| `BibleViewer.jsx`, `JournalPage.jsx` | 수정 | 입력/팝업/인터랙션 중 스와이프 guard 보강 |
| `Header.jsx`, `Header.css`, `BibleViewer.css` | 수정 | 주요 버튼 `aria-label`과 44px 터치 영역 보강 |
| `client/src/services/api.js` | 수정 | legacy `/api/notes` 호출을 `/api/free-notes`로 정리 |
| 문서 | 신규/수정 | 모바일 UX 최종 조정안, 구현 계획, PR-A walkthrough/PR 초안 |

### 검증
- `cd client && npm run lint` 성공 (v2.2 통합 정리 후 warning 없음)
- `cd client && npm run build` 성공
- 인앱 브라우저 390×844 검증
- iPhone Safari 실기기 수동 검증 통과

---

## PR-B. Mobile Bible Flow (2026-06-12)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `BibleViewer.jsx` | 수정 | 모바일 compact context bar, 본문 선택 바텀시트 추가 |
| `BibleViewer.jsx` | 수정 | 구절 액션 바텀시트, `묵상하기` 우선 액션 순서 |
| `BibleViewer.jsx` | 수정 | 📝 아이콘 탭 시 해당 구절 묵상 목록으로 직접 이동 |
| `BibleViewer.jsx` | 수정 | 모바일 전체 화면 묵상 작성 오버레이 추가 |
| `BibleViewer.jsx` | 수정 | 선택한 말씀 내용을 작성 화면 상단에 항상 표시 |
| `BibleViewer.jsx` | 수정 | 현재 장 묵상 목록 바텀시트 추가 |
| `BibleViewer.jsx` | 수정 | 모바일 하단 읽기 action bar 추가 |
| `ReadingDashboard.jsx` | 수정 | 구절 복사 toast와 clipboard fallback 추가 |
| `BibleViewer.css` | 수정 | 모바일 바텀시트, 전체 화면 작성, 하단 action bar 스타일 |

### 주요 결정
- 모바일 묵상 작성 UI는 사용자 승인에 따라 **전체 화면 오버레이(B안)**로 확정했다.
- 작성 화면에는 사용자가 선택한 말씀 본문을 반드시 표시한다.
- 데스크탑 3컬럼 묵상 경험은 유지하고, 모바일에서만 대체 흐름을 제공한다.

### 검증
- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- 로컬 Vite/API proxy 응답 확인
- iPhone Safari 실기기 수동 검증 통과

---

## PR-C. Mobile Journal & Chart Flow (2026-06-12)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `JournalPage.jsx`, `JournalPage.css` | 수정 | 날짜 선택 시트, 오늘 버튼, 최근 기록 목록 추가 |
| `JournalPage.jsx`, `JournalPage.css` | 수정 | 모바일 월간 요약 추가 |
| `JournalPage.jsx` | 수정 | 빈 상태 CTA를 `오늘 묵상 시작하기` 하나로 정리 |
| `BibleViewer.jsx`, `BibleViewer.css` | 수정 | 모바일 `Aa` 본문 전용 글자 크기 설정 추가 |
| `BibleChartPage.jsx`, `BibleChartPage.css` | 수정 | `다음 안 읽은 장 읽기`와 책 row 진입점 추가 |
| `ReadingDashboard.jsx` | 수정 | 읽기표에서 전달한 pending Bible location 처리 |
| 문서 | 신규/수정 | PR-C walkthrough/PR 초안 및 계획서 상태 갱신 |

### 주요 결정
- 읽기표의 작은 장 셀은 직접 버튼화하지 않고, row-level 이동과 `다음 안 읽은 장 읽기` 버튼을 우선 적용했다.
- 본문 가독성 설정은 앱 전체 root font-size가 아니라 성경 본문 전용 scale로 분리했다.

### 검증
- `cd client && npm run lint` 성공
- `cd client && npm run build` 성공
- iPhone Safari 실기기 수동 검증 통과

---

## 통합 정리. Lint Warning Cleanup (2026-06-12)

### 변경 내역

| 파일 | 변경 | 설명 |
|------|------|------|
| `NoteEditor.jsx` | 수정 | `loadNote`, `handleSave`를 `useCallback`으로 안정화하고 effect 의존성 정리 |
| `JournalPage.jsx` | 수정 | `loadJournalData`를 `useCallback`으로 안정화 |
| `ReadingDashboard.jsx` | 수정 | 초기 로딩, 장 로딩, 하이라이트 로딩 effect 의존성 정리 |
| `Settings.jsx` | 수정 | 설정 로딩 effect에 `setFontFamily` 의존성 명시 |
| 문서 | 수정 | PR/walkthrough/release note의 lint warning 상태를 최종 검증 결과로 갱신 |

### 검증
- `cd client && npm run lint` 성공, warning 없음
- `cd client && npm run build` 성공

---

## 남은 작업

- 배포 전 `/deploy` 단계에서 package/version/README/roadmap 배포 버전 갱신
- 실제 iOS PWA standalone, Android Chrome 추가 QA
