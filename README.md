# BibleMate 📖

매일 성경을 읽고 묵상을 기록하며 영적 성장을 돕습니다. 웹에서 작동하는 웹앱입니다.

## 주요 기능 ✨

### 📖 말씀 읽기 (Reading)
- **이중 역본 지원**: 개역한글(KRV) 및 영어(BBE)를 지원하며, 읽는 도중 즉시 전환해도 현재 구절 위치가 유지됩니다. *(모두 저작권 자유 역본)*
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

### 📦 데이터 관리 (Backup & Restore)
- **데이터 백업**: 노트, 하이라이트, 읽기 기록을 JSON 파일로 안전하게 내보낼 수 있습니다.
- **데이터 복구**: 백업 파일을 가져와 언제든 데이터를 복원할 수 있습니다.
- **데이터 주권**: 내 묵상 데이터를 내가 직접 관리하고 보관할 수 있습니다.

### ⚙️ 사용자 경험 (Customization)
- **다크 모드 완벽 지원**: 시스템 설정 또는 사용자 선호에 따라 눈이 편안한 다크 모드를 완벽하게 지원합니다.
- **접근성 강화**: 글자 크기를 10px에서 24px까지 미세하게 조절할 수 있어 남녀노소 누구나 편하게 읽을 수 있습니다.
- **화면 표시 설정**: 말씀 영역과 묵상 영역을 개별적으로 ON/OFF할 수 있어 읽기나 묵상 중 하나에 집중할 수 있습니다.
- **컴팩트 모드**: 모바일에서 사이드바가 한층 깔끔하게 보입니다.
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
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:3001`

### 4. 간편 실행 (Windows) ⚡

터미널 명령어를 모르는 분들을 위한 초간단 가이드입니다.

#### 📥 Step 1: 다운로드
1. [GitHub 저장소](https://github.com/winterrainlee/biblemate)에 접속합니다.
2. 초록색 **`<> Code`** 버튼 클릭 → **`Download ZIP`** 클릭
3. 다운받은 ZIP 파일을 원하는 위치에 압축 해제합니다.

#### 🛠️ Step 2: 초기 설정 (최초 1회)
압축 해제한 폴더에서 **`setup.bat`** 파일을 더블클릭하면 필요한 패키지 설치와 데이터베이스 설정이 자동으로 진행됩니다.
> ⚠️ **사전 요구사항**: [Node.js](https://nodejs.org/) 18 이상이 설치되어 있어야 합니다.

#### ▶️ Step 3: 서버 실행
**`start-biblemate.bat`** 파일을 더블클릭하면 서버가 켜집니다.
- 실행 창에 **내 컴퓨터의 IP 주소**와 접속 가능한 URL이 표시됩니다.
- 표시된 주소(예: `http://192.168.0.X:5173`)를 스마트폰 브라우저에 입력하면 바로 접속할 수 있습니다.
- **꽁팁**: 이 파일의 바로가기를 바탕화면에 만들어두면 편리합니다!

### 5. ☁️ 외부 서버 배포 (Optional)

PC를 끄지 않고도 24시간 접속 가능한 서버를 원한다면, Fly.io 같은 클라우드 플랫폼에 배포할 수 있습니다.

프로젝트에 포함된 배포 가이드를 참고하세요:
- 한글: [docs/deploy-flyio.md](docs/deploy-flyio.md)

## 프로젝트 구조 📁

```
biblemate/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # ReadingDashboard, Settings etc.
│   │   ├── components/     # BibleViewer, NoteEditor, Calendar etc.
│   │   └── services/       # API Communications
├── server/                 # Express Backend
│   ├── routes/             # API Endpoints (Bible, Notes, Logs)
│   ├── config/             # 설정 파일 (osis-mapping.json)
│   └── db-data/            # SQLite Database (로컬 생성됨)
└── scripts/                # Data Import Utilities
```

## 라이선스 및 저작권 📝

**BibleMate v1.1**
개인 묵상과 성경 읽기를 돕기 위해 만든 웹 애플리케이션입니다.

### 성경 데이터 저작권

> ✅ **저작권 걱정 없이 사용 가능한 역본만 사용합니다.**

| 역본 | 저작권 상태 | 비고 |
|------|------------|------|
| **개역한글 (KRV)** | ✅ 저작권 자유 | 대한성서공회 발행, 본문 동일성 유지 조건 준수 |
| **BBE (영어)** | ✅ Public Domain | 저작권 만료 (1965), 자유롭게 사용 가능 |

본 앱은 비영리 개인 학습/묵상용으로 제작되었습니다.

---

## 📬 문의

버그 제보, 기능 제안, 기타 문의사항은 아래로 연락해 주세요.

- **Email**: winterrain.lee@icloud.com
- **GitHub Issues**: [winterrainlee/biblemate/issues](https://github.com/winterrainlee/biblemate/issues)
