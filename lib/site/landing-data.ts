import { createAdminClient } from '@/lib/supabase/server';

export type LandingBrand = {
  id: string;
  name: string;
  category: string;
  color: string;
  logo_url: string | null;
};

export type LandingEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string | null;
  brand: LandingBrand;
};

export type CalendarBar = {
  key: string;
  title: string;
  brand: LandingBrand;
  /** 0 = 일요일 */
  start: number;
  span: number;
  /** 진행 상태별 막대 색 */
  tone: 'active' | 'upcoming' | 'ended';
};

export type CalendarWeek = {
  days: (number | null)[];
  bars: CalendarBar[];
  more: number;
};

export type LandingData = {
  today: Date;
  monthLabel: string;
  /** 홈 화면 — 진행 중 세일을 마감 임박순으로 */
  homeEvents: (LandingEvent & { daysLeft: number })[];
  /** 캘린더 화면 — 이번 달 주 단위 막대 */
  weeks: CalendarWeek[];
  /** 브랜드 화면 — 진행/예정 건수 포함 */
  brandRows: (LandingBrand & { activeCount: number; upcomingCount: number })[];
  brandTotal: number;
  /** 상세 화면 — 대표 세일 하나 */
  featured: (LandingEvent & { daysLeft: number; totalDays: number; progress: number }) | null;
  /** 지원 브랜드 칩 */
  brands: LandingBrand[];
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 오늘 00:00 (UTC Date 로 표현) */
function kstToday(): Date {
  const now = new Date(Date.now() + KST_OFFSET_MS);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function parseDate(d: string): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

export async function getLandingData(): Promise<LandingData> {
  const supabase = createAdminClient();
  const today = kstToday();

  // 이번 달 달력이 걸치는 범위(앞뒤 한 주 여유)까지 한 번에 가져온다.
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
  const rangeStart = new Date(monthStart.getTime() - 7 * 86_400_000);
  const rangeEnd = new Date(monthEnd.getTime() + 7 * 86_400_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [{ data: brandData }, { data: eventData }] = await Promise.all([
    supabase.from('brands').select('id, name, category, color, logo_url').order('name'),
    supabase
      .from('sale_events')
      .select('id, title, start_date, end_date, description, brand_id')
      .lte('start_date', iso(rangeEnd))
      .gte('end_date', iso(rangeStart))
      .order('end_date'),
  ]);

  const brands: LandingBrand[] = (brandData ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category ?? '종합',
    color: b.color || '#6C63FF',
    logo_url: b.logo_url,
  }));
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const events: LandingEvent[] = (eventData ?? []).flatMap((e) => {
    const brand = brandById.get(e.brand_id);
    if (!brand) return [];
    return [
      {
        id: e.id,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        description: e.description,
        brand,
      },
    ];
  });

  /* ── 홈: 진행 중인 세일을 마감 임박순으로 ── */
  const active = events.filter(
    (e) => parseDate(e.start_date) <= today && parseDate(e.end_date) >= today
  );
  const homeEvents = active
    .map((e) => ({ ...e, daysLeft: diffDays(parseDate(e.end_date), today) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  /* ── 캘린더: 이번 달을 주 단위로 잘라 막대 배치 ── */
  const weeks: CalendarWeek[] = [];
  const firstCell = new Date(monthStart.getTime() - monthStart.getUTCDay() * 86_400_000);

  for (let w = 0; w < 5; w++) {
    const weekStart = new Date(firstCell.getTime() + w * 7 * 86_400_000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 86_400_000);
    if (weekStart > monthEnd) break;

    const days: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * 86_400_000);
      days.push(d.getUTCMonth() === monthStart.getUTCMonth() ? d.getUTCDate() : null);
    }

    // 앱 캘린더와 같이 먼저 시작하고 오래 가는 세일이 위쪽 막대를 차지한다.
    const overlapping = events
      .filter((e) => parseDate(e.start_date) <= weekEnd && parseDate(e.end_date) >= weekStart)
      .sort((a, b) => {
        const startDiff =
          parseDate(a.start_date).getTime() - parseDate(b.start_date).getTime();
        if (startDiff !== 0) return startDiff;
        return parseDate(b.end_date).getTime() - parseDate(a.end_date).getTime();
      });
    const bars: CalendarBar[] = overlapping.slice(0, 3).map((e) => {
      const s = parseDate(e.start_date);
      const en = parseDate(e.end_date);
      const start = Math.max(0, diffDays(s, weekStart));
      const end = Math.min(6, diffDays(en, weekStart));
      const tone: CalendarBar['tone'] = en < today ? 'ended' : s > today ? 'upcoming' : 'active';
      return { key: e.id, title: e.title, brand: e.brand, start, span: end - start + 1, tone };
    });

    weeks.push({ days, bars, more: Math.max(0, overlapping.length - bars.length) });
  }

  /* ── 브랜드: 진행/예정 건수 ── */
  const brandRows = brands
    .map((b) => {
      const mine = events.filter((e) => e.brand.id === b.id);
      return {
        ...b,
        activeCount: mine.filter(
          (e) => parseDate(e.start_date) <= today && parseDate(e.end_date) >= today
        ).length,
        upcomingCount: mine.filter((e) => parseDate(e.start_date) > today).length,
      };
    })
    .sort((a, b) => b.activeCount - a.activeCount || a.name.localeCompare(b.name, 'ko'))
    .slice(0, 9);

  /* ── 상세: 설명이 가장 충실한 진행 중 세일 하나 ── */
  const featuredBase =
    [...active].sort((a, b) => (b.description?.length ?? 0) - (a.description?.length ?? 0))[0] ??
    null;
  const featured = featuredBase
    ? (() => {
        const s = parseDate(featuredBase.start_date);
        const e = parseDate(featuredBase.end_date);
        const totalDays = diffDays(e, s) + 1;
        return {
          ...featuredBase,
          daysLeft: diffDays(e, today),
          totalDays,
          progress: Math.min(1, Math.max(0, (diffDays(today, s) + 1) / totalDays)),
        };
      })()
    : null;

  return {
    today,
    monthLabel: `${today.getUTCFullYear()}년 ${today.getUTCMonth() + 1}월`,
    homeEvents,
    weeks,
    brandRows,
    brandTotal: brands.length,
    featured,
    brands,
  };
}
