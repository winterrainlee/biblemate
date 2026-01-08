# Bible Reading Mate v1.3 Specification

- 최초 생성일: 2026-01-08
- 최신 수정일: 2026-01-08

## 개요
- 버전: v1.3.0
- 목표: **"백업 안정성 강화 및 데이터 무결성 보장"**
- 상태: **개발 중**

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

## 마일스톤

- [ ] Task 1: 백업 Export 포맷 변경 (app_version + schema_version)
- [ ] Task 2: Import 검증 로직 구현
- [ ] Task 3: 에러 응답 표준화
- [ ] Task 4: 하위 호환성 처리
- [ ] Task 5: UI 에러 메시지 개선
- [ ] Task 6: 테스트 및 검증

## 참고 문서
- [implementation_plan.md (Antigravity)](file:///C:/Users/winte/.gemini/antigravity/brain/2e970794-4970-48f3-a3d6-cc89e0d1cade/implementation_plan.md)
