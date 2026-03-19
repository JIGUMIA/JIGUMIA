import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보 처리방침 — JIGUMIA',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#6C63FF' }}
            >
              <span className="text-white font-black text-sm italic">J</span>
            </div>
            <span className="font-bold text-[#111111] text-lg tracking-tight">JIGUMIA</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-[#111111] mb-2">개인정보 처리방침</h1>
        <p className="text-gray-400 text-sm mb-12">최종 수정일: 2026년 3월 19일</p>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-10 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">1. 수집하는 개인정보</h2>
            <p>
              JIGUMIA(이하 "서비스")는 Google 계정을 통한 소셜 로그인 시 다음 정보를 수집합니다.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
              <li>이메일 주소</li>
              <li>이름(닉네임)</li>
              <li>프로필 사진 URL</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>회원 식별 및 서비스 제공</li>
              <li>관심 브랜드 즐겨찾기 기능 제공</li>
              <li>세일 알림 발송</li>
              <li>서비스 이용 통계 분석 (비식별화)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              수집된 개인정보는 서비스 이용 기간 동안 보유합니다. 회원 탈퇴 시 지체 없이
              삭제됩니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">4. 개인정보의 제3자 제공</h2>
            <p>
              JIGUMIA는 수집된 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한
              경우 또는 이용자의 명시적 동의가 있는 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">5. Google API 사용 관련</h2>
            <p>
              본 서비스는 Google OAuth 2.0을 통해 로그인을 처리합니다. Google로부터
              수신한 정보는 서비스 제공 목적으로만 사용되며, Google API 서비스 이용자
              데이터 정책을 준수합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">6. 이용자의 권리</h2>
            <p>
              이용자는 언제든지 자신의 개인정보 조회, 수정, 삭제를 요청할 수 있습니다.
              계정 탈퇴 시 모든 개인정보는 즉시 삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">7. 문의</h2>
            <p>
              개인정보 처리에 관한 문의사항이 있으시면 아래로 연락해 주세요.
            </p>
            <p className="mt-2 text-sm">
              서비스명: JIGUMIA<br />
              이메일: support@jigumia.app
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 mt-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© 2026 JIGUMIA. All rights reserved.</p>
          <Link href="/" className="hover:text-gray-600 transition-colors">
            홈으로
          </Link>
        </div>
      </footer>
    </div>
  );
}
