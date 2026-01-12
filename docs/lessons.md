# Lessons Learned & Best Practices

Bible Reading Mate 프로젝트를 진행하며 각 버전(v1.0 ~ v1.3.1)에서 습득한 기술적 교훈과 베스트 프랙티스를 정리한 문서입니다.

---

## 1. Database & Data Integrity (데이터 무결성)

데이터는 서비스의 핵심 자산이며, 특히 외부 데이터 연동 시에는 엄격한 검증과 방어 로직이 필수적입니다.

### 🛡️ 데이터 신뢰성 및 검증
- **네트워크 I/O와 버퍼 처리 (The Buffer Rule)** `v1.3.1`
  - `https.get` 등으로 텍스트 수신 시 `string` 결합을 피하고 반드시 `Buffer.concat`을 사용해야 합니다. 멀티바이트(한글) 문자가 청크 경계에서 잘려 `\uFFFD`(Replacement Character)로 영구 손상되는 것을 방지합니다.
- **외부 데이터 교차 검증 (Cross-Validation)** `v1.3.1`
  - 신뢰할 수 있는 소스(GitHub 등)라도 구조적 오류(예: 욥기 35:16 병합 사고)가 있을 수 있습니다. 임포트 시 예상 레코드 수와 실제 수를 대조하는 로직이 필수입니다.
- **검증의 자동화 (Direct Inspection)** `v1.3.1`
  - UI 레벨 검증은 한계가 있습니다. SQL(`LIKE '%\uFFFD%'`)을 직접 실행하는 검증 스크립트(`scan-corrupted-db.js`)로 숨겨진 결함을 찾아야 합니다.

### 🕵️ 검증 전략 (The Proxy Trap)
- **Proxy Trap 회피** `v1.3.1`
  - "파일로 Export해서 라인 별로 검사하자"는 접근은 위험합니다. Text File은 DB의 **Proxy(대리자)**일 뿐입니다.
  - Export 과정에서 개행 문자 등이 섞이면 라인 번호가 밀려(Shifting), DB는 멀쩡한데 데이터가 꼬인 것처럼 보이는 착시를 일으킵니다.
  - **Lesson**: 검증은 중간 단계를 거치지 말고, `scan-corrupted-db.js`처럼 **DB에 직접 쿼리**하여 상태를 확인해야 합니다.
- **Dirty Data에 대한 가정** `v1.3.1`
  - "JSON 텍스트 필드에 설마 엔터가 있겠어?"라는 안일한 가정이 디버깅 시간을 낭비하게 만듭니다. 외부 데이터는 항상 정규화(Normalization, 예: 개행 제거) 후 처리해야 합니다.

### 💾 백업 및 복구 전략
- **복구 시 `INSERT OR REPLACE` 사용** `v1.3.1`
  - 누락된 데이터를 복구할 때 `UPDATE` 문은 무용지물입니다. 없는 데이터는 생성하고 있는 데이터는 덮어쓰는 `INSERT OR REPLACE` 전략을 사용하세요.
- **데이터 저장 커밋 (`saveDB`)** `v1.2.1`
  - `sql.js`와 같은 인메모리/파일 기반 DB 사용 시, 트랜잭션 후 반드시 파일 시스템으로의 동기화(`saveDB`)를 명시적으로 호출해야 데이터 유실을 막을 수 있습니다.
- **SQLite 라이브러리 선정** `v1.0`
  - 배포 환경(Node/Python 버전 등)에 제약이 많다면, 네이티브 빌드가 필요한 `better-sqlite3` 대신 WebAssembly 기반의 `sql.js`가 이식성 면에서 유리합니다.

---

## 2. Infrastructure & Architecture (인프라 및 아키텍처)

### 🏗️ Docker 및 클라우드 배포
- **Build-time DB Generation** `v1.1`
  - 클라우드 배포 시 DB 시딩(Seeding) 전략이 중요합니다. Docker 빌드 단계(`db-builder`)에서 DB를 미리 생성해두고, 런타임(`entrypoint.sh`)에 볼륨으로 복사하는 방식을 사용하면 초기 구동 속도와 데이터 지속성을 모두 확보할 수 있습니다.
- **Environment Parity (환경 일치)** `v1.2`
  - 코드 상의 경로(`server/data`)와 실제 배포 환경의 볼륨 마운트 경로가 일치하는지 항상 확인해야 합니다. 경로 불일치는 "데이터 증발"처럼 보이는 치명적 UX 제로 직결됩니다.

### 🔌 API 및 네트워크
- **상대 경로 사용** `v1.2.1`
  - 클라이언트에서 API 호출 시 `http://localhost:3001` 하드코딩을 피하고 `/api/...` 상대 경로를 사용해야 로컬/프로덕션 환경 모두에서 프록시 설정을 통해 유연하게 작동합니다.
- **CORS 및 인증 (`credentials`)** `v1.1`, `v1.2.1`
  - 포트가 다른 클라이언트-서버 통신 시 인증 쿠키를 주고받으려면:
    1. 서버: `cors({ credentials: true, origin: ... })`
    2. 클라이언트: `fetch(..., { credentials: 'include' })`
    이 두 가지 설정이 반드시 쌍으로 맞아야 합니다.

---

## 3. Frontend & UX (사용자 경험)

### 🎨 UI/UX 디자인
- **사용자 맥락 중심의 기본값 (Contextual Defaults)** `v1.2`
  - "당연한 기본값"은 없습니다. 앱 실행 시 단순히 1페이지를 보여주는 것보다, 사용자가 '마지막으로 읽던 곳'을 띄워주는 것이 훨씬 좋은 UX입니다.
- **커스텀 양식의 힘** `v1.2`
  - 범용적인 템플릿(SOAP 등)보다, 사용자가 정의할 수 있는 유연한 양식이나 레이아웃이 실제 사용 만족도를 높입니다. 기획 단계에서 ASCII Art 등으로 레이아웃을 미리 합의하면 소통 비용을 줄일 수 있습니다.
- **동적 상태와 UI** `v1.2`
  - 구절 클릭과 같이 단순한 액션에도 여러 맥락(메모, 하이라이트 등)이 포함될 때는 '팝업' UI가 효과적입니다.

### ⚛️ React 개발 패턴
- **Atomic State Management** `v1.2`
  - '책 변경' 시 '장 번호 리셋'과 같이 연관된 상태 변경은 `handleBookChange` 같은 단일 핸들러 내에서 원자적(Atomic)으로 처리해야 버그를 예방할 수 있습니다.
- **전역 상태 도입 시점** `v1.0`
  - 처음부터 Redux/Context를 도입하지 말고, `Settings`(테마, 폰트)와 같이 전역적 필요성이 명확해지는 시점에 도입해도 늦지 않습니다 (`Props Drilling`의 고통이 느껴질 때가 적기입니다).

---

## 4. Development Environment (개발 환경)

### 🪟 Windows 환경 대응
- **인코딩 (BOM)** `v1.0`, `v1.2`
  - PowerShell로 생성한 파일(`.env` 등)에 BOM(Byte Order Mark)이 포함되어 Node.js가 읽지 못하는 경우가 빈번합니다. `[System.IO.File]::WriteAllText` 등을 사용하여 표준 UTF-8(No BOM)을 준수해야 합니다.
- **터미널 호환성** `v1.0`
  - `npx` 권한 문제나 명령어(`mkdir`) 차이로 스크립트가 실패할 수 있습니다. `cmd /c` 래퍼를 사용하거나 Node.js 스크립트로 툴링을 대체하는 것이 이식성에 좋습니다.

---

## 5. Mobile Layout Debugging (모바일 레이아웃) `v1.4.1`

### 📱 모바일 공백 버그 추적
- **Inline Style 추적의 중요성** `v1.4.1`
  - CSS 파일 외에 JSX 내 inline `style` 속성도 공백의 원인이 될 수 있습니다. `marginTop`, `bottom` 같은 spacing 속성을 전체 검색해야 합니다.
- **Responsive 간격 분리** `v1.4.1`
  - 데스크톱(2rem)과 모바일(0.5rem~1rem)에서 적절한 간격이 다릅니다. 미디어 쿼리로 분리하거나, 처음부터 작은 값으로 통일하는 것이 안전합니다.
- **Sticky Position과 Bottom 값** `v1.4.1`
  - `position: sticky; bottom: 2rem;`은 데스크톱에서 보기 좋지만 모바일에서는 불필요한 공백을 유발합니다. 모바일 우선 설계 시 `bottom: 0.5rem` 정도가 적절합니다.

