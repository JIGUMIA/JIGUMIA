import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section, Em, MailLink } from '@/components/site/LegalPage';

export const metadata: Metadata = {
  title: 'JIGUMIA 계정 및 데이터 삭제',
  description:
    '모바일 앱 JIGUMIA(지구미아)에서 계정과 관련 데이터를 삭제하는 방법, 삭제되는 데이터 항목 및 보관 기간에 대한 안내입니다.',
};

const UPDATED_AT = '2026년 6월 29일';

export default function DeleteAccountPage() {
  return (
    <LegalPage title="계정 및 데이터 삭제" meta={`최종 업데이트: ${UPDATED_AT}`}>
      <Section title="1. 개요">
        <p>
          본 페이지는 모바일 앱 <Em>JIGUMIA(지구미아)</Em>의 이용자가 계정과 관련된 모든 데이터의
          삭제를 요청하는 방법을 안내합니다. JIGUMIA는 개발자 고주원이 운영하며, 계정 삭제 관련 문의는{' '}
          <MailLink /> 으로 연락 주시기 바랍니다.
        </p>
      </Section>

      <Section title="2. 앱에서 직접 삭제하기 (권장)">
        <p className="mb-3">
          JIGUMIA 앱에 로그인한 상태에서 아래 단계를 따르면 계정과 모든 데이터가 즉시 영구적으로
          삭제됩니다.
        </p>
        <ol className="ml-5 list-decimal space-y-1.5">
          <li>JIGUMIA 앱을 실행하고 로그인합니다.</li>
          <li>
            하단 탭에서 <Em>마이페이지</Em>로 이동합니다.
          </li>
          <li>
            <Em>회원 탈퇴</Em> 메뉴를 선택합니다.
          </li>
          <li>안내에 따라 탈퇴를 확인하면 계정과 데이터가 즉시 삭제됩니다.</li>
        </ol>
      </Section>

      <Section title="3. 이메일로 삭제 요청하기">
        <p>
          앱에 접근할 수 없는 경우, 가입에 사용한 이메일 주소로 <MailLink />에 계정 삭제를 요청해
          주세요. 본인 확인 후 영업일 기준 7일 이내에 계정과 관련 데이터를 삭제하고 처리 결과를
          회신드립니다.
        </p>
      </Section>

      <Section title="4. 삭제되는 데이터">
        <p className="mb-3">
          계정 삭제 시 다음의 모든 데이터가 즉시 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>계정 정보(이메일 주소, 고유 식별자, 이름)</li>
          <li>관심 브랜드 및 브랜드별 알림 설정</li>
          <li>기기 푸시 토큰</li>
          <li>앱 내 문의 내역</li>
        </ul>
      </Section>

      <Section title="5. 보관되는 데이터 및 기간">
        <p>
          JIGUMIA는 계정 삭제 후 별도로 보관하는 개인정보가 없으며, 위 데이터는 즉시 삭제됩니다. 다만
          관련 법령에서 일정 기간 보존을 요구하는 경우에는 해당 법령이 정한 기간 동안만 보관 후
          파기합니다. 자세한 내용은{' '}
          <Link
            href="/privacy"
            className="font-medium underline underline-offset-2"
            style={{ color: '#6C63FF' }}
          >
            개인정보처리방침
          </Link>
          을 참고해 주시기 바랍니다.
        </p>
      </Section>
    </LegalPage>
  );
}
