# PR: v2.3.3 - Auto Read from Verse Note

**Branch**: `feature/v2.3-auto-read-from-verse-note`  
**Date**: 2026-07-07  
**Version**: v2.3.3

## 주요 변경

- 구절별 묵상 저장 시 해당 날짜/책/장의 읽기 기록 자동 생성
- 기존 읽기 기록이 해당 장을 포함하면 중복 생성하지 않도록 방어
- 묵상 저장 후 성경 읽기 화면의 완료 상태를 즉시 갱신
- 읽기 기록 판정을 단일 장 alias뿐 아니라 `chapter_from`~`chapter_to` 범위 포함 기준으로 보강
- 앱 표시 버전과 package version을 v2.3.3으로 갱신
- v2.3.3 spec, implementation plan, walkthrough, dev-log, release notes, lessons 정리

## 검증

- `cd client && npm run lint`
- `cd client && npm run build`
- `git diff --check`
- 임시 DB 서버에서 `POST /api/verse-notes` 후 읽기 로그 자동 생성 확인
- 동일 구절 묵상 재저장 시 읽기 로그 중복 없음 확인

## 리뷰 포인트

- 구절 묵상 저장과 읽음 로그 생성이 같은 서버 저장 흐름에서 처리되는지 확인한다.
- 이미 읽음 기록이 있는 장에서 묵상을 수정해도 읽기 기록이 중복되지 않는지 확인한다.
- 구절 묵상 삭제 시 읽음 기록을 보존하는 정책이 기대와 맞는지 확인한다.
