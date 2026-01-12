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
- 버전 통합 (Integration): `feature/v버전명` 브랜치 (모든 기능이 모이는 곳)
- 기능 작업 (Working): `feature/v버전명-기능명` 브랜치 (실제 코드 수정)
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

---

## NOTE (Windows 환경 참고)

- `npm` 대신 `npm.cmd` 사용
- Node.js 강제 종료: `taskkill /F /IM node.exe`
- Git 추적 제외: `git rm --cached 파일명` 후 커밋
- Browser CDP 연결 실패 시: 포트 9222 점유 확인 후 Chrome 종료
