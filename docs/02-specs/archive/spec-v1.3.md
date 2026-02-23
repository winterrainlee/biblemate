# Bible Reading Mate v1.3 Specification

- 최초 생성일: 2026-01-08
- 최신 수정일: 2026-01-08

## 개요
- 버전: v1.3.0
- 목표: **"백업 안정성 강화 및 UX 개선"**
- 상태: **개발 중**

## v1.3 최종 범위

| 우선순위 | 기능 | 상태 |
|----------|------|------|
| ✅ 완료 | 백업 포맷 개선 (app_version + schema_version) | 완료 |
| ✅ 완료 | Import 필수 필드 검증 | 완료 |
| ✅ 완료 | 에러 응답 표준화 (error_code) | 완료 |
| ✅ 완료 | 하위 호환성 처리 | 완료 |
| ✅ 완료 | UI 에러 메시지 개선 | 완료 |
| ✅ 완료 | Import 용량 제한 (5mb) | 완료 |
| ✅ 완료 | 데이터 무결성 검사 (논리적 검증) | 완료 |
| ✅ 완료 | **화면 분할 비율 조정** | 완료 |

---

## 주요 구현 기능

### 1. 백업 JSON 포맷 개선

#### 기존 포맷 (v1.2.1)
```json
{
  "version": "1.1",
  "exported_at": "2026-01-08T...",
  "data": { ... }
}
```

#### 신규 포맷 (v1.3.0)
```json
{
  "app_version": "1.3.0",
  "schema_version": 1,
  "exported_at": "2026-01-08T...",
  "data": {
    "reading_logs": [...],
    "notes": [...],
    "highlights": [...]
  }
}
```

**설계 근거:**
- `app_version`: 내보낸 앱 버전 (디버깅/지원 용도)
- `schema_version`: 데이터 구조 버전 (호환성 체크용, 정수형)
- 하위 호환: 레거시 `version: "1.1"` 백업은 `schema_version: 1`로 간주

---

### 2. Import 검증 강화

#### 필수 필드 정의
| 테이블 | 필수 필드 |
|--------|-----------|
| `reading_logs` | `date`, `book`, `chapter_from`, `chapter_to` |
| `notes` | `date`, `content` |
| `highlights` | `book`, `chapter`, `verse` |

#### 기본값 자동 채움
| 필드 | 조건 | 기본값 |
|------|------|--------|
| `highlights.style` | 누락 시 | `"yellow"` |
| `*.created_at` | 누락 시 | 현재 시간 (ISO 8601) |
| `*.updated_at` | 누락 시 | 현재 시간 (ISO 8601) |

---

### 3. 에러 응답 표준화

#### 응답 형식
```javascript
// 성공
{ ok: true, imported: { reading_logs: 10, notes: 5, highlights: 20 } }

// 실패
{ ok: false, error_code: "ERROR_CODE", message: "상세 메시지" }
```

#### 에러 코드 정의
| 코드 | 상황 | HTTP |
|------|------|------|
| `INVALID_FORMAT` | JSON 파싱 실패 또는 data 객체 누락 | 400 |
| `UNSUPPORTED_SCHEMA` | 지원하지 않는 schema_version | 400 |
| `INVALID_SCHEMA` | 필수 필드 누락 | 400 |
| `IMPORT_FAILED` | 데이터베이스 오류 | 500 |

---

### 4. 하위 호환성 정책

| 입력 | 처리 |
|------|------|
| `version: "1.1"` (레거시) | `schema_version: 1`로 간주, 정상 처리 |
| `schema_version: 1` | 정상 처리 |
| `schema_version` 없음 + `version` 없음 | `INVALID_FORMAT` 에러 |
| `schema_version: 2+` (미래) | `UNSUPPORTED_SCHEMA` 에러 + 앱 업그레이드 안내 |

---

### 5. 화면 분할 비율 조정

#### 문제
- "묵상 집중" 모드(말씀 영역 OFF)에서 노트 에디터가 고정 높이(35vh)로 유지됨
- 말씀 영역이 없어도 노트 영역이 화면 하단에 작게 표시됨

#### 해결
| 모드 | 말씀 | 묵상 | 노트 영역 높이 |
|------|------|------|----------------|
| 기본 | ✅ | ✅ | 35vh (현재 유지) |
| 말씀 집중 | ✅ | ❌ | 0 (숨김) |
| 묵상 집중 | ❌ | ✅ | **100% (전체 화면)** |

#### 구현
- `ReadingDashboard.jsx`: 조건부 클래스 `full-height` 추가
- `ReadingDashboard.css`: `.note-editor-wrapper.full-height` 스타일 추가

---

## 마일스톤

### 백업 안정성 (완료)
- [x] Task 1: 백업 Export 포맷 변경 (app_version + schema_version)
- [x] Task 2: Import 검증 로직 구현
- [x] Task 3: 에러 응답 표준화
- [x] Task 4: 하위 호환성 처리
- [x] Task 5: UI 에러 메시지 개선

### 추가 기능 (완료)
- [x] Task 6: Import 용량 제한 (5mb)
- [x] Task 7: 데이터 무결성 검사 (논리적 검증)
- [x] Task 8: 화면 분할 비율 조정

## 참고 문서
- [codex-proposal-v1.3.md (v1.3 추가 우선순위)](../logs/codex-proposal-v1.3.md)

