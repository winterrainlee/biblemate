# PR 초안: v2.0.1 Phase0 Frontend 날짜 파싱 안정화

## 개요
- 범위: P0-4 (YYYY-MM-DD date-only 파싱의 하루 밀림 방지)
- 관련 계획서: docs/01-planning/implementation-plans/implementation-plan-v2.0.1-phase0-stability.md

## 변경 사항
- date-only/날짜 문자열 파싱 유틸 추가
- new Date('YYYY-MM-DD') 사용 제거 및 유틸 적용

## 변경 파일
- client/src/utils/dateOnly.js
- client/src/pages/JournalPage.jsx
- client/src/components/JournalStats.jsx
- client/src/components/NotePreview.jsx
- client/src/components/NoteEditor.jsx

## 테스트/검증
- [x] date-only 파싱 유틸 기본 결과 확인(스크립트)
- [ ] 날짜 하루 밀림 재현 케이스에서 정상 표시 확인
- [x] 월별 통계/필터 정상 동작(사용자 확인)
- [x] NotePreview/NoteEditor 표시 날짜 정상(사용자 확인)

## 리스크/주의사항
- 날짜 문자열이 비정상일 경우 표시가 빈 값으로 보일 수 있음(현재는 안전한 fallback 적용)

## 롤백
- 유틸 적용 전 new Date(dateStr) 방식으로 원복
