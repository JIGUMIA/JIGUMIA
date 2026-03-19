import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JIGUMIA — 브랜드 할인 캘린더',
  description:
    '올리브영, 무신사, 29cm 등 주요 브랜드의 할인 일정을 캘린더로 한눈에 확인하고, 세일 시작 전 알림을 받아보세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
