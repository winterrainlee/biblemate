---
description: Major 업데이트 후 코드 효율성 점검 및 리팩터링 제안
---

# Refactoring 워크플로우

Major 버전 업데이트 이후, 전체 코드베이스의 효율성을 점검하고 리팩터링을 제안하는 워크플로우입니다.

## 사용 시점
- Major 버전 (x.0) 출시 이후
- 기술 부채가 누적되었다고 판단될 때
- 성능 이슈가 발생했을 때

---

## 1단계: 코드베이스 분석

다음 항목들을 전체적으로 스캔합니다:

### 프론트엔드 (`client/src/`)
`~/.gemini/antigravity/global_skills/frontend-dev/SKILL.md` 참조

| 점검 항목 | 확인 내용 |
|----------|----------|
| **컴포넌트 크기** | 200줄 이상인 컴포넌트 → 분리 검토 |
| **중복 코드** | 유사한 로직이 여러 곳에 존재 → 공통화 |
| **상태 관리** | 불필요한 전역 상태, prop drilling |
| **성능** | 불필요한 리렌더링, 최적화 누락 |

### 백엔드 (`server/`)
`~/.gemini/antigravity/global_skills/backend-dev/SKILL.md` 참조

| 점검 항목 | 확인 내용 |
|----------|----------|
| **라우트 크기** | 50줄 이상인 핸들러 → 분리 검토 |
| **중복 쿼리** | 유사한 DB 쿼리 → 공통 함수화 |
| **에러 핸들링** | 일관성 없는 에러 처리 |
| **API 구조** | RESTful 원칙 준수 여부 |

### 공통
| 점검 항목 | 확인 내용 |
|----------|----------|
| **Dead Code** | 사용되지 않는 함수/변수/import |
| **Magic Numbers** | 하드코딩된 값 → 상수화 |
| **네이밍** | 불명확한 변수/함수명 |
| **의존성** | 사용하지 않는 패키지, 취약한 버전 |

---

## 2단계: Sub-agent 종합 리뷰

모든 Sub-agent 스킬을 참조하여 각 관점에서 개선점을 도출합니다:

1. `~/.gemini/antigravity/global_skills/qa-engineer/SKILL.md`
2. `~/.gemini/antigravity/global_skills/security-dev/SKILL.md`
3. `~/.gemini/antigravity/global_skills/ui-ux-design/SKILL.md`
4. `~/.gemini/antigravity/global_skills/interaction-design/SKILL.md`
5. `~/.gemini/antigravity/global_skills/frontend-dev/SKILL.md`
6. `~/.gemini/antigravity/global_skills/backend-dev/SKILL.md`

---

## 3단계: 리팩터링 제안서 작성

분석 결과를 바탕으로 리팩터링 제안서를 생성합니다:

```markdown
# 리팩터링 제안서 (v{버전} 이후)

## 📊 분석 요약
| 영역 | 발견된 이슈 | 우선순위 |
|------|------------|----------|
| 프론트엔드 | N건 | P0/P1/P2 |
| 백엔드 | N건 | P0/P1/P2 |
| 공통 | N건 | P0/P1/P2 |

## 🔴 P0 (즉시 수정 필요)
### 1. [이슈 제목]
- **위치**: `파일경로`
- **문제**: ...
- **제안**: ...
- **예상 효과**: ...

## 🟡 P1 (다음 마이너 버전에서 수정 권장)
...

## 🟢 P2 (향후 개선 고려)
...

## 📈 예상 개선 효과
- 성능: ...
- 유지보수성: ...
- 코드 품질: ...
```

---

## 4단계: 사용자 리뷰

1. 생성된 리팩터링 제안서를 사용자에게 보여줍니다.
2. 사용자가 수락한 항목에 대해 `/feature` 워크플로우로 진행합니다.

---

## ⚠️ 주의사항

- 리팩터링은 **기능 변경 없이** 코드 구조만 개선합니다.
- 각 리팩터링 항목은 **독립적으로 테스트 가능**해야 합니다.
- 대규모 리팩터링은 여러 PR로 나누어 진행합니다.
