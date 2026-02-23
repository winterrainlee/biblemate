# BibleMate 시스템 흐름도 (Sequence Diagrams)

> 생성일: 2026-01-29 | 버전: v2.0.1

---

## 1. 인증 흐름 (Authentication Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant S as Server (Express)
    participant DB as SQLite

    U->>C: 앱 접속
    C->>S: GET /api/auth/status
    S-->>C: {authRequired: true, authenticated: false}
    C-->>U: 로그인 화면 표시
    U->>C: 비밀번호 입력
    C->>S: POST /api/auth/login {password}
    S-->>C: Set-Cookie: session_token
    C-->>U: 메인 화면 이동
```

---

## 2. 성경 읽기 흐름 (Bible Reading Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as SQLite

    U->>C: 창세기 1장 선택
    C->>S: GET /api/bible/Gen/1?version=krv
    S->>DB: SELECT * FROM bible_verses WHERE book='Gen' AND chapter=1
    DB-->>S: 구절 데이터 (31구절)
    S-->>C: JSON 응답
    C->>S: GET /api/verse-notes?book=Gen&chapter=1
    S->>DB: SELECT * FROM verse_notes
    DB-->>S: 묵상 데이터
    S-->>C: JSON 응답
    C->>S: GET /api/highlights?book=Gen&chapter=1
    S->>DB: SELECT * FROM highlights
    DB-->>S: 하이라이트 데이터
    S-->>C: JSON 응답
    C-->>U: 본문 + 묵상 + 하이라이트 렌더링
```

---

## 3. 묵상 저장 흐름 (Verse Note Save Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as SQLite

    U->>C: 구절 선택 → 묵상 작성
    C->>S: POST /api/verse-notes {book, chapter, verse, content}
    S->>DB: INSERT INTO verse_notes
    S->>DB: saveDB() (파일로 저장)
    DB-->>S: OK
    S-->>C: {ok: true, id: 123}
    C-->>U: 📝 아이콘 표시 + 사이드바 업데이트
```

---

## 4. 백업/복원 흐름 (Backup & Restore Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as SQLite

    Note over U,DB: 백업 (Export)
    U->>C: 백업 버튼 클릭
    C->>S: GET /api/backup/export
    S->>DB: SELECT * FROM all_user_tables
    DB-->>S: 전체 사용자 데이터
    S-->>C: JSON 파일 다운로드
    C-->>U: backup-2026-01-29.json 저장

    Note over U,DB: 복원 (Import)
    U->>C: JSON 파일 업로드
    C->>S: POST /api/backup/import {data}
    S->>DB: DELETE + INSERT (트랜잭션)
    S->>DB: saveDB()
    DB-->>S: OK
    S-->>C: {ok: true, imported: {...}}
    C-->>U: 복원 완료 메시지
```

---

## 5. 전체 아키텍처 (System Architecture)

```mermaid
flowchart TB
    subgraph Client ["🖥️ Client (React + Vite)"]
        App[App.jsx]
        Pages[Pages: Reading, Journal, Chart, Settings]
        Components[Components: BibleViewer, NoteEditor, ...]
        Services[Services: api.js, journalApi.js]
    end

    subgraph Server ["⚙️ Server (Express)"]
        Routes[Routes: bible, verse-notes, highlights, ...]
        Auth[Auth Middleware]
        DBLayer[DB Layer: sql.js]
    end

    subgraph Storage ["💾 Storage"]
        SQLite[(SQLite DB)]
        Volume[Fly.io Volume]
    end

    Client -->|HTTP/JSON| Server
    Server --> Storage
    SQLite --> Volume
```

---

## 6. DB 테이블 구조 (Schema V3)

| 테이블 | 용도 |
|--------|------|
| `bible_verses` | 성경 본문 (66권, 31,000+ 구절) |
| `reading_logs` | 읽기 기록 |
| `highlights` | 형광펜 하이라이트 |
| `verse_notes` | 구절별 묵상 |
| `free_notes` | 자유 묵상 |
| `daily_prayers` | 오늘의 기도 |
| `user_settings` | 사용자 설정 |
| `notes` | 레거시 (deprecated) |
