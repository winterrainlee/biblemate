---
description: 배포 전 체크리스트 및 배포 절차 실행
---

# 배포 (Deployment) 워크플로우

배포는 프로젝트의 가장 중요한 순간입니다. `dev-method.md`의 절차에 따라 안전하게 배포를 진행합니다.

## 0단계: 배포 전 상태 확인
1. `git status`를 실행하여 커밋되지 않은 변경 사항이 없는지 확인합니다.
2. 현재 `feature/vX.Y` 통합 브랜치에 있는지 확인합니다.
3. 테스트(`npm run dev`)는 통과했습니까?

## 1단계: 버전 업데이트 (Version Bump)
사용자에게 이번 **배포 버전(vX.Y.Z)**을 물어보고, 다음 파일들의 버전을 일괄 업데이트합니다.
- `package.json`: version 필드
- `client/src/pages/Settings.jsx`: 버전 표시 텍스트
- `README.md`: 상단 버전 뱃지/텍스트 및 주요 기능
- `docs/01-planning/roadmap.md`: 최신 배포 버전 및 목표 버전 섹션

## 2단계: 문서 정리
1. `docs/01-planning/roadmap.md`를 업데이트합니다.
   - 이번 버전에 구현된 기능들을 `Inbox`나 `Categorized`에서 `Completed` 섹션으로 이동합니다.
2. `docs/docs-index.md`에 새로운 릴리즈 노트 링크를 준비(예정)합니다.
3. **설계 문서 최신화**: 이번 버전의 변경 사항을 `02-specs/` 폴더 내 문서에 반영합니다.
   - `architecture.md`: 시스템 구조나 데이터 스키마 변경 시
   - `layout-vX.Y.md`: UI/UX 변경 시 (파일이 없으면 새로 생성)

## 3단계: 릴리즈 노트 작성
1. `docs/04-releases/release-notes-vX.Y.Y.md` 파일을 생성합니다.
2. 이번 버전의 주요 변경 사항(Feature, Bug Fix, UX Improvements)을 요약하여 작성합니다.

## 4단계: 최종 병합 및 태깅 (Merge & Tag)
1. `git checkout master`
2. `git merge feature/vX.Y --squash` (커밋 메시지는 "Release vX.Y.Z" 형식 권장)
3. `git tag -a vX.Y.Z -m "Version X.Y.Z Release"`

## 5단계: 배포 및 푸시
1. `git push origin master`
2. `git push origin vX.Y.Z`
3. Fly.io 배포라면 `fly deploy` 명령어를 실행할지 물어봅니다. (현재는 github action에 Deploy to Fly.io가 등록되어 있습니다.)

## 6단계: 마무리
1. 배포가 성공하면 사용자에게 축하 메시지를 전합니다! 🎉