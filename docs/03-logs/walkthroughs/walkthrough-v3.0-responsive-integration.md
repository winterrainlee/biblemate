# BibleMate v3.0 Responsive 통합 Walkthrough

- 작업 브랜치: `feature/v3.0-responsive-integration`
- 검증일: 2026-09-09
- 상태: 구현·자동 검증·iPhone 실기기 검수 완료
- 사용자용 검수 서버: Tailscale 전용 실행 후 승인·종료 완료

## 구현 결과

- root dynamic viewport부터 Layout, Dashboard, BibleViewer까지 높이와 flex 최소 크기를 연결했다.
- 실제 성경 본문을 주 스크롤 영역으로 유지하고 외부 container의 중복 scroll을 차단했다.
- Compact 본문은 기본 하단 bar와 7버튼 Toolbar 각각에 맞는 padding·scroll padding을 사용한다.
- Workspace의 Composer와 Existing Notes는 `--pk-reading-panel-width`를 공유해 300–420px의 같은 우측 작업면을 사용한다.
- 641–720px Header는 축약 탭·읽기표 버튼을 표시하고 전체 이름·전역 글자 조절을 접는다.
- Login은 dynamic viewport 안에서 자체 세로 스크롤을 제공한다.
- 기존 묵상 열기는 남아 있는 구절 선택을 정리해 modal 아래에 Toolbar가 중복 노출되지 않게 한다.

## 브라우저 구조 검증

개인 데이터가 없는 synthetic fixture DB와 `127.0.0.1:5188` production build를 사용했다.

| viewport | 확인 결과 |
|---|---|
| 375×812 | 문서 가로 overflow 0, 기본 하단 bar, 7버튼 각 46px 이상, 묵상 하단 시트 정상 |
| 375×500 | 전체 화면 Composer 500px 높이 추종, 저장 버튼 viewport 안 유지, 묵상 목록 내부 스크롤 |
| 650×900 | 내부 다열 전환 없음, 축약 Header overflow 0, 묵상 modal dialog 정상 |
| 899×700 | Composer modal과 backdrop, `aria-modal=true` 유지 |
| 900×700 | Workspace 전환, 본문 600px + 우측 작업면 300px, 독립 스크롤 |
| 1280×900 | 본문 860px + 우측 작업면 420px, Composer/Existing Notes 동일 폭 |

추가 상태:

- 묵상 0개 장의 활성 trigger와 empty state
- 최대 전역 글자 20px에서 375·650·1280px 가로 overflow 0
- Dark mode의 Existing Notes와 하이라이트 yellow/green/blue/red
- 구절 선택 상태에서 `이 장의 묵상` 진입 시 Toolbar 정리
- 전체 화면 Composer가 앱 Header 위에 표시되고 제목·닫기 버튼이 가려지지 않음

## 자동 검증

```text
PASS chapter notes + composer + navigation guard tests 15/15
PASS ESLint
PASS Vite production build (2580 modules transformed)
PASS isolated v3 regression harness 8/8
PASS original database guard (server/data/bible.db)
PASS git diff --check
```

## 정리 확인

- 자동 검사용 서버 정상 종료
- 브라우저 viewport override reset 및 검사용 tab 종료
- synthetic fixture 디렉터리 삭제
- 사용자용 5174/Tailscale 검수 서버 종료 및 임시 서비스·DB 복제본 삭제
- 실제 `server/data/bible.db`의 기존 로컬 변경 유지

## 완료된 사용자 검수

1. iPhone Safari에서 한 손 스크롤·장 이동·본문 `Aa`
2. 단일·비연속 선택과 7버튼 하이라이트·지우기·복사
3. 신규 묵상 작성 시 키보드·저장·dirty draft 보호
4. Existing Notes 시트, 마진 표시, 본문 이동, 수정·삭제
5. Journal·Chart·Settings를 거쳐 Reading 복귀와 새로고침 지속성

위 항목을 Tailscale 검수 서버 한 세션에서 확인하고 승인했다.

## 모바일 실기기 검수 피드백

- 구절 선택 시 상단 읽기 영역이 숨겨져 `이 장의 묵상` 진입점도 함께 사라지는 문제를 확인했다.
- 7개 Context Toolbar 액션은 유지하고 선택 상태 제목 줄에 `기존 묵상 N개` 버튼을 추가했다.
- 평상시 진입점도 `기존 묵상 N개`로 이름을 통일해 새 묵상 작성 액션과 의미를 분리했다.
- 후속 사용자 결정에 따라 상단 `기존 묵상`은 장 전체 목록을 유지하고, 선택 상태 진입점은 `관련 묵상 N개`로 변경했다.
- 관련 묵상은 단일·연속·비연속 선택 중 하나라도 저장된 `verse_range`와 겹치는 기록만 표시하며, 필터 결과가 없으면 전용 empty state를 제공한다.
- 관련 범위 필터 테스트를 추가해 모델/navigation guard 테스트 16/16, ESLint, production build, `git diff --check`를 다시 통과했다.
- 실제 묵상 DB 복제본을 Tailscale 인터페이스 `100.64.23.61:5174`에만 바인딩해 iPhone 검수를 진행했고 사용자가 최종 동작을 승인했다.
- 승인 후 macOS 임시 서비스를 제거하고 5174 포트 종료, 임시 DB 삭제, 원본 DB SHA-256 무변경을 확인했다.
