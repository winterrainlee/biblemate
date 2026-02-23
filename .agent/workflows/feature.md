---
description: 기능 작업(Feature) 시작 자동화 (브랜치 생성, 구현 계획, 태스크 초기화)
---

# Feature 작업 시작 워크플로우

새로운 기능 개발을 시작할 때 사용하는 워크플로우입니다.
`coding-guide.md`에 명시된 **구현 계획(Implementation Plan)** 작성을 돕고 작업 환경을 세팅합니다.

## 1단계: 브랜치 생성
1. 사용자에게 작업할 **기능의 이름**을 물어봅니다. (예: `backup-validation`)
2. `git checkout -b feature/vX.Y-기능명` 명령어로 브랜치를 생성합니다. (현재 버전에 맞게 수정)
   - 이미 브랜치가 있다면 `git checkout`만 수행합니다.

## 2단계: 구현 계획 템플릿 생성
1. `implementation_plan.md` 파일을 생성(초기화)합니다.
   - 아래 템플릿을 사용하세요.
   ```markdown
   # [기능명] 구현 계획

   ## Goal
   - 이 작업의 핵심 목표를 한 문장으로 기술

   ## User Review Required
   - [ ] [항목] (사용자 확인이 필요한 주요 변경 사항)

   ## Proposed Changes
   ### [Component/File Name]
   - [Change Detail 1]
   - [Change Detail 2]

   ## Verification Plan
   ### Automated Tests
   - [ ] `npm test` ...

   ### Manual Verification
   - [ ] [검증 시나리오]
   ```
2. 생성된 `implementation_plan.md`를 에디터로 엽니다 (`view_file`).

## 2.5단계: Sub-agent 계획 검토
구현 계획이 작성된 후, 아래 스킬들을 순서대로 참조하여 검토 피드백을 생성합니다:

1. `~/.gemini/antigravity/global_skills/qa-engineer/SKILL.md` (QA 관점)
2. `~/.gemini/antigravity/global_skills/ui-ux-design/SKILL.md` (UI/UX 관점)
3. `~/.gemini/antigravity/global_skills/interaction-design/SKILL.md` (인터랙션 관점)
4. `~/.gemini/antigravity/global_skills/frontend-dev/SKILL.md` (프론트엔드 관점)
5. `~/.gemini/antigravity/global_skills/backend-dev/SKILL.md` (백엔드 관점)

각 스킬의 **계획 검토 체크리스트**를 기반으로 검토하고, `implementation_plan.md` 하단에 다음 형식으로 피드백을 추가합니다:

```markdown
---

## Agent Review

### 🧪 QA Engineer Review
(QA 관점 피드백)

### 🎨 UI/UX Review
(UI/UX 관점 피드백)

### ✨ Interaction Design Review
(인터랙션 관점 피드백)

### 💻 Frontend Review
(프론트엔드 관점 피드백)

### 🔧 Backend Review
(백엔드 관점 피드백)
```

### ⚠️ Agent 의견 충돌 시
Agent들의 의견이 충돌하면, 다음 형식으로 **3가지 수정안**을 제시합니다:

```markdown
## 🔀 의견 충돌 해결

**충돌 내용**: (예: 보안 vs UX)

### 옵션 A: (보안 우선)
- **이유**: ...
- **장점**: ...
- **단점**: ...

### 옵션 B: (UX 우선)
- **이유**: ...
- **장점**: ...
- **단점**: ...

### 옵션 C: (절충안)
- **이유**: ...
- **장점**: ...
- **단점**: ...

**권장**: 옵션 X (이유 설명)
```

사용자가 옵션을 선택하면 해당 방향으로 진행합니다.

## 3단계: 태스크 초기화
1. `task.md`를 작업에 맞게 초기화합니다.
   ```markdown
   # [기능명] Task List

   - [ ] 구현 계획 작성 및 승인 <!-- id: 0 -->
   - [ ] 기능 구현 <!-- id: 1 -->
   - [ ] 수동 검증 <!-- id: 2 -->
   - [ ] PR 초안 작성 및 교훈 기록 <!-- id: 3 -->
   ```
2. 생성된 `task.md`를 에디터로 엽니다.

## 4단계: 완료 알림
- "작업 준비가 완료되었습니다! 구현 계획을 작성한 후 승인을 요청해주세요." 라고 알립니다.
