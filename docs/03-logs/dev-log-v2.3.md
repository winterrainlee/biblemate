# Dev Log - v2.3

## 개요

- **목표**: "나만의 서재에서 읽는 성경" 컨셉의 시각 디자인 재구성
- **기간**: 2026-06-12 시작
- **통합 브랜치**: `feature/v2.3`
- **작업 브랜치**: `feature/v2.3-visual-redesign`
- **상태**: 구현 및 1차 검증 완료

---

## 준비 단계 (2026-06-12)

### 작성/정리 문서

| 파일 | 상태 | 설명 |
|---|---|---|
| `docs/01-planning/proposal-visual-redesign.md` | 작성됨 | v2.3 시각 디자인 제안서 |
| `docs/02-specs/spec-v2.3.md` | 신규 | v2.3 기준 명세 |
| `docs/01-planning/implementation-plans/implementation-plan-v2.3.0-visual-redesign.md` | 신규 | v2.3 구현 계획 |
| `docs/03-logs/dev-log-v2.3.md` | 신규 | 개발 로그 자리 |
| `docs/04-releases/release-notes-v2.3.0.md` | 신규 | 릴리즈 노트 자리 |
| `docs/docs-index.md` | 수정 | v2.3 문서 링크 추가 |
| `docs/01-planning/roadmap.md` | 수정 | v2.3 목표 버전 및 작업 항목 추가 |

### 결정된 기준

- Primary 색: 가죽 갈색 `#8B5E3C`.
- 다크모드 강조색: 금색 `#C9A36B`, 채움 버튼 배경 `#9A6B43`.
- 본문 기본 글꼴: `Noto Serif KR`.
- 추가 본문 글꼴 옵션: `Gowun Batang`, `Noto Sans KR`.
- 마이크로카피 톤: 존댓말 유지.
- 파비콘/앱 아이콘: v2.3 팔레트와 서재 컨셉에 맞춰 리디자인 대상에 포함.
- 종이 노이즈 텍스처: 기본 구현 보류.

---

## PR-A. Visual Foundation (2026-06-12)

상태: 구현 및 1차 검증 완료

변경 내역:
- `client/src/index.css`: Paper & Ink / Candlelight 토큰 적용, `bg-elevated`, `primary-solid`, `primary-contrast`, `border-light` 추가
- 전역 legacy 변수 매핑을 새 팔레트에 맞게 정리
- 하이라이트 4색을 라이트 저채도 색연필 톤, 다크 rgba 오버레이 톤으로 조정

검증:
- `cd client && npm run lint`
- `cd client && npm run build`
- 브라우저 라이트/다크 토큰 확인

---

## PR-B. Reading Surface & Typography (2026-06-12)

상태: 구현 및 1차 검증 완료

변경 내역:
- `Noto Serif KR`, `Gowun Batang` 추가
- UI 글꼴과 성경 본문 글꼴을 분리
- 설정 화면에 명조/고운바탕/고딕 본문 글꼴 선택 추가
- 성경 본문 paper surface, 절 번호, 줄간격, 본문 폭, 인용구 스타일 조정

검증:
- `.verse-content`가 `"Noto Serif KR", serif`로 렌더링되는 것 확인
- 모바일 390×844에서 첫 구절과 하단 action bar 표시 확인
- v2.2 모바일 `Aa` 설정 유지 확인

---

## PR-C. Surrounding Screens & Microcopy (2026-06-12)

상태: 구현 및 1차 검증 완료

변경 내역:
- 묵상 카드, 묵상일지, 노트 에디터 표면을 메모지/기도 노트 문법으로 조정
- 헤더 로고와 탭 시각 무게를 낮춤
- 로그인 화면을 크림 배경, 세리프 문구, `BM` 마크 중심으로 재구성
- `client/public/logo.svg` 추가, `client/public/logo.png`를 실제 1024×1024 PNG로 교체
- `client/index.html`, `client/public/manifest.json`의 favicon/apple touch icon 연결 정리
- `오늘 펼친 말씀`, `마음에 머문 구절`, `기도로 마무리`, `이 말씀 묵상하기`, `말씀 복사`, `말씀 여정` 문구 적용

검증:
- favicon `/logo.svg`, apple touch icon `/logo.png` 연결 확인
- 설정 화면 본문 글꼴 3옵션과 `BibleMate v2.3.0` 확인
- `git diff --check` 성공

---

## 남은 작업

- 실제 iOS 홈 화면 설치 아이콘 확인
- `/deploy` 시 최신 배포 버전, 배포일, 태그, 배포 절차 마감
