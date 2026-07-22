# Brand Sale Event Crawling System Design

## Overview

어드민 패널에서 버튼 클릭으로 올리브영/무신사/29cm의 세일 이벤트를 크롤링하고, 결과를 검수한 뒤 선택적으로 `sale_events` 테이블에 저장하는 시스템.

## Target Platforms

| Platform | Category | Sale Page |
|----------|----------|-----------|
| 올리브영 | 뷰티 | 세일/기획전 페이지 |
| 무신사 | 패션 | 세일 페이지 |
| 29cm | 라이프스타일 | 세일/기획전 페이지 |

## Architecture

```
[어드민 UI: /crawl] → 크롤링 버튼 클릭
    ↓
[API Route: /api/crawl/[platform]] → 플랫폼별 크롤러 실행
    ↓
[크롤러 모듈: lib/crawlers/*] → HTML 파싱 (cheerio)
    ↓
[검수 UI] → 크롤링 결과를 테이블로 표시 (체크박스 선택)
    ↓ (사용자가 항목 선택 + 수정)
[API Route: /api/sale-events] → 선택한 항목만 sale_events에 저장
```

## Components

### 1. Crawler Modules (`lib/crawlers/`)

플랫폼별 크롤러. 공통 인터페이스를 구현한다.

```ts
// lib/crawlers/types.ts
interface CrawlResult {
  platform: 'oliveyoung' | 'musinsa' | '29cm';
  title: string;
  start_date: string | null;
  end_date: string | null;
  discount_rate: string | null;
  description: string;
  source_url: string;
}

interface Crawler {
  crawl(): Promise<CrawlResult[]>;
}
```

파일 구조:
- `lib/crawlers/types.ts` — 공통 타입 정의
- `lib/crawlers/oliveyoung.ts` — 올리브영 크롤러
- `lib/crawlers/musinsa.ts` — 무신사 크롤러
- `lib/crawlers/twentynine.ts` — 29cm 크롤러
- `lib/crawlers/index.ts` — 플랫폼명으로 크롤러를 선택하는 팩토리

HTML 파싱에는 `cheerio`를 사용한다. 서버 사이드에서만 동작하며 브라우저 엔진이 불필요하다. JS 렌더링이 필수인 플랫폼이 발견되면 추후 Puppeteer를 검토한다.

### 2. API Route (`/api/crawl/[platform]`)

- **Method**: POST
- **Auth**: `verifyAdmin()` 인증 필수
- **Input**: platform path parameter (`oliveyoung` | `musinsa` | `29cm`)
- **Output**: `{ results: CrawlResult[], errors?: string[] }`
- DB에 저장하지 않음 — 크롤링 결과만 JSON으로 반환
- 파싱 실패 시 에러 메시지를 `errors` 배열에 포함

### 3. Admin UI (`app/(admin)/crawl/`)

**페이지 구성:**
- `page.tsx` — 서버 컴포넌트 (인증 확인, brands 데이터 prefetch)
- `CrawlClient.tsx` — 클라이언트 컴포넌트 (크롤링 실행, 결과 표시, 저장)

**UI 흐름:**
1. 플랫폼 선택 (올리브영 / 무신사 / 29cm 탭 또는 버튼)
2. "크롤링 실행" 버튼 클릭 → 로딩 표시
3. 결과 테이블 표시:
   - 체크박스 (선택/전체선택)
   - title, start_date, end_date, discount_rate, description, source_url
   - 각 필드는 인라인 수정 가능
   - 브랜드 매핑 드롭다운 (기존 brands 테이블에서 선택)
4. "선택 항목 저장" 버튼 → `/api/sale-events`에 POST → 성공 시 토스트

### 4. Sale Events Batch API

기존 `/api/sale-events` route에 bulk insert 기능을 추가하거나, 별도 `/api/sale-events/batch` route를 만든다.

- **Method**: POST
- **Body**: `{ events: Array<Omit<SaleEvent, 'id' | 'created_at'>> }`
- **Auth**: `verifyAdmin()` 인증 필수

## Data Flow

1. 사용자가 플랫폼 선택 후 크롤링 실행
2. API가 해당 플랫폼 크롤러를 호출하여 HTML fetch + 파싱
3. 파싱 결과를 CrawlResult[] 형태로 클라이언트에 반환
4. 사용자가 결과 검수: 필요 없는 항목 제외, 정보 수정, 브랜드 매핑
5. 선택한 항목을 sale_events 형식으로 변환 후 batch API로 저장

## Error Handling

- 크롤링 대상 사이트 접속 불가 → "사이트에 접속할 수 없습니다" 에러 표시
- HTML 구조 변경으로 파싱 실패 → "파싱 실패: 사이트 구조가 변경되었을 수 있습니다" 에러 + 빈 결과
- 부분 파싱 성공 → 성공한 항목은 표시, 실패 항목은 errors 배열로 알림

## Sidebar Navigation

기존 Sidebar 컴포넌트에 "크롤링" 메뉴 항목을 추가한다. 경로: `/crawl`

## Dependencies

- `cheerio` — HTML 파싱 (새로 추가)

## Constraints & Considerations

- 크롤링은 사이트 구조 변경에 취약하다. 파싱 로직은 플랫폼별로 분리하여 독립적으로 수정 가능하게 한다.
- 각 플랫폼의 robots.txt 및 이용약관을 확인해야 한다.
- 크롤링 요청 시 적절한 User-Agent 헤더와 요청 간격을 설정한다.
- cheerio로 시작하되, CSR(Client-Side Rendering) 사이트는 필요 시 Puppeteer로 전환한다.
