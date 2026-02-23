---
description: 작업 완료(PR) 자동화 (테스트, PR 초안, 교훈 기록)
---

# PR (Pull Request) 워크플로우

하나의 기능 구현 작업이 끝났을 때 수행하는 워크플로우입니다.
`coding-guide.md`의 **PR 초안** 및 **교훈(Lessons Learned)** 작성 규칙을 자동화합니다.

## 1단계: 기본 검증
1. `npm run dev` 명령어로 서버가 정상 실행되는지 확인(Health Check)하라고 사용자에게 제안합니다.
   - (이미 실행 중이라면 생략 가능)
   - 만약 에러 로그가 있다면 해결 후 진행해야 함을 알립니다.

## 1.5단계: Sub-agent 코드 리뷰
PR 작성 전, 아래 스킬들을 참조하여 변경된 코드를 검토합니다:

1. `~/.gemini/antigravity/global_skills/security-dev/SKILL.md` (보안 검토)
2. `~/.gemini/antigravity/global_skills/qa-engineer/SKILL.md` (QA 검토)
3. `~/.gemini/antigravity/global_skills/ui-ux-design/SKILL.md` (UI/UX 구현 검토)
4. `~/.gemini/antigravity/global_skills/interaction-design/SKILL.md` (인터랙션 구현 검토)
5. `~/.gemini/antigravity/global_skills/backend-dev/SKILL.md` (백엔드 구현 검토)

### 검토 절차
1. 각 스킬의 **코드 리뷰 체크리스트**를 기반으로 변경된 파일들을 검토합니다.
2. UI/UX 및 인터랙션 검토 시, **구현 계획(implementation_plan.md)의 Agent Review**와 비교하여 계획대로 구현되었는지 확인합니다.
3. 발견된 이슈가 있으면:
   - 🔴 **Critical**: PR 진행 전 반드시 수정 필요 → 사용자에게 알림
   - 🟡 **Warning**: 수정 권장 → PR 초안에 기록
   - 🟢 **Info**: 참고 사항 → PR 초안에 기록
4. PR 초안에 **## Agent Review** 섹션을 추가합니다.

### 검토 결과 템플릿
PR 초안의 Review Point 섹션 아래에 다음을 추가합니다:
```markdown
## 4. Agent Review

### 🔐 Security Review
(보안 검토 결과)

### 🧪 QA Review
(QA 검토 결과)

### 🎨 UI/UX Implementation Review
(계획 대비 구현 일치 여부)

### ✨ Interaction Implementation Review
(계획 대비 구현 일치 여부)

### 🔧 Backend Implementation Review
(계획 대비 구현 일치 여부)
```

### ⚠️ Agent 의견 충돌 시
Agent들의 의견이 충돌하면, 다음 형식으로 **3가지 수정안**을 제시합니다:

```markdown
## 🔀 의견 충돌 해결

**충돌 내용**: (예: 보안 vs 성능)

### 옵션 A: (보안 우선)
- **이유**: ...
- **장점**: ...
- **단점**: ...

### 옵션 B: (성능 우선)
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

## 2단계: PR 초안 파일 생성
1. 현재 날짜와 기능명을 포함한 파일명으로 PR 초안을 생성합니다.
   - 경로: `docs/03-logs/pr/pr-vX.Y-{기능명}.md`
   - **PR 템플릿**:
     ```markdown
     # PR: [기능명] 구현

     ## 1. 주요 변경 사항
     - [ ] (A 기능 구현)
     - [ ] (B 버그 수정)

     ## 2. 검증 결과
     - [x] npm run dev 실행 확인
     - [ ] (추가 검증 내용)

     ## 3. Review Point
     - (사용자가 중점적으로 봐줬으면 하는 부분)
     ```
2. 생성된 PR 파일을 에디터로 엽니다.

## 3단계: 교훈 기록 (Lessons Learned)
1. `docs/lessons.md` 파일을 에디터로 엽니다.
2. "이번 작업에서 얻은 교훈이나 주의사항이 있다면 기록해주세요."라고 안내합니다.
   - 파일이 없다면 새로 생성해줍니다.

## 4단계: 마무리
- "PR 초안 작성이 완료되었습니다! 내용을 채우고 사용자 리뷰를 요청하세요."라고 알립니다.
