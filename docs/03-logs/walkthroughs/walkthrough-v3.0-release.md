# BibleMate v3.0.0 Release Walkthrough

- 작업 브랜치: `feature/v3.0-release`
- 기준 브랜치: `feature/v3.0`
- 검증일: 2026-09-09
- 상태: Phase 1·2 완료 / Release PR 준비

## 버전 정합

- root/client/server package와 lockfile: `3.0.0`
- Settings 사용자 표시: `BibleMate v3.0.0`
- README 현재 버전과 라이선스 표기: `v3.0.0`
- backup export `app_version`: `3.0.0`
- PWA manifest: 앱 버전 필드가 없어 변경 없음

## 문서 마감

- README의 과거 3컬럼·빨간 밑줄 설명을 Reading First 구조로 갱신
- 기본 roadmap과 v3 전용 roadmap에 완료 범위와 Release Candidate 상태 반영
- v3.0 진행표, release notes, docs index, dev-log, lessons 정합화
- iPad 실제 Split View, Desktop keyboard, PWA standalone 미세 차이는 비차단 hotfix 후보로 명시

## 자동 검증

```text
PASS Chapter Notes + Composer + navigation guard 16/16
PASS ESLint
PASS Vite production build (2580 modules transformed)
PASS isolated v3 regression harness 8/8
PASS backup compatibility and legacy migration
PASS git diff --check
```

## DB 보호

- 자동 CRUD·backup/restore 검사는 매 실행 시 생성되는 임시 DB에서만 수행했다.
- 기본 작업 트리의 사용자 `server/data/bible.db`는 release worktree와 물리적으로 분리했다.
- 사용자 DB SHA-256: 검증 전후 `cee1337c620f52e1ba86e6771d9c759403a7ee3c81de92bd53840af2109fe06d`
- release seed DB SHA-256: 검증 전후 `b7178e71dfac6b07077a802e1e473a22e74f1f02115faad47e818b5ab247a7bc`
- `master...feature/v3.0-release`의 DB 파일 차이가 없어야 Release PR과 squash commit을 진행한다.

## 배포 전 남은 게이트

1. Release PR push·생성 사용자 승인
2. PR 리뷰 및 `feature/v3.0` 통합 승인
3. 깨끗한 master worktree의 squash release commit 검토
4. `master`·`v3.0.0` tag push와 자동 Fly.io 배포 승인
5. GitHub Actions와 운영 read-only smoke test 확인
