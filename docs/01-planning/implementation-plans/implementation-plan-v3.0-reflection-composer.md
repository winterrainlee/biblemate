# BibleMate v3.0 Reflection Composer 구현 계획

- 작업 브랜치: `feature/v3.0-reflection-composer`
- 병렬 트랙: 핵심 묵상 트랙 Wave 1
- 상태: **구현계획 승인 / 구현 중**
- 선행 조건: Context Toolbar 통합 완료

## Goal

- 선택한 말씀을 immutable snapshot으로 고정하고, Compact 전체 화면과 Workspace 우측 패널에서 같은 Composer와 저장 계약을 사용한다.
- 저장 실패·이탈·중복 제출에도 작성 내용을 잃지 않는다.

## State Contract

```text
selectionSnapshot
  contextKey, book, bookName, chapter, version, versionLabel
  verseNumbers, verseRange, verseItems, primaryVerse

composerSession
  mode: create | edit
  source: selection | existing-note
  noteId, originalDate, selectionSnapshot
  initialDraft, draft { memo, quoteEnabled, quoteText }
  status: idle | saving | error
```

- Composer 진입 순간 selection을 snapshot으로 복사하며 저장 시 live selection을 참조하지 않는다.
- create/edit는 같은 component와 submit 경로를 사용한다.
- edit는 기존 API 복합키를 위해 원래 날짜를 유지한다.
- `verse_range` 저장은 `3-5, 7`, 화면 표시는 `3–5, 7`을 사용한다.
- quote 저장 형식은 기존 `"인용문"\n\n묵상내용`을 유지한다.
- dirty는 현재 draft와 initialDraft의 구조 비교로 판정한다.

## Proposed Changes

- 신규 `client/src/components/ReflectionComposer.jsx/.css`
- 선택 snapshot, payload, dirty 비교를 담당할 순수 utility 분리
- `BibleViewer.jsx`의 popup 기반 memo state를 `composerSession`으로 교체
- Compact `<600px`: safe-area와 키보드를 고려한 전체 화면
- Reading `600–899px`: 본문 위 dialog
- Workspace `≥900px`: 본문 2/3 + 우측 Composer 1/3
- 저장 중 중복 제출 차단, 실패 시 draft 유지, 성공 시 목록 재조회·읽음 상태 갱신·focus 복귀
- 닫기·취소·Escape·책/장/역본 변경 전 dirty 확인

## Non-Goals

- Existing Notes 목록/패널 최종 UI
- 묵상 삭제와 본문 이동 재설계
- Markdown, autosave, DB/API schema 변경
- Journal 자유 묵상·기도 editor 변경

## Verification

- 단일·연속·비연속 snapshot의 범위·인용문 정확성
- Composer 진입 후 selection 변경과 무관하게 snapshot 유지
- create/edit payload, 원래 날짜와 `verse_range` 보존
- 저장 실패 시 draft 유지, 성공 시 선택 종료·목록/읽음 갱신
- 변경 없는 edit는 확인 없이 닫힘, 변경된 draft는 이탈 확인
- 중복 저장 요청 방지, stale response 무시
- Compact 키보드가 저장 액션을 가리지 않음
- Workspace 개폐 시 본문 scroll 위치 유지
- lint/build/diff check와 임시 DB API 계약 검증

## 중간 게이트

서버를 열지 않고 순수 모델 검증, lint/build, 임시 DB의 생성→동일 복합키 수정→조회→삭제를 통과해야 Existing Notes 계획으로 넘어간다.
