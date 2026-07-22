/* eslint-disable @next/next/no-img-element -- 브랜드 로고는 외부 CDN(logo_url) 이미지라 next/image 대신 img 사용 */
import {
  Search,
  Bell,
  Home,
  CalendarDays,
  Heart,
  User,
  ChevronRight,
  ChevronLeft,
  Share2,
  LayoutGrid,
  Shirt,
  Sparkles,
  Apple,
  Smartphone,
} from 'lucide-react';
import type { LandingBrand, LandingData } from '@/lib/site/landing-data';

/** JIGUMIA 앱 디자인 토큰 (JIGUMIA/src/constants/colors.ts 기준) */
const INK = '#191F28';
const INK3 = '#4E5968';
const MUTED = '#8B95A1';
const FAINT = '#B0B8C1';
const LINE = '#F1F3F5';
const CHIP = '#F6F7F9';
const BRAND = '#6C63FF';
const DANGER = '#F5333F';

/** 아이폰 프레임 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[290px] shrink-0 rounded-[46px] bg-[#1A1A1E] p-[10px] shadow-[0_28px_60px_-18px_rgba(35,30,90,0.45)]">
      <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-white">
        <div className="absolute left-1/2 top-0 z-20 h-[26px] w-[110px] -translate-x-1/2 rounded-b-[16px] bg-[#1A1A1E]" />
        <div className="h-full overflow-hidden pt-[30px]" style={{ color: INK }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ScreenHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-1">
      <span className="text-[19px] font-bold tracking-tight">{title}</span>
      <div className="flex items-center gap-3">
        <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
        <Bell className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </div>
    </div>
  );
}

function TabBar({ active }: { active: 0 | 1 | 2 | 3 }) {
  const items = [Home, CalendarDays, Heart, User];
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex w-[252px] -translate-x-1/2 items-center justify-around rounded-full bg-white px-2 py-2 shadow-[0_6px_24px_rgba(25,31,40,0.14)]">
      {items.map((Icon, i) => (
        <div
          key={i}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: i === active ? BRAND : 'transparent' }}
        >
          <Icon
            className="h-[18px] w-[18px]"
            strokeWidth={2.2}
            style={{ color: i === active ? '#FFFFFF' : '#C4CAD2' }}
            fill={i === active ? '#FFFFFF' : 'none'}
          />
        </div>
      ))}
    </div>
  );
}

/** 브랜드 로고 — logo_url 이 있으면 이미지, 없으면 브랜드 색 이니셜 타일 */
function BrandLogo({
  brand,
  size = 34,
  radius = 9,
}: {
  brand: LandingBrand;
  size?: number;
  radius?: number;
}) {
  const style = { width: size, height: size, borderRadius: radius } as const;

  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="shrink-0 object-contain"
        style={{ ...style, border: `1px solid ${LINE}`, backgroundColor: '#FFFFFF' }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center font-extrabold leading-none text-white"
      style={{ ...style, backgroundColor: brand.color, fontSize: size * 0.36 }}
    >
      {brand.name.slice(0, 1)}
    </div>
  );
}

function formatRange(start: string, end: string) {
  const f = (d: string) => d.slice(5).replace('-', '.');
  return `${f(start)} – ${f(end)}`;
}

function daysLeftLabel(daysLeft: number) {
  if (daysLeft <= 0) return { text: '오늘 종료', urgent: true };
  if (daysLeft === 1) return { text: '내일 종료', urgent: true };
  return { text: `${daysLeft}일 남음`, urgent: daysLeft <= 2 };
}

/* ─────────────────────────── 1. 홈 ─────────────────────────── */

const CATEGORIES = [
  { label: '전체', Icon: LayoutGrid, bg: '#EEEDFF', fg: BRAND, active: true },
  { label: '패션', Icon: Shirt, bg: '#FFE9EF', fg: '#F4436E' },
  { label: '뷰티', Icon: Sparkles, bg: '#FFF1E0', fg: '#FB923C' },
  { label: '식품', Icon: Apple, bg: '#E4F8EC', fg: '#22C55E' },
  { label: '전자기기', Icon: Smartphone, bg: '#E6F1FF', fg: '#3B82F6' },
];

export function HomeScreen({ events }: { events: LandingData['homeEvents'] }) {
  return (
    <div className="relative h-full">
      <ScreenHeader title="지금이야" />

      <div className="flex gap-2 overflow-hidden px-4 pb-3 pt-1">
        {CATEGORIES.map(({ label, Icon, bg, fg, active }) => (
          <div key={label} className="flex w-[46px] shrink-0 flex-col items-center gap-1">
            <div
              className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px]"
              style={{ backgroundColor: bg, boxShadow: active ? `0 0 0 1.5px ${BRAND}` : undefined }}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={2.2} style={{ color: fg }} />
            </div>
            <span className="text-[9px] font-semibold" style={{ color: active ? BRAND : MUTED }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-b px-4" style={{ borderColor: LINE }}>
        {['진행중', '인기', '마감임박', '예정'].map((t, i) => (
          <div key={t} className="pb-2">
            <span
              className="text-[12px]"
              style={{ color: i === 0 ? INK : FAINT, fontWeight: i === 0 ? 700 : 500 }}
            >
              {t}
            </span>
            {i === 0 && (
              <div className="mt-[6px] h-[2px] rounded-full" style={{ backgroundColor: INK }} />
            )}
          </div>
        ))}
      </div>

      <div className="px-4">
        {events.map((e, i) => {
          const badge = daysLeftLabel(e.daysLeft);
          return (
            <div
              key={e.id}
              className="flex items-center gap-2.5 border-b py-[9px]"
              style={{ borderColor: LINE }}
            >
              <span className="w-3 text-[12px] font-bold">{i + 1}</span>
              <BrandLogo brand={e.brand} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-bold leading-tight">{e.title}</p>
                <p className="mt-[3px] truncate text-[9.5px]" style={{ color: MUTED }}>
                  {e.brand.name} · {formatRange(e.start_date, e.end_date)}
                </p>
              </div>
              <span
                className="shrink-0 rounded-[5px] px-[6px] py-[3px] text-[9px] font-bold"
                style={
                  badge.urgent
                    ? { backgroundColor: '#FFEBEC', color: DANGER }
                    : { color: DANGER }
                }
              >
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      <TabBar active={0} />
    </div>
  );
}

/* ─────────────────────────── 2. 캘린더 ─────────────────────────── */

const TONE = {
  active: { bg: '#FFE3E5', fg: '#B4232E' },
  upcoming: { bg: '#DCEBFF', fg: '#1D4ED8' },
  ended: { bg: '#E9EAED', fg: '#3A3A3A' },
} as const;

export function CalendarScreen({
  weeks,
  monthLabel,
  todayDate,
}: {
  weeks: LandingData['weeks'];
  monthLabel: string;
  todayDate: number;
}) {
  return (
    <div className="relative h-full">
      <ScreenHeader title="세일 일정" />

      <div className="flex gap-1.5 px-4 pb-2 pt-1">
        {['♡ 관심', '카테고리 ⌄', '쇼핑몰 ⌄'].map((c) => (
          <span
            key={c}
            className="rounded-full px-2.5 py-[5px] text-[10px] font-semibold"
            style={{ backgroundColor: CHIP, color: INK3 }}
          >
            {c}
          </span>
        ))}
      </div>

      <div
        className="grid grid-cols-7 border-b px-2 pb-[6px] text-center text-[9.5px] font-semibold"
        style={{ borderColor: LINE }}
      >
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <span key={d} style={{ color: i === 0 ? DANGER : i === 6 ? '#3B82F6' : MUTED }}>
            {d}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-3 pb-1 pt-2">
        <span className="text-[13px] font-extrabold">{monthLabel}</span>
        <span
          className="rounded-[5px] px-[5px] py-[2px] text-[8px] font-bold text-white"
          style={{ backgroundColor: BRAND }}
        >
          이번 달
        </span>
      </div>

      {weeks.map((w, wi) => (
        <div key={wi} className="border-b px-2 py-1" style={{ borderColor: LINE }}>
          <div className="grid grid-cols-7 pb-1 text-center text-[9.5px] font-semibold">
            {w.days.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : d === todayDate ? (
                <span key={i}>
                  <span
                    className="inline-flex h-[17px] w-[17px] items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    {d}
                  </span>
                </span>
              ) : (
                <span key={i} style={{ color: i === 0 ? DANGER : i === 6 ? '#3B82F6' : INK }}>
                  {d}
                </span>
              )
            )}
          </div>
          <div className="space-y-[3px]">
            {w.bars.map((b) => (
              <div key={b.key} className="grid grid-cols-7">
                <div
                  className="flex items-center gap-1 overflow-hidden rounded-[4px] px-1 py-[2px]"
                  style={{
                    gridColumnStart: b.start + 1,
                    gridColumnEnd: `span ${b.span}`,
                    backgroundColor: TONE[b.tone].bg,
                  }}
                >
                  <BrandLogo brand={b.brand} size={10} radius={2} />
                  <span
                    className="truncate text-[7.5px] font-semibold"
                    style={{ color: TONE[b.tone].fg }}
                  >
                    {b.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {w.more > 0 && (
            <p className="pt-[3px] text-[8px] font-semibold" style={{ color: BRAND }}>
              +{w.more}
            </p>
          )}
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      <TabBar active={1} />
    </div>
  );
}

/* ─────────────────────────── 3. 브랜드 ─────────────────────────── */

export function BrandsScreen({
  rows,
  total,
}: {
  rows: LandingData['brandRows'];
  total: number;
}) {
  return (
    <div className="relative h-full">
      <ScreenHeader title="브랜드" />

      <div className="flex gap-1.5 px-4 pb-3 pt-1">
        <span
          className="rounded-full px-2.5 py-[5px] text-[10px] font-bold text-white"
          style={{ backgroundColor: BRAND }}
        >
          관심 {rows.length}
        </span>
        <span
          className="rounded-full px-2.5 py-[5px] text-[10px] font-semibold"
          style={{ backgroundColor: CHIP, color: INK3 }}
        >
          전체 {total}
        </span>
      </div>

      <div className="px-4">
        {rows.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2.5 border-b py-[10px]"
            style={{ borderColor: LINE }}
          >
            <BrandLogo brand={b} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold leading-tight">{b.name}</p>
              <p className="mt-[3px] truncate text-[9.5px]" style={{ color: MUTED }}>
                {b.category}
                {b.activeCount > 0 ? (
                  <>
                    {' · '}
                    <span className="font-semibold" style={{ color: DANGER }}>
                      지금 {b.activeCount}건 진행 중
                    </span>
                  </>
                ) : b.upcomingCount > 0 ? (
                  <> · 예정 {b.upcomingCount}건</>
                ) : null}
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: FAINT }} />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      <TabBar active={2} />
    </div>
  );
}

/* ─────────────────────────── 4. 세일 상세 ─────────────────────────── */

function formatKorean(date: string) {
  const [, m, d] = date.split('-').map(Number);
  const day = ['일', '월', '화', '수', '목', '금', '토'][new Date(`${date}T00:00:00Z`).getUTCDay()];
  return `${m}월 ${d}일 (${day})`;
}

export function DetailScreen({ event }: { event: NonNullable<LandingData['featured']> }) {
  const badge = daysLeftLabel(event.daysLeft);
  const pct = Math.round(event.progress * 100);

  return (
    <div className="relative h-full">
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.4} />
        <div className="flex items-center gap-3">
          <Heart className="h-[17px] w-[17px]" fill={DANGER} style={{ color: DANGER }} />
          <Share2 className="h-[16px] w-[16px]" strokeWidth={2.2} />
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2">
          <BrandLogo brand={event.brand} size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-bold leading-tight">{event.brand.name}</p>
            <p className="text-[9px]" style={{ color: MUTED }}>
              {event.brand.category}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-[7px] py-[3px] text-[8.5px] font-bold"
            style={{ backgroundColor: '#FFEBEC', color: DANGER }}
          >
            진행 중
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-extrabold leading-snug tracking-tight">
          {event.title}
        </h3>

        {/* 배너 — 앱은 세일 이미지를 띄우지만 웹에는 에셋이 없어 브랜드 색 그라디언트로 대체 */}
        <div
          className="mt-2.5 flex h-[86px] flex-col items-center justify-center gap-1.5 rounded-[10px]"
          style={{ background: `linear-gradient(135deg, ${event.brand.color}1F, ${event.brand.color}3D)` }}
        >
          <BrandLogo brand={event.brand} size={30} />
          <span className="px-4 text-center text-[9px] font-bold" style={{ color: INK3 }}>
            {formatRange(event.start_date, event.end_date)}
          </span>
        </div>

        <p className="mt-3 text-[11px] font-bold">
          {formatKorean(event.start_date)} &nbsp;–&nbsp; {formatKorean(event.end_date)}
        </p>
        <p className="mt-[3px] text-[9.5px]" style={{ color: MUTED }}>
          <span className="font-bold" style={{ color: INK }}>
            {badge.text}
          </span>{' '}
          · {event.totalDays}일간
        </p>

        <div className="mt-3">
          <div className="flex justify-between text-[8px]" style={{ color: MUTED }}>
            <span>{event.start_date.slice(5).replace('-', '.')} 시작</span>
            <span>{event.end_date.slice(5).replace('-', '.')} 종료</span>
          </div>
          <div className="relative mt-1 h-[4px] rounded-full" style={{ backgroundColor: '#EDEEF2' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${pct}%`, backgroundColor: BRAND }}
            />
            <div
              className="absolute -top-[3px] h-[10px] w-[10px] rounded-full border-2 bg-white"
              style={{ left: `calc(${pct}% - 5px)`, borderColor: BRAND }}
            />
          </div>
        </div>

        {event.description && (
          <>
            <p className="mt-4 text-[8.5px] font-semibold" style={{ color: MUTED }}>
              상세 내용
            </p>
            <p className="mt-1.5 line-clamp-6 text-[9.5px] leading-[1.7]" style={{ color: INK3 }}>
              {event.description}
            </p>
          </>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-white px-4 pb-4 pt-3">
        <div
          className="flex items-center justify-center gap-1.5 rounded-[12px] py-[11px] text-[11.5px] font-bold text-white"
          style={{ backgroundColor: BRAND }}
        >
          {event.brand.name} 바로가기 <span>→</span>
        </div>
      </div>
    </div>
  );
}
