# 개발 로그 - v1.4.0

## 개요
- **버전**: v1.4.0
- **기간**: 2026-01-12 ~ 진행 중
- **목표**: 읽기 경험 개선 (UX) 및 운영 보안 강화
- **주요 기능**:
    - R1: 읽기 완료 버튼 개선 (Round Pill UI, Toast 피드백)
    - R2: 성경 읽기표 페이지 신규 생성 (/chart)
    - R4: 화면 분할 비율 조절 (Draggable Resizer)
    - N1: CORS 보안 설정 (Allowed Origins)

## 변경 내역

### 2026-01-12
- **[Feature] R1: 읽기 완료 버튼 개선**
    - `BibleViewer.jsx`: "읽기 완료" 버튼을 Round Pill 스타일로 변경.
    - `ReadingDashboard.jsx`: 버튼 상태(`loading`, `success`, `error`) 및 Toast 메시지 로직 구현.
    - 읽기 완료 시 초록색 체크 아이콘 및 배경색 전환 애니메이션 적용.

- **[Feature] R2: 성경 읽기표 페이지 구현**
    - `BibleChartPage.jsx`: 기존 모달(`TrackerModal`)을 대체하는 독립 페이지 생성.
    - `/chart` 라우트 추가 및 헤더(`Header.jsx`)에 링크 연결.
    - 상단 헤더에 [전체 / 구약 / 신약] 필터 버튼 배치.
    - 필터 선택 시 상단 통계(진행률) 동적 변경 로직 적용.
    - 모바일(아이폰 미니 등) 대응을 위한 `BibleChartPage.css` 반응형 레이아웃 최적화.

- **[Feature] R4: 화면 분할(Split Screen) 리사이저**
    - `ReadingDashboard.jsx`: 드래그로 본문/노트 영역 비율 조절 기능 구현.
    - `splitRatio`를 `localStorage`에 저장하여 사용자 설정 유지.
    - `ReadingDashboard.css`: `--split-ratio` CSS 변수를 활용한 데스크탑 좌우 분할 레이아웃 적용.
    - 모바일 환경에서는 기존 상하 배치 유지.

## 이슈 및 해결
- **이슈**: R1 적용 후 `BibleViewer` 렌더링 실패 (페이지 백지화).
- **원인**: 코드 수정 과정에서 JSX 구조가 손상됨.
- **해결**: `BibleViewer.jsx` 전체 재작성을 통해 문법 오류 수정 및 복구.

- **이슈**: 모바일에서 읽기표 페이지 헤더 및 통계 영역 레이아웃 깨짐.
- **해결**: CSS 미디어 쿼리를 전면 수정하여 작은 화면에서도 요소들이 한 줄에 배치되거나 적절히 줄바꿈되도록 최적화.

## 다음 계획
- N1: CORS 보안 설정 구현
- 최종 검증 및 배포
