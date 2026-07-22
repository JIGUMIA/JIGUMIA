import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Bell, Heart, ShoppingBag } from 'lucide-react';
import {
  PhoneFrame,
  HomeScreen,
  CalendarScreen,
  BrandsScreen,
  DetailScreen,
} from '@/components/site/PhoneMock';
import { getLandingData } from '@/lib/site/landing-data';

export const metadata: Metadata = {
  title: 'JIGUMIA (지구미아) — 브랜드 세일 캘린더',
  description:
    '올리브영·무신사·29CM·유니클로 등 인기 브랜드의 세일 일정을 캘린더 하나로 모아 보는 앱. 관심 브랜드의 세일은 시작 전 알림으로 미리 챙기세요.',
};

/** 세일 데이터가 매일 바뀌므로 1시간마다 재생성 */
export const revalidate = 3600;

const APP_STORE_URL = 'https://apps.apple.com/app/id6772139871';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.jigumia.app&pcampaignid=web_share';

const HERO_BG = '#534ABF';
const HERO_CIRCLE = '#5F59C6';
const PURPLE = '#6C63FF';

const FEATURES = [
  {
    icon: Calendar,
    title: '브랜드 세일 캘린더',
    desc: '여러 브랜드의 세일 일정을 월별 달력 하나에서 한눈에 확인합니다.',
  },
  {
    icon: Bell,
    title: '세일 알림',
    desc: '관심 브랜드의 세일이 시작되기 전, 푸시 알림으로 미리 알려드려요.',
  },
  {
    icon: Heart,
    title: '관심 브랜드 추적',
    desc: '좋아하는 브랜드만 골라 담아 그 브랜드의 일정만 모아 봅니다.',
  },
  {
    icon: ShoppingBag,
    title: '세일 상세 · 바로가기',
    desc: '혜택과 기간을 확인하고 버튼 한 번으로 쇼핑몰까지 바로 이동해요.',
  },
];

/** 홍보물 6컷 문구를 그대로 쓴 앱 화면 섹션 */
const SHOWCASE_COPY = [
  {
    headline: '놓치기 쉬운 세일 정보를 한눈에!',
    body: '지금 진행 중인 세일과 곧 시작될 세일을 홈 화면에서 실시간으로 모아 보여줍니다. 마감이 임박한 세일은 빨간 배지로 먼저 눈에 띄어요.',
  },
  {
    headline: '다양한 브랜드의 세일 정보를 캘린더로!',
    body: '달력만 열면 이번 달 모든 브랜드 세일이 기간별 막대로 펼쳐집니다. 날짜를 탭하면 그날 진행되는 세일을 한 번에 볼 수 있어요.',
  },
  {
    headline: '관심 브랜드를 모아 만드는 나만의 캘린더',
    body: '자주 사는 브랜드만 관심으로 담아두면, 캘린더가 내 쇼핑 일정으로 바뀝니다. 브랜드별로 지금 몇 건이 진행 중인지도 바로 보여요.',
  },
  {
    headline: '클릭 한 번이면 쇼핑몰 바로가기 →',
    body: '세일 기간, 남은 일수, 상세 혜택까지 확인한 뒤 버튼 하나로 해당 쇼핑몰로 이동합니다. 세일 정보를 찾아 앱을 옮겨 다닐 필요가 없어요.',
  },
];

function StoreButtons({ dark = false }: { dark?: boolean }) {
  const cls = dark
    ? 'bg-white text-[#111111]'
    : 'bg-[#111111] text-white';
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.03] ${cls}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        App Store
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.03] ${cls}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M3.18 23.76c.3.17.64.24.99.2l.09-.05 11.04-6.38-2.36-2.36-9.76 8.59zm-1.85-20.4A1.99 1.99 0 001 5v14c0 .57.24 1.09.62 1.46l.08.07 7.83-7.83v-.18L1.33 3.36zm19.44 8.39l-2.63-1.52-2.65 2.65 2.65 2.65 2.65-1.54c.75-.44.75-1.7-.02-2.24zM4.17.28L15.21 6.6l-2.36 2.36-9.76-8.6a1.07 1.07 0 00-.92-.08z" />
        </svg>
        Google Play
      </a>
    </div>
  );
}

export default async function LandingPage() {
  const data = await getLandingData();
  const screens = [
    <HomeScreen key="home" events={data.homeEvents} />,
    <CalendarScreen
      key="cal"
      weeks={data.weeks}
      monthLabel={data.monthLabel}
      todayDate={data.today.getUTCDate()}
    />,
    <BrandsScreen key="brands" rows={data.brandRows} total={data.brandTotal} />,
    data.featured ? <DetailScreen key="detail" event={data.featured} /> : null,
  ];
  const showcase = SHOWCASE_COPY.map((c, i) => ({ ...c, screen: screens[i] })).filter(
    (s) => s.screen !== null
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="JIGUMIA" width={32} height={32} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight text-[#111111]">JIGUMIA</span>
          </Link>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: PURPLE }}
          >
            앱 다운로드
          </a>
        </div>
      </header>

      {/* Hero — 홍보물 01-hero */}
      <section
        className="relative overflow-hidden px-6 py-24 text-center text-white"
        style={{ backgroundColor: HERO_BG }}
      >
        <div
          className="pointer-events-none absolute -left-[20%] top-[42%] h-[130vw] w-[130vw] rounded-full"
          style={{ backgroundColor: HERO_CIRCLE }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.45em] text-white/55">
            JIGUMIA
          </p>
          <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-white/85 md:text-6xl">
            지금이야!
          </h1>
          <p className="mt-4 text-base font-medium text-white/70">
            놓치면 아까운 세일, 딱 맞게 알려줄게
          </p>

          <h2 className="mt-14 text-4xl font-black leading-[1.25] tracking-tight md:text-5xl">
            세일 기간을 놓친
            <br />
            당신을 위한 앱
          </h2>

          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-white/75">
            올리브영, 무신사, 29cm 등 주요 브랜드의 할인 일정을
            <br className="hidden sm:block" /> 캘린더 하나로 모아 보고, 시작 전 알림을 받아보세요.
          </p>

          <div className="mt-10">
            <StoreButtons dark />
          </div>
        </div>
      </section>

      {/* 앱 화면 쇼케이스 */}
      <div className="bg-gradient-to-b from-[#F7F5FD] via-[#E6E1F5] to-[#CEC8EB]">
        {showcase.map((s, i) => (
          <section key={s.headline} className="px-6 py-20">
            <div
              className={`mx-auto flex max-w-5xl flex-col items-center gap-12 lg:gap-20 ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              <div className="flex shrink-0 justify-center">
                <PhoneFrame>{s.screen}</PhoneFrame>
              </div>
              <div className="max-w-md text-center lg:text-left">
                <h3 className="text-3xl font-black leading-snug tracking-tight text-[#2A2450] md:text-[2rem]">
                  {s.headline}
                </h3>
                <p className="mt-5 text-[15px] leading-[1.85] text-[#4A4470]">{s.body}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="mb-14 text-center text-3xl font-black text-[#111111]">주요 기능</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${PURPLE}18` }}
              >
                <Icon className="h-7 w-7" style={{ color: PURPLE }} />
              </div>
              <h3 className="mb-2 font-bold text-[#111111]">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-3 text-3xl font-black text-[#111111]">지원 브랜드</h2>
          <p className="mb-12 text-sm text-gray-400">
            현재 {data.brandTotal}개 브랜드 · 계속 추가되고 있어요
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {data.brands.map((b) => (
              <span
                key={b.id}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white py-2 pl-2 pr-4 text-sm font-semibold text-[#111111] shadow-sm"
              >
                {b.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 외부 CDN 로고
                  <img
                    src={b.logo_url}
                    alt=""
                    className="h-6 w-6 rounded-md object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.name.slice(0, 1)}
                  </span>
                )}
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — 홍보물 06-cta */}
      <section
        className="relative overflow-hidden px-6 py-24 text-center text-white"
        style={{ backgroundColor: HERO_BG }}
      >
        <div
          className="pointer-events-none absolute -right-[25%] -top-[35%] h-[90vw] w-[90vw] rounded-full"
          style={{ backgroundColor: HERO_CIRCLE }}
        />
        <div className="relative">
          <h2 className="text-4xl font-black leading-[1.3] tracking-tight md:text-5xl">
            지금 바로
            <br />
            다운로드 하세요
          </h2>
          <div className="mt-10">
            <StoreButtons dark />
          </div>
        </div>
      </section>

      {/* 문의 및 지원 */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="mb-3 font-bold text-[#111111]">문의 및 지원</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            앱 사용 중 문제가 있거나 기능 제안, 문의 사항이 있다면
            <br />
            아래 이메일로 연락 주세요. 가능한 한 빠르게 답장드리겠습니다.
          </p>
          <a
            href="mailto:jigumia0226@gmail.com"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-2"
            style={{ color: PURPLE }}
          >
            jigumia0226@gmail.com →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-sm text-gray-400 sm:flex-row">
          <p>&copy; 2026 JIGUMIA. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-gray-600">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gray-600">
              이용약관
            </Link>
            <Link href="/delete-account" className="transition-colors hover:text-gray-600">
              계정 삭제
            </Link>
            <Link href="/login" className="transition-colors hover:text-gray-600">
              관리자
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
