# AGENTS.md - BibleMate Codex Agent Rules (Optimized)

이 문서는 Codex CLI 에이전트가 BibleMate 프로젝트에서 따라야 하는 필수 규칙과 워크플로우를 요약합니다.

## 0. 빠른 체크리스트 (반드시 지킴)
- 모든 답변은 한국어로 작성한다.
- 요구사항/범위 변경 또는 생략은 사전 질문 후 승인받는다.
- 판단 필요 시 즉시 중지하고 "이유 → 선택지 2~3개 → 장단점 → 추천안" 형식으로 제안한다.
- 구현 계획 승인 전까지 코드 수정을 시작하지 않는다.
- 기본 흐름: `/feature` → `docs/01-planning/implementation-plans/implementation-plan-vX.Y.Z-기능명.md` → 구현/검증(`docs/03-logs/walkthroughs/walkthrough-vX.Y.Z-기능명.md`) → `/pr` → dev-log/lessons → merge.
- 필수 문서: spec, dev-log, release-notes, implementation-plan, walkthrough, PR 초안, lessons.
- 버전/브랜치 전략을 준수한다.
- Codex CLI의 샌드박스/승인 정책을 준수하고 네트워크 접근은 승인 후 진행한다.
- Windows 환경 규칙(`npm.cmd`, `taskkill`, `git rm --cached`)을 준수한다.
- 데이터 무결성/상대 경로 규칙을 지킨다.

## 1. Language & Communication
- 모든 답변은 한국어로 작성한다.
- 문서 및 코드 주석은 한국어 또는 영어로 작성하되, 일관성을 유지한다.

## 2. AI 협업 승인 게이트 (Must)
1. 승인 없이 범위/요구사항 변경 금지.
2. 결정 필요 시 즉시 정지하고 제안 형식 준수.
3. 구현 계획 승인 전 코드 수정 금지.

## 3. 개발 워크플로우 (6단계)
이 섹션은 실제 작업 절차(프로세스)를 설명한다.
1) 기능 브랜치 생성: `/feature` 워크플로우 실행.
2) 구현 계획 작성: `docs/01-planning/implementation-plans/implementation-plan-vX.Y.Z-기능명.md`를 작성해 제출.
3) 구현 및 검증: `docs/03-logs/walkthroughs/walkthrough-vX.Y.Z-기능명.md`로 검증 결과 제출, 로컬 `npm run dev` 확인 후 승인.
4) PR 초안 작성 및 리뷰: `/pr` 실행, `docs/03-logs/pr/`에 PR 초안 생성.
5) 개발 로그 업데이트: `docs/03-logs/dev-log-v버전명.md` 업데이트, `docs/lessons.md`에 교훈 추가.
6) 최종 병합: 기능 → 통합 브랜치 병합, 통합 → `master` 병합.

## 4. 문서 규칙

### 문서 폴더 구조
```
docs/
├── 01-planning/    # 기획, 로드맵, 아이디어 제안서
│   └── implementation-plans/ # 작업별 구현 계획
├── 02-specs/       # 요구사항 명세서, 아키텍처, 디자인
├── 03-logs/        # 개발 로그, 검증 리포트, PR 초안
│   ├── pr/         # PR 초안 파일
│   └── walkthroughs/ # 작업별 검증 기록
├── 04-releases/    # 릴리즈 노트
├── guides/         # 개발 방법론, 배포 가이드
└── assets/         # 목업, 스크린샷, 테스트 데이터
```

### 버전별 필수 문서
- `docs/02-specs/spec-v버전명.md`
- `docs/03-logs/dev-log-v버전명.md`
- `docs/04-releases/release-notes-v버전명.md`

### 작업별 필수 문서
- `docs/01-planning/implementation-plans/implementation-plan-vX.Y.Z-기능명.md` (작업 시작 전)
- `docs/03-logs/walkthroughs/walkthrough-vX.Y.Z-기능명.md` (검증 결과)
- `docs/03-logs/pr/pr-vX.Y-기능명.md` (작업 완료 후 PR 초안)
- `docs/lessons.md` (작업 완료 후 업데이트)

## 5. 버전 관리 기준
| 유형 | 설명 | 예시 |
|------|------|------|
| **Major (x.0)** | 아키텍처 변경, 핵심 UX 변경 | DB 스키마 대폭 변경, 핵심 기능 재설계 |
| **Minor (x.y)** | 신규 기능, UI/UX 개선 | 신규 기능 추가, 성능 향상 |
| **Patch (x.y.z)** | 핫픽스, 오타, 보안 패치 | 긴급 버그 수정, 오타 수정 |

## 6. 브랜치 전략
```
master (배포용)
  └── feature/vX.Y (버전 통합)
        └── feature/vX.Y-기능명 (기능 작업)
```
- **`master`**: 항상 배포 가능한 최신/안정 상태.
- **`feature/vX.Y`**: 특정 버전의 모든 기능을 모으는 통합 브랜치.
- **`feature/vX.Y-기능명`**: 실제 코드 수정 작업 브랜치.
- Hot fix는 사용자 승인 하에 `master`에서 직접 작업 가능.

## 7. 사용 가능한 워크플로우
이 섹션은 실행 가능한 명령어 목록이다.
| 명령어 | 설명 |
|--------|------|
| `/branch` | 안전한 코드 수정을 위한 feature 브랜치 생성 |
| `/feature` | 기능 작업 시작 자동화 (브랜치 생성, 구현 계획, 태스크 초기화) |
| `/dev-log` | 버전별 개발 로그 작성 및 업데이트 |
| `/pr` | 작업 완료 자동화 (테스트, PR 초안, 교훈 기록) |
| `/deploy` | 배포 전 체크리스트 및 배포 절차 실행 |

## 8. 배포 절차 (/deploy)
1. **버전 업데이트**:
   - `package.json`: version 필드
   - `client/src/pages/Settings.jsx`: 버전 표시 텍스트
   - `README.md`: 상단 버전 뱃지/텍스트
   - `docs/01-planning/roadmap.md`: 최신 배포 버전
2. **문서 정리**:
   - `roadmap.md` 완료 처리
   - `docs-index.md` 업데이트
   - 설계 문서 최신화
3. **릴리즈 노트 작성**:
   - `docs/04-releases/release-notes-vX.Y.Z.md`
4. **최종 병합 및 태깅**:
   ```bash
   git checkout master
   git merge feature/vX.Y --squash
   git tag -a vX.Y.Z -m "Version X.Y.Z Release"
   ```
5. **배포 및 푸시**:
   ```bash
   git push origin master
   git push origin vX.Y.Z
   ```

## 9. Codex CLI 환경 규칙 (요약)
- PowerShell 환경에서 실행됨을 전제로 한다.
- 샌드박스/승인 정책을 준수하며, 쓰기/네트워크 작업은 승인 후 진행한다.
- 텍스트/파일 검색은 가능하면 `rg` 또는 `rg --files`를 우선 사용한다.

## 10. Windows 환경 참고
- `npm` 대신 `npm.cmd` 사용
- Node.js 강제 종료: `taskkill /F /IM node.exe`
- Git 추적 제외: `git rm --cached 파일명` 후 커밋
- Browser CDP 연결 실패 시: 포트 9222 점유 확인 후 Chrome 종료

## 11. 핵심 교훈 (Lessons Learned)

### 데이터 무결성
- **Buffer Rule**: `https.get` 등으로 텍스트 수신 시 `Buffer.concat` 사용 (멀티바이트 문자 손상 방지)
- **Cross-Validation**: 외부 데이터는 임포트 시 예상 레코드 수와 실제 수 대조
- **Direct Inspection**: DB에 직접 쿼리하여 검증 (Proxy를 통한 검증 회피)

### 인프라 및 아키텍처
- **Environment Parity**: 코드 경로와 배포 환경 경로 일치 확인
- **상대 경로 사용**: API 호출 시 `http://localhost:3001` 하드코딩 피하고 `/api/...` 사용

### 개발 패턴
- **Atomic State Management**: 연관 상태 변경은 단일 핸들러 내에서 원자적 처리
- **문서화 필수**: 코드는 잊혀지지만 문서는 남음, AI 협업 컨텍스트 유지에 핵심

## 12. 프로젝트 구조
```
biblemate/
├── .agent/
│   ├── rules/          # 코딩 규칙 (coding-guide.md)
│   └── workflows/      # 워크플로우 정의 파일
├── client/             # React Frontend (Vite)
│   └── src/
│       ├── pages/      # ReadingDashboard, Settings 등
│       ├── components/ # BibleViewer, NoteEditor, Calendar 등
│       └── services/   # API 통신
├── server/             # Express Backend
│   ├── routes/         # API Endpoints
│   ├── config/         # 설정 파일
│   └── data/           # SQLite Database
├── scripts/            # 데이터 임포트 유틸리티
└── docs/               # 프로젝트 문서
```

## 13. 기술 스택
- **Frontend**: React, Vite, React Router
- **Styling**: Vanilla CSS (CSS Variables, Responsive Flex/Grid)
- **Backend**: Node.js, Express
- **Database**: SQLite (sql.js) - WASM 기반
- **Key Libraries**: date-fns, lucide-react, concurrently



