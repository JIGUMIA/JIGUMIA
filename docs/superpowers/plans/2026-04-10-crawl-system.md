# Brand Sale Event Crawling System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 어드민 패널에서 올리브영/무신사/29cm 세일 이벤트를 크롤링하고, 검수 후 선택 저장하는 시스템 구축.

**Architecture:** 플랫폼별 크롤러 모듈(`lib/crawlers/`) → API Route(`/api/crawl/[platform]`) → 어드민 UI(`/crawl`)로 결과 검수 → 기존 `/api/sale-events` batch insert. 기존 코드 패턴(server component → Client component, verifyAdmin, createAdminClient)을 그대로 따른다.

**Tech Stack:** Next.js 16, cheerio (HTML 파싱), 기존 Supabase/Tailwind/Lucide 스택

**Note:** 이 프로젝트에는 테스트 러너가 설정되어 있지 않으므로, 각 태스크는 `npm run build` 및 브라우저 수동 검증으로 확인한다.

---

### Task 1: cheerio 설치 및 크롤러 타입 정의

**Files:**
- Create: `lib/crawlers/types.ts`
- Modify: `package.json` (cheerio 추가)

- [ ] **Step 1: cheerio 설치**

```bash
npm install cheerio
```

- [ ] **Step 2: 크롤러 공통 타입 정의**

Create `lib/crawlers/types.ts`:

```ts
export type Platform = 'oliveyoung' | 'musinsa' | '29cm';

export interface CrawlResult {
  platform: Platform;
  title: string;
  start_date: string | null;
  end_date: string | null;
  discount_rate: string | null;
  description: string;
  source_url: string;
}

export interface Crawler {
  crawl(): Promise<CrawlResult[]>;
}
```

- [ ] **Step 3: 타입을 types/index.ts에 re-export**

Append to `types/index.ts`:

```ts
// Crawl types
export type { Platform, CrawlResult } from '@/lib/crawlers/types';
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 빌드 성공 (타입만 추가했으므로 에러 없음)

- [ ] **Step 5: Commit**

```bash
git add lib/crawlers/types.ts types/index.ts package.json package-lock.json
git commit -m "feat(crawl): add cheerio and crawler type definitions"
```

---

### Task 2: 올리브영 크롤러 구현

**Files:**
- Create: `lib/crawlers/oliveyoung.ts`

올리브영 세일/기획전 페이지(https://www.oliveyoung.co.kr/store/main/getPromotionList.do 등)를 크롤링한다. 실제 HTML 구조는 크롤링 시 확인해야 하므로, 기본 골격을 작성하고 실제 셀렉터는 페이지를 fetch한 뒤 조정한다.

- [ ] **Step 1: 올리브영 크롤러 작성**

Create `lib/crawlers/oliveyoung.ts`:

```ts
import * as cheerio from 'cheerio';
import { CrawlResult, Crawler } from './types';

const OLIVEYOUNG_SALE_URL = 'https://www.oliveyoung.co.kr/store/main/getPromotionList.do';

export class OliveyoungCrawler implements Crawler {
  async crawl(): Promise<CrawlResult[]> {
    const res = await fetch(OLIVEYOUNG_SALE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`올리브영 페이지 접속 실패: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: CrawlResult[] = [];

    // 프로모션 리스트 항목 파싱
    // 실제 셀렉터는 HTML 구조 확인 후 조정 필요
    $('.promo-item, .exhibition-item, .plan_list li').each((_, el) => {
      const title = $(el).find('.title, .tit, h3').first().text().trim();
      const dateText = $(el).find('.date, .period, .txt_date').first().text().trim();
      const description = $(el).find('.desc, .txt, p').first().text().trim();
      const link = $(el).find('a').attr('href') ?? '';
      const sourceUrl = link.startsWith('http')
        ? link
        : `https://www.oliveyoung.co.kr${link}`;

      if (!title) return;

      const { startDate, endDate } = parseDateRange(dateText);

      results.push({
        platform: 'oliveyoung',
        title,
        start_date: startDate,
        end_date: endDate,
        discount_rate: extractDiscount($(el).text()),
        description: description || title,
        source_url: sourceUrl || OLIVEYOUNG_SALE_URL,
      });
    });

    return results;
  }
}

/** "2026.04.10 ~ 2026.04.20" 같은 형식 파싱 */
function parseDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const match = text.match(
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[~\-]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/
  );
  if (match) {
    const [, y1, m1, d1, y2, m2, d2] = match;
    return {
      startDate: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      endDate: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
    };
  }
  return { startDate: null, endDate: null };
}

/** 텍스트에서 할인율 추출 (예: "최대 50%") */
function extractDiscount(text: string): string | null {
  const match = text.match(/(최대\s*)?\d+%/);
  return match ? match[0] : null;
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add lib/crawlers/oliveyoung.ts
git commit -m "feat(crawl): add oliveyoung crawler"
```

---

### Task 3: 무신사 크롤러 구현

**Files:**
- Create: `lib/crawlers/musinsa.ts`

- [ ] **Step 1: 무신사 크롤러 작성**

Create `lib/crawlers/musinsa.ts`:

```ts
import * as cheerio from 'cheerio';
import { CrawlResult, Crawler } from './types';

const MUSINSA_SALE_URL = 'https://www.musinsa.com/events';

export class MusinsaCrawler implements Crawler {
  async crawl(): Promise<CrawlResult[]> {
    const res = await fetch(MUSINSA_SALE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`무신사 페이지 접속 실패: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: CrawlResult[] = [];

    // 이벤트/세일 리스트 파싱
    // 실제 셀렉터는 HTML 구조 확인 후 조정 필요
    $('.event-list-item, .event_list li, [class*="event"] li').each((_, el) => {
      const title = $(el).find('.title, .tit, h3, [class*="title"]').first().text().trim();
      const dateText = $(el).find('.date, .period, [class*="date"]').first().text().trim();
      const description = $(el).find('.desc, .txt, p').first().text().trim();
      const link = $(el).find('a').attr('href') ?? '';
      const sourceUrl = link.startsWith('http')
        ? link
        : `https://www.musinsa.com${link}`;

      if (!title) return;

      const { startDate, endDate } = parseDateRange(dateText);

      results.push({
        platform: 'musinsa',
        title,
        start_date: startDate,
        end_date: endDate,
        discount_rate: extractDiscount($(el).text()),
        description: description || title,
        source_url: sourceUrl || MUSINSA_SALE_URL,
      });
    });

    return results;
  }
}

function parseDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const match = text.match(
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[~\-]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/
  );
  if (match) {
    const [, y1, m1, d1, y2, m2, d2] = match;
    return {
      startDate: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      endDate: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
    };
  }
  return { startDate: null, endDate: null };
}

function extractDiscount(text: string): string | null {
  const match = text.match(/(최대\s*)?\d+%/);
  return match ? match[0] : null;
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add lib/crawlers/musinsa.ts
git commit -m "feat(crawl): add musinsa crawler"
```

---

### Task 4: 29cm 크롤러 구현

**Files:**
- Create: `lib/crawlers/twentynine.ts`

- [ ] **Step 1: 29cm 크롤러 작성**

Create `lib/crawlers/twentynine.ts`:

```ts
import * as cheerio from 'cheerio';
import { CrawlResult, Crawler } from './types';

const TWENTYNINE_SALE_URL = 'https://www.29cm.co.kr/collections/sale';

export class TwentynineCrawler implements Crawler {
  async crawl(): Promise<CrawlResult[]> {
    const res = await fetch(TWENTYNINE_SALE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`29cm 페이지 접속 실패: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: CrawlResult[] = [];

    // 세일/기획전 리스트 파싱
    // 실제 셀렉터는 HTML 구조 확인 후 조정 필요
    $('.exhibition-item, .sale-item, [class*="promotion"] li, [class*="exhibition"] li').each(
      (_, el) => {
        const title = $(el).find('.title, .tit, h3, [class*="title"]').first().text().trim();
        const dateText = $(el).find('.date, .period, [class*="date"]').first().text().trim();
        const description = $(el).find('.desc, .txt, p').first().text().trim();
        const link = $(el).find('a').attr('href') ?? '';
        const sourceUrl = link.startsWith('http')
          ? link
          : `https://www.29cm.co.kr${link}`;

        if (!title) return;

        const { startDate, endDate } = parseDateRange(dateText);

        results.push({
          platform: '29cm',
          title,
          start_date: startDate,
          end_date: endDate,
          discount_rate: extractDiscount($(el).text()),
          description: description || title,
          source_url: sourceUrl || TWENTYNINE_SALE_URL,
        });
      }
    );

    return results;
  }
}

function parseDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const match = text.match(
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[~\-]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/
  );
  if (match) {
    const [, y1, m1, d1, y2, m2, d2] = match;
    return {
      startDate: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      endDate: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
    };
  }
  return { startDate: null, endDate: null };
}

function extractDiscount(text: string): string | null {
  const match = text.match(/(최대\s*)?\d+%/);
  return match ? match[0] : null;
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add lib/crawlers/twentynine.ts
git commit -m "feat(crawl): add 29cm crawler"
```

---

### Task 5: 크롤러 팩토리 (index)

**Files:**
- Create: `lib/crawlers/index.ts`

- [ ] **Step 1: 팩토리 모듈 작성**

Create `lib/crawlers/index.ts`:

```ts
import { Platform, Crawler } from './types';
import { OliveyoungCrawler } from './oliveyoung';
import { MusinsaCrawler } from './musinsa';
import { TwentynineCrawler } from './twentynine';

const crawlers: Record<Platform, () => Crawler> = {
  oliveyoung: () => new OliveyoungCrawler(),
  musinsa: () => new MusinsaCrawler(),
  '29cm': () => new TwentynineCrawler(),
};

export function getCrawler(platform: Platform): Crawler {
  const factory = crawlers[platform];
  if (!factory) throw new Error(`Unknown platform: ${platform}`);
  return factory();
}

export const PLATFORMS: Platform[] = ['oliveyoung', 'musinsa', '29cm'];

export type { Platform, CrawlResult, Crawler } from './types';
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add lib/crawlers/index.ts
git commit -m "feat(crawl): add crawler factory index"
```

---

### Task 6: 크롤링 API Route

**Files:**
- Create: `app/api/crawl/[platform]/route.ts`

- [ ] **Step 1: API route 작성**

Create `app/api/crawl/[platform]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { getCrawler, PLATFORMS, Platform } from '@/lib/crawlers';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { platform } = await params;

  if (!PLATFORMS.includes(platform as Platform)) {
    return NextResponse.json(
      { error: `Invalid platform: ${platform}. Must be one of: ${PLATFORMS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const crawler = getCrawler(platform as Platform);
    const results = await crawler.crawl();
    return NextResponse.json({ results, errors: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ results: [], errors: [message] }, { status: 200 });
  }
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/crawl/
git commit -m "feat(crawl): add /api/crawl/[platform] route"
```

---

### Task 7: sale-events batch insert API

**Files:**
- Create: `app/api/sale-events/batch/route.ts`

- [ ] **Step 1: batch route 작성**

Create `app/api/sale-events/batch/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { events } = await req.json();

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: 'events array is required' }, { status: 400 });
  }

  // 필수 필드 검증
  for (const e of events) {
    if (!e.brand_id || !e.title || !e.start_date || !e.end_date) {
      return NextResponse.json(
        { error: `Missing required fields in event: ${e.title ?? '(no title)'}` },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sale_events')
    .insert(
      events.map((e: Record<string, unknown>) => ({
        brand_id: e.brand_id,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        discount_rate: e.discount_rate ?? null,
        description: e.description ?? null,
        status: e.status ?? 'upcoming',
      }))
    )
    .select();

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/sale-events/batch/
git commit -m "feat(crawl): add /api/sale-events/batch route"
```

---

### Task 8: 크롤링 어드민 페이지 (서버 컴포넌트)

**Files:**
- Create: `app/(admin)/crawl/page.tsx`

- [ ] **Step 1: 서버 컴포넌트 작성**

Create `app/(admin)/crawl/page.tsx`:

```tsx
import { createAdminClient } from '@/lib/supabase/server';
import CrawlClient from '@/components/crawl/CrawlClient';

export default async function CrawlPage() {
  const supabase = createAdminClient();
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, color')
    .order('name');

  return <CrawlClient brands={brands ?? []} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/crawl/
git commit -m "feat(crawl): add crawl server page"
```

---

### Task 9: 크롤링 클라이언트 컴포넌트

**Files:**
- Create: `components/crawl/CrawlClient.tsx`

이 컴포넌트가 가장 크다. 플랫폼 선택, 크롤링 실행, 결과 테이블(체크박스 + 인라인 수정 + 브랜드 매핑), 일괄 저장 기능을 포함한다.

- [ ] **Step 1: CrawlClient 컴포넌트 작성**

Create `components/crawl/CrawlClient.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Globe, Loader2, Check, AlertCircle } from 'lucide-react';
import type { CrawlResult, Platform } from '@/lib/crawlers/types';

interface Brand {
  id: string;
  name: string;
  color: string | null;
}

interface EditableResult extends CrawlResult {
  selected: boolean;
  brand_id: string;
  editing_title: string;
  editing_start_date: string;
  editing_end_date: string;
  editing_discount_rate: string;
  editing_description: string;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  oliveyoung: '올리브영',
  musinsa: '무신사',
  '29cm': '29cm',
};

export default function CrawlClient({ brands }: { brands: Brand[] }) {
  const [platform, setPlatform] = useState<Platform>('oliveyoung');
  const [results, setResults] = useState<EditableResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCrawl() {
    setLoading(true);
    setErrors([]);
    setMessage(null);
    setResults([]);

    try {
      const res = await fetch(`/api/crawl/${platform}`, { method: 'POST' });
      const data = await res.json();

      if (data.errors?.length) setErrors(data.errors);

      const editable: EditableResult[] = (data.results ?? []).map((r: CrawlResult) => ({
        ...r,
        selected: true,
        brand_id: '',
        editing_title: r.title,
        editing_start_date: r.start_date ?? '',
        editing_end_date: r.end_date ?? '',
        editing_discount_rate: r.discount_rate ?? '',
        editing_description: r.description,
      }));

      setResults(editable);
      if (editable.length === 0 && !data.errors?.length) {
        setMessage('크롤링 결과가 없습니다.');
      }
    } catch {
      setErrors(['크롤링 요청 중 오류가 발생했습니다.']);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(idx: number) {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  }

  function toggleSelectAll() {
    const allSelected = results.every((r) => r.selected);
    setResults((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  }

  function updateField(idx: number, field: string, value: string) {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    const selected = results.filter((r) => r.selected);
    if (selected.length === 0) {
      setMessage('저장할 항목을 선택해주세요.');
      return;
    }

    const missingBrand = selected.find((r) => !r.brand_id);
    if (missingBrand) {
      setMessage('모든 선택 항목에 브랜드를 지정해주세요.');
      return;
    }

    const missingDate = selected.find((r) => !r.editing_start_date || !r.editing_end_date);
    if (missingDate) {
      setMessage('모든 선택 항목에 시작일/종료일을 입력해주세요.');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const events = selected.map((r) => ({
        brand_id: r.brand_id,
        title: r.editing_title,
        start_date: r.editing_start_date,
        end_date: r.editing_end_date,
        discount_rate: r.editing_discount_rate || null,
        description: r.editing_description || null,
        status: 'upcoming' as const,
      }));

      const res = await fetch('/api/sale-events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(`저장 실패: ${err.error}`);
        return;
      }

      setMessage(`${selected.length}개 이벤트가 저장되었습니다.`);
      setResults([]);
    } catch {
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = results.filter((r) => r.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">세일 크롤링</h1>
      </div>

      {/* Platform tabs + crawl button */}
      <div className="flex items-center gap-3">
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPlatform(p);
              setResults([]);
              setErrors([]);
              setMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === p
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}

        <button
          onClick={handleCrawl}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
          {loading ? '크롤링 중...' : '크롤링 실행'}
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
          {message}
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={results.every((r) => r.selected)}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-600"
                    />
                  </th>
                  <th className="p-3 text-left">브랜드</th>
                  <th className="p-3 text-left">제목</th>
                  <th className="p-3 text-left">시작일</th>
                  <th className="p-3 text-left">종료일</th>
                  <th className="p-3 text-left">할인율</th>
                  <th className="p-3 text-left">설명</th>
                  <th className="p-3 text-left">원본</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-800 ${
                      r.selected ? 'bg-slate-800/50' : 'opacity-50'
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={() => toggleSelect(idx)}
                        className="rounded border-slate-600"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={r.brand_id}
                        onChange={(e) => updateField(idx, 'brand_id', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="">선택</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_title}
                        onChange={(e) => updateField(idx, 'editing_title', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={r.editing_start_date}
                        onChange={(e) => updateField(idx, 'editing_start_date', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={r.editing_end_date}
                        onChange={(e) => updateField(idx, 'editing_end_date', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_discount_rate}
                        onChange={(e) => updateField(idx, 'editing_discount_rate', e.target.value)}
                        className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_description}
                        onChange={(e) => updateField(idx, 'editing_description', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                      >
                        링크
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900">
            <span className="text-sm text-slate-400">
              {selectedCount}개 선택됨
            </span>
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? '저장 중...' : '선택 항목 저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: 브라우저 검증**

`npm run dev` → `/crawl` 접속 → 플랫폼 탭 전환 / 크롤링 실행 / 결과 테이블 렌더링 확인

- [ ] **Step 4: Commit**

```bash
git add components/crawl/CrawlClient.tsx
git commit -m "feat(crawl): add crawl client component with review UI"
```

---

### Task 10: Sidebar에 크롤링 메뉴 추가

**Files:**
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: navItems 배열에 크롤링 항목 추가**

`components/Sidebar.tsx`의 import에 `Globe` 아이콘 추가:

```ts
import { LayoutDashboard, Tag, CalendarDays, MessageSquare, Globe } from 'lucide-react';
```

navItems 배열 끝에 추가:

```ts
  { href: '/crawl', label: '크롤링', icon: Globe },
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: 브라우저 검증**

사이드바에 "크롤링" 메뉴 표시 확인, 클릭 시 `/crawl` 이동 확인

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat(crawl): add crawl menu to sidebar"
```

---

### Task 11: proxy.ts에 /crawl 경로 추가

**Files:**
- Modify: `proxy.ts`

proxy.ts의 matcher에 `/crawl` 경로가 포함되어 있는지 확인하고, 없으면 추가한다. 현재 matcher가 `/(admin)` 그룹 하위 경로를 자동으로 포함하는지 확인 필요.

- [ ] **Step 1: proxy matcher 확인 및 수정**

`proxy.ts`의 matcher 패턴을 확인한다. `/crawl`이 기존 `/(admin)/` 라우트 그룹에 속하므로 layout.tsx의 인증이 적용되지만, proxy에서도 명시적으로 매칭해야 하는 경우 추가한다.

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 3: Commit (변경이 있을 경우)**

```bash
git add proxy.ts
git commit -m "feat(crawl): add /crawl to proxy matcher"
```

---

### Task 12: 통합 검증 및 셀렉터 조정

**Files:**
- Modify: `lib/crawlers/oliveyoung.ts` (필요 시)
- Modify: `lib/crawlers/musinsa.ts` (필요 시)
- Modify: `lib/crawlers/twentynine.ts` (필요 시)

- [ ] **Step 1: 전체 빌드 확인**

```bash
npm run build
```

- [ ] **Step 2: 올리브영 크롤링 테스트**

`npm run dev` → `/crawl` → 올리브영 → 크롤링 실행. 결과가 비어 있으면:
1. 브라우저 개발자 도구에서 올리브영 세일 페이지 HTML 구조 확인
2. `lib/crawlers/oliveyoung.ts`의 셀렉터 조정
3. 재시도

- [ ] **Step 3: 무신사 크롤링 테스트**

동일한 방법으로 무신사 크롤러 셀렉터 조정

- [ ] **Step 4: 29cm 크롤링 테스트**

동일한 방법으로 29cm 크롤러 셀렉터 조정

- [ ] **Step 5: 저장 플로우 테스트**

크롤링 결과에서 항목 선택 → 브랜드 매핑 → 날짜/할인율 수정 → "선택 항목 저장" → sale-events 페이지에서 저장 확인

- [ ] **Step 6: 최종 Commit**

```bash
git add -A
git commit -m "feat(crawl): finalize crawler selectors after integration testing"
```
