# v1.3.1 Release Notes - Data Integrity Restoration

**Release Date**: 2026-01-09
**Description**: 성경 데이터의 무결성을 확보하기 위한 긴급 수정(Hotfix) 및 데이터 정제 작업이 포함된 릴리즈입니다.

## 🌟 Major Highlights
- **성경 텍스트 완전 무결성 확보 (Corrupted 0건)**
- **욥기 35-42장 구조적 오류 복구**
- **네트워크 수신 시 한글 깨짐(\uFFFD) 근본 해결**

## 🛠 Features & Improvements

### 1. Data Integrity (데이터 정제)
- **UTF-8 Decoding Fix**: `import-bible.js`에서 네트워크 패킷 수신 시 `Buffer` 처리를 도입하여, 멀티바이트(한글) 문자가 청크 경계에서 깨지는 현상을 완전히 해결했습니다.
- **HTML Entity Removal**: 본문에 남아있던 `&#x27;`, `&quot;` 등 웹 인코딩 잔재를 모두 디코딩하여 가독성을 높였습니다.

### 2. Structural Fix (구조 오류 수정)
- **Job (욥기) 35:16 ~ 42장 복원**:
  - 원본 데이터 소스의 병합 사고로 인해 7개 장(Chapter) 전체가 꼬여있던 문제를 발견했습니다.
  - 대한성서공회 개역한글 원문을 확보하여 해당 범위의 **203개 구절**을 전면 교체 및 복구했습니다.
- **Missing Data Recovery**:
  - `UPDATE` 만으로는 복구할 수 없는 누락 구절들을 위해 `INSERT OR REPLACE` 로직을 도입하여 데이터 일관성을 강제했습니다.

### 3. Corrections System
- **Patch Overriding**: 원본 소스를 직접 수정하는 대신 `bible-corrections.json`을 통한 오버라이딩 방식을 정립하여, 향후 유사한 오류 발생 시 신속하게 대응할 수 있는 체계를 마련했습니다. (총 517개 패치 적용)

## 🐛 Bug Fixes
- Fixed intermittent text corruption (Replacement Character `\uFFFD`) in Genesis, Job, and Revelation.
- Fixed verse shifting issue where fixing one verse would break adjacent ones.

## 📝 Known Issues
- None. (All known text corruptions have been resolved)
