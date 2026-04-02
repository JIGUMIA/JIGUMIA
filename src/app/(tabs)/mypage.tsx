import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase';

const ACCENT = '#FF2D2D';
const BG = '#FAFAF8';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#8E8E93';
const CARD_BG = '#FFFFFF';
const SURFACE_DARK = '#1A1A1A';

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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: TEXT_PRIMARY, letterSpacing: -0.5 }}>
          마이페이지
        </Text>
      </View>

      {/* Profile card */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: SURFACE_DARK,
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
      }}>
        {/* decorative circle */}
        <View style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: 60,
          backgroundColor: ACCENT, opacity: 0.08,
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 16,
          }}>
            {user
              ? <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>{initials}</Text>
              : <Ionicons name="person" size={24} color="rgba(255,255,255,0.4)" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>
              {user ? (user.user_metadata?.full_name ?? '사용자') : '로그인이 필요해요'}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: '500' }}>
              {user ? user.email : '관심 브랜드와 알림을 이용하세요'}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={{
        marginHorizontal: 20, marginTop: 16,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
      }}>
        {user ? (
          <>
            {MENU_ITEMS.map((item, idx) => (
              <View key={item.label}>
                <MenuItem icon={item.icon} label={item.label} onPress={() => {}} />
                {idx < MENU_ITEMS.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 20 }} />
                )}
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 20 }} />
            <MenuItem
              icon="log-out-outline"
              label="로그아웃"
              onPress={handleSignOut}
              destructive
            />
          </>
        ) : (
          <TouchableOpacity
            style={{
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={16} color={TEXT_PRIMARY} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: TEXT_PRIMARY }}>
              Google 계정으로 로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#D1D1D6', letterSpacing: 0.5 }}>
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
        paddingVertical: 16,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: destructive ? ACCENT + '10' : '#F5F5F5',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? ACCENT : TEXT_PRIMARY}
        />
      </View>
      <Text style={{
        flex: 1, fontSize: 15, fontWeight: '600',
        color: destructive ? ACCENT : TEXT_PRIMARY,
      }}>
        {label}
      </Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={14} color="#D1D1D6" />
      )}
    </TouchableOpacity>
  );
}
