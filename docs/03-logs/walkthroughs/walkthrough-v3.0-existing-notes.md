# BibleMate v3.0 Existing Notes Integration Walkthrough

- 작업 브랜치: `feature/v3.0-existing-notes`
- 검증일: 2026-09-09
- 상태: 구현·자동 검증 완료 / Responsive 통합 후 실기기 검수 대기
- 사용자 검수 서버: 실행하지 않음

## 구현 결과

- 현재 장의 기존 묵상을 `ChapterNotesPanel` 하나에서 렌더링한다.
- Compact `<600px`에서는 하단 시트, Reading `600–899px`에서는 modal dialog, Workspace `≥900px`에서는 본문 옆 1/3 패널로 표시한다.
- 묵상 0개 장에서도 `이 장의 묵상 0개` 진입점과 안내 문구를 유지한다.
- 본문 마진 표시를 누르면 해당 절의 묵상 카드로 이동하고 focus를 준다.
- 카드에서 본문 절 이동, 내용 복사, 기존 Reflection Composer 수정, 확인 후 삭제를 실행한다.
- Workspace에서는 묵상 목록과 Composer가 같은 우측 영역을 번갈아 사용한다.

## 비동기·오류 처리

- `book:chapter` context와 최신 request id가 모두 일치할 때만 조회 응답을 적용한다.
- 장 전환 직후 이전 장의 목록을 현재 장 묵상이나 마진 표시로 노출하지 않는다.
- 최초 조회 실패는 빈 목록으로 오인하지 않도록 오류와 재시도만 표시한다.
- 기존 목록의 refresh 실패는 항목을 유지하고 오류·재시도 상태만 추가한다.
- 삭제 실패는 항목을 유지하고, 삭제 성공은 로컬 항목과 마진 표시를 먼저 제거한 다음 서버 재조회를 별도로 수행한다.
- 삭제 후 재조회 실패를 삭제 실패로 되돌리지 않는다.

## 자동 검증

```text
PASS chapter notes + composer + navigation guard model tests 15/15
PASS ESLint
PASS Vite production build (2580 modules transformed)
PASS isolated v3 regression harness 8/8
PASS original database guard (server/data/bible.db)
PASS git diff --check
```

검증한 주요 계약:

- 절 오름차순과 같은 절의 최신 날짜순 정렬
- 단일·다중 `verse_range` 저장값 보존 및 화면 범위 표시
- 현재 장에서만 immutable 삭제 commit 적용
- 재조회 실패 시 기존 목록 보존
- stale context/request 응답 무시
- Composer 수정 payload의 원래 날짜·범위 보존
- dirty draft navigation guard

## 남은 통합 검수

- iPhone에서 묵상 0개·1개·여러 개인 장의 시트 열기와 닫기
- 마진 표시 → 대상 카드 focus → 본문 절 이동
- 기존 묵상 수정 후 같은 기록이 중복 없이 갱신되는지
- 삭제 취소·성공과 목록/본문 표시 동기화
- 긴 묵상과 다중 범위 카드 스크롤
- Responsive 통합 이후 Composer, 7버튼 Context Toolbar, Journal 결과와 함께 한 번의 검수 서버 세션에서 확인
