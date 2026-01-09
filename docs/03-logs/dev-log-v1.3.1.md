# Bible Reading Mate v1.3.1 Development Log

## 개발 정보
- **시작일**: 2026-01-09
- **목표 버전**: v1.3.1 (Hotfix & Data Integrity)
- **주요 목표**: 성경 텍스트 무결성 확보 (문자 깨짐 및 구조적 오류 해결)

---

## 작업 기록

### 2026-01-09 (성경 데이터 정결화)
#### 개발 내용
- **패치 시스템 (Corrections System)**:
  - `bible-corrections.json` 도입: 원본 데이터를 건드리지 않고 수정 사항을 오버라이딩하는 구조.
  - 총 **517개** 구절 수정 (모세오경, 역사서, 시가서, 선지서, 신약 포함).
- **데이터 무결성 확보**:
  - `import-bible.js` 개선: 
    - HTML 엔티티(`&#x27;` 등) 디코딩 로직 추가.
    - 네트워크 수신 시 `Buffer` 처리로 UTF-8 문자 깨짐(`\uFFFD`) 근본 해결.
    - `INSERT OR REPLACE` 적용으로 누락된 구절 복구 가능.
- **구조적 오류 수정 (Critical Fix)**:
  - **욥기 35:16 ~ 42장**: 원본 데이터 병합으로 뭉개진 203개 구절을 개역한글 원문으로 전면 교체.
  - 시편, 요한계시록 등에서 발견된 음절 탈락 및 오삽입 수정.

#### Retrospective & Troubleshooting
1.  **Issue: "Shifting" Phenomenon (손상 이동 현상)**
    - **문제**: 특정 구절을 수정하면 인접한 다른 구절이 깨지는 현상이 반복됨.
    - **원인**: 초기에는 Byte Offset 문제로 추정했으나, 실제로는 **욥기 35:16**과 같이 거대한 텍스트 덩어리가 병합되어 있어 라인 번호 기반 스캔(`find-corrupted.js`)이 오작동했던 것.
    - **해결**: DB 직접 쿼리 방식(`scan-corrupted-db.js`)으로 전환하여 정확한 타겟팅 가능해짐.

2.  **Issue: 간헐적 문자 깨짐 (\uFFFD)**
    - **문제**: 수정 후에도 `scan-corrupted-db.js`에서 140여 개의 새로운 깨진 문자가 발견됨.
    - **원인**: Node.js `https` 모듈 사용 시, 한글(3바이트)이 청크 경계에서 잘리면 `string` 변환 과정에서 깨짐 발생.
    - **해결**: `Buffer`로 전체 데이터를 수집 후 한 번에 디코딩하는 방식으로 구조 변경.
    - **교훈**: 멀티바이트 문자열을 다루는 네트워크 I/O에서는 반드시 Buffer 처리를 우선해야 함.

3.  **Issue: 욥기 데이터 구조 붕괴**
    - **문제**: 욥기 36장 내용이 35:16에 포함되어 있고, 37장이 36장으로 밀리는 등 7개 장(Chapter) 전체가 어긋남.
    - **해결**: 단순 텍스트 수정이 불가능하여, 대한성서공회 원문을 확보해 해당 범위(203구절)를 통째로 재생성(Re-insert).
    - **결과**: 구조 및 텍스트 완벽 복원.

---

## 최종 결과 (Verification)
- **전수 검사**: `scan-corrupted-db.js` 실행 결과 **Corrupted 0건**.
- **샘플 검증**: 창세기(난이도 높음), 욥기(구조적 오류), 요한계시록(음절 탈락) 등 주요 취약점 브라우저 대조 완료.
- **적용**: v1.3.1 배포 준비 완료.

---

## Lessons Learned & Best Practices (DB & Data Integrity)

이번 대규모 성경 데이터 정제 작업을 통해 얻은 핵심 교훈을 정리합니다. 향후 DB 관련 작업 및 외부 데이터 연동 시 반드시 참고해야 합니다.

### 1. 네트워크 I/O와 문자 인코딩 (The Buffer Rule)
- **교훈**: `https.get` 등으로 대량의 텍스트 데이터를 수신할 때, **절대 `string`으로 청크(chunk)를 직접 연결하지 마세요.**
- **이유**: 한글과 같은 멀티바이트 문자(UTF-8 3byte)가 네트워크 패킷 경계에서 잘려서 들어올 수 있습니다. 이때 `chunk.toString()`을 호출하면 잘린 바이트가 `\uFFFD`(Replacement Character)로 영구 변환되어 데이터가 손상됩니다.
- **해결책**:
  ```javascript
  // ❌ Bad
  res.on('data', chunk => data += chunk); 
  
  // ✅ Good
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const data = buffer.toString('utf8');
  });
  ```

### 2. 외부 데이터의 구조적 맹점 (Trust, but Verify)
- **교훈**: 신뢰할 수 있는 소스(GitHub 등)라도 데이터 포맷이나 구조적 정합성을 100% 확신하지 마세요.
- **사례**: JSON 파일 내에서 `Job 35:16`이라는 단일 키에 `Job 36` 전체 내용이 텍스트로 병합되어 있었습니다. 이로 인해 단순 파싱으로는 36장 이후의 모든 장/절 매핑이 어긋나는 결과를 초래했습니다.
- **Best Practice**:
  - `import` 로직 작성 시, 예상되는 레코드 수(Verse count)와 실제 임포트 된 수가 일치하는지 교차 검증하는 로직을 필수적으로 포함하세요.

### 3. 복구 전략: UPDATE vs INSERT OR REPLACE
- **교훈**: 데이터 훼손이 "누락"을 동반하는 경우, `UPDATE` 문은 무용지물입니다.
- **상황**: 욥기 구조 오류로 인해 DB에 아예 존재하지 않는 구절(Missing Rows)이 발생했습니다. `UPDATE` 문은 대상 행이 없어 아무런 동작을 하지 않았고, 겉보기에 에러가 없었기에 문제 해결이 지연되었습니다.
- **해결책**: 데이터 무결성을 강제해야 하는 복구 스크립트에서는 `INSERT OR REPLACE` (SQLite) 또는 `UPSERT` 구문을 사용하여, 없는 데이터는 새로 생성하고 있는 데이터는 덮어쓰는 강력한 전략을 취해야 합니다.

### 4. 검증의 자동화 (Direct DB Inspection)
- **교훈**: 애플리케이션 레벨(UI)에서의 검증은 한계가 있습니다. 반드시 **DB 레벨에서 직접 쿼리**하는 검증 스크립트를 작성하세요.
- **적용**: `scan-corrupted-db.js`와 같이 SQL을 직접 실행하여 `LIKE '%\uFFFD%'` 조건 등을 전수 조사하는 스크립트가 있었기에, 140여 개의 숨겨진 깨진 문자를 찾아낼 수 있었습니다.
