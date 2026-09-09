# BibleMate v3.0 Responsive 통합 구현 계획

- 작성일: 2026-09-09
- 작업 브랜치: `feature/v3.0-responsive-integration`
- 기준 브랜치: `feature/v3.0-existing-notes` 완료 결과
- 상태: **구현계획 작성 완료 / 사용자 승인 대기**
- 사용자 승인 기준: **iPhone Safari 정상 동작 필수, 비모바일 미세 조정은 후속 hotfix 허용**

## Goal

- Reading Canvas, 구절 선택, 7버튼 Context Toolbar, Reflection Composer, Existing Notes가 화면 폭과 상태 전환에 관계없이 한 제품처럼 이어지게 한다.
- 기존 기능과 데이터 계약은 바꾸지 않고 Header·Layout·Reading 화면의 높이, overflow, breakpoint, safe-area 충돌을 한 번 정리한다.
- 자동 검증을 먼저 통과시킨 뒤 검수 서버를 한 번만 열어 iPhone 실기기 검수를 완료한다.

## 사용자가 경험할 흐름

```text
성경 본문을 읽는다
  → 구절을 선택해 7개 도구를 사용한다
  → 묵상을 작성하거나 기존 묵상을 연다
  → 닫으면 읽던 위치로 돌아온다
  → 장·탭·화면 방향이 바뀌어도 조작부와 본문이 겹치지 않는다
```

## 폭별 기준

| 폭 | 구조 | 필수 동작 |
|---|---|---|
| Compact `<600px` | 단일 본문 + 하단 도구막대 + 전체 화면 Composer + 묵상 하단 시트 | iPhone safe-area, 키보드, 44px 터치 영역, 읽던 위치 복귀 |
| Reading `600–899px` | 넓은 단일 본문 + modal Composer/묵상 dialog | 외부 앱과 1:1 분할해도 내부 다열 전환 없음 |
| Workspace `≥900px` | 본문 2/3 + Composer 또는 묵상 패널 1/3 | 본문과 우측 작업면의 독립 스크롤, 자연스러운 열기·닫기 |

- 기능 breakpoint는 `600px`과 `900px`을 기준으로 유지한다.
- Header의 `640px`, legacy Dashboard의 `768px` 규칙은 전역 동작을 무리하게 바꾸지 않고 Bible mode 한정 selector로 충돌만 해소한다.
- iPhone Safari가 최종 사용자 승인 게이트다. 650px·1280px은 자동/브라우저 구조 검증을 수행하되 모바일에 영향 없는 미세 시각 문제는 기록 후 hotfix로 이관할 수 있다.

## 현재 확인된 통합 위험

1. `Layout`, `Header`, `ReadingDashboard`, `BibleViewer`가 서로 다른 breakpoint와 높이 규칙을 사용한다.
2. 본문 내부 sticky header와 앱 Header가 함께 있을 때 작은 높이·Safari 주소창 변화에서 가용 영역이 줄어든다.
3. Compact의 하단 읽기 bar, 7버튼 Toolbar, 묵상 시트, Composer가 같은 safe-area와 z-index 영역을 번갈아 사용한다.
4. Workspace의 Composer와 Existing Notes가 각각 33.333% 패널을 사용하므로 동일 폭·경계·스크롤 계약이 필요하다.
5. 전역 글자 크기와 본문 전용 `Aa` 배율 조합에서 7버튼, 긴 성경 이름, 긴 묵상 본문이 overflow를 만들 수 있다.
6. 이전 단계에서 모바일 우선으로 승인된 Desktop·Light/Dark 조합의 명백한 회귀 여부를 최종 통합에서 한 번 확인해야 한다.

## Proposed Changes

### 1. Layout / Header 높이 계약

- `--pk-viewport-height`, safe-area, Header 높이를 기준으로 앱 본문 가용 높이를 일관되게 계산한다.
- Bible mode의 root container가 외부와 내부에서 중복 스크롤되지 않게 하고 실제 본문만 주 스크롤 영역이 되도록 정리한다.
- 모바일 Header와 Reading navigation이 겹치거나 세로 공간을 과도하게 차지하지 않게 한다.

### 2. Reading 상태별 겹침 방지

- 기본 하단 읽기 bar, 선택 Toolbar, Composer, Existing Notes가 동시에 경쟁하지 않는 표시 우선순위를 확정한다.
- Compact에서 Toolbar와 safe-area 사이, 본문 마지막 절과 고정 bar 사이의 여백을 검증한다.
- overlay/dialog가 열릴 때 장 swipe와 배경 조작을 차단하고 닫을 때 focus와 읽던 위치를 복구한다.

### 3. Workspace 공용 우측 작업면

- Composer와 Existing Notes의 폭, border, 높이, 독립 스크롤을 같은 계약으로 맞춘다.
- 패널이 열리면 본문이 약 2/3를 유지하고, 닫히면 본문이 자연스럽게 전체 폭으로 복귀하게 한다.
- 작은 Workspace 진입점 부근에서도 본문과 패널이 최소 폭 이하로 눌리거나 가로 스크롤되지 않게 한다.

### 4. 긴 콘텐츠와 조작 영역

- 긴 책 이름·범위·묵상·인용문·오류 문구가 가로 overflow를 만들지 않게 한다.
- Compact의 핵심 터치 target은 44px 이상을 유지한다.
- 글자 크기 10–20과 본문 배율 90–125%의 극단 조합에서 header, 본문, Toolbar, 패널 레이아웃을 확인한다.

### 5. Light / Dark와 주변 화면 회귀

- 하이라이트 4색 위 선택 상태, Composer, Existing Notes의 텍스트·경계·오류 대비를 Light/Dark에서 확인한다.
- Journal, Chart, Settings, Login은 Wave 1 Visual Cleanup 결과를 유지하고 mobile overflow와 Header 연결만 점검한다.
- 주변 화면의 정보 구조나 시각 디자인을 다시 설계하지 않는다.

## 예상 수정 파일

- `client/src/index.css`
- `client/src/components/Layout.css`
- `client/src/components/Header.css`
- `client/src/pages/ReadingDashboard.css`
- `client/src/components/BibleViewer.css`
- `client/src/components/ReflectionComposer.css`
- `client/src/components/ChapterNotesPanel.css`
- 꼭 필요한 경우에만 해당 JSX에 상태 class나 접근성 속성을 최소 추가

## 변경 금지 범위

- API endpoint, DB schema, backup format
- 묵상·하이라이트·읽기 기록의 저장 계약
- 구절 선택, 7버튼 Toolbar, Composer, Existing Notes의 기능 의미
- Journal/Chart/Settings/Login 정보 구조 재설계
- 신규 기능, 검색, 태그, 자동 저장

## 구현 순서

1. 공용 높이·safe-area·scroll owner 계약 정리
2. Compact의 Header/본문/하단 bar/Composer/묵상 시트 겹침 수정
3. Reading 폭의 단일 본문과 modal 크기·focus 확인
4. Workspace 우측 작업면 폭·독립 스크롤 통합
5. 긴 콘텐츠·글자 크기·Light/Dark·주변 화면 회귀 정리
6. 자동 검증 후 단일 검수 서버 세션 준비

## Automated Verification

- `npm run lint`
- `npm run build`
- chapter notes / composer / navigation guard 순수 테스트
- `npm run verify:v3-regression` 임시 DB 회귀 8개
- `git diff --check`
- 375×812, 650×900, 1280×900 구조 확인
- 각 폭에서 Reading, Selection, 7버튼 Toolbar, Composer, Existing Notes의 overflow와 scroll owner 확인
- Light / Dark 및 하이라이트 4색 대비 확인
- 원본 `server/data/bible.db` 실행 전후 hash/stat/Git 상태 불변 확인

## 단일 실기기 검수 항목

### 1. Reading / Selection

- 한 손 스크롤, 이전·다음 장, 본문 크기 `Aa`
- 단일·비연속 선택과 전체 해제
- 7개 버튼이 겹치지 않고 터치되는지
- 하이라이트 적용·지우기, 복사 후 Reading 복귀

### 2. Composer

- 신규 묵상 작성과 기존 묵상 수정
- iPhone 키보드가 본문·입력창·저장 버튼을 가리지 않는지
- dirty draft 닫기/탭 이동 보호
- 저장 후 같은 묵상이 중복 없이 갱신되는지

### 3. Existing Notes

- 묵상 0개·1개·여러 개인 장의 시트 열기·닫기
- 마진 표시 → 대상 카드 → 본문 절 이동
- 복사·수정·삭제 취소/성공과 본문 표시 동기화
- 긴 묵상과 다중 구절 범위 스크롤

### 4. 주변 화면과 지속성

- Journal의 날짜 이동·자유 묵상·기도와 Reading 복귀
- Chart 필터·이어 읽기, Settings 표시 설정
- 새로고침 후 묵상·하이라이트·읽음 기록 유지

## 완료 조건

1. iPhone Safari에서 Header, 본문, 7버튼 Toolbar, 키보드, safe-area가 겹치지 않는다.
2. Composer와 Existing Notes를 닫으면 읽던 위치와 focus가 자연스럽게 복구된다.
3. 650px에서 내부 다열 UI가 강제로 나타나지 않고, 1280px에서 우측 작업면이 본문과 독립적으로 동작한다.
4. 긴 콘텐츠와 최대 글자 크기에서도 의도치 않은 가로 스크롤이 없다.
5. 기존 데이터/API/backup 회귀 검증과 원본 DB 보호 검사가 통과한다.
6. 사용자 iPhone 실기기 승인을 받고 비모바일 잔여 문제는 필요한 경우 명시적 hotfix 목록으로 남긴다.
