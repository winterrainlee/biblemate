# v1.1.0 명세서: 클라우드 진출 및 데이터 보안

## 1. 개요 (Overview)
v1.1.0 버전은 **데이터 주권(백업/복구)**과 **서비스 가용성(Fly.io 배포)**, 그리고 **액세스 보안(암호 보호)**에 초점을 맞춥니다. 이제 BibleMate를 언제 어디서나 안전하게 사용할 수 있습니다.

## 2. 주요 기능 (Features)

### 2.1. 데이터 백업 및 복구 (Data Backup & Restore)
- **목표**: 사용자가 자신의 데이터를 로컬 파일로 저장하고 복구할 수 있게 하여, 데이터 유실 위험을 줄입니다.
- **구현**: `GET /api/backup/export` (JSON 내보내기), `POST /api/backup/import` (트랜잭션 기반 덮어쓰기)

### 2.2. 사이드바 컴팩트 모드 (Sidebar Compact Mode)
- **목표**: 모바일 환경에서 더 많은 네비게이션 항목이 보이도록 UI 최적화.
- **구현**: 성경/장 선택 UI를 가로 배치(90%/110%)로 변경.

### 2.3. 대시보드 블록 토글 (Dashboard Block Toggles)
- **목표**: 읽기 또는 묵상 중 하나에 집중할 수 있는 환경 제공.
- **구현**: `localStorage` 기반 표시 설정 토글 스위치 제공.

### 2.4. 클라우드 배포 (Cloud Deployment)
- **목표**: 24시간 접속 가능한 환경 구축.
- **플랫폼**: Fly.io (도쿄 리전)
- **기술 스택**: Docker (3-stage build), SQLite Persistent Volume (`/app/server/db-data`)

### 2.5. 액세스 패스워드 보호 (Access Security)
- **목표**: 외부 배포 시 무단 접근 방지.
- **구현**: 
  - 서버: 환경변수 `ACCESS_PASSWORD` 존재 시 인증 미들웨어 활성화.
  - 보안: `httpOnly` 세션 쿠키 기반 인증 관리.
  - UI: 전용 로그인 페이지 및 설정 내 로그아웃 버튼 추가.

## 3. 기술적 과제 (Technical Tasks)

### Backend
- [x] `server/routes/auth.js` 인증 라우터 구현
- [x] `cookie-parser` 연동 및 인증 미들웨어 적용
- [x] Dockerfile 멀티스테이지 빌드 구성 (seed DB 자동 생성 과정 포함)

### Frontend
- [x] `App.jsx` 인증 상태 체크 로직 (Status API 연동)
- [x] `LoginPage.jsx` 구현
- [x] `Settings.jsx` 로그아웃 섹션 추가

## 4. 데이터베이스 및 서버 구성
- **DB**: SQLite (db-data 볼륨 마운트)
- **인증**: 환경변수 기반 세션 인증 (무상태성 및 로컬 편의성 유지)

