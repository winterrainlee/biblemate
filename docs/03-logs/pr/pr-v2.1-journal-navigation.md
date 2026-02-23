# PR: 읽은 날짜 클릭 시 묵상일지 이동 (v2.1)

## 1. 주요 변경 사항

- [x] `ReadingDashboard.jsx` — `handleNavigateToJournal` 구현 및 `BibleViewer` 프롭 전달
- [x] `BibleViewer.jsx` — 상단 '읽음' 상태바 클릭 핸들러 추가
- [x] `BibleViewer.jsx` — 하단 완료 메시지에 '기록 보기' 링크 추가
- [x] `dateOnly.js` — 날짜 이동 시 타임존 이슈 방지를 위한 `parseDateInput` 적용

## 2. 테스트 결과
- [x] 상/하단 클릭 시 묵상일지 탭 전환 및 날짜 동기화 확인
- [x] `npm run build` 성공

## 3. Review Point
- `activeTab`을 'journal'로 변경할 때 `currentDate`를 동시에 업데이트하여 묵상일지에서 즉시 해당 날짜 내용을 볼 수 있도록 함.
- 클릭 가능 영역에 대한 UI 피드백(커서, 툴팁)이 유저에게 충분한지 확인 필요.
