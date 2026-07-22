import Link from 'next/link';
import Image from 'next/image';

export const CONTACT_EMAIL = 'jigumia0226@gmail.com';

export function LegalPage({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="JIGUMIA" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-[#111111] text-lg tracking-tight">JIGUMIA</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-[#111111] mb-2">{title}</h1>
        <p className="text-gray-400 text-sm mb-12">{meta}</p>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-10 text-gray-600 leading-[1.85]">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>&copy; 2026 JIGUMIA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              이용약관
            </Link>
            <Link href="/delete-account" className="hover:text-gray-600 transition-colors">
              계정 삭제
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#111111] mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#111111]">{children}</strong>;
}

export function MailLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="font-medium underline underline-offset-2"
      style={{ color: '#6C63FF' }}
    >
      {CONTACT_EMAIL}
    </a>
  );
}
