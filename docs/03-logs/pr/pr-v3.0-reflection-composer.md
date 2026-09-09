# PR Draft — v3.0 Reflection Composer

- Base: `feature/v3.0`
- Head: `feature/v3.0-reflection-composer`
- 제목: `feat: add v3 reflection composer`

## 요약

- 선택 시점의 말씀을 immutable snapshot으로 고정합니다.
- 신규 작성과 기존 묵상 수정을 같은 반응형 Composer와 저장 경로로 처리합니다.
- dirty 이탈 확인, 중복 저장 차단, 실패 시 draft 유지, stale response 차단을 추가합니다.

## 주요 변경

- Compact 전체 화면, Reading dialog, Workspace 우측 1/3 Composer
- 기존 날짜와 `verse_range`를 보존하는 edit payload
- 선택 범위·인용문·dirty 비교 순수 모델 및 Node 테스트 5건
- Context Toolbar의 묵상 액션을 새 Composer에 연결

## 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `node --test src/components/reflectionComposerModel.test.js` — 5/5
- [x] Wave 1 임시 통합 worktree 결합 검증
- [ ] 최종 통합 iPhone 검수 — 단일 검수 서버 세션에서 수행

## 범위 제외

- Existing Notes 목록/패널 최종 통합
- API/DB schema 변경
- 최종 Responsive 정합

