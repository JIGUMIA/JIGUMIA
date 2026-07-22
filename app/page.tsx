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
import { BrandMarquee } from '@/components/site/BrandMarquee';
import { getLandingBrands } from '@/lib/site/landing-data';
import { getMockScreens } from '@/lib/site/mock-screens';

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

/**
 * 스토어 배지.
 *
 * Apple / Google 모두 공식 배지 아트워크를 변형 없이 사용하도록 요구한다
 * (자체 제작 버튼·로고 재현 금지). public/badges 의 파일은 각사 공식 배포처에서
 * 받은 원본이며, 여기서는 크기만 지정한다.
 *
 * 여백 규정: 배지 높이의 1/4 이상을 사방에 비워야 하므로 gap 을 넉넉히 둔다.
 * Apple SVG 는 아트워크가 곧 배지지만 Google PNG 는 상하 투명 여백을 포함해서,
 * 검은 알약 높이를 맞추려면 Google 쪽을 조금 더 크게 잡아야 한다.
 */
function StoreButtons() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="App Store에서 다운로드"
        className="transition-opacity hover:opacity-85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 공식 배지 원본을 그대로 사용 */}
        <img src="/badges/app-store-ko.svg" alt="App Store에서 다운로드" className="h-[52px] w-auto" />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google Play에서 다운로드"
        className="transition-opacity hover:opacity-85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 공식 배지 원본을 그대로 사용 */}
        <img
          src="/badges/google-play-ko.png"
          alt="Google Play에서 다운로드"
          className="h-[68px] w-auto"
        />
      </a>
    </div>
  );
}

export default async function LandingPage() {
  // 앱 목업은 가상 데이터, "지원 브랜드" 목록만 실제 DB에서 가져온다.
  const brands = await getLandingBrands();
  const mock = getMockScreens();
  const screens = [
    <HomeScreen key="home" events={mock.homeEvents} />,
    <CalendarScreen
      key="cal"
      weeks={mock.weeks}
      monthLabel={mock.monthLabel}
      todayDate={mock.todayDate}
    />,
    <BrandsScreen key="brands" rows={mock.brandRows} total={mock.brandTotal} />,
    <DetailScreen key="detail" event={mock.featured} />,
  ];
  const showcase = SHOWCASE_COPY.map((c, i) => ({ ...c, screen: screens[i] }));

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
            <StoreButtons />
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
      <section className="overflow-hidden bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-3 text-3xl font-black text-[#111111]">지원 브랜드</h2>
          <p className="mb-12 text-sm text-gray-400">
            현재 {brands.length}개 브랜드 · 계속 추가되고 있어요
          </p>
        </div>
        <BrandMarquee brands={brands} />
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
            <StoreButtons />
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
          </div>
        </div>
      </footer>
    </div>
  );
}
