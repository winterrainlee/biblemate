# 개발 로그 - v2.1.1 (Hotfix)

## 작업 개요
- **일자**: 2026-02-27
- **내용**: 에스겔 16장 본문 오류(구절 밀림 및 오염) 수정

## 상세 내역
- **문제 분석**:
    - 에스겔 16:34 구절이 33절의 내용을 중복해서 가지고 있었음.
    - 이로 인해 35절부터 62절까지 내용이 한 구절씩 뒤로 밀림.
    - 63절 본문에 불필요한 태그([Ezekiel 16:64]) 및 62절 내용이 중복 포함됨.
- **해결 방법**:
    1. 대한성서공회(BSK) 공식 개역한글 본문을 추출하여 정본 데이터 확보.
    2. `server/data/bible-corrections.json`에 34~63절의 교정 데이터 추가 (v1.3.2).
    3. 전용 핫픽스 스크립트(`scripts/apply-ezekiel-fix.js`)를 작성하여 DB(`bible.db`)에 즉시 반영.
- **적용 결과**:
    - 에스겔 16장 총 구절 수: 63절 (정상)
    - 34절: "너의 음란함이 다른 여인과 같지 아니함은..." (복구 완료)
    - 63절: 본문 오염 및 태그 제거 완료.

## 비고
- 이번 작업은 긴급 핫픽스이므로 전체 성경 데이터를 다시 임포트하지 않고 `bible-corrections.json` 기반의 부분 업데이트로 진행함.

---

## 배포 오류 수정 (Post-Release)

### 1차 오류: Docker 빌드 중 네트워크 접근 실패
- **오류**: `process "/bin/sh -c node scripts/import-bible.js" did not complete successfully: exit code: 1`
- **원인**: `import-bible.js`가 Docker 빌드 단계에서 GitHub 외부 URL에서 성경 데이터를 다운로드하는데, Fly.io 빌드 환경에서는 외부 네트워크 접근이 차단됨.
- **해결**:
    1. `.gitignore`에서 `server/data/bible.db` 및 `*.db` 추적 제외 규칙 해제.
    2. `bible.db`를 레포에 직접 포함하여 네트워크 의존성 제거.
    3. `Dockerfile`에서 `db-builder` 스테이지 제거 및 `server/data/bible.db`를 `db-seed/`로 이동 후 entrypoint에서 볼륨에 복사하는 방식으로 변경. (`fly.toml`의 볼륨 마운트 설정과 호환되도록 유지)

### 2차 오류: Depot 원격 빌더 타임아웃
- **오류**: `==> Building image / Waiting for depot builder...` (무한 대기)
- **원인**: `flyctl deploy --remote-only` 옵션이 Fly.io Depot 원격 빌더를 사용하도록 강제하는데, 해당 서비스가 응답하지 않음.
- **해결**: `.github/workflows/deploy.yml`에서 `--remote-only` → `--local-only`로 변경하여 GitHub Actions 러너에서 직접 Docker 빌드를 수행하도록 전환.
