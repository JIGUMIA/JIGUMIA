import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
try { AppleAuthentication = require('expo-apple-authentication'); } catch {}
let Crypto: typeof import('expo-crypto') | null = null;
try { Crypto = require('expo-crypto'); } catch {}
import { supabase } from '../services/supabase';
import { useSettingsStore } from '../store/settingsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = ['intro', 'login'] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { setHasSeenOnboarding } = useSettingsStore();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const canLogin = agreedTerms && agreedPrivacy;
  const allAgreed = agreedTerms && agreedPrivacy;

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreedTerms(next);
    setAgreedPrivacy(next);
  };

  const handleStart = () => {
    flatListRef.current?.scrollToIndex({ index: 1, animated: true });
  };

  const handleBrowse = () => {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = async () => {
    if (!canLogin) {
      Alert.alert(t('terms_required_title'), t('terms_required_desc'));
      return;
    }
    try {
      const redirectTo = 'jigumia://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
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
          setHasSeenOnboarding(true);
          router.replace('/(tabs)');
        }
      }
    } catch (e: any) {
      Alert.alert(t('login_error'), e.message);
    }
  };

  const handleAppleLogin = async () => {
    if (!canLogin || !AppleAuthentication || !Crypto) {
      if (!canLogin) Alert.alert(t('terms_required_title'), t('terms_required_desc'));
      return;
    }
    try {
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) throw new Error('Apple Sign In failed');
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (error) throw error;
      setHasSeenOnboarding(true);
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert(t('login_error'), e.message);
    }
  };

  const renderIntroPage = () => (
    <View
      style={{
        width: SCREEN_WIDTH,
        flex: 1,
        backgroundColor: '#6C63FF',
      }}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Decorative circles */}
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

        {/* Content */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          {/* Logo */}
          <Image
            source={require('../../assets/JIGUMIA_LOGO.png')}
            style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 32 }}
            resizeMode="cover"
          />

          {/* App name */}
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 12 }}>
            {t('app_title')}
          </Text>

          {/* Description */}
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            lineHeight: 24,
            fontWeight: '500',
          }}>
            {t('onboarding_intro_desc')}
          </Text>

          {/* Feature highlights */}
          <View style={{ marginTop: 40, gap: 16 }}>
            {[
              { icon: 'calendar-outline' as const, text: t('onboarding_feature_calendar') },
              { icon: 'heart-outline' as const, text: t('onboarding_feature_favorites') },
              { icon: 'notifications-outline' as const, text: t('onboarding_feature_notifications') },
            ].map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                </View>
                <Text style={{ fontSize: 15, color: '#FFFFFF', fontWeight: '600' }}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start button - bottom full width */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={handleStart}
            style={{
              backgroundColor: '#FFFFFF',
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#6C63FF' }}>
              {t('onboarding_login_title')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderLoginPage = () => (
    <View
      style={{
        width: SCREEN_WIDTH,
        flex: 1,
        backgroundColor: '#6C63FF',
      }}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Back button */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => flatListRef.current?.scrollToIndex({ index: 0, animated: true })}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          {/* Logo */}
          <Image
            source={require('../../assets/JIGUMIA_LOGO.png')}
            style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 16 }}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 32 }}>
            {t('login_welcome')}
          </Text>

          {/* Terms agreement */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 24,
          }}>
            {/* Agree all */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
              onPress={toggleAll}
              activeOpacity={0.7}
            >
              <Ionicons
                name={allAgreed ? 'checkbox' : 'square-outline'}
                size={22}
                color={allAgreed ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF', flex: 1 }}>
                {t('agree_all')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 }} />

            {/* Terms */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
              <TouchableOpacity
                onPress={() => setAgreedTerms(!agreedTerms)}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={agreedTerms ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreedTerms ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>
                  {t('terms_of_service')}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4, fontWeight: '600' }}>
                  ({t('required')})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/terms')} hitSlop={8}>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 }} />

            {/* Privacy */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
              <TouchableOpacity
                onPress={() => setAgreedPrivacy(!agreedPrivacy)}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={agreedPrivacy ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreedPrivacy ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>
                  {t('privacy_policy')}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4, fontWeight: '600' }}>
                  ({t('required')})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/privacy')} hitSlop={8}>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login buttons */}
          <View style={{ width: '100%', gap: 12 }}>
            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                opacity: canLogin ? 1 : 0.5,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={18} color="#111111" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111111' }}>
                {t('google_login')}
              </Text>
            </TouchableOpacity>

            {/* Apple - iOS only */}
            {Platform.OS === 'ios' && AppleAuthentication && (
              <TouchableOpacity
                onPress={handleAppleLogin}
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  borderRadius: 14,
                  backgroundColor: '#000000',
                  opacity: canLogin ? 1 : 0.5,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                  {t('apple_login')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Browse without login */}
          <TouchableOpacity
            onPress={handleBrowse}
            style={{ marginTop: 24, paddingVertical: 12 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>
              {t('onboarding_browse')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderItem = ({ item }: { item: string }) => {
    if (item === 'login') return renderLoginPage();
    return renderIntroPage();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#6C63FF' }}>
      <FlatList
        ref={flatListRef}
        data={[...PAGES]}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}
