# Lessons Learned & Best Practices

> **마지막 업데이트: 2026-04-30**

Bible Reading Mate 프로젝트를 진행하며 각 버전(v1.0 ~ v2.1)에서 습득한 기술적 교훈과 베스트 프랙티스를 정리한 문서입니다.

---

## 1. Database & Data Integrity (데이터 무결성)

데이터는 서비스의 핵심 자산이며, 특히 외부 데이터 연동 시에는 엄격한 검증과 방어 로직이 필수적입니다.

### 🕵️ 데이터 신뢰성 및 검증
- **네트워크 I/O와 버퍼 처리 (The Buffer Rule)** `v1.3.1`
  - `https.get` 등으로 텍스트 수신 시 `string` 결합을 피하고 반드시 `Buffer.concat`을 사용해야 합니다. 멀티바이트(한글) 문자가 청크 경계에서 잘려 `\uFFFD`(Replacement Character)로 영구 손상되는 것을 방지합니다.
- **외부 데이터 교차 검증 (Cross-Validation)** `v1.3.1`
  - 신뢰할 수 있는 소스(GitHub 등)라도 구조적 오류(예: 민기 35:16 병합 사고)가 있을 수 있습니다. 임포트 시 예상 레코드 수와 실제 매수를 대조하는 로직이 필수입니다.
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
- **레거시 API 호환성 유지 (Backend Facade)** `v2.0`
  - V2 업데이트로 테이블 구조가 변경(`notes` ➔ `free_notes`)되었더라도, 모든 프론트엔드 코드를 즉시 수정하기 어렵다면 서버 API 레이어에서 기존 엔드포인트가 신규 테이블을 바라보도록 맵핑하세요. 이는 작업의 원자성을 보장하고 UI가 깨지는 것을 방지하는 안전한 브릿지 역할을 합니다.

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

---

## 6. DB Migration & Scripting (DB 마이그레이션) `v2.0`

### 🧪 Node.js ESM 환경에서의 스크립팅
- **Dynamic Import와 환경 변수** `v2.0`
  - Node.js에서 ESM(`import`)은 모듈 평가(Evaluation)가 코드 실행보다 먼저 일어납니다(Hoisting).
  - 따라서 `process.env.MY_VAR = '...'` 설정 후 `import { ... } from './config.js'`를 호출하면, `config.js` 내부에서는 환경 변수가 설정되기 전 값을 참조할 수 있습니다.
  - **Lesson**: 테스트 스크립트 등에서 런타임에 환경 설정을 주입해야 한다면 `await import(...)` (Dynamic Import)를 사용하여 실행 순서를 제어해야 합니다.

### 🧹 DB Connection 관리
- **Connection Leak 방지** `v2.0`
  - 마이그레이션 테스트처럼 하나의 프로세스에서 DB 연결→종료→재연결을 반복할 때, `sql.js` (WebAssembly)나 파일 핸들이 완전히 해제되지 않아 `assertion failed`나 `EBUSY` 에러가 발생할 수 있습니다.
  - 명시적인 `close()` 호출뿐만 아니라, 필요하다면 프로세스를 분리하거나 가비지 컬렉션을 고려해야 합니다.

### 🔧 Windows PowerShell API 테스트
- **curl vs Invoke-RestMethod** `v2.0`
  - Windows PowerShell에서 `curl`은 `Invoke-WebRequest`의 별칭으로, Unix/Linux의 curl과 문법이 다릅니다.
  - API 테스트 시 `-H "Content-Type: application/json"` 대신 `-ContentType "application/json"`을 사용해야 하며, JSON body는 single quote로 감싸야 합니다.
  - **Lesson**: 크로스 플랫폼 스크립트에서는 `Invoke-RestMethod` (PowerShell)와 `curl` (bash/cmd)를 구분하여 사용하세요.

---

## 7. React State Coordination & Navigation `v2.0`

### 🔄 부모-자식 간의 상태 동기화 (Targeted State Update)
- **책/장 네비게이션 동기화** `v2.0`
  - 자식 컴포넌트(`BibleViewer`)에서 '이전 책의 마지막 장'으로 이동하는 것과 같이 복합적인 상태 변경이 필요할 때, 부모의 핸들러(`handleBookChange`)가 단순히 책 ID만 받는 것이 아니라 선택적으로 `chapterId`를 받도록 확장해야 합니다.
  - **Lesson**: `handleBookChange = (bookId, chapterId = 1) => { ... }`와 같이 기본 매개변수를 활용하면 기존 호출처는 유지하면서 특정 시나리오에서의 정밀한 제어가 가능해집니다.

### 🛡️ 삭제된 기능 복구 (The Overwrite Accident)
- **도구 사용 오류와 코드 유실** `v2.0`
  - `multi_replace_file_content`와 같은 도구를 사용할 때, 타겟 범위가 겹치거나 잘못 지정되면 의도치 않게 기존 함수가 삭제될 수 있습니다. (예: `ReadingDashboard`의 핵심 핸들러 유실 사고)
  - **Lesson**: 대규모 코드 수정 후에는 반드시 Health Check(`npm run dev`)를 수행하고, 화면이 나오지 않는다면 즉시 최근의 파일 수정 이력을 검토하여 유실된 함수가 없는지 확인해야 합니다.

---

## 8. Mobile/Tablet Web Experience `v2.0`

### 🚫 브라우저 기본 제스처 차단 (Overscroll Lock)
- **Swipe-to-navigate 충돌** `v2.0`
  - 태블릿 브라우저에서 가로 스크롤이나 대각선 스크롤 시 '뒤로 가기/앞으로 가기' 제스처가 발동되어 앱 사용 흐름을 방해할 수 있습니다.
  - **Lesson**: `html`, `body`에 `overscroll-behavior: none;`을 적용하면 시스템 수준의 swipe navigation을 차단할 수 있습니다. 또한 `touch-action: pan-y;`를 통해 터치 동작을 필요한 방향(수직 스크롤)으로만 한정시키는 것이 좋습니다.


---

## 9. Feature Implementation & Debugging Details `v2.0`

### 🔑 데이터 키 관리 (Semantic Keys over Raw Values)
- **Hex Code Key의 위험성**:
  - 색상 코드(`#fef08a`)를 객체의 키로 직접 사용하면, 대소문자 차이(`F` vs `f`)나 미세한 값 변경 시 데이터 정합성이 깨집니다.
  - **Lesson**: 변동 가능한 값(Value) 대신 변하지 않는 의미론적 키(Semantic Key, 예: `yellow`, `green`)를 사용하여 데이터 구조의 안정성을 확보하세요.
- **다크 모드와 하드코딩의 충돌** `v2.0`
  - JS에서 `backgroundColor: '#...` 처럼 헥사 코드를 직접 컴포넌트에 넘기면 CSS의 다크 모드 변수(`:root.dark`)가 적용되지 않습니다.
  - **Lesson**: 테마에 따라 변해야 하는 색상은 반드시 CSS 변수(`var(--pk-color-...)`)를 사용하거나, DB에 저장된 레거시 값을 렌더링 시점에 변수로 치환하는 **Theme Mapping Layer**를 경유하게 하세요.

### 📦 컴포넌트 간 데이터 전달 (The Delivery Accident)
- **로직 완벽, 연결 실패** `v2.0`
  - 부모에서 데이터를 완벽하게 넘겨주더라도 자식 컴포넌트의 Props 비구조화 할당 목록에서 누락되면 `ReferenceError`와 함께 화면이 멈추게 됩니다.
  - **Lesson**: 신규 데이터를 컴포넌트에 주입할 때는 반드시 **Props 선언부**, **Prop 전달부**, **사용부** 이 세 지점을 모두 확인해야 합니다.

### ⚖️ 타입 비교의 함정 (Strict vs Loose)
- **DB(Number) vs API(String)** `v2.0`
  - SQLite 등 DB에서는 숫자로 저장되더라도, JSON API를 거치거나 클라이언트 상태로 넘어올 때 문자열로 변환될 수 있습니다.
  - **Lesson**: ID나 구절 번호 같은 식별자를 비교할 때 `===` (Strict Equality)가 실패한다면, 데이터 출처가 서로 다른지 확인하고 `==` (Loose Equality)를 사용하거나 명시적인 형 변환(`Number()`)을 수행하여 동기화 오류를 방지하세요.

### 📱 모바일 적응형 레이아웃 (Adaptive Hiding)
- **복잡한 재배치 대신 숨김**:
  - 데스크톱의 3단 레이아웃을 모바일에서 모두 보여주려 하면 오히려 사용성을 해칩니다.
  - **Lesson**: 모바일에서는 핵심 경험(성경 읽기)에 집중하기 위해 보조 패널(사이드바)을 과감히 숨기고(`display: none`), 본문을 1단으로 단순화하는 것이 훌륭한 최적화 전략입니다.

### 💾 데이터 지속성의 함정 (The Persistence Trap)
- **메모리 vs 파일 시스템**:
  - `sql.js`와 같은 인메모리 기반 DB는 프로세스 종료 시점(`exit`)에 파일로 저장(`saveDB`)하는 로직이 있을 수 있습니다.
  - 테스트를 위해 외부 스크립트로 DB 파일을 삭제하거나 초기화하더라도, 실행 중인 메인 서버 프로세스가 살아있다면 종료 시점에 메모리의 데이터를 다시 덮어써서 초기화를 무효화시킵니다.
  - **Lesson**: DB 초기화나 복원 테스트를 수행할 때는 반드시 관련 서버 프로세스를 확실하게 종료(`taskkill`)하여 메모리 상의 데이터가 파일을 덮어쓰는 상황을 방지하세요.

---

## 10. UI Interaction & CSS Layout `v2.0`

### 🎈 이벤트 전파와 팝업 (Bubble Trouble)
- **외부 클릭 감지의 부작용**:
  - `document` 레벨에 '외부 클릭 시 팝업 닫기' 리스너가 걸려있을 때, 팝업 트리거 요소(구절)를 클릭하면 이벤트가 버블링되어 팝업이 열리자마자 닫히는 현상이 발생할 수 있습니다.
  - **Lesson**: 팝업 내부나 트리거 요소의 `onClick` 핸들러 시작 부분에 반드시 `e.stopPropagation()`을 추가하여 불필요한 이벤트 전파를 막아야 합니다.

### 📐 Flexbox와 텍스트 확장
- **Header Title 공간 확보**:
  - 팝업 헤더처럼 공간이 제한적인 곳에서 가변 길이 텍스트(예: 구절 범위)를 표시할 때, 단순히 `width`를 주면 레이아웃이 깨지기 쉽습니다.
  - **Lesson**: 텍스트 요소에 `flex: 1`을 주어 남은 공간을 모두 차지하게 하고, 옆의 고정 요소(닫기 버튼)에는 `flex-shrink: 0`을 명시하여, 텍스트가 늘어나도 버튼이 찌그러지지 않고 텍스트 영역만 최대로 확보되도록 하십시오.

### 🎯 액션 맥락과 이력 관리의 분리 (Context vs History) `v2.0`
- **'어제 읽음'과 '오늘 읽기'의 구분**:
  - 상단 헤더는 "이 장을 읽었는지 여부(이력)"를 보여주지만, 하단 완료 버튼은 "오늘의 일과를 수행했는지 여부(액션)"를 의미합니다.
  - **Lesson**: 하나의 상태(`isCompleted`)로 여러 목적을 달성하려 하지 말고, 목적에 맞는 별도의 상태(`isReadOnCurrentDate`)를 정의하여 사용자의 혼동을 방지하십시오.

### 🔐 로컬 인증 예외 처리 (Localhost Exception) `v2.0`
- **개발 생산성 vs 보안**:
  - `.env`에 비밀번호가 설정되어 있더라도, 개발자가 로컬(`localhost`)에서 매번 로그인하는 것은 비효율적입니다.
  - **Lesson**: 인증 미들웨어에서 `req.hostname === 'localhost'` 조건을 확인하여 로컬 환경은 무조건 통과시키는 예외 처리를 추가하면, 보안을 유지하면서 개발 경험(DX)을 해치지 않을 수 있습니다.

---

## 11. Phase 0 안정화 (Security & Date Parsing) `v2.0.1`

### 인증 예외 처리(Host 기반 예외의 위험)
- **Host 헤더 기반 localhost 예외 제거** `v2.0.1`
  - `req.hostname === 'localhost'` 조건은 요청 헤더 스푸핑으로 우회 가능성이 있습니다.
  - **Lesson**: 개발 편의는 `NODE_ENV` 분기 + dev 세션 TTL(예: `DEV_SESSION_DAYS`)로 확보하고, 운영 보안은 고정 정책으로 유지하세요.

### date-only 문자열 파싱 주의(타임존 하루 밀림)
- **`new Date('YYYY-MM-DD')` 지양** `v2.0.1`
  - 브라우저/OS 타임존에 따라 하루가 밀리는 문제가 발생할 수 있습니다.
  - **Lesson**: `date-fns`의 `parse(dateStr, 'yyyy-MM-dd', new Date())` 같은 **로컬 date-only 파서**를 유틸화해 일관 적용하세요.

---

## 12. 모바일 팝업 맥락 정보 패턴 `v2.1`

### 숨겨진 사이드바 대체 UI (Context in Popup)
- **문제**: 데스크톱에서 사이드바로 제공되는 정보(구절 위치, 구절 본문)가 모바일에서 `display: none`이 되면, 팝업 내부에서도 맥락 없이 데이터만 나열된다.
- **Lesson**: 반응형 레이아웃에서 주요 컨텍스트 패널을 숨길 경우, 해당 패널이 제공하던 **맥락 정보**가 대체 UI(팝업/드로어 등)에서도 충분히 표시되는지 확인하라. 특히 `popup` state에 이미 `verseText` 가 있는 경우처럼 **기존 state를 재사용**하면 추가 API 호출 없이 해결 가능하다.

### duplicate key 경고 조기 차단
- **`Modal.jsx`의 `bottom: 0` 중복 키** `v2.1`
  - 빌드 경고(`Duplicate key "bottom" in object literal`)가 이번 작업과 무관한 파일에서 발견됨.
  - **Lesson**: 기능 구현과 무관한 빌드 경고도 PR 전 정리하라. 경고 누적은 나중에 실제 버그를 경고 속에 묻히게 한다.

---

## 13. Cross-Tab Context Navigation `v2.1`

### 탭 간 컨텍스트 유지 및 이동
- **문제**: 사용자가 성경을 읽다가 관련 묵상을 더 자세히 보고 싶을 때, 수동으로 탭을 바꾸고 날짜를 찾는 과정이 번거롭다.
- **Lesson**: `TabContext`와 같은 전역 상태를 활용하여 **상호 참조(Cross-reference)**를 자동화하라. 이때 단순 탭 전환뿐만 아니라, 해당 기능의 매개변수(날짜, 대상 ID 등)를 함께 전달하여 전환된 뷰에서도 즉시 맥락이 유지되게 하는 것이 중요하다.
- **날짜 데이터 파싱 일관성**: 탭 간 이동 시 URL이나 문자열로 날짜를 넘길 경우, 반드시 `parseDateInput`과 같은 검증된 유틸을 사용하여 브라우저 타임존에 의한 '하루 밀림' 현상을 방지해야 한다.

---

## 14. Clipboard API & Copy UX `v2.1`

### 📋 모바일 Safari 클립보드 호환성 (Clipboard Fallback)
- **`navigator.clipboard.writeText()` 실패** `v2.1`
  - 데스크톱 브라우저에서는 정상 작동하지만, **iPhone Safari**에서는 `navigator.clipboard` API가 사용자 제스처 맥락 밖에서 거부(`NotAllowedError`)되거나 `window.isSecureContext`가 `false`인 경우 실패할 수 있다.
  - **Lesson**: `navigator.clipboard && window.isSecureContext` 조건으로 분기하고, 실패 시 **`textarea` + `document.execCommand('copy')`** 방식을 fallback으로 구현해야 한다. textarea는 `position: fixed; left: -9999px`로 숨기고 `focus()` → `select()` → `execCommand('copy')` → `removeChild()` 순서로 처리한다.

### 📝 복사 텍스트 포맷 설계 (Content-first Format)
- **구절 참조 위치** `v2.1`
  - 초기 포맷 `에스겔 8:1\n→ 묵상내용`은 구절 참조가 내용보다 먼저 나와 붙여넣기 후 읽을 때 흐름이 끊긴다.
  - **Lesson**: 묵상 내용이 핵심이므로 `묵상내용 (에스겔 8:1)` 형식처럼 **내용 우선(Content-first)**으로 배치하고, 구절 참조는 괄호로 부가 정보화하는 것이 가독성이 높다.

### 🎯 반복 카드 액션의 피드백 범위
- **개별 카드 복사 상태** `v2.1.4`
  - 리스트형 카드에서 하나의 `isCopied` boolean만 사용하면 모든 카드가 동시에 성공 상태처럼 보일 수 있다.
  - **Lesson**: 반복 항목의 액션 피드백은 `copiedItemId`처럼 대상 ID를 상태로 저장해, 사용자가 클릭한 항목에만 결과가 표시되도록 해야 한다.

---

## 15. Bible Text Hotfix & Partial Patching `v2.1.1`

### ⚡ 부분 패치(Partial Patch)의 효율성
- **문제**: 성경 본문 전체(수십만 구절)를 다시 임포트하는 것은 시간이 오래 걸리고 의도치 않은 회귀 버그(Regression)를 유발할 위험이 있음.
- **Lesson**: `bible-corrections.json`과 같은 교정 데이터 메커니즘이 있다면, 특정 구절들만 골라 트랜잭션으로 업데이트하는 **Standalone Hotfix Script** 방식이 훨씬 안전하고 빠름.

### 🔐 데이터 이관 시의 트랜잭션과 무결성
- **문제**: 수동으로 DB를 수정하면 실수로 데이터를 중복 생성하거나 유실할 수 있음.
- **Lesson**: 핫픽스 스크립트 작성 시 반드시 `BEGIN TRANSACTION`과 `COMMIT`을 사용하고, 작업 전후에 **구절 수(Verse Count) 비교**와 같은 자동 검증 로직을 포함하여 무결성을 보장하라.

---

## 16. HAN 소스 파싱 안정화와 마지막 절 경계 처리 `v2.1.3`

### 📌 역본 기준 불일치 방지
- **문제**: 동일 출처 사이트라도 `version` 파라미터(`GAE`, `HAN`)가 다르면 기준 본문이 달라질 수 있다.
- **Lesson**: 데이터 교정 스크립트는 URL 파라미터를 명시적으로 고정하고, 검증 문서와 코드가 같은 기준을 쓰는지 반드시 교차 점검하라.

### 🧩 마지막 절 오염(Footer 혼입) 방지
- **문제**: 절 marker 기반 파싱에서 마지막 절은 다음 marker가 없어서 페이지 하단 UI 텍스트(검색 영역 등)가 함께 들어올 수 있다.
- **Lesson**: 마지막 절은 `</font></span>` 같은 본문 종료 경계를 기준으로 추가 절단 로직을 넣어야 한다.

### 🛡️ 데이터 교정 스크립트는 기본 dry-run 우선
- **문제**: 외부 HTML 구조가 바뀌면 파서가 조용히 잘못된 텍스트를 저장할 수 있다.
- **Lesson**: `--dry-run`(트랜잭션 롤백) 모드를 기본 실행 경로로 만들고, 장별 연속 절/빈 텍스트/오염 패턴 검증을 통과한 뒤에만 실제 반영하라.

### 🧾 correction 데이터도 스키마 검증이 필요
- **문제**: `bible-corrections.json` 한 항목에 `verse`, `version` 필드가 빠져 있으면 전체 재임포트가 중간에 실패한다.
- **Lesson**: 본문 데이터뿐 아니라 correction JSON도 필수 필드 스키마 검증을 자동화하고, 배치 실행 전 누락 필드 여부를 먼저 확인하라.
