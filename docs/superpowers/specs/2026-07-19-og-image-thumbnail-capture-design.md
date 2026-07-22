# og:image 우선 썸네일 수집 — 설계

날짜: 2026-07-19
대상: `.claude/workflows/sale-maintenance.js` (이미지 수집 로직), `sale_events.image_url` 기존 데이터

## 문제

앱 세일 상세 화면은 `sale_events.image_url` 한 장을 카드 이미지로 띄운다. 현재 이 값은 유지보수 워크플로우가 이벤트 페이지 raw HTML에서 캠페인 key-visual을 긁어 채운다. 그런데 일부 이벤트 페이지는 포스터를 여러 레이어(배경 + 제품컷 + 텍스트)로 쌓아 JS로 합성해 보여준다. 이 경우 워크플로우가 **배경 레이어(`bg_*`)만** 긁어와 앱에서 텅 빈 배경만 노출된다.

예: 삼성 "삼성 AI 신혼가전" → `.../wedding_re/bg_wedding_pc.png` (배경 레이어).

## 목표

카카오톡이 링크 붙일 때 보여주는 썸네일처럼, 사이트가 공유용으로 미리 만들어 둔 **완성된 대표 이미지 한 장**을 쓴다. Open Graph 규격상 이건 페이지의 `<meta property="og:image">` 이다. 레이어 합성 문제 없이 항상 완성된 카드 이미지를 얻는다.

## 결정된 방향

- 수집 전략: **og:image 우선 + 포스터 폴백** (사용자 승인)
- 기존 25개 이벤트 이미지: **전부 재수집(덮어쓰기)** (사용자 승인)
- 앱 렌더링 코드: 변경 없음 (범위 밖)

## A. 워크플로우 수정 (앞으로)

Phase 2 리서치 프롬프트의 이미지 수집 규칙을 우선순위 방식으로 교체:

1. `event_url` raw HTML에서 `<meta property="og:image" content="...">` 추출. 없으면 `og:image:secure_url`, `twitter:image` 도 확인.
2. 그 og:image가 **캠페인 전용 이미지**인지 **범용 브랜드 로고/기본 공유이미지**인지 판단.
   - 버리는 신호: URL/파일명에 `logo`, `default`, `common`, `share`, `og-default`, `main` 만 있거나, 브랜드명 단독, 브랜드 홈 대문과 동일한 이미지.
   - 캠페인 전용 신호: 캠페인/이벤트 코드·날짜·시즌명이 경로에 포함 (예: `.../campaign/...`, `.../event/260713_.../...`).
3. 쓸만한 og:image → 채택.
4. 아니면 폴백: 기존처럼 HTML에서 완성 포스터(key-visual) 탐색. 단 **`bg_` / `background` / `_bg` 레이어 파일은 절대 금지**. `kv` / `pc_kv` / `key_visual` / `_1PCE_` / `top` 을 우선.
5. `curl -sI` 로 HTTP 200 + `content-type: image/*` 확인. 아무것도 없으면 `""` (추측 금지).

`BRAND_FINDINGS_SCHEMA` 의 `image_url` 필드 설명 문자열도 위 우선순위 + `bg_` 금지 규칙을 담도록 갱신. Phase 3 INSERT/UPDATE 경로는 그대로 (image_url 한 장을 DB로 전달).

## B. 기존 25개 재수집 (일회성)

현재 `image_url` 이 채워진 25개 이벤트 각각의 `event_url` 에 대해 같은 og:image-우선 로직을 실행하고 `image_url` 을 **덮어쓴다**(의도적 교체 — COALESCE 아님). `bg_` 배경만 들어있던 건들이 확실한 개선 대상. 에이전트 팬아웃으로 병렬 처리.

## 알려진 한계

- og:image는 서버가 카카오톡/네이버 공유용으로 심는 태그라 SPA 페이지여도 curl로 대부분 잡히나, 일부 사이트는 클라이언트에서만 주입해 curl로 안 보일 수 있다. 그 경우 4번 폴백(포스터)으로 자동 전환.
- "범용 로고 vs 캠페인" 판단은 휴리스틱 + LLM 에이전트 판단에 의존. 애매하면 폴백을 시도한다.

## 관련 메모리

- [[project_sale_event_image_url]] — image_url 컬럼/수집 파이프라인
- [[feedback_sale_event_description_style]] — 같은 테마(앱 노출 품질)
