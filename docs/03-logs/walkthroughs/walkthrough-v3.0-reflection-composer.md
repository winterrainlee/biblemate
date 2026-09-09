# BibleMate v3.0 Reflection Composer Walkthrough

- 작업 브랜치: `feature/v3.0-reflection-composer`
- 기준 브랜치: `feature/v3.0`
- 검증일: 2026-09-09
- 검수 서버: 실행하지 않음 (Wave 통합 검수에서 1회 실행 예정)

## 구현 결과

- 구절 선택 시점의 책·장·역본·구절 번호·본문을 immutable `selectionSnapshot`으로 복사한다.
- 신규 `ReflectionComposer`가 create/edit를 같은 UI와 저장 경로로 처리한다.
- Compact는 safe-area와 동적 viewport를 반영한 전체 화면, Reading은 중앙 dialog, Workspace는 본문 2/3 + 우측 1/3 패널로 표시한다.
- 편집 저장 시 기존 복합키에 필요한 원래 날짜와 `verse_range`를 보존한다.
- 작성 내용과 최초 draft를 구조 비교하여 실제 변경이 있을 때만 이탈 확인을 표시한다.
- 저장 중 중복 제출을 막고, 실패하면 draft와 인용 설정을 유지한 채 inline 오류를 표시한다.
- 저장 요청 token과 session id가 다른 응답은 무시하여 종료된 세션에 결과가 반영되지 않게 했다.
- 저장 성공 후 해당 장의 묵상과 읽음 상태를 갱신하고 선택 모드를 종료한다.
- Composer 개폐 전후 본문 `scrollTop`을 복원한다.
- 닫기·취소·Escape·책/장/역본 이동에 동일한 dirty guard를 적용한다.

## 파일별 변경

- `client/src/components/ReflectionComposer.jsx`: 반응형 공용 Composer UI
- `client/src/components/ReflectionComposer.css`: Compact/Reading/Workspace 레이아웃과 safe-area 처리
- `client/src/components/reflectionComposerModel.js`: snapshot, 범위 변환, dirty 판정, 저장 payload 순수 모델
- `client/src/components/reflectionComposerModel.test.js`: 순수 모델 focused test 5건
- `client/src/components/BibleViewer.jsx`: 기존 popup memo 상태를 Composer session으로 교체하고 Context Toolbar 진입점 연결

## 자동 검증

| 명령 | 결과 |
|---|---|
| `cd client && node --test src/components/reflectionComposerModel.test.js` | PASS — 5/5 |
| `cd client && npm run lint` | PASS — 오류·경고 없음 |
| `cd client && npm run build` | PASS — Vite production build 성공 |
| `git diff --check` | PASS |

검증한 순수 계약:

1. `3-5, 7` 저장 형식과 `3–5, 7` 표시 형식
2. 원본 선택 배열이 바뀌어도 snapshot이 변하지 않음
3. create payload의 복합 범위 및 `"인용문"\n\n묵상내용` 형식
4. edit payload의 원래 날짜 및 `verse_range` 보존
5. draft 구조 기반 dirty 판정

## 통합 검수에서 확인할 항목

- iPhone 폭에서 키보드를 연 상태로 저장·취소 버튼이 가려지지 않는지
- 단일·연속·비연속 선택에서 제목, 선택 본문, 저장 범위가 일치하는지
- 저장 실패를 유도했을 때 입력 내용이 유지되는지
- Workspace에서 Composer 개폐 후 본문 스크롤 위치가 유지되는지
- 기존 묵상 수정 후 원래 날짜의 항목이 교체되고 중복 생성되지 않는지

## 보호 사항

- 원본 `server/data/bible.db`를 읽기·복사·수정·스테이징하지 않았다.
- push, PR, merge를 실행하지 않았다.
- 사용자 요청에 따라 검수 서버를 실행하지 않았다.
