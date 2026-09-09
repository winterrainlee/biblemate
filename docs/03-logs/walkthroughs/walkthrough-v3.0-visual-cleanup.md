# BibleMate v3.0 Surrounding Screens Visual Cleanup Walkthrough

- 브랜치: `feature/v3.0-visual-cleanup`
- 기준 커밋: `0ca70b9300205f1e09e90c294099cbb837aea13d`
- 작성일: 2026-09-09
- 검수 서버: 실행하지 않음 (Wave 통합 후 단일 검수 예정)

## 구현 결과

### 말씀 여정 및 보조 통계

- Chart의 root를 `bible-chart-page`로 격리하고 필터, 통계, 진행 막대, 책·장 grid class를 `chart-*`로 정리했다.
- 카드 그림자를 제거하고 얇은 border와 낮은 표면 대비를 사용해 Reading Canvas와 시각 무게를 맞췄다.
- 모바일 필터 및 이어 읽기 action의 터치 영역을 확보하고 375px 화면에서 줄바꿈과 폭을 제한했다.
- ReadingProgress와 JournalStats의 `.book-name`, `.stat-*`, `.progress-*` 공용 class를 컴포넌트 namespace로 교체했다.

### 로그인 및 설정

- 로그인은 모바일에서 불필요한 카드 외곽을 걷어내고, 묵상 문구에는 serif를 적용했다.
- 비밀번호 입력, 로그인 action을 48px로 유지하고 오류 영역에 `role="alert"`를 추가했다.
- Settings의 정적 inline style을 semantic class로 이전했다. 동적 진행률·선택 색상 표현만 inline style로 남겼다.
- 형광펜 이름 입력, 글꼴 선택, 글자 크기, 백업·복구, 로그아웃 handler와 API 호출은 변경하지 않았다.

### Journal 제한 범위

- 날짜 이동의 `.nav-btn`을 `.journal-nav-btn`으로 변경해 전역 충돌을 제거했다.
- 빈 상태 CTA와 자유 묵상·기도 action의 최소 터치 크기를 44px로 맞췄다.
- 자유 묵상·기도 본문/입력에 serif를 적용하고 해당 카드 그림자를 낮췄다.
- 구절 묵상 목록, 편집 상태, 수정·삭제·복사 handler 및 관련 markup은 변경하지 않았다.

## 자동 검증

| 검증 | 명령 | 결과 |
|---|---|---|
| ESLint | `cd client && npm run lint` | 통과 |
| Production build | `cd client && npm run build` | 통과 (`2573 modules transformed`) |
| whitespace/error marker | `git diff --check` | 통과 |
| 변경 파일 경계 | `git diff --name-only` | 허용된 화면/컴포넌트와 본 문서만 포함 |
| 충돌 class 검색 | 지정 class 대상 `rg` | Chart/ReadingProgress/JournalStats/날짜 nav의 공용 class 제거 확인 |
| 사용자 DB 보호 | `git status --short -- server/data/bible.db` | 변경 없음 |

## 잔여 확인 항목

Wave 통합 후 한 번의 모바일 검수에서 다음을 확인한다.

1. Journal 날짜 이동·오늘·자유 묵상·기도 작성/취소/저장
2. Chart 전체/구약/신약 필터와 이어 읽기, 375px 가로 overflow
3. Settings 형광펜 이름·글꼴·크기·백업/복구·로그아웃 접근
4. Login 키보드·오류·loading 상태
5. Reading 복귀 시 Header·본문·Context Toolbar 시각 회귀 여부

## 참고

- Journal CSS의 `.note-date`, `.editor-actions`는 Existing Notes 소유 구절 묵상 영역이므로 이번 브랜치에서 이름을 바꾸지 않았다.
- API/service/server 및 원본 `server/data/bible.db`는 접근하거나 수정하지 않았다.
