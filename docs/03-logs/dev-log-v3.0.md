# 개발 로그 - v3.0

## 개요

- **버전**: v3.0.0
- **기간**: 2026-09-08 ~ 진행 중
- **목표**: 성경 읽기와 묵상 기록의 핵심 경험을 실제 사용 흐름 중심으로 재구성
- **통합 브랜치**: `feature/v3.0`
- **현재 작업 브랜치**: `feature/v3.0-reading-canvas`

## 변경 내역

### 2026-09-08

#### [Feature] Reading Canvas

- `client/src/components/BibleViewer.css`: 큰 paper card와 3컬럼 전제를 걷어내고 실제 가용 폭별 단일 Reading Canvas, 본문 폭·행간·절 간격·절 번호 위계를 구성
- `client/src/components/BibleViewer.jsx`: 기존 데이터/API와 선택 로직을 유지하면서 모바일 본문 선택·장의 묵상·Aa 접근 구조와 묵상 마진 표시를 최소 JSX 변경으로 연결
- `client/src/components/Header.css`, `Header.jsx`: Reading 화면에서 전역 헤더와 조작부의 시각적 무게 축소
- `client/src/pages/ReadingDashboard.css`: Reading Canvas 중심 레이아웃으로 보조 패널 전제 완화
- 사용자 피드백에 따라 위첨자형 절 번호와 인접한 묵상 점을 본문 기준선 번호 + 왼쪽 마진 선으로 수정
- PR 리뷰에서 절 번호·묵상선 대비, 클릭 우선순위, Compact 조작 영역과 기본 dialog semantics 보강

## 이슈 및 해결

- **이슈**: Tailscale 검수 서버에서 묵상 표시가 보이지 않는 것으로 인식됨
- **원인**: 최초 검수 장에 로컬 묵상 데이터가 없었음
- **해결**: 기존 묵상·하이라이트가 함께 있는 장으로 데이터/API와 레이아웃을 교차 검증

- **이슈**: 절 번호와 묵상 점의 의미가 시각적으로 뭉치고 절 번호가 약해 보임
- **해결**: 세 시안을 비교한 뒤 사용자 선택 C안인 기준선 절 번호 + 왼쪽 마진 선을 반영

## 검증 결과

- [x] `cd client && npm run lint`
- [x] `cd client && npm run build`
- [x] `git diff --check origin/feature/v3.0...HEAD`
- [x] 375×812 / 650×900 / 1280×900 Light 검증
- [x] Light / Dark 및 하이라이트 4색 대비 검증
- [x] 이전·다음 장, 기존 묵상 열기, 하이라이트 레이아웃 회귀 확인
- [x] iPhone 13 mini Safari + Tailscale HTTP 실기기 검수 및 사용자 승인

## 다음 계획

- Reading Canvas PR 리뷰 후 사용자 승인에 따라 `feature/v3.0` 통합
- Verse Selection은 별도 구현계획 승인 전 시작하지 않음
