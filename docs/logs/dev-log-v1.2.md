# Bible Reading Mate v1.2 Development Log

## 개발 정보
- **시작일**: 2026-01-06
- **목표 버전**: v1.2.0

---

## 작업 기록

### 2026-01-07 (Task 1 완료)
- **내용**: [PATCH] 책 변경 시 장 번호 1로 리셋
- **Retrospective**: 
  - `Bible.jsx`에서는 이미 리셋 로직이 있었으나, `ReadingDashboard.jsx`에서 `setCurrentBook`을 직접 넘기면서 발생한 누락임을 발견.
  - 단순한 상태 관리 실수였지만, 장 수가 적은 책으로 이동할 때의 예외 케이스를 고려하지 않아 발생한 버그였음.
- **Troubleshooting**: 
  - `handleBookChange`를 별도로 정의하여 책과 장의 상태를 원자적으로(atomically) 관리하도록 수정함.
- **Lessons Learned**: 
  - 상태 변경이 연쇄적으로 일어나야 하는 경우, 로직을 통합 핸들러로 묶는 것이 안전함.

### 2026-01-08 (Task 3 완료)
- **내용**: [UX] 묵상 양식 (Reflection Forms) 구현 및 병합 완료
- **Retrospective**: 
  - 처음엔 단순 '시스템 템플릿'으로 접근했으나, 사용자의 실제 묵상 루틴(발견한 하나님, 의문점 등)을 반영하면서 훨씬 실용적인 기능이 됨.
  - 버튼 레이아웃 기획 시 작업 흐름(양식->저장->복사)을 고려하는 과정이 UI 직관성을 크게 높임.
- **Troubleshooting**: 
  - 버튼을 추가하며 기존 핸들러 위치가 밀려 스타일링이 깨지는 현상이 있었으나, `NoteEditor.css`에 `icon-only`, `primary` 클래스를 세분화하여 해결함.
- **Lessons Learned**: 
  - "사용자는 툴을 자신의 방식대로 쓰고 싶어 한다." -> 범용적인 SOAP보다 커스텀 양식 1종이 더 높은 만족도를 줄 수 있음을 배움.
  - 사전에 아스키 그림으로 레이아웃을 합의하는 과정이 소통 비용을 획기적으로 줄여줌.

### 2026-01-08 (Task 6 완료)
- **내용**: [UX] 스마트 초기 말씀 로드 로직 및 사이드바 정렬 개선
- **Retrospective**: 
  - 앱 구동 시점의 사용자 맥락(Context)을 이해하는 것이 얼마나 중요한지 깨달음. 말라기 1장은 시스템적으로는 안전한 기본값이지만, 사용자에게는 매번 찾아가야 하는 허들이었음.
  - 사이드바 정렬 피드백을 통해 데이터 로직과 시각적 표현 사이의 간극을 줄일 수 있었음.
- **Troubleshooting**: 
  - 기록 로드(`logs`)와 메타데이터 로드(`books`) 사이의 경쟁 상태(Race Condition)를 해결하기 위해 `async/await` 동기화 로직을 보강함.
- **Lessons Learned**: 
  - "당연한 기본값은 없다." -> 사용자의 이전 기록이 항상 최고의 기본값이 된다.
  - 기능 구현 후 실제 사용 흐름을 한 번 더 짚어보는 것이 사이드바 정렬 같은 세밀한 개선점을 찾는 데 큰 도움이 됨.

### 2026-01-08 (Task 4 완료)
- **내용**: [SECURITY] 자정 세션 만료 로직 및 설정 UI 개선
- **Retrospective**: 
  - 세션 만료를 단순히 기간(Duration)으로 보지 않고 특정 시점(Point in time)으로 관리함으로써 보안과 사용자 루틴(매일 접속)을 동시에 잡을 수 있었음.
  - 설정 페이지 상단에 로그아웃을 배치하여 '세션 관리'라는 목적을 더 명확히 함.
- **Troubleshooting**: 
  - Windows PowerShell로 생성한 `.env` 파일에 BOM(Byte Order Mark)이 포함되어 Node.js가 환경 변수를 읽지 못하는 이슈 발생. `Set-Content` 대신 BOM을 제외한 `[System.IO.File]::WriteAllText` 방식을 사용하여 해결.
  - `--env-file` 플래그가 불안정할 때를 대비해 `process.loadEnvFile()`을 서버 코드에 명시적으로 추가하여 안정성 확보.
- Lessons Learned: 
  - 인코딩은 늘 환경 간 마찰을 일으키는 지점이다. 표준 UTF-8(BOM 없음) 준수가 필수적임.
  - Node.js의 최신 기능(v21.7+)인 기본 환경 변수 로더를 활용하여 외부 의존성(dotenv) 없이 기능을 구현함.

### 2026-01-08 (Task 2 완료 및 데이터 가시성 복구)
- **내용**: [UX] 구절 클릭 시 다중 옵션 팝업 구현 및 DB 경로 표준화
- **Retrospective**: 
  - 구절 클릭이라는 단일 동작에 여러 맥락(하이라이트, 메모, 복사)을 담는 과정에서 팝업이라는 UI 패턴이 매우 효과적임을 확인.
  - 사용자의 제안으로 추가한 '하이라이트 취소' 동적 UI는 팝업의 상태 관리를 한 단계 더 세밀하게 만드는 계기가 됨.
- **Troubleshooting**: 
  - **데이터 증발 이슈**: 서버 재시작 후 데이터가 보이지 않는 현상 발생. 
    1. 원인: 서버 설정 로직이 `server/db-data/`를 바라보고 있었으나, 실제 데이터는 `.gitignore` 표준인 `server/data/bible.db`에 있었음.
    2. 해결: `init.js`의 `DB_PATH`를 `server/data/bible.db`로 표준화하여 가시성 복구.
  - **인증 루프**: 세션 만료 시 빈 화면이 뜨는 버그. `App.jsx`의 인증 오류 핸들링을 강화하여 세션 만료 시 로그인 창으로 안전하게 유도하도록 수정.
- **Lessons Learned**: 
  - 코드가 명시하는 경로와 실제 데이터가 저장되는 실제 환경 사이의 일치(Environment Parity)는 운영의 핵심임.
  - `forwardRef`와 `useImperativeHandle`을 활용한 컴포넌트 간 통신(BibleViewer -> NoteEditor)은 상태 끌어올리기(Lifting State Up)의 훌륭한 대안이 될 수 있음.

---

## 이슈 및 해결
- **[이슈 #1] 책 변경 시 장 번호 유지**: `ReadingDashboard.jsx`에서 `onBookChange` 시 장 번호를 1로 리셋하지 않아 발생. (Task 1에서 해결)
- **[이슈 #2] 에디터 버튼 배치 혼선**: 작업 흐름에 맞지 않는 버튼 배치. (Task 3 완료 시 교정)
- **[이슈 #3] DB 경로 불일치**: `db-data`와 `data` 폴더 혼선으로 데이터 미표시 이슈 발생. (Task 2 병합 시 `data`로 경로 표준화 및 아키텍처/방법론 문서에 공식 명시 완료)
