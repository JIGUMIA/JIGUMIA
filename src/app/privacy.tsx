import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../hooks/useColorScheme';

export default function PrivacyScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 12,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
          {t('privacy_policy')}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 20, fontWeight: '500' }}>
          시행일: 2025년 4월 1일
        </Text>

        <Intro colors={colors}>
          JIGUMIA(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보 처리방침은 회사가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
        </Intro>

        <Section title="1. 수집하는 개인정보 항목" colors={colors}>
          {`회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.

[필수 항목]
• 이메일 주소
• 이름 (Google/Apple 계정에서 제공)
• 고유 사용자 식별자 (OAuth ID)

[자동 수집 항목]
• 기기 정보 (OS 종류, 앱 버전)
• 서비스 이용 기록 (접속 일시, 관심 브랜드 목록)`}
        </Section>

        <Section title="2. 개인정보 수집 방법" colors={colors}>
          {`• Google 계정 로그인 시 OAuth 인증을 통해 수집
• Apple 계정 로그인 시 Sign in with Apple을 통해 수집
• 서비스 이용 과정에서 자동으로 생성·수집`}
        </Section>

        <Section title="3. 개인정보의 수집 및 이용 목적" colors={colors}>
          {`회사는 수집한 개인정보를 다음의 목적으로 이용합니다.

• 회원 가입 및 관리: 회원 식별, 본인 확인
• 서비스 제공: 관심 브랜드 저장, 세일 알림 발송
• 서비스 개선: 이용 통계 분석, 서비스 품질 향상
• 고객 지원: 문의 접수 및 답변, 공지사항 전달`}
        </Section>

        <Section title="4. 개인정보의 보유 및 이용 기간" colors={colors}>
          {`회원의 개인정보는 서비스 이용 기간 동안 보유하며, 다음의 경우 지체 없이 파기합니다.

• 회원 탈퇴 시: 즉시 파기
• 서비스 종료 시: 종료일로부터 30일 이내 파기

단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
• 전자상거래법에 따른 계약·청약 철회 기록: 5년
• 로그인 기록: 3개월`}
        </Section>

        <Section title="5. 개인정보의 제3자 제공" colors={colors}>
          {`회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.

• 이용자가 사전에 동의한 경우
• 법령에 의해 요구되는 경우`}
        </Section>

        <Section title="6. 개인정보의 파기 절차 및 방법" colors={colors}>
          {`• 파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 즉시 파기합니다.
• 파기 방법: 전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄하거나 소각합니다.`}
        </Section>

        <Section title="7. 개인정보 처리의 위탁" colors={colors}>
          {`회사는 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁합니다.

• Supabase (데이터베이스 및 인증 서비스)
  - 위탁 업무: 회원 정보 저장 및 인증
  - 보유 기간: 위탁 계약 종료 시까지`}
        </Section>

        <Section title="8. 이용자의 권리와 행사 방법" colors={colors}>
          {`이용자는 언제든지 다음의 권리를 행사할 수 있습니다.

• 개인정보 열람 요청
• 개인정보 수정 요청
• 개인정보 삭제 요청 (회원 탈퇴)
• 처리 정지 요청

위 권리는 앱 내 "마이페이지" 또는 이메일(support@jigumia.app)을 통해 행사할 수 있습니다.`}
        </Section>

        <Section title="9. 개인정보 보호책임자" colors={colors}>
          {`• 책임자: JIGUMIA Team
• 이메일: support@jigumia.app

개인정보 관련 문의, 불만 처리 등은 위 연락처로 문의해 주시기 바랍니다.`}
        </Section>

        <Section title="10. 개인정보 처리방침 변경" colors={colors}>
          본 개인정보 처리방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
        </Section>

        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 24, fontWeight: '500', lineHeight: 18 }}>
          본 개인정보 처리방침은 2025년 4월 1일부터 시행됩니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Intro({ children, colors }: { children: string; colors: any }) {
  return (
    <Text style={{
      fontSize: 13, color: colors.textSecondary, lineHeight: 20,
      fontWeight: '500', marginBottom: 24,
      paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
      {children}
    </Text>
  );
}

function Section({ title, children, colors }: { title: string; children: string; colors: any }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, fontWeight: '500' }}>
        {children}
      </Text>
    </View>
  );
}
