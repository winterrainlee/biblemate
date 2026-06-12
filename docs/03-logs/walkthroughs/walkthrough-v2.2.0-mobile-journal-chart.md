# Walkthrough v2.2.0 - Mobile Journal & Chart

- 작성일: 2026-06-12
- 브랜치: `feature/v2.2-mobile-ux`
- 관련 계획: `docs/01-planning/implementation-plans/implementation-plan-v2.2.0-mobile-ux.md`
- 관련 명세: `docs/02-specs/mobile-ux-final-adjustment-v2.md`
- 범위: PR-C. Mobile Journal & Chart Flow

## 1. 구현 요약

### MOB-201. 날짜 선택 시트와 오늘 버튼

- 묵상일지 날짜 텍스트를 버튼으로 바꿔 날짜 선택 시트를 열 수 있게 했다.
- 날짜 시트에는 native `date` input, 오늘로 이동, 최근 기록 목록을 넣었다.
- 오늘이 아닌 날짜에서는 `오늘` 버튼을 노출한다.

### MOB-202. 모바일 일지 요약

- 모바일 일지 상단에 이번 달 읽은 날과 묵상한 날 요약을 추가했다.
- 요약 영역에서 날짜 이동 시트를 바로 열 수 있다.

### MOB-203. 빈 상태 CTA 정리

- 빈 상태의 `자유 묵상 작성`/`기도 작성` 중복 CTA를 `오늘 묵상 시작하기` 하나로 줄였다.
- CTA는 자유 묵상 작성으로 바로 진입한다.

### MOB-301. 본문 전용 가독성 설정

- 모바일 성경 화면에 `Aa` 버튼을 추가했다.
- `Aa` 시트에서 성경 본문 전용 글자 크기를 90~125% 범위로 조정한다.
- 설정값은 `localStorage`에 저장하며 앱 전체 root font-size에는 영향을 주지 않는다.

### MOB-302. 읽기표를 진입점으로 만들기

- 읽기표 상단에 `다음 안 읽은 장 읽기` 버튼을 추가했다.
- 책 row를 누르면 해당 책의 다음 안 읽은 장으로 이동한다.
- 작은 장 셀은 직접 버튼화하지 않고 row-level 진입을 우선 적용했다.

## 2. 검증 결과

```bash
cd client
npm run lint
```

결과: 성공. PR-C 시점에 남아 있던 hook dependency warning 6개는 v2.2 통합 정리에서 해소했다.

```bash
cd client
npm run build
```

결과: 성공.

## 3. 수동 QA 체크리스트

- [x] 묵상일지 날짜를 탭하면 날짜 선택 시트가 열린다.
- [x] 3주 전 날짜로 이동할 수 있다.
- [x] 과거 날짜에서 오늘 버튼으로 1탭 복귀한다.
- [x] 빈 상태 CTA가 하나만 보이고 자유 묵상 작성으로 진입한다.
- [x] 모바일 일지 요약이 본문 작성 흐름을 방해하지 않는다.
- [x] 성경 화면 `Aa` 버튼으로 본문 글자 크기만 바뀐다.
- [x] 읽기표의 `다음 안 읽은 장 읽기`가 성경 읽기 화면으로 이동한다.
- [x] 책 row 탭이 해당 책의 다음 안 읽은 장으로 이동한다.

## 4. PR-C 완료 판단

자동 검증과 iPhone Safari 실기기 수동 QA를 통과했다. PR-C는 체크포인트 커밋 가능 상태다.
