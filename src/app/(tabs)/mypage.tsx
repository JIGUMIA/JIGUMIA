import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase';

const MENU_ITEMS = [
  { icon: 'notifications-outline' as const, label: '알림 설정' },
  { icon: 'list-outline' as const, label: '알림 내역' },
  { icon: 'information-circle-outline' as const, label: '앱 정보' },
];

export default function MyPageScreen() {
  const { user, signOut } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      const redirectTo = 'jigumia://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) return;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        // Implicit flow: URL fragment(#)에서 토큰 파싱
        const hash = result.url.split('#')[1] ?? '';
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) throw sessionError;
        }
      }
    } catch (e: any) {
      Alert.alert('로그인 오류', e.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: signOut },
    ]);
  };

  const initials = user
    ? (user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()
    : '?';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>나의</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>마이페이지</Text>
      </View>

      {/* Profile card */}
      <View style={{
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: '#6C63FF',
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
      }}>
        <View style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }} />
        <View style={{
          position: 'absolute', bottom: -30, left: 60,
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: 'rgba(255,255,255,0.07)',
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 60, height: 60, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 16,
          }}>
            {user
              ? <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '900' }}>{initials}</Text>
              : <Ionicons name="person" size={28} color="rgba(255,255,255,0.8)" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>
              {user ? (user.user_metadata?.full_name ?? '사용자') : '로그인이 필요해요'}
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
              {user ? user.email : '관심 브랜드와 알림을 이용하세요'}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={{
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}>
        {user ? (
          <>
            {MENU_ITEMS.map((item, idx) => (
              <View key={item.label}>
                <MenuItem icon={item.icon} label={item.label} onPress={() => {}} />
                {idx < MENU_ITEMS.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 }} />
                )}
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 }} />
            <MenuItem
              icon="log-out-outline"
              label="로그아웃"
              onPress={handleSignOut}
              destructive
            />
          </>
        ) : (
          <TouchableOpacity
            style={{ paddingVertical: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={18} color="#6C63FF" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#6C63FF' }}>
              Google 계정으로 로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#D1D5DB' }}>
        JIGUMIA v1.0.0
      </Text>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
      }}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? '#EF5350' : '#6C63FF'}
        style={{ marginRight: 14 }}
      />
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: destructive ? '#EF5350' : '#1E1B4B' }}>
        {label}
      </Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}
