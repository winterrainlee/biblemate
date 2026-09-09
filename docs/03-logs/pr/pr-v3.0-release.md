# PR: v3.0.0 Release Candidate

**Branch**: `feature/v3.0-release` → `feature/v3.0`
**Date**: 2026-09-09
**Version**: v3.0.0
**Status**: PR #10 병합 완료

## 1. 주요 변경 사항

- [x] root/client/server package 및 lockfile을 `3.0.0`으로 통일
- [x] Settings, README, backup export metadata 버전 정합
- [x] README를 v3 Reading First 기능 설명으로 갱신
- [x] 기본/v3 전용 roadmap과 진행표를 실제 완료 상태로 갱신
- [x] release notes, dev-log, docs index, lessons 마감
- [x] release walkthrough와 배포 승인 게이트 기록

## 2. 검증 결과

- [x] 모델·navigation guard 테스트 16/16
- [x] ESLint
- [x] Vite production build — 2580 modules transformed
- [x] 임시 DB API 회귀 Harness 8/8
- [x] backup compatibility·legacy migration
- [x] 사용자 DB와 release seed DB hash 무변경
- [x] `git diff --check`

## 3. Review Point

- 제품 버전 표기가 모두 `3.0.0`으로 일치하고 의존성 버전을 잘못 변경하지 않았는지
- backup `schema_version=3` 계약은 유지하면서 `app_version`만 갱신됐는지
- 과거 3컬럼 설명과 개발 중·검수 대기 문구가 활성 문서에 남지 않았는지
- DB·secret·임시 파일·build artifact가 PR diff에 포함되지 않았는지
- 비차단 실기기 항목이 완료로 과장되지 않고 hotfix 후보로 기록됐는지

## 4. 배포 경계

- 이 PR은 `feature/v3.0` 통합까지만 수행하며 `master`를 변경하지 않는다.
- master squash commit과 `v3.0.0` tag는 별도 검토 후 준비한다.
- master push가 Fly.io 자동 배포를 시작하므로 push·배포는 별도 사용자 승인을 받는다.
- 운영 DB 교체나 쓰기 smoke test는 이번 릴리즈 범위가 아니다.
