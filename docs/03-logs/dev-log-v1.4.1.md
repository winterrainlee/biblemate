# 개발 로그 - v1.4.1

## 개요
- **버전**: v1.4.1 (Patch)
- **기간**: 2026-01-12
- **목표**: 모바일 레이아웃 버그 수정 및 설정 페이지 UX 개선
- **주요 변경**:
    - 모바일 본문-묵상 영역 공백 버그 수정
    - 설정 페이지 리팩토링 (헤더, 섹션 순서, 달력 숨김 옵션)

## 변경 내역

### 2026-01-12

#### [Bug Fix] 모바일 공백 버그 수정
- `ReadingDashboard.css`:
  - `.dashboard-main`에 `gap: 0` 추가
  - `.bible-viewer-wrapper` 하단 padding 1.5rem → 0.5rem
  - `.hide-on-mobile` 미디어 쿼리 클래스 추가
- `BibleViewer.jsx`:
  - 읽기 완료 버튼 컨테이너 `marginTop` 2rem → 1rem
  - sticky `bottom` 2rem → 0.5rem

#### [Feature] 설정 페이지 UX 개선
- `Settings.jsx`:
  - 헤더: 뒤로가기(`ArrowLeft`) 버튼 추가, 부제목 제거
  - 테마 설정 섹션 제거 (헤더 아이콘으로 접근 가능)
  - "화면 표시 설정" 섹션 최상단으로 이동
  - `hideCalendarOnMobile` 토글 옵션 추가
- `ReadingDashboard.jsx`:
  - `dashboardConfig.hideCalendarOnMobile` 설정값 적용

## 이슈 및 해결
- **이슈**: 모바일에서 말씀 본문과 묵상 영역 사이 불필요한 공백
- **원인**: CSS `gap`, padding, JSX inline `marginTop`/`bottom` 값이 데스크톱 기준(2rem)으로 설정됨
- **해결**: 모바일 우선 간격 값(0.5rem~1rem)으로 조정

- **이슈**: 설정 페이지에서 가장 자주 사용하는 "화면 표시 설정"이 하단에 배치됨
- **해결**: 섹션 순서 재정렬하여 최상단으로 이동

## 검증 결과
- [x] npm run dev 실행 확인
- [x] 모바일 브라우저 공백 버그 수정 확인 (사용자 테스트)
- [x] 설정 페이지 섹션 순서 확인
- [x] 누가복음 5장 HTML 엔티티 정상 출력 확인

## 다음 계획
- 버전 업데이트 (package.json, README 등)
- /deploy 워크플로우 실행
