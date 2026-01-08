# Bible Reading Mate v1.3 Development Log

## 개발 정보
- **시작일**: 2026-01-08
- **목표 버전**: v1.3.0
- **주요 목표**: 백업 시스템 안정성 강화 및 UX 개선

---

## 작업 기록

### 2026-01-08 (백업 안정성 강화 & UX 개선)
#### 개발 내용
- **백업 파일 포맷 개선**:
  - `app_version`, `schema_version` 메타데이터 도입
  - 구버전(v1.1) 백업 파일 호환성 로직 구현
- **Import 안정성 확보**:
  - `id` 필드 누락 시 `null` 처리로 자동 생성 유도 (Bug Fix - Server 500 Error 해결)
  - 5MB 용량 제한 및 필수 필드 검증 로직 추가 (악성 파일 방지)
- **UX 개선**:
  - Import/Export 결과를 Toast에서 Modal Popup으로 변경
  - 묵상 집중 모드 레이아웃 개선

#### Retrospective & Troubleshooting
1.  **초기 기획 및 전략**
    - GPT Codex 제안 적극 반영 (hybrid 버전 관리 방식 채택)
    - 스키마 버전 관리가 마이그레이션 및 유지보수에 필수적임을 재확인.

2.  **Server Issue: 백업 데이터 `id` 의존성**
    - **문제**: 구버전 백업 등에서 `id` 누락 시 SQLite Insert 에러로 서버 중단.
    - **해결**: 모든 레코드 처리 시 `id ?? null` 체크 로직 추가.
    - **교훈**: 외부 입력 데이터는 항상 불완전하다고 가정하고 방어 로직을 작성해야 함.

3.  **Client Issue: JSON 파싱 및 이스케이프**
    - **문제**: 테스트 데이터 생성 시 `"` 미처리로 인한 `JSON.parse` 에러.
    - **해결**: 수동 생성 대신 Node.js 스크립트로 재생성.
    - **교훈**: 테스트 데이터도 스크립트로 생성하여 휴먼 에러 방지 필요.

4.  **Client Issue: 다운로드 중복 코드**
    - **문제**: DOM 조작 코드 중복으로 인한 콘솔 에러.
    - **해결**: 중복 제거.
    - **교훈**: 복사 붙여넣기 시 코드 리뷰 철저.

5.  **Test Environment: 브라우저 자동화**
    - **문제**: CDP 연결 불안정으로 E2E 테스트 실패.
    - **대안**: `curl` 및 API 직접 호출 테스트로 검증 수행.
    - **교훈**: E2E 실패 대비용 Integration Test Script 준비 필요.

### 2026-01-09 (UX 개선: Favicon & PWA)
#### 개발 내용
- **브랜딩 강화**:
  - `logo.png` (Blue Book Icon) 생성 및 적용.
  - `manifest.json` 추가로 모바일 홈 화면 추가 및 PWA 지원.
- **웹 표준 준수**:
  - `index.html` 내 favicon, apple-touch-icon, manifest 링크 최적화.

---

## 이슈 및 해결
- (위 Troubleshooting 섹션에 통합됨)
