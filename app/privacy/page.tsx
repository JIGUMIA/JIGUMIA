import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

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
            <Image src="/logo.png" alt="JIGUMIA" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-[#111111] text-lg tracking-tight">JIGUMIA</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black text-[#111111] mb-2">개인정보 처리방침</h1>
        <p className="text-gray-400 text-sm mb-12">시행일: 2025년 4월 1일</p>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-10 text-gray-600 leading-relaxed">
          <p className="pb-6 border-b border-gray-100">
            JIGUMIA(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보 처리방침은 회사가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
          </p>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">1. 수집하는 개인정보 항목</h2>
            <p className="mb-3">회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
            <p className="font-semibold text-[#111111] text-sm mb-1">[필수 항목]</p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-3">
              <li>이메일 주소</li>
              <li>이름 (Google/Apple 계정에서 제공)</li>
              <li>고유 사용자 식별자 (OAuth ID)</li>
            </ul>
            <p className="font-semibold text-[#111111] text-sm mb-1">[자동 수집 항목]</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>기기 정보 (OS 종류, 앱 버전)</li>
              <li>서비스 이용 기록 (접속 일시, 관심 브랜드 목록)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">2. 개인정보 수집 방법</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Google 계정 로그인 시 OAuth 인증을 통해 수집</li>
              <li>Apple 계정 로그인 시 Sign in with Apple을 통해 수집</li>
              <li>서비스 이용 과정에서 자동으로 생성·수집</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">3. 개인정보의 수집 및 이용 목적</h2>
            <p className="mb-3">회사는 수집한 개인정보를 다음의 목적으로 이용합니다.</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>회원 가입 및 관리: 회원 식별, 본인 확인</li>
              <li>서비스 제공: 관심 브랜드 저장, 세일 알림 발송</li>
              <li>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
              <li>고객 지원: 문의 접수 및 답변, 공지사항 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">4. 개인정보의 보유 및 이용 기간</h2>
            <p className="mb-3">
              회원의 개인정보는 서비스 이용 기간 동안 보유하며, 다음의 경우 지체 없이 파기합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-3">
              <li>회원 탈퇴 시: 즉시 파기</li>
              <li>서비스 종료 시: 종료일로부터 30일 이내 파기</li>
            </ul>
            <p className="text-sm">
              단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-1">
              <li>전자상거래법에 따른 계약·청약 철회 기록: 5년</li>
              <li>로그인 기록: 3개월</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">5. 개인정보의 제3자 제공</h2>
            <p className="mb-3">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의해 요구되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">6. 개인정보의 파기 절차 및 방법</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 즉시 파기합니다.</li>
              <li>파기 방법: 전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄하거나 소각합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">7. 개인정보 처리의 위탁</h2>
            <p className="mb-3">회사는 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Supabase (데이터베이스 및 인증 서비스)</li>
              <li className="ml-4 list-none">- 위탁 업무: 회원 정보 저장 및 인증</li>
              <li className="ml-4 list-none">- 보유 기간: 위탁 계약 종료 시까지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">8. 이용자의 권리와 행사 방법</h2>
            <p className="mb-3">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-3">
              <li>개인정보 열람 요청</li>
              <li>개인정보 수정 요청</li>
              <li>개인정보 삭제 요청 (회원 탈퇴)</li>
              <li>처리 정지 요청</li>
            </ul>
            <p className="text-sm">
              위 권리는 앱 내 &quot;마이페이지&quot; 또는 이메일(support@jigumia.app)을 통해 행사할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">9. 개인정보 보호책임자</h2>
            <ul className="list-none space-y-1 text-sm">
              <li>책임자: JIGUMIA Team</li>
              <li>이메일: support@jigumia.app</li>
            </ul>
            <p className="text-sm mt-3">
              개인정보 관련 문의, 불만 처리 등은 위 연락처로 문의해 주시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111111] mb-3">10. 개인정보 처리방침 변경</h2>
            <p className="text-sm">
              본 개인정보 처리방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
            </p>
          </section>

          <p className="text-sm text-gray-400 pt-6 border-t border-gray-100">
            본 개인정보 처리방침은 2025년 4월 1일부터 시행됩니다.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 mt-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>&copy; 2025 JIGUMIA. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              이용약관
            </Link>
            <Link href="/" className="hover:text-gray-600 transition-colors">
              홈으로
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
