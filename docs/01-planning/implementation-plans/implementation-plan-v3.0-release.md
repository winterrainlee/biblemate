# BibleMate v3.0.0 Release 구현 계획

- 작성일: 2026-09-09
- 기준 브랜치: `feature/v3.0`
- 예정 작업 브랜치: `feature/v3.0-release`
- 대상 배포 브랜치: `master`
- 상태: **사용자 계획 승인 / Phase 1 진행**

## 1. 목표

- 사용자 승인을 마친 v3.0 Reading UX 전체를 `v3.0.0`으로 마감한다.
- 표시 버전, 패키지 메타데이터, 로드맵, 릴리즈 노트와 실제 코드 상태를 일치시킨다.
- 사용자 로컬 DB를 건드리지 않는 깨끗한 환경에서 최종 회귀와 release diff를 검증한다.
- 승인된 release commit과 tag만 `master`에 push하고 자동 Fly.io 배포 결과를 확인한다.

## 2. 현재 상태

- Reading Canvas부터 Existing Notes와 Responsive 통합까지 `feature/v3.0` 병합 완료
- PR #9 모바일 실기기 검수 및 사용자 승인 완료
- 런타임 표시 버전과 package metadata는 아직 `v2.3.3`
- `master` push는 `.github/workflows/deploy.yml`의 Fly.io 자동 배포를 즉시 시작함
- 기본 작업 트리의 `server/data/bible.db`에는 사용자 로컬 변경이 있으므로 release commit에서 반드시 제외해야 함

## 3. 포함 범위

### 버전 정합

- `package.json`, `package-lock.json`
- `client/package.json`, `client/package-lock.json`
- `server/package.json`, `server/package-lock.json`
- `client/src/pages/Settings.jsx`
- `README.md`

위 파일의 제품 버전을 `3.0.0` 또는 사용자 표시 형식 `v3.0.0`으로 통일한다.

### 문서 마감

- `docs/01-planning/roadmap.md`: 최신/목표 버전과 v3.0 완료 항목
- `docs/01-planning/v3.0-progress.md`: Release 단계를 제외한 기능 완료 상태 확정
- `docs/04-releases/release-notes-v3.0.0.md`: 개발 중 문구 제거, 최종 변경·검증·알려진 제한 정리
- `docs/docs-index.md`: v3.0 문서 설명을 완료 상태로 갱신
- `docs/03-logs/dev-log-v3.0.md`, release walkthrough, PR 초안, `docs/lessons.md` 마감

### 최종 검증 및 릴리즈

- 통합 브랜치 자동 검증과 release diff 검토
- release 작업 브랜치 → `feature/v3.0` 통합
- 깨끗한 임시 worktree에서 `feature/v3.0` → `master` squash merge
- `Release v3.0.0` 커밋 및 annotated tag `v3.0.0`
- 사용자 최종 승인 후 `master`와 tag push, GitHub Actions/Fly.io 배포 확인

## 4. 제외 범위

- 신규 기능 및 DB schema/API 변경
- 사용자 `server/data/bible.db`의 commit 또는 운영 DB 교체
- iPad 실기기, Desktop keyboard, PWA standalone의 비차단 미세 조정
- 배포 실패 시 승인 없는 force push, tag 재작성 또는 운영 데이터 변경

위 제외 항목에서 발견된 문제는 배포 차단 여부를 보고한 뒤 별도 hotfix로 분리한다.

## 5. 작업 단계

### Phase 1 — Release Branch와 메타데이터

1. 계획 승인 후 `feature/v3.0-release`를 최신 `feature/v3.0`에서 생성한다.
2. 모든 runtime/package 버전 표기를 `3.0.0`으로 변경한다.
3. roadmap, progress, release notes, README와 문서 인덱스를 최종 상태로 맞춘다.
4. release walkthrough와 PR 초안을 작성한다.

### Phase 2 — 최종 자동 검증

1. `client` ESLint와 production build
2. Chapter Notes, Composer, navigation guard 테스트 16개
3. 임시 DB 기반 v3 regression harness 8개
4. `git diff --check`
5. 원본 DB hash와 Git 상태를 실행 전후 비교
6. `origin/master...feature/v3.0-release` diff에서 DB, secret, 임시 파일, build artifact 포함 여부 확인

버전·문서 변경 작업과 release/deploy 구성 점검은 병렬로 수행할 수 있다. 최종 build·회귀·diff 검사는 모든 변경을 합친 뒤 한 번 더 수행한다.

### Phase 3 — Release PR

1. 검증 결과를 walkthrough와 PR 초안에 기록한다.
2. 사용자 승인 후 release branch를 push하고 `feature/v3.0` 대상 PR을 생성한다.
3. PR diff와 병합 가능 상태를 리뷰한 뒤 사용자 승인으로 통합한다.

### Phase 4 — Master, Tag, Deploy

1. 사용자 DB가 있는 기본 작업 트리와 분리된 깨끗한 임시 worktree에서 `master`를 준비한다.
2. 최신 `origin/feature/v3.0`을 `master`에 squash merge하고 `Release v3.0.0` 커밋을 만든다.
3. 최종 commit diff, tag 대상, 원격 차이를 사용자에게 제출한다.
4. 명시적 배포 승인 후 annotated tag `v3.0.0`을 생성하고 `master`와 tag를 push한다.
5. GitHub Actions의 Fly.io 배포 완료 여부를 확인한다.
6. 운영 `/api/health`, 정적 앱 로드와 읽기 전용 성경 조회를 점검한다.

`master` push가 자동 배포를 시작하므로 최종 push 승인은 곧 배포 승인으로 취급한다.

## 6. 승인 게이트

1. **완료**: Release 구현계획 사용자 승인
2. 버전·문서·자동 검증 완료 후 release PR push/생성 승인
3. release PR 리뷰 후 `feature/v3.0` 병합 승인
4. squash release commit 검토 후 `master`·tag push 및 자동 배포 승인

## 7. 실패 및 롤백 원칙

- 자동 검증 실패 시 release PR을 만들지 않고 원인과 artifact를 보고한다.
- DB 변경이 diff에 나타나면 즉시 중단하고 stage 대상에서 제외한 뒤 원본 hash를 재확인한다.
- GitHub Actions 배포 실패 시 운영 데이터에는 손대지 않고 로그와 실패 commit을 기준으로 대응안을 제시한다.
- 배포 후 치명적 회귀가 확인되면 force push 대신 별도 revert/hotfix 절차를 제안하고 승인을 받는다.
- tag는 push 전 최종 commit을 확인하며, push된 tag를 임의로 재작성하지 않는다.

## 8. 완료 조건

1. 모든 제품 버전 표기가 `v3.0.0`으로 일치한다.
2. 필수 문서와 release 기록이 완료 상태다.
3. lint, build, 모델 테스트 16/16, regression 8/8이 통과한다.
4. release diff에 사용자 DB·secret·임시 산출물이 없다.
5. `master`의 release commit과 `v3.0.0` tag가 동일한 검증 결과를 가리킨다.
6. GitHub Actions/Fly.io 배포와 운영 read-only smoke test가 성공한다.
7. 비차단 실기기 항목은 후속 hotfix 목록으로 명시된다.
