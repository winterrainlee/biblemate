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

## CORS 보안 설정 (선택사항)

내 앱 도메인(예: `https://biblemate.fly.dev`) 외의 다른 사이트에서 API를 호출하지 못하도록 보안을 강화하려면 `ALLOWED_ORIGINS` 환경변수를 설정하세요:

```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" secrets set ALLOWED_ORIGINS="https://biblemate.fly.dev"
```

여러 도메인을 허용하려면 쉼표(`,`)로 구분하세요:
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" secrets set ALLOWED_ORIGINS="https://biblemate.fly.dev,https://my-domain.com"
```

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

> [!WARNING]
> **성경 DB 수정 배포 주의**
> `server/data/bible.db`가 바뀐 배포는 `fly deploy`만으로 운영 데이터가 바뀌지 않습니다.
> 현재 entrypoint는 `/app/server/data/bible.db`가 없을 때만 시드 DB를 복사하므로, 이미 볼륨 DB가 있으면 기존 운영 DB가 그대로 유지됩니다.
> 또한 `sql.js` 기반 서버는 메모리 DB를 종료 시 파일로 저장할 수 있으므로, 운영 DB 교체는 반드시 **앱 중지 상태**에서 수행해야 합니다.

### 성경 DB 교체 배포 절차

성경 본문 교정, 재임포트, `bible-corrections.json` 반영처럼 `server/data/bible.db` 자체가 바뀐 경우에는 아래 절차를 따릅니다.

1. 로컬에서 최종 `server/data/bible.db`를 생성하고 검증합니다.
   - 예: 책 수/총 절 수 확인, 샘플 구절 대조, 교정 반영 확인
2. 일반 배포를 먼저 수행합니다.
   - `& "$env:USERPROFILE\.fly\bin\flyctl.exe" deploy`
3. 운영 앱을 중지합니다.
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 0 -a biblemate --yes
```
4. 운영 볼륨 ID를 확인합니다.
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" volumes list -a biblemate
```
5. 운영 볼륨을 붙인 유지보수 머신을 띄웁니다.
   - 운영 앱이 꺼진 상태에서 같은 볼륨에 접근하기 위한 임시 머신입니다.
6. 기존 운영 DB를 백업합니다.
   - 예: `/app/server/data/bible.db.bak-YYYYMMDD-HHMMSS`
7. 검증된 로컬 `server/data/bible.db`를 운영 볼륨의 `/app/server/data/bible.db`로 교체합니다.
   - 파일이 크면 `fly ssh sftp put` 또는 유지보수 머신 경유 업로드를 사용합니다.
8. 유지보수 머신을 제거하고 서비스 머신을 다시 시작합니다.
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 1 -a biblemate --yes
```
9. 재기동 후 운영 검증을 수행합니다.
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" status -a biblemate
curl https://biblemate.fly.dev/api/health
```
   - 필요 시 운영 머신 안에서 `bible.db`를 직접 조회해 샘플 구절을 확인합니다.

### DB 교체 체크리스트

- 앱 중지 전: 사용자 데이터 백업 여부 확인
- 교체 전: 운영 DB 백업 파일 생성
- 교체 후: `/api/health` 확인
- 교체 후: 본문 샘플 검증
  - 예: `겔 27:36`, `겔 16:63`, `창 1:1`
- 교체 후: 서비스 머신이 기대한 볼륨 ID를 다시 사용 중인지 확인

### 롤백

운영 DB 교체 후 문제가 생기면 아래 순서로 즉시 복구합니다.

1. 앱 중지
2. 유지보수 머신으로 볼륨 재접속
3. 백업본을 원래 이름으로 복원
4. 앱 재기동

예시:
```powershell
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 0 -a biblemate --yes
# 유지보수 머신에서:
# cp /app/server/data/bible.db.bak-YYYYMMDD-HHMMSS /app/server/data/bible.db
& "$env:USERPROFILE\.fly\bin\flyctl.exe" scale count 1 -a biblemate --yes
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

### 문제: `fly deploy` 후에도 성경 본문이 예전 상태로 보임

- 원인: 운영 볼륨의 기존 `bible.db`가 유지되고, 새 이미지에 포함된 seed DB는 복사되지 않음
- 확인:
  - `fly volumes list -a biblemate`
  - 운영 머신에서 `/app/server/data/bible.db` 타임스탬프/샘플 구절 직접 조회
- 해결:
  - 본 가이드의 `성경 DB 교체 배포 절차`대로 운영 볼륨 DB를 직접 교체

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
