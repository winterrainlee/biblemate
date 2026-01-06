# BibleMate v1.1.0 개발 로그

**작업 기간**: 2026-01-05 ~ 2026-01-06  
**목표 버전**: v1.1.0  
**주요 기능**: 데이터 백업/복구, 사이드바 컴팩트 모드, 대시보드 블록 토글, **Fly.io 클라우드 배포, 액세스 암호 보호**

---

## 1. 초기 개발 단계 (2026-01-05)

### 주요 구현 항목 (로컬 기능)
1. **백엔드**: `server/routes/backup.js` 신규 생성
   - GET `/api/backup/export`: 전체 데이터 내보내기
   - POST `/api/backup/import`: 데이터 가져오기 (덮어쓰기 정책)
2. **프론트엔드**: Settings 페이지 확장 및 `BibleSelector` 컴팩트 레이아웃 적용.
3. **ReadingDashboard**: `localStorage` 연동 동적 그리드 시스템 구현.

---

## 2. 확장 개발 단계: 클라우드 진출 및 보안 (2026-01-06)

### Fly.io 배포 및 Docker 최적화
- **도전 과제**: SQLite DB를 빌드 시점에 생성하고, 실행 시점에 영구 볼륨으로 관리해야 함.
- **해결책**: 
  - 3단계 멀티스테이지 빌드 (`client-builder` -> `db-builder` -> `production`) 도입.
  - `db-builder`에서 `scripts/import-bible.js`를 실행하여 시드 DB(bible.db)를 생성하고, 이를 `db-seed` 폴더에 임시 보관.
  - 컨테이너 시작 시(`entrypoint.sh`), `/app/server/db-data` 볼륨이 비어있으면 시드 DB를 복사하도록 설정.

### 인증 보안 시스템 (Access Password)
- **도전 과제**: 외부 주소(fly.dev) 노출에 따른 데이터 유출 우려.
- **해결책**:
  - `ACCESS_PASSWORD` 환경변수를 통한 조건부 인증 미들웨어 구현.
  - `cookie-parser`를 활용한 세션 관리.
  - 로그인 실패/성공 시나리오 구현 및 디자인 정밀 조정 (텍스트 가운데 정렬 등).

---

## 3. 발생한 문제 및 해결책

### [문제] Docker 빌드 시 DB 파일 누락
- **원인**: `.gitignore`와 `.dockerignore`에 `scripts`와 `*.db`가 포함되어 빌드 컨테이너에 필요한 자원이 전달되지 않음.
- **해결**: `.dockerignore`에서 `scripts` 제거, Dockerfile 내에서 명시적으로 DB 생성 로직 수행.

### [문제] CORS 및 쿠키 전송 이슈
- **원인**: 클라이언트-서버 간 다른 포트 사용 시 인증 쿠키가 전송되지 않음.
- **해결**: Express 설정에서 `credentials: true` 적용 및 클라이언트 `fetch` 옵션에 `credentials: 'include'` 추가.

---

## 4. Lessons Learned

### 구조 이해의 중요성 (The Strength of Architecture)
- 단순한 '바이브 코더'로서의 접근이 아닌, Docker와 클라우드 플랫폼의 생명주기(Lifecycle)를 이해해야만 인프라 문제를 해결할 수 있음을 체감함.
- **v1.1.0**으로 버전업하며 작성한 아키텍처 문서는 향후 AI와의 협업 및 시스템 확장에 결정적인 기준점이 됨.

---

## 🎉 v1.1.0 개발 완료 (2026-01-06)

**주요 성과**:
- ✅ 데이터 주권 확보 (백업/복구)
- ✅ 모바일/대시보드 UX 최적화
- ✅ 서비스 상시 가용성 확보 (Fly.io)
- ✅ 외부 접근 보안 강화 (Password Protection)


