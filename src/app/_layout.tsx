import '../../global.css';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useSaleStore } from '../store/saleStore';
import { useFavoriteStore } from '../store/favoriteStore';

export default function RootLayout() {
  const { initialize, user } = useAuthStore();
  const { fetchAll } = useSaleStore();
  const { fetchFavorites } = useFavoriteStore();
  const [splashDone, setSplashDone] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sale-list" />
      </Stack>
    </GestureHandlerRootView>
  );
}
