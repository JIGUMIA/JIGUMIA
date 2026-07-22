# og:image 우선 썸네일 수집 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세일 이벤트 카드 이미지(`sale_events.image_url`)를 배경 레이어가 아니라 카카오톡식 완성 썸네일(og:image)로 채운다.

**Architecture:** 유지보수 워크플로우(`.claude/workflows/sale-maintenance.js`)의 이미지 수집 규칙을 "본문 스크래핑 우선 / og:image 금지"에서 "og:image 우선 + 포스터 폴백 + bg_ 금지"로 뒤집는다. 그런 다음 이미 저장된 25개 이벤트를 같은 규칙으로 재수집해 덮어쓴다.

**Tech Stack:** Node 워크플로우 스크립트(에이전트 오케스트레이션, LLM 에이전트 + curl/grep), Supabase(execute_sql).

## Global Constraints

- 테스트 러너 없음 (CLAUDE.md). 검증은 `node --check` 구문 검사 + DB/이미지 스팟체크로 한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트에 절대 노출 금지 — 서버측 Bash/MCP 호출에만 사용.
- Supabase project id: `swihknyicqddjqgxpmwt`.
- 워크플로우 상단 상수(`TODAY`/`URGENCY_THRESHOLD`/`PREV_CHECKED_IDS`)는 이 작업과 무관 — 플레이스홀더 그대로 둔다.

---

### Task 1: 워크플로우 이미지 수집 규칙 뒤집기 (og:image 우선 + bg_ 금지)

**Files:**
- Modify: `.claude/workflows/sale-maintenance.js:83` (BRAND_FINDINGS_SCHEMA image_url 설명)
- Modify: `.claude/workflows/sale-maintenance.js:221` (프롬프트 image_url 지침)

**Interfaces:**
- Produces: 이후 모든 유지보수 실행이 image_url을 og:image 우선 규칙으로 채움. Task 2 백필도 같은 규칙 문장을 재사용.

- [ ] **Step 1: 스키마 image_url 설명(줄 83) 교체**

기존:
```js
image_url: { type: 'string', description: '이 세일/기획전을 소개하는 실제 배너·키비주얼 이미지 URL (없으면 빈 문자열). 브랜드 로고나 사이트 공통 og:image는 절대 넣지 말 것 — 반드시 이 이벤트 전용 캠페인 이미지여야 함.' },
```
신규:
```js
image_url: { type: 'string', description: '이 세일을 대표하는 완성된 카드 썸네일 이미지 URL (없으면 빈 문자열). 우선순위: (1) 페이지 og:image가 캠페인 전용 이미지면 그것을 사용, (2) og:image가 브랜드 로고/사이트 공통 기본이미지면 버리고 본문의 완성 포스터(kv/key_visual)를 사용. bg_/background 같은 배경 레이어 파일은 절대 사용 금지 — 텍스트·제품이 합성되기 전 배경만 나옴.' },
```

- [ ] **Step 2: 프롬프트 image_url 지침(줄 221) 교체**

기존(줄 221 전체):
```
- image_url: event_url 페이지를 찾았다면 그 raw HTML에서 이 세일 전용 배너/키비주얼 이미지 URL을 함께 찾을 것. 방법: curl로 받은 HTML에서 img 태그나 background-image, 혹은 "kv"/"key_visual"/"banner"/"main" 같은 이름의 이미지 경로를 grep. <meta property="og:image">는 대부분 브랜드 로고나 사이트 공통 썸네일이므로 절대 사용하지 말 것 — 반드시 페이지 본문 안에서 이 캠페인만의 이미지를 찾을 것. 이미지 URL을 curl -sI로 접속 확인(HTTP 200, content-type: image/*)까지 하고 나서 기재. 못 찾으면 빈 문자열("")로 둘 것 — 무리해서 추측하지 말 것.
```
신규:
```
- image_url: event_url 페이지의 "완성된 대표 썸네일 한 장"을 찾을 것 (카카오톡이 링크 붙일 때 보여주는 그 이미지). 우선순위대로 시도:
  1) curl로 raw HTML을 받아 <meta property="og:image" content="..."> 를 추출 (없으면 og:image:secure_url, twitter:image 도 확인).
  2) 그 og:image가 "이 캠페인 전용 이미지"인지 "범용 브랜드 로고/사이트 기본 공유이미지"인지 판단. 버리는 신호: URL/파일명이 logo·default·common·share·og-default·main 뿐이거나 브랜드명 단독이거나 브랜드 홈 대문과 동일. 캠페인 신호: 경로에 캠페인/이벤트 코드·날짜·시즌명 포함(예: /campaign/..., /event/260713_...).
  3) 캠페인 전용 og:image면 그대로 채택.
  4) og:image가 범용 로고라 버렸거나 아예 없으면 폴백: 본문 HTML에서 img/background-image 중 "kv"/"key_visual"/"pc_kv"/"_1PCE_"/"top"/"banner" 같은 완성 포스터를 grep. 단 파일명에 bg_ · background · _bg 가 들어간 배경 레이어는 절대 쓰지 말 것 — 텍스트·제품 합성 전 배경만 나옴.
  5) 고른 이미지 URL을 curl -sI로 접속 확인(HTTP 200, content-type: image/*)한 뒤 기재. 아무것도 못 찾으면 빈 문자열("")로 둘 것 — 추측 금지.
```

- [ ] **Step 3: 구문 검사**

Run: `node --check /Users/kohjoowon/jigumia-admin/.claude/workflows/sale-maintenance.js`
Expected: 출력 없음(정상), 종료코드 0.

- [ ] **Step 4: 육안 확인**

`.claude/workflows/sale-maintenance.js`에서 줄 83과 image_url 지침 블록이 신규 문장으로 바뀌고 기존 "og:image ... 절대 사용하지 말 것" 문구가 사라졌는지 grep으로 확인:
Run: `grep -n "og:image" /Users/kohjoowon/jigumia-admin/.claude/workflows/sale-maintenance.js`
Expected: "절대 사용하지 말 것"류가 사라지고 "우선"/"캠페인 전용" 문구가 보임.

---

### Task 2: 기존 25개 이벤트 image_url 재수집(덮어쓰기)

**Files:**
- 없음(스크립트 파일 변경 없음). Supabase execute_sql + 에이전트 팬아웃으로 수행.

**Interfaces:**
- Consumes: Task 1에서 확정한 og:image 우선 규칙 문장.

- [ ] **Step 1: 대상 조회**

image_url이 채워진 이벤트 전체를 조회(id, title, event_url, 현재 image_url). event_url이 없는 건은 재수집 불가이므로 제외(그대로 둠).
```sql
SELECT s.id, s.title, s.event_url, s.image_url
FROM sale_events s
WHERE s.image_url IS NOT NULL AND s.image_url <> ''
  AND s.event_url IS NOT NULL AND s.event_url <> '';
```

- [ ] **Step 2: 이벤트별 og:image 재수집 (에이전트 팬아웃)**

각 이벤트의 event_url에 대해 Task 1의 우선순위 규칙(og:image 우선 → 범용 로고면 폴백 → bg_ 금지 → curl -sI 200/image 확인)을 그대로 적용해 새 image_url 한 장을 반환하는 서브에이전트를 병렬 실행. 각 에이전트는 {id, new_image_url} 반환. 좋은 이미지 못 찾으면 new_image_url을 빈 문자열로 두고, 그 경우 기존 값을 유지(덮어쓰지 않음).

- [ ] **Step 3: 덮어쓰기 UPDATE**

new_image_url이 비어있지 않고 기존과 다른 건만 덮어쓴다:
```sql
UPDATE sale_events SET image_url = data.url
FROM (VALUES ('<id>'::uuid, '<new_url>'), ...) AS data(id, url)
WHERE sale_events.id = data.id;
```

- [ ] **Step 4: 스팟체크**

바뀐 건 중 특히 기존이 bg_였던 삼성 "삼성 AI 신혼가전"이 배경이 아닌 완성 이미지로 바뀌었는지 확인:
```sql
SELECT title, image_url FROM sale_events
WHERE title IN ('삼성 AI 신혼가전') OR image_url LIKE '%bg_%';
```
Expected: bg_ 파일명이 남아있지 않음.

- [ ] **Step 5: 메모리 갱신**

`project_sale_event_image_url.md`에 "2026-07-19: 수집 전략을 og:image 우선 + 포스터 폴백으로 변경, 기존 25건 재수집" 한 줄 추가.

---

## Self-Review

- **Spec coverage:** A(워크플로우 규칙 뒤집기)=Task 1, B(기존 25건 재수집)=Task 2. 앱 렌더링 변경 없음=범위 밖 명시. 커버 완료.
- **Placeholder scan:** `<id>`/`<new_url>`은 Step 2 결과로 치환되는 실제 값 자리표시로, 실행 시 채워짐 — 플랜상 미결 항목 아님.
- **Type consistency:** image_url은 전 구간 string. 폴백/우선순위 용어(og:image, bg_ 금지, kv)가 Task 1·2에서 동일하게 사용됨.
