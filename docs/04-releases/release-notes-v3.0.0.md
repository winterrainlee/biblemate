# Release Notes v3.0.0

**배포일**: 미정
**버전**: v3.0.0
**상태**: 개발 중

## 현재 완료된 변경

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

## 호환성

- 기존 데이터와 API 계약을 유지합니다.
- 기존 묵상·하이라이트·장 이동 기능을 유지합니다.
- Context Toolbar, Reflection Composer는 후속 작업이며 아직 포함되지 않았습니다.

## 검증

- ESLint 및 Vite production build 통과
- 375×812, 650×900, 1280×900 반응형 검증
- Light / Dark와 기존 묵상·하이라이트 표시 검증
- iPhone 13 mini Safari 실기기 검수 및 사용자 승인
- Verse Selection lint/build 및 iPhone Safari 실기기 검수·사용자 승인

전체 v3.0 릴리즈 노트는 후속 기능 완료에 맞춰 계속 갱신합니다.
