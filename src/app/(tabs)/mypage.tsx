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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          나의
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>
          마이페이지
        </Text>
      </View>

      {/* Profile card */}
      <View style={{
        marginHorizontal: 20, marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(108,99,255,0.15)',
      }}>
        {/* top accent bar */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3, backgroundColor: '#6C63FF',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
        }} />

        {/* glow blob */}
        <View style={{
          position: 'absolute', top: -30, right: -30,
          width: 130, height: 130, borderRadius: 65,
          backgroundColor: '#6C63FF', opacity: 0.06,
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 58, height: 58, borderRadius: 18,
            backgroundColor: 'rgba(108,99,255,0.1)',
            borderWidth: 1.5, borderColor: 'rgba(108,99,255,0.25)',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 16,
          }}>
            {user
              ? <Text style={{ color: '#6C63FF', fontSize: 24, fontWeight: '900' }}>{initials}</Text>
              : <Ionicons name="person" size={26} color="rgba(108,99,255,0.4)" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>
              {user ? (user.user_metadata?.full_name ?? '사용자') : '로그인이 필요해요'}
            </Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '500' }}>
              {user ? user.email : '관심 브랜드와 알림을 이용하세요'}
            </Text>
          </View>
          {user && (
            <View style={{
              paddingHorizontal: 8, paddingVertical: 4,
              backgroundColor: 'rgba(108,99,255,0.08)',
              borderRadius: 8,
              borderWidth: 1, borderColor: 'rgba(108,99,255,0.25)',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#6C63FF', letterSpacing: 0.5 }}>
                멤버
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu */}
      <View style={{
        marginHorizontal: 20, marginTop: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        overflow: 'hidden',
      }}>
        {/* top accent bar */}
        <View style={{
          height: 3, backgroundColor: '#6C63FF',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
        }} />

        {user ? (
          <>
            {MENU_ITEMS.map((item, idx) => (
              <View key={item.label}>
                <MenuItem icon={item.icon} label={item.label} onPress={() => {}} />
                {idx < MENU_ITEMS.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
                )}
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
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
              paddingVertical: 20,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={16} color="#6C63FF" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#6C63FF' }}>
              Google 계정으로 로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#D1D5DB', letterSpacing: 1 }}>
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
        paddingVertical: 17,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: destructive ? '#FFF0F0' : 'rgba(108,99,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? '#EF5350' : '#6C63FF'}
        />
      </View>
      <Text style={{
        flex: 1, fontSize: 15, fontWeight: '600',
        color: destructive ? '#EF5350' : '#1E1B4B',
      }}>
        {label}
      </Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}
