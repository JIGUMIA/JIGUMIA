import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Bell, Heart, ShoppingBag } from 'lucide-react';

const FEATURES = [
  {
    icon: Calendar,
    title: '캘린더 뷰',
    desc: '월간·주간 캘린더로 세일 일정을 한눈에 파악할 수 있어요.',
  },
  {
    icon: Bell,
    title: '세일 알림',
    desc: '세일 시작 D-1, 당일, 종료 임박 알림을 놓치지 마세요.',
  },
  {
    icon: Heart,
    title: '관심 브랜드',
    desc: '즐겨찾는 브랜드를 등록해 세일 일정을 먼저 확인하세요.',
  },
  {
    icon: ShoppingBag,
    title: '브랜드 탐색',
    desc: '카테고리 필터와 검색으로 원하는 브랜드를 빠르게 찾아요.',
  },
];

const BRANDS = [
  { name: '올리브영', color: '#EF5350' },
  { name: '무신사', color: '#5C6BC0' },
  { name: '29cm', color: '#EC407A' },
  { name: '쿠팡', color: '#FFA726' },
  { name: 'SSG.COM', color: '#6C63FF' },
  { name: 'H&M', color: '#26A69A' },
  { name: 'JAJU', color: '#F06292' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="JIGUMIA" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-[#111111] text-lg tracking-tight">JIGUMIA</span>
          </div>
          <span className="text-sm text-gray-400">출시 준비 중</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          style={{ backgroundColor: '#6C63FF18', color: '#6C63FF' }}
        >
          브랜드 할인 캘린더 앱
        </div>
        <h1 className="text-5xl font-black text-[#111111] leading-tight mb-5">
          세일, <span style={{ color: '#FF2D2D' }}>지금이야</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg mx-auto">
          올리브영, 무신사, 29cm 등 주요 브랜드의<br />
          할인 일정을 캘린더로 한눈에 확인하고<br />
          세일 시작 전 알림을 받아보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            disabled
            className="flex items-center justify-center gap-2 bg-[#111111] text-white px-8 py-3.5 rounded-2xl font-semibold text-sm opacity-40 cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store — 출시 예정
          </button>
          <button
            disabled
            className="flex items-center justify-center gap-2 bg-[#111111] text-white px-8 py-3.5 rounded-2xl font-semibold text-sm opacity-40 cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M3.18 23.76c.3.17.64.24.99.2l.09-.05 11.04-6.38-2.36-2.36-9.76 8.59zm-1.85-20.4A1.99 1.99 0 001 5v14c0 .57.24 1.09.62 1.46l.08.07 7.83-7.83v-.18L1.33 3.36zm19.44 8.39l-2.63-1.52-2.65 2.65 2.65 2.65 2.65-1.54c.75-.44.75-1.7-.02-2.24zM4.17.28L15.21 6.6l-2.36 2.36-9.76-8.6a1.07 1.07 0 00-.92-.08z" />
            </svg>
            Google Play — 출시 예정
          </button>
        </div>
      </section>

      {/* App Preview Placeholder */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="rounded-3xl mx-auto max-w-sm h-96 flex items-center justify-center"
            style={{ backgroundColor: '#EEEDF8' }}
          >
            <div className="text-center">
              <Image src="/logo.png" alt="JIGUMIA" width={80} height={80} className="rounded-3xl mx-auto mb-4" />
              <p className="text-gray-400 text-sm">앱 스크린샷 준비 중</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-black text-[#111111] text-center mb-14">주요 기능</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#6C63FF18' }}
              >
                <Icon className="w-7 h-7" style={{ color: '#6C63FF' }} />
              </div>
              <h3 className="font-bold text-[#111111] mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-[#111111] mb-3">지원 브랜드</h2>
          <p className="text-gray-400 mb-12 text-sm">현재 입점 브랜드 · 계속 추가될 예정이에요</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BRANDS.map(({ name, color }) => (
              <span
                key={name}
                className="px-5 py-2.5 rounded-full font-semibold text-sm"
                style={{ backgroundColor: color + '18', color }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Google OAuth Notice */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
          <h3 className="font-bold text-[#111111] mb-3">Google 계정으로 간편 로그인</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            JIGUMIA는 Google 로그인을 통해 간편하게 가입할 수 있어요.<br />
            수집된 정보(이메일, 프로필)는 서비스 제공 목적으로만 사용되며,<br />
            제3자에게 제공되지 않습니다.
          </p>
          <Link
            href="/privacy"
            className="inline-block mt-4 text-sm font-medium underline underline-offset-2"
            style={{ color: '#6C63FF' }}
          >
            개인정보 처리방침 보기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>&copy; 2025 JIGUMIA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              개인정보 처리방침
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              이용약관
            </Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">
              관리자
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
