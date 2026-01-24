---
trigger: always_on
---

## MUST (필수 규칙)

### 버전 관리 기준
| 유형 | 설명 |
|------|------|
| Major (x.0) | 아키텍처 변경, 핵심 UX 변경 |
| Minor (x.y) | 신규 기능, UI/UX 개선 |
| Patch (x.y.z) | 핫픽스, 오타, 보안 패치 |

### 브랜치 워크플로우
- 버전 통합 (Integration): `feature/v버전명` 브랜치
- 기능 작업 (Working): `feature/v버전명-기능명` 브랜치 → `/feature` workflow 실행
- 작업 완료 (Done): 구현 및 검증 완료 → `/pr` workflow 실행
- 긴급 수정: 마지막 릴리즈 태그에서 분기
- 배포: `/deploy` workflow 실행

### 문서 규칙
**버전별 필수 문서**:
- `spec-v버전명.md` - 버전 명세서
- `dev-log-v버전명.md` - 개발 로그
- `release-notes-v버전명.md` - 릴리즈 노트

**작업별 필수 문서**:
- `implementation_plan.md` - 구현 계획 (작업 시작 전)
- `docs/03-logs/pr/` - PR 초안 (작업 완료 후)
- `docs/lessons.md` - 교훈 기록 (작업 완료 후)

**Dev-Log 작성 시점** (`/dev-log` workflow):
- `/feature` 실행 시: 해당 버전의 dev-log 파일 생성/확인
- 기능 구현 완료 시: 변경 내역 추가
- `/pr` 실행 전: dev-log 최종 업데이트 확인

---

## NOTE (Windows 환경 참고)

- `npm` 대신 `npm.cmd` 사용
- Node.js 강제 종료: `taskkill /F /IM node.exe`
- Git 추적 제외: `git rm --cached 파일명` 후 커밋
- Browser CDP 연결 실패 시: 포트 9222 점유 확인 후 Chrome 종료

---

## React 코딩 가이드

React/Next.js 코드 작성 시 아래 글로벌 스킬을 참조하라:
- **스킬 경로**: `~/.gemini/antigravity/global_skills/react-best-practices/SKILL.md`

### 우선순위 규칙 (Impact 순)
1. **Bundle Size** - `React.lazy()`, dynamic imports 적용
2. **Re-render 최적화** - `React.memo`, `useMemo`, `useCallback` 활용
3. **Lazy State Init** - localStorage 읽기는 `useState(() => ...)` 콜백 사용
4. **조건부 렌더링** - `&&` 대신 삼항연산자 사용 권장

---

## 테스트 코딩 가이드

테스트 코드 작성 시 아래 글로벌 스킬을 참조하라:
- **스킬 경로**: `~/.gemini/antigravity/global_skills/test-writing-guide/SKILL.md`

### 핵심 원칙
1. **AAA 패턴** - Arrange → Act → Assert 순서
2. **테스트 격리** - 각 테스트는 독립적으로 실행 가능
3. **명확한 명명** - `should [행동] when [조건]` 형식

