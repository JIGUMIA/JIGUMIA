# JIGUMIA — 브랜드 할인 캘린더 앱
### Product Requirements Document v1.1

---

## 1. 프로젝트 개요

### 1.1 앱 소개

JIGUMIA(지구미아)는 올리브영, 무신사, 29cm, 쿠팡 등 주요 브랜드의 할인 및 세일 일정을 캘린더 형태로 한눈에 볼 수 있는 쇼핑 일정 관리 앱입니다.

'지금이야' — 지금 세일 중인 브랜드를 놓치지 말자는 컨셉으로, 20대 여성을 주요 타겟으로 합니다.

### 1.2 핵심 가치

- 한 곳에서 모든 브랜드 세일 일정 확인
- 캘린더 뷰로 직관적인 일정 파악
- 세일 시작 전 사전 알림 기능
- 관심 브랜드 즐겨찾기 및 필터링

### 1.3 타겟 사용자

| 항목 | 내용 |
|------|------|
| 주요 타겟 | 20대 여성 |
| 관심사 | 패션, 뷰티, 라이프스타일 쇼핑 |
| 행동 특성 | 세일 기간에 집중 구매, SNS 통해 세일 정보 수집 |
| 페인 포인트 | 브랜드별 세일 일정이 분산되어 있어 놓치기 쉬움 |

---

## 2. 기능 정의

### 2.1 핵심 기능 (MVP)

#### 캘린더 뷰
- 월간 캘린더: 한 달 전체 세일 일정 조망
- 주간 캘린더: 이번 주 세일 브랜드 상세 보기
- 날짜 셀에 브랜드 로고/태그 표시
- 오늘 날짜 하이라이트, 진행 중인 세일 강조 표시

#### 브랜드 세일 정보
- 브랜드명, 세일 기간, 할인율, 카테고리 표시
- 세일 상세 페이지: 주요 할인 품목, 쿠폰 정보, 브랜드 링크
- 진행 중 / 예정 / 종료 상태 구분

#### 알림 기능
- 세일 시작 D-1, 당일 푸시 알림
- 관심 브랜드 세일 시작 알림
- 세일 종료 임박(D-1) 알림

#### 브랜드 관리
- 관심 브랜드 즐겨찾기 등록/해제
- 카테고리별 필터 (패션, 뷰티, 식품, 전자기기, 라이프)
- 브랜드 검색

### 2.2 추가 기능 (v2)

- 세일 메모/장바구니 연동
- 친구와 세일 일정 공유
- 브랜드별 세일 히스토리 통계
- 위시리스트 상품 가격 알림

---

## 3. 초기 입점 브랜드

| 브랜드 | 카테고리 | 세일 유형 | 비고 |
|--------|----------|-----------|------|
| 올리브영 | 뷰티/헬스 | 정기 세일, 올영세일 | 월 1~2회 정기 세일 |
| 무신사 | 패션 | 무신사 데이, 블프 | 연 2~4회 대형 세일 |
| 29cm | 패션/라이프 | 29스타일위크 | 분기별 세일 |
| 쿠팡 | 종합 | 로켓배송 특가, 타임딜 | 상시 특가 |
| SSG.COM | 종합/패션 | 쓱세일 | 월 1회 대형 세일 |
| H&M | 패션 | 시즌 세일, 멤버 세일 | 계절별 세일 |
| JAJU (자주) | 라이프/패션 | 자주 세일위크 | 월 1회 |

---

## 4. 화면 구성 (IA)

### 4.1 주요 화면

| 화면 | 주요 구성 요소 |
|------|---------------|
| 홈 (캘린더) | 월간/주간 탭, 브랜드 태그, 오늘의 세일 배너 |
| 세일 상세 | 브랜드 정보, 기간, 할인율, 주요 혜택, 바로가기 링크 |
| 브랜드 탐색 | 전체 브랜드 리스트, 카테고리 필터, 검색 |
| 관심 브랜드 | 즐겨찾기 브랜드, 다가오는 세일 요약 |
| 알림 설정 | 브랜드별 알림 ON/OFF, 알림 타이밍 설정 |
| 마이페이지 | 프로필, 알림 내역, 앱 설정 |

### 4.2 네비게이션 구조

- 하단 탭바: 홈(캘린더) / 탐색 / 관심 / 마이
- 홈 상단: 월간/주간 뷰 전환 탭
- 세일 카드 탭 시 상세 시트(Bottom Sheet) 표시

---

## 5. 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| Frontend | Expo (React Native) | iOS / Android 동시 개발 |
| Styling | NativeWind | Tailwind CSS for React Native |
| Backend/DB | Supabase | Auth, DB, Storage, Realtime |
| 인증 | Supabase Auth + Google OAuth | 딥링크 방식 (아래 참고) |
| 알림 | Expo Notifications + FCM | 푸시 알림 |
| 배포 | EAS Build (Expo) | 앱스토어 / 플레이스토어 제출 |
| 상태관리 | Zustand | 경량 상태관리 |

---

## 6. 인증 설계

### 6.1 Google OAuth 플로우

앱에서 소셜 로그인은 브라우저에 URL이 노출되지 않고 **딥링크(Deep Link)** 방식으로 동작합니다.

```
① 구글 로그인 버튼 탭
② WebBrowser.openAuthSessionAsync() 로 구글 로그인 창 열림
③ 인증 완료 후 jigumia://auth/callback 으로 리다이렉트
④ 앱이 딥링크 받아서 세션 처리
⑤ 홈 화면으로 이동
```

### 6.2 Supabase 리다이렉트 URL 설정

Supabase 대시보드 → Authentication → Redirect URLs에 아래 두 개 등록 필요:

```
jigumia://auth/callback         ← 앱용 (딥링크)
http://localhost:8081/auth/callback   ← 개발용
```

### 6.3 Google Cloud Console 설정

Google OAuth 동의 화면에서 아래 항목 반드시 설정:

| 항목 | 값 |
|------|----|
| 앱 이름 | JIGUMIA |
| 앱 로고 | J 아이콘 (512x512 PNG) |
| 지원 이메일 | 본인 이메일 |
| 개발자 이메일 | 본인 이메일 |

> 설정하면 Google 계정 선택 화면에 "JIGUMIA(으)로 이동" 으로 정상 표시됨

### 6.4 출시 전 체크리스트 ⚠️

- [ ] Google OAuth 앱을 **테스트 모드 → 프로덕션**으로 게시 요청
  - 테스트 모드에서는 등록된 테스트 계정만 로그인 가능
  - 프로덕션 게시 후 모든 유저 로그인 가능
- [ ] Google Play / App Store 앱 등록 후 OAuth 승인 앱 도메인 추가
- [ ] Supabase Redirect URL 프로덕션 딥링크 등록 확인

---

## 7. 데이터베이스 설계

### brands (브랜드)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 브랜드명 |
| logo_url | text | 로고 이미지 URL |
| category | text | 패션/뷰티/식품/전자기기/라이프 |
| website_url | text | 공식 사이트 URL |
| created_at | timestamptz | 생성일 |

### sale_events (세일 이벤트)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| brand_id | uuid | FK → brands.id |
| title | text | 세일명 (예: 올영세일) |
| start_date | date | 세일 시작일 |
| end_date | date | 세일 종료일 |
| discount_rate | text | 할인율 (예: 최대 50%) |
| description | text | 세일 상세 설명 |
| status | text | upcoming / active / ended |
| created_at | timestamptz | 생성일 |

### user_favorites (관심 브랜드)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| brand_id | uuid | FK → brands.id |
| created_at | timestamptz | 등록일 |

### user_notification_settings (알림 설정)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| brand_id | uuid | FK → brands.id |
| notify_day_before | boolean | D-1 알림 여부 |
| notify_on_start | boolean | 당일 알림 여부 |
| notify_day_before_end | boolean | 종료 임박 알림 여부 |

---

## 8. 개발 로드맵

| 단계 | 기간 | 목표 |
|------|------|------|
| Phase 1 | 1~2주차 | Expo 프로젝트 세팅, Supabase 연동, Google OAuth 딥링크 인증 구현 |
| Phase 2 | 3~4주차 | 캘린더 UI, 세일 데이터 CRUD, 브랜드 리스트 |
| Phase 3 | 5~6주차 | 관심 브랜드, 필터/검색, 세일 상세 Bottom Sheet |
| Phase 4 | 7~8주차 | Expo Notifications + FCM 푸시 알림 |
| Phase 5 | 9~10주차 | EAS Build, 앱스토어/플레이스토어 제출, Google OAuth 프로덕션 게시 |

---

## 9. 디자인 가이드

### 9.1 브랜드 아이덴티티

- 앱 이름: JIGUMIA (지구미아) — '지금이야'에서 유래
- 키 컬러: `#111111` (블랙), `#FF2D2D` (레드), `#FAFAF8` (오프화이트)
- 타이포그래피: DM Sans (영문), Pretendard (한글)
- 아이콘: J 레터마크 + 30도 기울기 + 레드 포인트 도트 2개 (대각선 배치)

### 9.2 디자인 원칙

- 미니멀 & 클린 — 군더더기 없이 정보 전달에 집중
- 무신사 + 올리브영 중간 — 트렌디하면서 친근함
- 모바일 퍼스트 — 375px 기준 레이아웃 (iPhone 기준)
- 다크/라이트 모드 모두 지원

---

*JIGUMIA — 지금이야*
