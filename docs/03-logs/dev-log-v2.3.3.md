# Dev Log - v2.3.3

## 개요

- **목표**: 구절 묵상 저장 시 해당 장 읽음 자동 표시
- **작성일**: 2026-07-07
- **작업 브랜치**: `feature/v2.3-auto-read-from-verse-note`
- **상태**: 배포 완료

---

## 변경 내역

- `POST /api/verse-notes` 저장 성공 시 동일 날짜/책/장을 포함하는 읽기 기록을 자동 생성
- 기존 읽기 기록이 해당 장을 포함하면 중복 생성하지 않도록 방어
- `BibleViewer.jsx`에서 구절 묵상 저장 후 읽기 로그 새로고침 콜백 호출
- `ReadingDashboard.jsx`에서 장 범위 기반 읽음 판정 helper 추가
- root/client/server package version과 설정 화면/README 표시 버전을 v2.3.3으로 갱신
- v2.3.3 spec, implementation plan, walkthrough, PR draft, release notes, lessons 업데이트

## 검증

- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`
- 임시 DB 서버에서 `POST /api/verse-notes` 후 `GET /api/reading-logs` 확인
- 동일 구절 묵상 재저장 시 `readingLog.created: false`와 읽기 로그 1개 유지 확인

## 남은 확인

- 실제 배포 환경에서 묵상 저장 후 모바일/데스크톱 완료 상태 반영을 최종 확인한다.
