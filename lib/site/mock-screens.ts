/**
 * 홍보용 앱 목업에 쓰는 가상 데이터.
 *
 * 실제 DB(브랜드·세일)를 그대로 노출하지 않기 위해 가공 브랜드와 가공 세일만 사용한다.
 * 다만 날짜는 오늘 기준 상대값으로 계산해, 달력이 늘 이번 달로 보이게 한다.
 */

export type MockBrand = {
  id: string;
  name: string;
  category: string;
  color: string;
  /** 목업은 실제 로고를 쓰지 않는다 — 항상 이니셜 타일로 렌더된다. */
  logo_url: null;
};

export type MockEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string | null;
  brand: MockBrand;
};

export type MockBar = {
  key: string;
  title: string;
  brand: MockBrand;
  start: number;
  span: number;
  tone: 'active' | 'upcoming' | 'ended';
};

export type MockWeek = { days: (number | null)[]; bars: MockBar[]; more: number };

export type MockScreens = {
  monthLabel: string;
  todayDate: number;
  homeEvents: (MockEvent & { daysLeft: number })[];
  weeks: MockWeek[];
  brandRows: (MockBrand & { activeCount: number; upcomingCount: number })[];
  brandTotal: number;
  featured: MockEvent & { daysLeft: number; totalDays: number; progress: number };
};

const B = (id: string, name: string, category: string, color: string): MockBrand => ({
  id,
  name,
  category,
  color,
  logo_url: null,
});

/** 실존 브랜드와 겹치지 않도록 지어낸 이름들 */
const BRANDS = {
  cotton: B('b1', '코튼브릿지', '패션', '#3B4A6B'),
  lumi: B('b2', '루미넬', '뷰티', '#E4568C'),
  green: B('b3', '그린테이블', '식품', '#2FA36B'),
  nova: B('b4', '노바기어', '전자기기', '#2563EB'),
  haru: B('b5', '하루상점', '라이프', '#E08A2E'),
  fair: B('b6', '페어웨더', '패션', '#7C5CD6'),
  objet: B('b7', '오브제하우스', '라이프', '#1F1F24'),
  bomnal: B('b8', '봄날마켓', '식품', '#5FA83C'),
  midori: B('b9', '미도리', '뷰티', '#12A5A0'),
  stella: B('b10', '스텔라샵', '종합', '#D6455B'),
} as const;

/** 오늘 기준 상대 일수로 정의한 가상 세일 */
const SEED: {
  id: string;
  title: string;
  brand: MockBrand;
  from: number;
  to: number;
  description?: string;
}[] = [
  { id: 'e1', title: '한여름 클리어런스', brand: BRANDS.cotton, from: -12, to: 0 },
  { id: 'e2', title: '뷰티 위크 최대 60%', brand: BRANDS.lumi, from: -6, to: 0 },
  { id: 'e3', title: '주말 장보기 특가전', brand: BRANDS.green, from: -3, to: 1 },
  { id: 'e4', title: '신학기 가전 페어', brand: BRANDS.nova, from: -9, to: 1 },
  { id: 'e5', title: '리빙 페스타 (2차)', brand: BRANDS.haru, from: -2, to: 3 },
  {
    id: 'e6',
    title: '한여름 준비 위크',
    brand: BRANDS.fair,
    from: -4,
    to: 3,
    description:
      '무더위를 대비한 여름 준비 기획전으로, 일주일간 진행됩니다. 온라인 스토어는 첫날 오전 3시부터 재고 소진 시까지 선착순 사은품도 함께 제공됩니다. 개별 품목별 할인율은 상품마다 다르게 적용됩니다.',
  },
  { id: 'e7', title: '오브제 단독 기획전', brand: BRANDS.objet, from: -1, to: 5 },
  { id: 'e8', title: '제철 과일 첫 수확전', brand: BRANDS.bomnal, from: 0, to: 6 },
  { id: 'e9', title: '스킨케어 리필 데이', brand: BRANDS.midori, from: 2, to: 9 },
  { id: 'e10', title: '이달의 멤버스 혜택', brand: BRANDS.stella, from: 4, to: 12 },
  { id: 'e11', title: '가을 프리오더', brand: BRANDS.cotton, from: 6, to: 16 },
  { id: 'e12', title: '홈카페 기획전', brand: BRANDS.haru, from: -18, to: -2 },
  // 달력이 실제 앱만큼 빽빽해 보이도록 이번 달을 길게 가로지르는 일정들
  { id: 'e13', title: '여름 결산 세일', brand: BRANDS.stella, from: -20, to: 8 },
  { id: 'e14', title: '5만원 이상 무료배송', brand: BRANDS.bomnal, from: -24, to: 10 },
  { id: 'e15', title: '단독 컬러 발매', brand: BRANDS.fair, from: -16, to: -6 },
  { id: 'e16', title: '주방 리뉴얼 특가', brand: BRANDS.objet, from: -14, to: 2 },
  { id: 'e17', title: '썸머 파이널 위크', brand: BRANDS.lumi, from: 1, to: 7 },
  { id: 'e18', title: '캠핑 시즌오프', brand: BRANDS.nova, from: -8, to: 4 },
  { id: 'e19', title: '베이커리 위크', brand: BRANDS.green, from: 3, to: 11 },
  { id: 'e20', title: '데일리 룩 제안전', brand: BRANDS.cotton, from: -5, to: 6 },
];

const DAY = 86_400_000;

function utc(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d));
}
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function parse(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return utc(y, m - 1, d);
}
function diff(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / DAY);
}

export function getMockScreens(): MockScreens {
  // KST 기준 오늘
  const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = utc(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate());

  const events: MockEvent[] = SEED.map((s) => ({
    id: s.id,
    title: s.title,
    brand: s.brand,
    start_date: iso(new Date(today.getTime() + s.from * DAY)),
    end_date: iso(new Date(today.getTime() + s.to * DAY)),
    description: s.description ?? null,
  }));

  const active = events.filter(
    (e) => parse(e.start_date) <= today && parse(e.end_date) >= today
  );

  const homeEvents = active
    .map((e) => ({ ...e, daysLeft: diff(parse(e.end_date), today) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  /* 이번 달 달력 */
  const monthStart = utc(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const monthEnd = utc(today.getUTCFullYear(), today.getUTCMonth() + 1, 0);
  const firstCell = new Date(monthStart.getTime() - monthStart.getUTCDay() * DAY);

  const weeks: MockWeek[] = [];
  for (let w = 0; w < 5; w++) {
    const weekStart = new Date(firstCell.getTime() + w * 7 * DAY);
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY);
    if (weekStart > monthEnd) break;

    const days: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * DAY);
      days.push(d.getUTCMonth() === monthStart.getUTCMonth() ? d.getUTCDate() : null);
    }

    const overlapping = events
      .filter((e) => parse(e.start_date) <= weekEnd && parse(e.end_date) >= weekStart)
      .sort((a, b) => {
        const s = parse(a.start_date).getTime() - parse(b.start_date).getTime();
        return s !== 0 ? s : parse(b.end_date).getTime() - parse(a.end_date).getTime();
      });

    const bars: MockBar[] = overlapping.slice(0, 3).map((e) => {
      const s = parse(e.start_date);
      const en = parse(e.end_date);
      const start = Math.max(0, diff(s, weekStart));
      const end = Math.min(6, diff(en, weekStart));
      const tone: MockBar['tone'] = en < today ? 'ended' : s > today ? 'upcoming' : 'active';
      return { key: e.id, title: e.title, brand: e.brand, start, span: end - start + 1, tone };
    });

    // 실제 앱처럼 가려진 일정이 더 있는 것처럼 보이게 한다.
    weeks.push({ days, bars, more: Math.max(0, overlapping.length - bars.length) });
  }

  /* 브랜드 목록 */
  const allBrands = Object.values(BRANDS);
  const brandRows = allBrands
    .map((b) => {
      const mine = events.filter((e) => e.brand.id === b.id);
      return {
        ...b,
        activeCount: mine.filter(
          (e) => parse(e.start_date) <= today && parse(e.end_date) >= today
        ).length,
        upcomingCount: mine.filter((e) => parse(e.start_date) > today).length,
      };
    })
    .sort((a, b) => b.activeCount - a.activeCount || a.name.localeCompare(b.name, 'ko'))
    .slice(0, 9);

  /* 상세 화면 — 설명이 있는 세일 고정 */
  const base = events.find((e) => e.id === 'e6')!;
  const s = parse(base.start_date);
  const e = parse(base.end_date);
  const totalDays = diff(e, s) + 1;
  const featured = {
    ...base,
    daysLeft: diff(e, today),
    totalDays,
    progress: Math.min(1, Math.max(0, (diff(today, s) + 1) / totalDays)),
  };

  return {
    monthLabel: `${today.getUTCFullYear()}년 ${today.getUTCMonth() + 1}월`,
    todayDate: today.getUTCDate(),
    homeEvents,
    weeks,
    brandRows,
    brandTotal: 45,
    featured,
  };
}
