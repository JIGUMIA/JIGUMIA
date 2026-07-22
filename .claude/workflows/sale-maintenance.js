export const meta = {
  name: 'sale-maintenance',
  description: 'JIGUMIA 일일 세일 유지보수 — 브랜드 로테이션 (12개씩, ID 기반 포인터)',
  phases: [
    { title: '준비', detail: 'DB 조회 + 오늘 체크할 브랜드 선정' },
    { title: '리서치', detail: '브랜드별 현재 세일 정보 수집' },
    { title: 'DB 반영', detail: '신규 이벤트 INSERT' },
  ],
}

// ─── 메인 세션이 실행 전에 Edit 툴로 직접 설정하는 상수 ──────────────────────
// args가 named workflow에서 전달되지 않는 버그 우회책.
// CLAUDE.md "Daily Sale Maintenance" 참조.
const TODAY = 'YYYY-MM-DD'              // 실행 전 메인 세션이 오늘 날짜로 교체
const URGENCY_THRESHOLD = 'YYYY-MM-DD' // 실행 전 메인 세션이 today+3일로 교체
const PREV_CHECKED_IDS = []            // 실행 전 메인 세션이 포인터 파일의 배열로 교체
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 12
const PROJECT_ID = 'swihknyicqddjqgxpmwt'

// ─── Schemas ────────────────────────────────────────────────────────────────

const DB_STATE_SCHEMA = {
  type: 'object',
  properties: {
    brands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          website_url: { type: 'string' }
        },
        required: ['id', 'name', 'category', 'website_url']
      }
    },
    activeEvents: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          brand_id: { type: 'string' },
          title: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          status: { type: 'string' },
          event_url: { type: 'string' },
          image_url: { type: 'string' }
        },
        required: ['id', 'brand_id', 'title', 'start_date', 'end_date', 'status']
      }
    }
  },
  required: ['brands', 'activeEvents']
}

const BRAND_FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    brand_id: { type: 'string' },
    brand_name: { type: 'string' },
    searches_done: {
      type: 'array',
      items: { type: 'string' },
      description: '실제로 실행한 검색어/방문 URL 목록 (감사 로그용, 최소 3개)'
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          discount_rate: { type: 'number' },
          description: { type: 'string', description: '앱 사용자에게 보여줄 세일 상세 설명 — 무엇을, 얼마나, 어떻게 할인하는지 자연스러운 문장으로 서술 (대상 품목/카테고리, 할인 방식, 특이사항 등). 조사 과정이나 출처 확인 방법 같은 리서치 메모는 절대 넣지 말 것. 가독성을 위해 문장 하나당 줄바꿈(\\n)으로 구분할 것 — 여러 문장을 한 줄에 쭉 이어 쓰지 말 것.' },
          source_url: { type: 'string' },
          event_url: { type: 'string', description: '브랜드 공식 사이트 내 해당 이벤트를 설명하는 페이지 URL (없으면 빈 문자열)' },
          image_url: { type: 'string', description: '이 세일을 대표하는 완성된 카드 썸네일 이미지 URL (없으면 빈 문자열). 우선순위: (1) 페이지 og:image가 캠페인 전용 이미지면 그것을 사용, (2) og:image가 브랜드 로고/사이트 공통 기본이미지면 버리고 본문의 완성 포스터(kv/key_visual)를 사용. bg_/background 같은 배경 레이어 파일은 절대 사용 금지 — 텍스트·제품이 합성되기 전 배경만 나옴.' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['title', 'start_date', 'end_date', 'source_url', 'confidence']
      }
    },
    updates: {
      type: 'array',
      description: '이미 DB에 등록된 이벤트 중 event_url 또는 image_url이 비어있어서 이번에 새로 찾아 채운 것들 (신규 이벤트 아님 — events 배열과 별개)',
      items: {
        type: 'object',
        properties: {
          event_id: { type: 'string', description: '기존 이벤트의 id (DB에 등록된 이벤트 목록에서 그대로 사용)' },
          event_url: { type: 'string' },
          image_url: { type: 'string' }
        },
        required: ['event_id']
      }
    }
  },
  required: ['brand_id', 'brand_name', 'searches_done', 'events']
}

const INSERT_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    inserted: { type: 'number' },
    skipped: { type: 'number' },
    summary: { type: 'string' }
  },
  required: ['inserted', 'skipped', 'summary']
}

// ─── Phase 1: 준비 ──────────────────────────────────────────────────────────

phase('준비')

const dbState = await agent(
  `Use the mcp__plugin_supabase_supabase__execute_sql tool to query Supabase project "${PROJECT_ID}".

Run query 1:
SELECT id, name, category, website_url FROM brands ORDER BY name ASC

Run query 2:
SELECT id, brand_id, title, start_date, end_date, status, event_url, image_url FROM sale_events WHERE status IN ('active', 'upcoming') ORDER BY end_date ASC

Return JSON:
{
  "brands": [{"id":"...","name":"...","category":"...","website_url":"..."}],
  "activeEvents": [{"id":"...","brand_id":"...","title":"...","start_date":"...","end_date":"...","status":"...","event_url":"...","image_url":"..."}]
}`,
  { label: 'db-query', schema: DB_STATE_SCHEMA }
)

const { brands, activeEvents } = dbState

// 삭제된 브랜드 ID 자동 정리: DB에 존재하는 ID만 유지
const validBrandIds = new Set(brands.map(b => b.id))
const prevCheckedIds = PREV_CHECKED_IDS.filter(id => validBrandIds.has(id))
const checkedIds = new Set(prevCheckedIds)

// 아직 안 체크한 브랜드
let unchecked = brands.filter(b => !checkedIds.has(b.id))

// 전부 완료 시 리셋 → 처음부터 다시
const didReset = unchecked.length === 0
if (didReset) {
  log(`전체 ${brands.length}개 브랜드 완료 → 로테이션 리셋`)
  unchecked = [...brands]
  checkedIds.clear()
}

// 로테이션 배치: 미체크 브랜드 중 앞에서 BATCH_SIZE개
const regularBatch = unchecked.slice(0, BATCH_SIZE)
const regularBatchIds = new Set(regularBatch.map(b => b.id))

// 긴급 브랜드(만료 3일 이내): 배치에 없는 것만 앞에 추가
const urgentBrandIds = new Set(
  activeEvents
    .filter(e => e.end_date >= TODAY && e.end_date <= URGENCY_THRESHOLD)
    .map(e => e.brand_id)
)
const urgentExtra = brands.filter(b => urgentBrandIds.has(b.id) && !regularBatchIds.has(b.id) && !checkedIds.has(b.id))

const targetBrands = [...urgentExtra, ...regularBatch]

// 포인터 갱신용: 기존 체크 목록 + 이번 배치 (긴급 추가분은 제외 — 정규 로테이션 아님)
const newCheckedBrandIds = didReset
  ? regularBatch.map(b => b.id)
  : [...prevCheckedIds, ...regularBatch.map(b => b.id)]

log(`오늘 체크: ${targetBrands.length}개 (긴급 ${urgentExtra.length}개 + 로테이션 ${regularBatch.length}개)`)
log(`진행률: ${newCheckedBrandIds.length} / ${brands.length}`)

// ─── Phase 2: 리서치 ────────────────────────────────────────────────────────

phase('리서치')

const findings = await pipeline(
  targetBrands,
  (brand) => {
    const existing = activeEvents.filter(e => e.brand_id === brand.id)
    const existingStr = existing.length > 0
      ? existing.map(e => `- [id:${e.id}] ${e.title} (${e.start_date}~${e.end_date}, ${e.status}) — event_url:${e.event_url ? '있음' : '없음'}, image_url:${e.image_url ? '있음' : '없음'}`).join('\n')
      : '없음'
    const missingUrlEvents = existing.filter(e => !e.event_url || !e.image_url)

    return agent(
      `브랜드: ${brand.name} (${brand.category})
공식 사이트: ${brand.website_url}
오늘 날짜: ${TODAY}

현재 DB에 등록된 이벤트:
${existingStr}

할 일 — 아래 3가지를 전부 수행할 것 (site+SNS만으로는 시즌오프/멤버스데이 같은 정기 행사를 놓친 전례 있음):
1. 공식 사이트 접속 → 현재 진행 중이거나 곧 시작하는 세일/행사 확인
2. 공식 SNS(인스타그램/카카오 채널) 검색 → 최신 세일 공지 확인
3. 웹/뉴스 검색 — 아래 키워드 조합을 모두 검색: "${brand.name} 세일", "${brand.name} 시즌오프", "${brand.name} 할인", "${brand.name} SALE". 뉴스 기사·커뮤니티 언급도 확인 (공식 채널이 놓친 행사를 뉴스가 먼저 보도하는 경우 많음).

포함 기준: 브랜드 전체 할인 행사, 멤버십데이/위크, 시즌오프, 대규모 기획전
제외 기준: 개별 상품 할인, 단일 매장/지점 행사, 상시 쿠폰·포인트, 카드사 제휴 프로모
${missingUrlEvents.length > 0 ? `
추가 할 일 — 기존 이벤트 정보 보강: 위에 event_url 또는 image_url이 "없음"으로 표시된 이벤트(${missingUrlEvents.map(e => `[id:${e.id}] ${e.title}`).join(', ')})가 있음. 1번(공식 사이트 접속) 과정에서 이 이벤트들의 공식 페이지를 찾게 되면, event_url(이벤트 상세 페이지 URL)과 image_url(이 이벤트 전용 배너/키비주얼, 위 image_url 작성 기준과 동일하게 검증)을 찾아서 updates 배열에 담아 보고할 것. 못 찾으면 그냥 생략 — 억지로 채우지 말 것.` : ''}

이미 등록된 이벤트는 중복 제출 금지.
신규 이벤트 없으면 events: [] 반환 — 단, 이 경우에도 searches_done에는 위 3단계에서 실제 실행한 검색어/방문 URL을 반드시 기록 (사후 감사용, "찾지 못함"이 아니라 "무엇을 확인했는지"가 남아야 함).
brand_id는 반드시 "${brand.id}" 그대로 사용.

주의 — 회차 혼동 금지: "시즌오프", "멤버스데이", "블랙프라이데이" 등은 매년/매월 반복되는 행사명이라 검색 결과에 여러 회차(작년, 지난달, 다른 기간)가 섞여 나옴. 찾은 기사/공지의 날짜가 오늘(${TODAY}) 기준으로 이미 끝난 것처럼 보이는데도 그 캠페인 페이지가 여전히 접속 가능하고 라이브해 보인다면, 그 기사는 다른 회차일 가능성이 높음 — 이 경우 해당 기사의 세부 수치(정확한 할인율 breakdown 등)를 그대로 가져다 쓰지 말고, confidence를 "low"로 낮추고 description에 "정확한 기간/세부 할인율 미확인"이라고 명시할 것. 불확실한 정보를 확정된 것처럼 적지 말 것.

JS 렌더링 페이지 대응법: 브랜드 공식 사이트의 캠페인 페이지가 SPA(예: musinsa.com/campaign/*, Next.js 기반 사이트)라 WebFetch로 텍스트가 안 보이면, 포기하지 말고 Bash로 raw HTML을 직접 받아서 확인할 것:
  curl -s "<페이지 URL>" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
Next.js 사이트는 <script id="__NEXT_DATA__" type="application/json"> 태그 안에 서버 렌더링된 페이지 데이터(JSON)가 그대로 들어있는 경우가 많음 — 여기서 startAt/endAt/status 같은 필드를 grep으로 찾으면 JS 실행 없이도 정확한 날짜를 확인할 수 있음 (실제로 무신사 시즌오프 캠페인에서 이 방법으로 정확한 기간을 확인한 전례 있음). 이 방법으로도 못 찾으면 그때 low confidence로 보고할 것 — 무리해서 추측하지 말 것.

URL 필드 3개는 용도가 다름 — 혼동하지 말 것:
- source_url: 이 세일 정보를 "확인한" 실제 페이지 URL (뉴스 기사, SNS 공지, 공식 사이트 등 무엇이든 가능). 반드시 실제로 접속해서 확인한 URL만 기재.
- event_url: 브랜드 "공식 사이트" 내에서 이 이벤트를 직접 설명하는 페이지 URL (예: 이벤트/기획전 상세 페이지). 뉴스 기사나 SNS 링크는 절대 여기 넣지 말 것. 공식 사이트에 해당 이벤트를 설명하는 별도 페이지가 없으면 빈 문자열("")로 둘 것 — 홈페이지 기본 URL을 대신 넣지 말 것.
- image_url: event_url 페이지의 "완성된 대표 썸네일 한 장"을 찾을 것 (카카오톡이 링크 붙일 때 보여주는 그 이미지). 우선순위대로 시도:
  1) curl로 raw HTML을 받아 <meta property="og:image" content="..."> 를 추출 (없으면 og:image:secure_url, twitter:image 도 확인).
  2) 그 og:image가 "이 캠페인 전용 이미지"인지 "범용 브랜드 로고/사이트 기본 공유이미지"인지 판단. 버리는 신호: URL/파일명이 logo·default·common·share·og-default·main 뿐이거나 브랜드명 단독이거나 브랜드 홈 대문과 동일. 캠페인 신호: 경로에 캠페인/이벤트 코드·날짜·시즌명 포함(예: /campaign/..., /event/260713_...).
  3) 캠페인 전용 og:image면 그대로 채택.
  4) og:image가 범용 로고라 버렸거나 아예 없으면 폴백: 본문 HTML에서 img/background-image 중 "kv"/"key_visual"/"pc_kv"/"_1PCE_"/"top"/"banner" 같은 완성 포스터를 grep. 단 파일명에 bg_ · background · _bg 가 들어간 배경 레이어는 절대 쓰지 말 것 — 텍스트·제품 합성 전 배경만 나옴.
  5) 고른 이미지 URL을 curl -sI로 접속 확인(HTTP 200, content-type: image/*)한 뒤 기재. 아무것도 못 찾으면 빈 문자열("")로 둘 것 — 추측 금지.
  주의 — 초와이드 배경 스트립 금지: kv/포스터라도 가로:세로 비율이 약 3:1 이상으로 지나치게 넓고 납작하면(예: 1920x425) 그건 페이지 상단 히어로 배경 스트립이라 텍스트가 CSS로 얹혀 있고 이미지 자체엔 여백만 크게 나옴 — 카드 썸네일로 부적합. 이런 경우 그 kv 대신 캠페인 전용 og:image(대개 1080x584처럼 카드 비율에 제목·기간·제품이 다 합성돼 있음)를 우선할 것. 즉 og:image가 캠페인 전용이면 kv가 있어도 og:image를 택함. 특히 삼성(samsung.com/sec/event) 페이지는 /kv/ 파일이 와이드 배경 스트립이고 /kdp/seo/ og:image가 완성 카드인 전형적 사례.

description 작성 기준 (중요 — 이 필드는 앱에서 사용자에게 그대로 노출됨):
- 세일 자체를 설명하는 자연스러운 문장으로 작성할 것. 예: "여름 신상품과 클리어런스 아이템을 대상으로 최대 50% 할인하는 기획전으로, 티셔츠·바캉스 용품 등이 포함됩니다."
- 반드시 포함: 할인 대상(품목/카테고리), 할인 방식이나 규모(가능한 경우), 참여 방법이나 특이사항(쿠폰, 선착순, 온/오프라인 구분 등 있는 경우만).
- 절대 넣지 말 것: "raw HTML로 확인", "meta description에 명시", "뉴스 기사 1건만으로 확인", "공식 페이지를 찾지 못함" 같은 리서치 과정/검증 방법 서술. 이런 내용은 description이 아니라 confidence 필드와 아래 저확신 caveat 규칙으로만 표현할 것.
- 정보가 불확실한 경우(위 회차 혼동 규칙 등으로 confidence를 low로 낮춘 경우)에만, description 끝에 짧게 "(정확한 기간/할인율은 미확정)"처럼 사용자가 이해할 수 있는 자연스러운 문구 한 줄만 덧붙일 것 — 조사 방법론은 여전히 언급하지 말 것.
- 가독성: 문장 하나당 줄바꿈(\n)으로 나눠 쓸 것. 여러 문장을 공백으로 이어 붙인 하나의 문단으로 쓰지 말 것 — 앱 화면에서 쭉 붙어 보여 가독성이 떨어짐.
- source_url은 절대 description에 포함하지 말 것 ("출처: <url>" 같은 표기 금지, 매체명 언급도 금지 — 예: "OO 뉴스룸 및 OO 기사 기준" 같은 문구도 금지). source_url은 별도 필드로만 보고하고, 그 출처를 밝히는 문장은 description에 절대 쓰지 말 것 — description은 순수하게 세일 내용만 담을 것.`,
      { label: brand.name, phase: '리서치', schema: BRAND_FINDINGS_SCHEMA }
    )
  }
)

// 신규 이벤트 없음 + 검색 기록이 부실한 브랜드는 감사 로그로 노출 (조용히 누락되는 것 방지)
const thinResearch = findings
  .filter(Boolean)
  .filter(f => (f.events || []).length === 0 && (f.searches_done || []).length < 3)
  .map(f => f.brand_name)

if (thinResearch.length > 0) {
  log(`⚠ 검색 기록 부실 (재확인 권장): ${thinResearch.join(', ')}`)
}

// ─── Phase 3: DB 반영 ───────────────────────────────────────────────────────

phase('DB 반영')

const toInsert = findings
  .filter(Boolean)
  .flatMap(f =>
    (f.events || [])
      .filter(e => e.confidence === 'high' || e.confidence === 'medium')
      .map(e => ({
        brand_id: f.brand_id,
        brand_name: f.brand_name,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        discount_rate: e.discount_rate !== undefined ? e.discount_rate : null,
        description: e.description || null,
        event_url: e.event_url || null,
        image_url: e.image_url || null,
        status: e.start_date > TODAY ? 'upcoming' : e.end_date < TODAY ? 'ended' : 'active'
      }))
  )

const toUpdate = findings
  .filter(Boolean)
  .flatMap(f => (f.updates || []).filter(u => u.event_url || u.image_url))

log(`INSERT 대상: ${toInsert.length}건, 기존 이벤트 URL 보강 대상: ${toUpdate.length}건`)

let insertResult = { inserted: 0, skipped: 0, summary: '신규 이벤트 없음' }

if (toInsert.length > 0) {
  insertResult = await agent(
    `Supabase project "${PROJECT_ID}"에 아래 이벤트들을 INSERT해주세요.

각 이벤트마다:
1. 중복 확인: SELECT id FROM sale_events WHERE brand_id='<id>' AND title='<title>' AND start_date='<start>'
2. 결과가 없으면 INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, event_url, image_url, status) VALUES (...)
3. 이미 존재하면 skip (오류 아님, skipped 카운트 증가)

이벤트 목록:
${JSON.stringify(toInsert, null, 2)}

모든 처리 완료 후 inserted(실제 삽입 수), skipped(중복 skip 수), summary(브랜드별 결과 한 줄 요약) 반환.`,
    { label: 'db-insert', schema: INSERT_RESULT_SCHEMA }
  )
}

let updated = 0

if (toUpdate.length > 0) {
  const updateResult = await agent(
    `Supabase project "${PROJECT_ID}"의 sale_events 테이블에서 기존 이벤트들의 event_url/image_url을 보강해주세요.

각 항목마다:
1. UPDATE sale_events SET event_url = COALESCE(NULLIF(event_url, ''), '<event_url>'), image_url = COALESCE(NULLIF(image_url, ''), '<image_url>') WHERE id = '<event_id>' — 값이 없는 필드만 지정해서 UPDATE (기존에 이미 값이 있으면 절대 덮어쓰지 말 것)
2. 항목에 event_url이 없으면 event_url은 건드리지 말고 image_url만, 반대도 마찬가지

업데이트 목록:
${JSON.stringify(toUpdate, null, 2)}

모든 처리 완료 후 updated(실제 UPDATE된 행 수) 반환.`,
    { label: 'db-update', schema: { type: 'object', properties: { updated: { type: 'number' } }, required: ['updated'] } }
  )
  updated = updateResult.updated || 0
}

log(`완료 — ${insertResult.inserted}건 추가, ${insertResult.skipped}건 스킵, ${updated}건 URL 보강`)

// 포인터는 메인 세션이 newCheckedBrandIds를 받아 직접 파일에 씀
return {
  checkedBrands: targetBrands.map(b => b.name),
  newCheckedBrandIds,
  inserted: insertResult.inserted,
  skipped: insertResult.skipped,
  updated,
  progress: `${newCheckedBrandIds.length} / ${brands.length}`,
  summary: insertResult.summary,
  thinResearch
}
