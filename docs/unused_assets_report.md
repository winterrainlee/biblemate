# 프로젝트 미사용 자산 분석 보고서

**작성일**: 2026-01-25
**마지막 업데이트**: 2026-01-25

## 개요
이 문서는 BibleMate 프로젝트의 전체 소스 코드를 분석하여, 현재 사용되지 않거나 참조되지 않는 코드, 파일 및 자산의 현황을 정리하고 정리(삭제) 작업을 수행한 기록입니다.

## 분석 기준
- v2.0 소스 코드 기준 (`client`, `server` 디렉토리)
- `App.jsx`, `index.js` 등 메인 진입점에서의 호출 구조 추적
- 파일 간 Import/Reference 관계 분석 (Grep 및 소스 코드 독해)

## 1. Frontend (Client) 미사용 자산

### 1.1 미사용 페이지 컴포넌트
다음 컴포넌트들은 소스 코드에는 존재하지만, 라우팅(`App.jsx`)에 등록되어 있지 않거나 실질적으로 접근할 수 없는 상태입니다.

| 파일 경로 | 파일명 | 분석 내용 | 처리 결과 |
|:--- |:--- |:--- |:--- |
| `client/src/pages/` | **Home.jsx** | `ReadingDashboard`로 대체됨 | **[삭제됨]** |
| `client/src/pages/` | **Bible.jsx** | `ReadingDashboard`로 대체됨 | **[삭제됨]** |
| `client/src/pages/` | **Notes.jsx** | 미사용/구현 미흡 | **[삭제됨]** |
| `client/src/pages/` | **Search.jsx** | `Sidebar.jsx` 메뉴에 존재하나 라우트 없음 | **[보존]** (추후 구현 예정) |

### 1.2 미사용 CSS 파일
| 파일 경로 | 파일명 | 분석 내용 | 처리 결과 |
|:--- |:--- |:--- |:--- |
| `client/src/pages/` | **Home.css** | `Home.jsx` 미사용에 따른 정리 필요 | 파일 없음 (확인됨) |
| `client/src/pages/` | **Bible.css** | `Bible.jsx` 미사용에 따른 정리 필요 | 파일 없음 (확인됨) |

### 1.3 미사용 정적 자산 (Assets)
| 파일 경로 | 파일명 | 분석 내용 | 처리 결과 |
|:--- |:--- |:--- |:--- |
| `client/src/assets/` | **react.svg** | 참조 없음 (Vite 기본 파일) | **[삭제됨]** |

---

## 2. Backend (Server) 미사용 코드

### 2.1 미사용/임시 스크립트
서버 루트 및 `scripts` 폴더에는 과거 데이터 마이그레이션이나 일회성 검증을 위해 작성된 스크립트들이 존재합니다.

| 분류 | 파일 경로 | 설명 | 권장 사항 |
|:--- |:--- |:--- |:--- |
| **마이그레이션** | `server/merge_db_data.js` | DB 데이터 병합 스크립트 | `scripts/legacy/` 등으로 이동 |
| **운영/검증** | `server/scan_bible_db.js` | 성경 DB 스캔용 | 필요 시 `scripts/`로 이동 |
| **운영/검증** | `server/query_free_notes.js` | 데이터 조회용 유틸리티 | 필요 시 `scripts/`로 이동 |
| **데이터 복구** | `server/scripts/restore_note_*.js` | 특정 날짜 노트 복구용 (일회성) | 아카이빙 또는 삭제 |
| **데이터 검증** | `server/scripts/check-note-*.js` | 특정 이슈 트래킹용 스크립트 | 아카이빙 또는 삭제 |

### 2.2 미사용 데이터 파일
| 파일 경로 | 파일명 | 분석 내용 | 비고 |
|:--- |:--- |:--- |:--- |
| `server/data/` | **bible-corrections.json** | 참조 없음 | 삭제 검토 |

---

## 3. 조치 이력 (Action Log)

### 2026-01-25
- **프론트엔드 레거시 정리**: `Home.jsx`, `Bible.jsx`, `Notes.jsx` 삭제
- **자산 정리**: 미사용 `react.svg` 삭제
- **코드 정리**: `App.jsx` 내 불필요한 주석 처리된 import 구문 제거
- **보존**: `Search.jsx`는 추후 기능 구현 가능성을 고려하여 유지하기로 결정
