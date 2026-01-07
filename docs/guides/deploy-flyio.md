# Fly.io 배포 가이드

BibleMate를 Fly.io에 배포하여 24시간 접속 가능하게 만드는 가이드입니다.

## 배포 아키텍처

```
사용자 → Fly.io Edge (HTTPS) → Express Server → React 정적 파일
                                      ↓
                              SQLite (영구 볼륨)
```

- **단일 컨테이너**: Express가 React 빌드 파일도 함께 서빙
- **도쿄 리전 (nrt)**: 한국에서 가장 가까운 Fly.io 리전
- **영구 볼륨**: SQLite 데이터가 재시작/재배포 시에도 유지

---

## 사전 준비

### 1. Fly CLI 설치 (PowerShell 관리자 권한)

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. PATH 설정 (설치 후 새 터미널에서도 안 되면)

```powershell
$env:PATH += ";$env:USERPROFILE\.fly\bin"
# 또는 전체 경로로 실행
& "$env:USERPROFILE\.fly\bin\flyctl.exe" <명령어>
```

### 3. Fly.io 로그인

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" auth login
```

---

## 최초 배포

### 1. 앱 생성

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" apps list  # 기존 앱 확인
& "$env:USERPROFILE\.fly\bin\flyctl.exe" launch --no-deploy  # 새 앱 생성 (필요시)
```

> [!TIP]
> **보안 팁**: 앱 이름이 곧 접속 주소가 됩니다 (예: `my-app.fly.dev`).
> 누구나 추측하기 쉬운 이름보다는 나만이 알 수 있는 복잡한 이름(예: `biblemate-x7z2p`)을 사용하는 것이 보안상 유리합니다.

### 2. 볼륨 생성 (SQLite 데이터 영구 저장)

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" volumes create biblemate_data --size 1 --region nrt
```

> ⚠️ 경고 메시지가 나오면 `y` 입력 (개인 프로젝트는 단일 볼륨으로 충분)

### 3. 배포

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" deploy
```

---

## 주요 설정 파일

### fly.toml

```toml
app = "biblemate"
primary_region = "nrt"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = "off"      # 24시간 상시 가동
  auto_start_machines = true
  min_machines_running = 1

[mounts]
  source = "biblemate_data"
  destination = "/app/server/data"  # 볼륨 마운트 경로

[checks]
  [checks.health]
    type = "http"
    port = 3001
    path = "/api/health"
```

### Dockerfile 핵심 포인트

1. **3단계 멀티스테이지 빌드**:
   - `client-builder`: React 클라이언트 빌드
   - `db-builder`: `import-bible.js` 실행하여 성경 DB 생성
   - `production`: 최종 서버 이미지
2. **시드 DB**: 빌드 시 생성된 DB를 `db-seed/`에 보관
3. **Entrypoint 스크립트**: 볼륨이 비어있으면 시드 DB 자동 복사

```dockerfile
# Build stage - Generate Bible DB
FROM node:20-alpine AS db-builder
# ... import-bible.js 실행으로 DB 생성

# Production stage
COPY --from=db-builder /app/server/data/bible.db ./server/db-seed/bible.db

# Entrypoint: 볼륨 비어있으면 시드에서 복사
RUN echo 'if [ ! -f /app/server/data/bible.db ]; then' >> /entrypoint.sh && \
    echo '  cp /app/server/db-seed/bible.db /app/server/data/bible.db' >> /entrypoint.sh
```

---

## 암호 보호 설정 (선택사항)

외부에서 접근을 제한하려면 `ACCESS_PASSWORD` 환경변수를 설정하세요:

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" secrets set ACCESS_PASSWORD="your-secret-password"
```

설정 후 앱에 접속하면 암호 입력 화면이 표시됩니다.

> 환경변수가 없으면 암호 없이 바로 접속 가능 (로컬 개발 환경)

---

## 유지보수 명령어

### 상태 확인

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" status
& "$env:USERPROFILE\.fly\bin\flyctl.exe" logs
```

### 업데이트 배포

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" deploy
```

### SSH 접속

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" ssh console
```

### 볼륨 관리

```powershell
# 볼륨 목록
& "$env:USERPROFILE\.fly\bin\flyctl.exe" volumes list

# 볼륨 삭제 (ID로)
& "$env:USERPROFILE\.fly\bin\flyctl.exe" volumes destroy <vol_id> -y

# 볼륨 재생성
& "$env:USERPROFILE\.fly\bin\flyctl.exe" volumes create biblemate_data --size 1 --region nrt
```

### 앱 재시작

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" apps restart biblemate
```

### 앱 스케일 조정

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 0  # 중지
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 1  # 시작
```

---

## 트러블슈팅

### 문제: 앱이 계속 재시작됨

1. 로그 확인: `fly logs`
2. 일반적인 원인:
   - 모듈을 찾지 못함 → 경로 확인
   - 볼륨 마운트로 파일 덮어씌워짐 → 설정 파일과 데이터 분리

### 문제: DB 데이터가 유지되지 않음

- sql.js는 메모리 DB이므로 앱 실행 중 파일 업로드해도 반영 안 됨
- 해결: 앱 중지 → 파일 업로드 → 앱 시작
- 또는: 시드 DB 방식 사용 (Dockerfile에 포함)

### 문제: SFTP 연결 안 됨

```
Error: app has no started VMs
```
→ 앱이 중지된 상태. `fly scale count 1`로 시작 후 재시도

---

## 비용

| 항목 | 비용 |
|------|------|
| VM (shared-cpu-1x) | 무료 크레딧 내 |
| Volume 1GB | ~$0.15/월 |
| **총 예상** | **~$1-2/월** |

> Fly.io는 월 $5 무료 크레딧 제공 → 낮은 트래픽에서 실질적으로 무료

---

## 접속 URL

- **앱**: https://biblemate.fly.dev
- **헬스체크**: https://biblemate.fly.dev/api/health
- **대시보드**: https://fly.io/apps/biblemate
