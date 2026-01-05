# Bible Reading Mate (BibleMate) 📖

매일 성경을 읽고 묵상을 기록하며 영적 성장을 돕는, 직관적이고 아름다운 웹 애플리케이션입니다.

## 주요 기능 ✨

### 📖 말씀 읽기 (Reading)
- **이중 역본 지원**: 개역한글(KRV) 및 영어(BBE)를 지원하며, 읽는 도중 즉시 전환해도 현재 구절 위치가 유지됩니다.
- **읽기 상태 시각화**: 본문 스크롤 시 상단에 현재 위치(장/절)와 '읽음' 배지가 표시되어 직관적인 파악이 가능합니다.
- **최근 읽은 날짜**: 이전에 읽은 본문이라면, 언제 읽었는지 날짜 뱃지를 통해 확인할 수 있습니다.

### 📝 묵상 기록 (Writing)
- **날짜별 묵상**: 매일의 묵상을 기록할 수 있으며, 입력 중 잠시 멈추면 자동으로 저장되어 데이터 손실을 방지합니다.
- **스마트 복사**: `[날짜] 읽은 범위 + 내용` 포맷으로 깔끔하게 복사되어 나눔이나 공유가 간편합니다.
- **안전한 저장**: 실수로 내용을 덮어쓰거나 날리는 일이 없도록 정교한 저장 로직이 적용되어 있습니다.

### 📊 진도 관리 (Tracking)
- **통합 대시보드**: 달력, 성경 선택, 노트 작성을 한 화면에서 처리할 수 있는 효율적인 2-Column 레이아웃을 제공합니다.
- **다회 읽기 지원**: 하루에 여러 본문을 읽어도 모두 기록되며, 달력에 읽은 날짜가 점(Dot)으로 표시됩니다.
- **월별 히스토리**: 달력을 통해 월별 읽기 현황을 한눈에 파악하고 관리할 수 있습니다.

### ⚙️ 사용자 경험 (Customization)
- **다크 모드 완벽 지원**: 시스템 설정 또는 사용자 선호에 따라 눈이 편안한 다크 모드를 완벽하게 지원합니다.
- **접근성 강화**: 글자 크기를 10px에서 24px까지 미세하게 조절할 수 있어 남녀노소 누구나 편하게 읽을 수 있습니다.
- **반응형 디자인**: 데스크톱의 넓은 화면부터 모바일 환경까지 최적화된 레이아웃을 제공합니다.

## 기술 스택 🛠️

- **Frontend**: React, Vite, React Router
- **Styling**: Vanilla CSS (CSS Variables, Responsive Flex/Grid)
- **Backend**: Node.js, Express
- **Database**: SQLite (`sql.js`) - WASM 기반, 별도 설치 없이 브라우저/Node 환경 호환
- **Key Libraries**: `date-fns` (날짜), `lucide-react` (아이콘)

## 설치 및 실행 🚀

### 1. 프로젝트 설정
```bash
# 레포지토리 복제
git clone <repository-url>
cd bible-reading-mate

# 패키지 설치 (Root 및 Client)
npm install
cd client && npm install && cd ..
```

### 2. 데이터베이스 설정
성경 데이터를 로컬 DB에 임포트해야 합니다.
```bash
npm run import-bible
```

### 3. 개발 서버 실행
백엔드와 프론트엔드를 동시에 실행합니다.
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:3001`

## 📚 Documentation 

프로젝트의 상세 문서입니다.

- [**문서 홈 (Index)**](docs/docs-index.md)
- [**프로젝트 명세서**](docs/specifications/spec-v1.0.md)
- [**개발 로그**](docs/logs/dev-log-v1.0.md)

## 프로젝트 구조 📁

```
bible-reading-mate/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # ReadingDashboard, Settings etc.
│   │   ├── components/     # BibleViewer, NoteEditor, Calendar etc.
│   │   └── services/       # API Communications
├── server/                 # Express Backend
│   ├── routes/             # API Endpoints (Bible, Notes, Logs)
│   └── data/               # SQLite Database
├── docs/                   # Documentation
│   ├── specifications/     # Specs & Layouts
│   ├── logs/               # Dev & Verification Logs
│   └── planning/           # Future Roadmap
└── scripts/                # Data Import Utilities
```

## 라이선스 및 저작권 📝

**BibleMate v1.0**
개인 묵상과 성경 읽기를 돕기 위해 만든 웹 애플리케이션입니다.

### 성경 데이터 저작권
- **한국어: 『성경전서 개역한글판』**
  본 성경전서 개역한글판의 저작권은 재단법인 대한성서공회에 있으며, 본 앱은 해당 저작권을 준수하여 사용합니다. (본문 동일성 유지)
- **English: Open English Bible (OEB)**
  Public Domain (CC0), No copyright reserved.

본 앱은 비영리 개인 학습/묵상용으로 제작되었습니다.
