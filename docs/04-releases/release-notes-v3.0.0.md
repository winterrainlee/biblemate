# Release Notes v3.0.0

**배포일**: 2026-09-09 예정
**버전**: v3.0.0
**상태**: Release Candidate

## 주요 변경

### Reading Canvas

- 성경 본문을 큰 paper card와 3컬럼 구조에서 분리해 단일 읽기 화면으로 재구성했습니다.
- 실제 사용 가능한 폭을 기준으로 Compact / Reading / Workspace 레이아웃을 적용했습니다.
- 본문 폭, 좌우 여백, 글자 크기, 행간과 절 간격을 장시간 읽기에 맞게 조정했습니다.
- 절 번호를 본문 기준선에 배치하고 기존 묵상은 왼쪽 여백의 조용한 세로선으로 표시합니다.
- 장·역본·본문 크기 조작부가 말씀보다 먼저 눈에 들어오지 않도록 시각적 무게를 줄였습니다.

### Verse Selection

- 구절을 한 번 탭해 단일 또는 비연속 다중 선택할 수 있습니다.
- 선택한 구절을 다시 탭하거나 선택 bar를 닫아 자연스럽게 Reading 상태로 돌아갑니다.
- 기존 하이라이트 색을 유지하면서 선택 상태를 별도 overlay와 indicator로 표시합니다.
- 모바일 스크롤과 장 이동 swipe가 구절 선택과 충돌하지 않도록 gesture 경계를 분리했습니다.
- 구절 본문 keyboard toggle, 선택 상태 알림과 focus 복귀를 지원합니다.

### Context Toolbar + Highlight + Copy

- 선택한 말씀 아래에서 하이라이트 4색, 지우기, 묵상, 복사를 7개 직접 버튼으로 사용할 수 있습니다.
- 여러 절의 기존 색이 달라도 선택한 색으로 일관되게 적용하며, 삭제는 독립된 지우개로 실행합니다.
- 단일·연속·비연속 선택 범위와 현재 역본을 정확한 출처로 복사합니다.
- 하이라이트나 복사가 성공하면 읽던 위치에서 Reading 상태로 돌아갑니다.
- 선택 범위와 인용문을 기존 묵상 작성 화면으로 전달합니다.

### Wave 1 구현 및 통합 완료

- 선택한 말씀을 고정 snapshot으로 보존하는 반응형 Reflection Composer를 구현했습니다.
- 저장 실패 시 작성 내용을 유지하고, 변경된 draft의 이탈과 중복 저장을 방지합니다.
- Chart, Login, Settings와 Journal 보조 화면을 Reading 중심 제품 언어로 정리했습니다.
- 원본 사용자 DB를 사용하지 않는 임시 DB 기반 회귀 Harness를 추가했습니다.

### Existing Notes Integration

- 상단 `기존 묵상`에서 현재 장 전체 기록을 화면 폭에 맞는 시트·dialog·우측 패널로 확인할 수 있습니다.
- 말씀 선택 중에는 `관련 묵상`에서 선택 구절 중 하나라도 저장 범위와 겹치는 기록만 확인할 수 있습니다.
- 본문 왼쪽의 묵상 표시를 누르면 해당 기록으로 바로 이동하며, 목록에서 본문 절 이동·복사·수정·삭제를 처리합니다.
- 빈 장에서도 진입점을 유지하고 조회 실패 시 재시도 경로를 제공합니다.
- 장 전환 중 오래된 응답과 삭제 후 재조회 실패가 이미 확정된 화면 상태를 되돌리지 않도록 보호합니다.

### Responsive 통합

- iPhone, 1:1 분할 폭, 넓은 Workspace에서 Header·본문·고정 도구·묵상 화면의 높이와 스크롤 경계를 통일했습니다.
- iPhone에서 7버튼 도구막대와 전체 화면 Composer가 safe-area 및 작은 viewport 높이에서도 저장 액션을 가리지 않습니다.
- Workspace의 Composer와 기존 묵상 목록이 같은 300–420px 우측 작업면과 독립 스크롤을 사용합니다.
- 641–720px에서는 축약 Header를 사용해 큰 글자에서도 가로 넘침을 방지합니다.
- Login과 주변 화면이 전역 dynamic viewport 계약 안에서 자체 스크롤을 유지합니다.

## 호환성

- 기존 데이터와 API 계약을 유지합니다.
- 기존 묵상·하이라이트·장 이동 기능을 유지합니다.
- Wave 1 기능은 개별 리뷰와 자동 검증을 거쳐 `feature/v3.0`에 통합됐습니다.

## 검증

- ESLint 및 Vite production build 통과
- 375×812, 650×900, 1280×900 반응형 검증
- Light / Dark와 기존 묵상·하이라이트 표시 검증
- iPhone 13 mini Safari 실기기 검수 및 사용자 승인
- Verse Selection lint/build 및 iPhone Safari 실기기 검수·사용자 승인
- Context Toolbar lint/build 및 iPhone Safari 7버튼 실기기 검수·사용자 승인
- Wave 1 결합 lint/build, Composer 모델 테스트 5/5, 격리 회귀 검사 8/8 통과
- 리뷰 수정 후 Composer/navigation guard 테스트 9/9 및 통합 회귀 Harness 8/8 재통과
- Existing Notes 모델/navigation guard 테스트 15/15, lint/build 및 격리 회귀 Harness 8/8 통과
- Responsive 375·650·899/900·1280px 브라우저 검증, 최대 글자·Dark 4색 확인 및 전체 자동 회귀 재통과
- iPhone 실기기에서 장 전체 기존 묵상과 단일·비연속 선택 관련 묵상 필터를 확인하고 사용자 승인
- Release Candidate에서 모델/navigation guard 테스트 16/16, ESLint, production build, 격리 API 회귀 8/8 재통과
- root/client/server 및 backup export metadata의 앱 버전 `3.0.0` 정합 확인
- 사용자 DB와 release seed DB의 검증 전후 SHA-256 무변경 확인

## 알려진 비차단 항목

- iPad 실제 Split View, Desktop keyboard 전용 조작, PWA standalone의 미세 시각 차이는 발견 시 v3.0.x hotfix로 처리합니다.
- 기존 DB schema와 API·backup 형식은 변경하지 않습니다.
