import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { useThemeColors } from '../hooks/useColorScheme';


export default function LoginScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [agreedPrivacy, setAgreedPrivacy] = useState(true);

  const allAgreed = agreedTerms && agreedPrivacy;

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreedTerms(next);
    setAgreedPrivacy(next);
  };

  const handleLogin = (loginFn: () => Promise<void>) => {
    if (!allAgreed) {
      Alert.alert(t('terms_required_title'), t('terms_required_desc'));
      return;
    }
    loginFn();
  };

  const handleGoogleLogin = async () => {
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
          const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
          if (sessionError) throw sessionError;
          router.back();
        }
      }
    } catch (e: any) {
      Alert.alert(t('login_error'), e.message);
    }
  };

  const handleAppleLogin = async () => {
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

      if (!credential.identityToken) {
        throw new Error('Apple Sign In failed - no identity token');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (error) throw error;
      router.back();
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert(t('login_error'), e.message);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel={t('go_back')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 40 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 24 }}
          />
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
            {t('login_welcome')}
          </Text>
          <Text style={{
            fontSize: 14, color: colors.textSecondary, textAlign: 'center',
            lineHeight: 20, fontWeight: '500',
          }}>
            {t('login_desc')}
          </Text>
        </View>

        {/* Terms agreement */}
        <View style={{
          marginTop: 32,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}>
          {/* Agree all */}
          <TouchableOpacity
            style={[styles.termRow, { paddingVertical: 16 }]}
            onPress={toggleAll}
            activeOpacity={0.7}
          >
            <Ionicons
              name={allAgreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={allAgreed ? colors.brand : colors.textSecondary}
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, flex: 1 }}>
              {t('agree_all')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />

          {/* Terms of service */}
          <View style={styles.termRow}>
            <TouchableOpacity
              onPress={() => setAgreedTerms(!agreedTerms)}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreedTerms ? 'checkbox' : 'square-outline'}
                size={20}
                color={agreedTerms ? colors.brand : colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {t('terms_of_service')}
              </Text>
              <Text style={{ fontSize: 12, color: colors.accent, marginLeft: 4, fontWeight: '600' }}>
                ({t('required')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/terms')} hitSlop={8}>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 16 }} />

          {/* Privacy policy */}
          <View style={styles.termRow}>
            <TouchableOpacity
              onPress={() => setAgreedPrivacy(!agreedPrivacy)}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreedPrivacy ? 'checkbox' : 'square-outline'}
                size={20}
                color={agreedPrivacy ? colors.brand : colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {t('privacy_policy')}
              </Text>
              <Text style={{ fontSize: 12, color: colors.accent, marginLeft: 4, fontWeight: '600' }}>
                ({t('required')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/privacy')} hitSlop={8}>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login buttons */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {/* Google */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: allAgreed ? colors.card : colors.surfaceSecondary,
                borderColor: allAgreed ? colors.border : colors.surfaceSecondary,
                borderWidth: 1,
                opacity: allAgreed ? 1 : 0.5,
              },
            ]}
            onPress={() => handleLogin(handleGoogleLogin)}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color={colors.text} style={{ marginRight: 12 }} />
            <Text style={[styles.loginText, { color: colors.text }]}>{t('google_login')}</Text>
          </TouchableOpacity>

          {/* Apple - iOS only */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: allAgreed ? colors.text : colors.surfaceSecondary,
                  opacity: allAgreed ? 1 : 0.5,
                },
              ]}
              onPress={() => handleLogin(handleAppleLogin)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={22} color={allAgreed ? colors.background : colors.text} style={{ marginRight: 12 }} />
              <Text style={[styles.loginText, { color: allAgreed ? colors.background : colors.text }]}>{t('apple_login')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
