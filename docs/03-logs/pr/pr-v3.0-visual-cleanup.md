# PR Draft — v3.0 Surrounding Screens Visual Cleanup

- Base: `feature/v3.0`
- Head: `feature/v3.0-visual-cleanup`
- 제목: `feat: clean up v3 surrounding screens`

## 요약

- Chart, Login, Settings와 Journal 보조 화면을 Reading 중심 시각 언어로 정리합니다.
- 기능·데이터 흐름을 유지하고 전역 CSS 충돌 가능성이 있는 class를 페이지별 namespace로 격리합니다.

## 주요 변경

- 반복 카드·그림자·헤더 무게 축소
- Settings inline style을 의미 있는 CSS class로 이동
- Chart/ReadingProgress/JournalStats class 격리
- Journal shell·날짜·빈 상태·자유 묵상·기도 영역 정리

## 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [x] 금지 파일 변경 없음
- [x] Wave 1 임시 통합 worktree 결합 검증
- [ ] 최종 통합 iPhone 검수 — 단일 검수 서버 세션에서 수행

## 범위 제외

- `BibleViewer*`, `ReadingDashboard*`, Header/Layout/index.css
- Journal 구절 묵상 목록·편집 영역
- API/server 변경

