import '../../global.css';
import 'react-native-url-polyfill/auto';
import '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, AppState, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
let Updates: typeof import('expo-updates') | null = null;
try { Updates = require('expo-updates'); } catch {}
let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try { LocalAuthentication = require('expo-local-authentication'); } catch {}
import { useAuthStore } from '../store/authStore';
import { useSaleStore } from '../store/saleStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { useSettingsStore } from '../store/settingsStore';
import { useColorScheme } from '../hooks/useColorScheme';
import NetworkBanner from '../components/NetworkBanner';
import { initSentry } from '../services/sentry';

export default function RootLayout() {
  const scheme = useColorScheme();
  const { initialize, user } = useAuthStore();
  const { fetchAll } = useSaleStore();
  const { fetchFavorites } = useFavoriteStore();
  const { biometricEnabled } = useSettingsStore();
  const [splashDone, setSplashDone] = useState(false);
  const [locked, setLocked] = useState(biometricEnabled);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    initSentry();
    initialize();
    fetchAll();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.delay(1000),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setSplashDone(true));
  }, []);

  useEffect(() => {
    if (!user) return;

    // slight delay: Supabase auth session can become usable slightly after getSession()
    const t = setTimeout(() => {
      fetchFavorites(user.id);
    }, 300);

    return () => clearTimeout(t);
  }, [user?.id, fetchFavorites]);

  useEffect(() => {
    if (!user) return;

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      fetchFavorites(user.id);
    });

    return () => sub.remove();
  }, [user?.id, fetchFavorites]);

  useEffect(() => {
    if (!biometricEnabled || !LocalAuthentication) { setLocked(false); return; }
    (async () => {
      const hasHardware = await LocalAuthentication!.hasHardwareAsync();
      if (!hasHardware) { setLocked(false); return; }
      const result = await LocalAuthentication!.authenticateAsync({
        promptMessage: '본인 확인',
        fallbackLabel: '비밀번호 사용',
      });
      if (result.success) setLocked(false);
    })();
  }, [biometricEnabled]);

  useEffect(() => {
    if (__DEV__ || !Updates) return;
    (async () => {
      try {
        const update = await Updates!.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates!.fetchUpdateAsync();
          Alert.alert('업데이트', '새 버전이 설치되었어요. 앱을 다시 시작합니다.', [
            { text: '확인', onPress: () => Updates!.reloadAsync() },
          ]);
        }
      } catch (e) {
        // silent fail for update check
      }
    })();
  }, []);

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' }}>
          {/* background decorative circles */}
          <View style={{
            position: 'absolute', top: -80, right: -80,
            width: 300, height: 300, borderRadius: 150,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }} />
          <View style={{
            position: 'absolute', bottom: -60, left: -60,
            width: 250, height: 250, borderRadius: 125,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }} />

          <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
            {/* Logo circle */}
            <View style={{
              width: 88, height: 88, borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <Text style={{ fontSize: 42, fontWeight: '900', color: '#FFFFFF' }}>J</Text>
            </View>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFFFFF' }}>
              지금이야
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 6, letterSpacing: 5 }}>
              JIGUMIA
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 12 }}>
              브랜드 할인 캘린더
            </Text>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (locked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="lock-closed" size={48} color="#FFFFFF" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>잠금 해제가 필요해요</Text>
          <TouchableOpacity
            onPress={async () => {
              const result = await LocalAuthentication!.authenticateAsync({ promptMessage: '본인 확인', fallbackLabel: '비밀번호 사용' });
              if (result.success) setLocked(false);
            }}
            style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>잠금 해제</Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sale-list" />
        <Stack.Screen name="search" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="notification-history" />
        <Stack.Screen name="app-info" />
        <Stack.Screen name="sale/[id]" />
        <Stack.Screen name="brand/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
