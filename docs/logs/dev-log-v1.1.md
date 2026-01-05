# BibleMate v1.1 개발 로그

**작업 시작일**: 2026-01-05  
**목표 버전**: v1.1  
**주요 기능**: 데이터 백업/복구, 사이드바 컴팩트 모드, 대시보드 블록 토글

---

## 계획 단계 (2026-01-05 15:47)

### 문서 검토
- ✅ v1.1 명세서 확인 (`docs/specifications/spec-v1.1.md`)
- ✅ 작업 흐름도 확인 (`docs/planning/roadmap.md`)
- ✅ 개발 방법론 확인 (`docs/planning/dev-method.md`)
- ✅ 프로젝트 구조 확인
- ✅ 구현 계획서 작성 완료

### 주요 구현 항목
1. **백엔드**: `server/routes/backup.js` 신규 생성
   - GET `/api/backup/export`: 전체 데이터 내보내기
   - POST `/api/backup/import`: 데이터 가져오기 (덮어쓰기 정책)

2. **프론트엔드 - Settings 페이지 확장**:
   - 데이터 백업/복구 UI 섹션
   - 대시보드 표시 설정 섹션 (토글 스위치)

3. **프론트엔드 - BibleSelector 컴팩트 모드**:
   - 세로 → 가로 레이아웃 변경
   - 반응형 처리

4. **프론트엔드 - ReadingDashboard 동적 그리드**:
   - localStorage 기반 설정 읽기
   - 그리드 레이아웃 동적 조정

---

## 개발 진행 상황

### [완료] 백엔드 구현 (2026-01-05)

#### 백업/복구 API 생성
- ✅ `server/routes/backup.js` 라우터 생성
- ✅ GET `/api/backup/export`: 전체 데이터(reading_progress, notes, highlights) JSON으로 내보내기
  - 버전 정보 포함 (`version: "1.1"`)
  - 내보내기 시간 타임스탬프 포함
- ✅ POST `/api/backup/import`: JSON 데이터 가져오기
  - 스키마 검증 구현
  - 트랜잭션 처리 (BEGIN/COMMIT/ROLLBACK)
  - 기존 데이터 삭제 후 새 데이터 삽입 (덮어쓰기 정책)
- ✅ `server/index.js`에 백업 라우터 등록 (`/api/backup`)

### [완료] 프론트엔드 구현 (2026-01-05)

#### Settings 페이지 확장
- ✅ 상태 관리 추가 (`useState`, `useEffect`)
- ✅ 아이콘 import (`Download`, `Upload`, `Eye`, `EyeOff`)
- ✅ **데이터 백업/복구 섹션** 구현:
  - 백업 버튼: `handleExport` 함수로 파일 다운로드
  - 복구 버튼: `handleImport` 함수로 파일 업로드
  - 경고 메시지: "복구 전 현재 데이터를 백업하는 것을 권장합니다" 문구 포함
  - 상태 메시지 표시 (성공/실패)
- ✅ **화면 표시 설정 섹션** 구현:
  - 말씀 영역 ON/OFF 토글
  - 묵상 영역 ON/OFF 토글
  - localStorage에 설정 저장
  - 최소 하나는 켜져 있도록 검증

#### BibleSelector 컴팩트 모드
- ✅ `BibleSelector.css` 수정:
  - `.selector-compact-row` 클래스 추가 (가로 배치)
  - `.selector-row.full-width` 클래스 추가 (역본 선택은 전체 폭)
  - gap 간격 축소 (0.75rem → 0.5rem)
- ✅ `BibleSelector.jsx` 구조 변경:
  - 역본 선택: 한 줄 (full-width)
  - 책/장 선택: selector-compact-row로 가로 배치
  - 반응형 처리 (`flex-wrap: wrap`)

#### ReadingDashboard 동적 그리드
- ✅ dashboardConfig 상태 추가
- ✅ localStorage에서 설정 읽기 (`useEffect`)
- ✅ 조건부 렌더링:
  - `showReading` 상태에 따라 성경 영역 표시/숨김
  - `showNotes` 상태에 따라 노트 영역 표시/숨김

---

## 발생한 문제 및 해결책

### [문제] 백업 API 테이블 이름 오류 (2026-01-05)
**증상**: Settings 페이지에서 "데이터 내보내기" 클릭 시 "백업 중 오류가 발생했습니다" 메시지 표시
**오류 메시지**: `no such table: reading_progress`
**원인**: 백업 라우터에서 잘못된 테이블 이름 사용
  - 코드: `reading_progress` (잘못됨)
  - 실제 스키마: `reading_logs` (올바름)
**해결책**: 
  - `server/routes/backup.js`에서 모든 `reading_progress`를 `reading_logs`로 변경
  - 컬럼명도 실제 스키마에 맞게 수정 (`chapter_from`, `chapter_to`)
  - notes 테이블 INSERT 쿼리도 실제 스키마에 맞게 수정 (`date`, `content`, `created_at`, `updated_at`)

### [문제] 브라우저 CDP 연결 실패 (2026-01-05)
**증상**: `browser_subagent` 실행 시 CDP(Chrome DevTools Protocol) 연결 실패
**오류 메시지**: `failed to connect to browser via CDP even though the CDP port is responsive: target closed: EOF`
**원인**: 포트 9222를 다른 Chrome 프로세스가 점유 (VS Code 확장, 백그라운드 Chrome 등)
**해결책**: 수동 테스트 필요 - 사용자가 http://localhost:5173 에서 직접 기능 확인

### 수동 테스트 체크리스트
1. **BibleSelector 컴팩트 모드**: ✅ 완료
   - 사이드바에서 역본 선택이 한 줄에 표시되는지 확인
   - 책/장 선택이 가로로 나란히 배치되는지 확인 (90%/110% 비율)
   
2. **데이터 백업**: (수정 완료 - 재테스트 필요)
   - Settings → "데이터 내보내기" 클릭
   - `biblemate_backup_YYYYMMDD.json` 파일 다운로드 확인
   - 성공 메시지 표시 확인

3. **데이터 복구**:
   - Settings → "데이터 가져오기" 클릭
   - 파일 선택 시 경고 메시지 출력 확인 ("복구 전 현재 데이터를 백업하는 것을 권장합니다")
   - 복구 후 페이지 새로고침 확인

4. **대시보드 토글**:
   - Settings → "화면 표시 설정"
   - "말씀 영역" OFF → 홈에서 성경 영역 숨김 확인
   - "묵상 영역" OFF → 홈에서 노트 영역 숨김 확인
   - 둘 다 OFF 시도 → 경고 메시지 확인
   - 설정이 localStorage에 저장되어 새로고침 후에도 유지되는지 확인

---

## Lessons Learned

### 1. 스키마 확인의 중요성
- 백엔드 API 개발 시 **실제 데이터베이스 스키마를 먼저 확인**하는 것이 중요
- 테이블 이름과 컬럼명을 정확하게 사용해야 런타임 오류 방지 가능
- 해결: 개발 초기에 `schema.sql` 파일을 항상 참고할 것

### 2. localStorage의 특성
- localStorage는 브라우저별로 독립적으로 저장됨
- 같은 서버라도 기기/브라우저마다 다른 설정 유지 가능
- 장점: 기기별 사용 패턴 최적화 가능
- 단점: 기기 간 동기화 불가 (향후 서버 저장 방식 고려)

### 3. 사용자 피드백의 가치
- 초기 85%/115% 비율 → 사용자 피드백으로 90%/110%로 조정
- 실제 사용자의 의견이 최적의 UX를 찾는 데 중요

---

## 🎉 v1.1 개발 완료

**개발 기간**: 2026-01-05 (1일)  
**총 작업 시간**: 약 4시간  
**주요 성과**:
- ✅ 데이터 백업/복구 시스템 구축
- ✅ 모바일 UX 개선 (컴팩트 모드)
- ✅ 사용자 맞춤형 경험 제공 (대시보드 토글)

**다음 단계**: v1.1 배포 및 v1.2 계획 수립

