# PR: v1.4.1 버그 수정 및 설정 페이지 UX 개선

## 1. 주요 변경 사항

### 버그 수정
- [x] 모바일 본문-묵상 영역 공백 버그 수정 (`ReadingDashboard.css`, `BibleViewer.jsx`)
  - `.dashboard-main`에 `gap: 0` 추가
  - `.bible-viewer-wrapper` 하단 padding 1.5rem → 0.5rem
  - 읽기 완료 버튼 컨테이너 marginTop 2rem → 1rem, bottom 2rem → 0.5rem
- [x] HTML 엔티티 표시 버그 - 검증 결과 이미 정상 (v1.3.1에서 해결됨)

### 설정 페이지 UX 개선
- [x] 헤더 구조 변경: 뒤로가기 버튼 추가, 부제목 제거
- [x] 테마 설정 섹션 제거 (헤더 아이콘으로 접근 가능)
- [x] 화면 표시 설정 섹션 맨 위로 이동
- [x] 모바일 달력 숨김 옵션 추가 (`hideCalendarOnMobile`)

## 2. 변경된 파일
| 파일 | 변경 내용 |
|------|----------|
| `client/src/pages/Settings.jsx` | 헤더 변경, 테마 제거, 섹션 순서 조정, 달력 숨김 옵션 |
| `client/src/pages/ReadingDashboard.jsx` | `hideCalendarOnMobile` 설정 적용 |
| `client/src/pages/ReadingDashboard.css` | 모바일 공백 버그 수정, `.hide-on-mobile` 클래스 추가 |
| `client/src/components/BibleViewer.jsx` | 버튼 컨테이너 간격 조정 |

## 3. 검증 결과
- [x] npm run dev 실행 확인
- [x] 모바일 브라우저 공백 버그 수정 확인 (사용자 테스트)
- [x] 설정 페이지 섹션 순서 확인 (브라우저 테스트)
- [x] 누가복음 5장 HTML 엔티티 정상 출력 확인

## 4. Review Point
- 모바일 간격 조정 값이 적절한지 (0.5rem, 1rem)
- 설정 페이지 섹션 순서가 사용자 친화적인지
