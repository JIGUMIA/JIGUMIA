import React from 'react';
import { View, Text, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try { LocalAuthentication = require('expo-local-authentication'); } catch {}
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeColors } from '../../hooks/useColorScheme';
import i18n from '../../i18n';

const MENU_ITEMS = [
  { icon: 'notifications-outline' as const, labelKey: 'notification_settings', route: '/notification-settings' as const },
  { icon: 'list-outline' as const, labelKey: 'notification_history', route: '/notification-history' as const },
];

export default function MyPageScreen() {
  const colors = useThemeColors();
  const { user, signOut, deleteAccount } = useAuthStore();
  const { t } = useTranslation();
  const { biometricEnabled, setBiometricEnabled, language, setLanguage } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account'),
      t('delete_account_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (e: any) {
              Alert.alert(t('delete_account'), e.message);
            }
          },
        },
      ]
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!LocalAuthentication) {
      Alert.alert(t('app_info'), '이 기기에서는 생체 인증을 사용할 수 없어요');
      return;
    }
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(t('app_info'), '이 기기는 생체 인증을 지원하지 않아요');
        return;
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(t('app_info'), '기기에 등록된 생체 인증이 없어요');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: t('biometric_prompt') });
      if (result.success) setBiometricEnabled(true);
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleLanguageToggle = () => {
    const next = language === 'ko' ? 'en' : 'ko';
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  const initials = user
    ? (user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()
    : '?';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
          {t('mypage')}
        </Text>
      </View>

      {/* Profile card */}
      <TouchableOpacity
        activeOpacity={user ? 1 : 0.7}
        onPress={() => { if (!user) router.push('/login'); }}
        style={{
          marginHorizontal: 20,
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: user ? colors.brand + '18' : colors.surfaceSecondary,
            borderWidth: 1.5,
            borderColor: user ? colors.brand + '40' : colors.border,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 16,
          }}>
            {user
              ? <Text style={{ color: colors.brand, fontSize: 22, fontWeight: '900' }}>{initials}</Text>
              : <Ionicons name="person" size={24} color={colors.textSecondary} />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              {user ? (user.user_metadata?.full_name ?? t('user_label')) : t('login_required')}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' }}>
              {user ? user.email : t('login_tap')}
            </Text>
          </View>
          {user ? (
            <View style={{
              paddingHorizontal: 10, paddingVertical: 5,
              backgroundColor: colors.brand + '12',
              borderRadius: 10,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand }}>{t('member')}</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Menu */}
      <View style={{
        marginHorizontal: 20, marginTop: 16,
        backgroundColor: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        {user && MENU_ITEMS.map((item, idx) => (
          <View key={item.labelKey}>
            <MenuItem
              icon={item.icon}
              label={t(item.labelKey)}
              onPress={() => router.push(item.route)}
            />
            {idx < MENU_ITEMS.length - 1 && (
              <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />
            )}
          </View>
        ))}
        {user && <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />}
        <MenuItem
          icon="information-circle-outline"
          label={t('app_info')}
          onPress={() => router.push('/app-info')}
        />
        <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />
        <MenuItem
          icon="mail-outline"
          label={t('contact')}
          onPress={() => router.push('/contact')}
        />
        {user && (
          <>
            <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />
            <MenuItem
              icon="log-out-outline"
              label={t('logout')}
              onPress={handleSignOut}
              destructive
            />
            <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />
            <MenuItem
              icon="trash-outline"
              label={t('delete_account')}
              onPress={handleDeleteAccount}
              destructive
            />
          </>
        )}
      </View>

      {/* Settings card */}
      <View style={{
        marginHorizontal: 20, marginTop: 12,
        backgroundColor: colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        {/* Biometric toggle */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingVertical: 14,
        }}>
          <View style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}>
            <Ionicons name="finger-print-outline" size={18} color={colors.text} />
          </View>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }}>
            {t('biometric_setting')}
          </Text>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.border, true: colors.brand }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={{ height: 1, backgroundColor: colors.surfaceSecondary, marginHorizontal: 20 }} />
        {/* Language toggle */}
        <TouchableOpacity
          onPress={handleLanguageToggle}
          style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 20, paddingVertical: 14,
          }}
          accessibilityLabel={t('language_setting')}
          accessibilityRole="button"
        >
          <View style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}>
            <Ionicons name="language-outline" size={18} color={colors.text} />
          </View>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }}>
            {t('language_setting')}
          </Text>
          <View style={{
            paddingHorizontal: 10, paddingVertical: 4,
            backgroundColor: colors.brand + '12',
            borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand }}>
              {language === 'ko' ? '한국어' : 'English'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 }}>
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
  const colors = useThemeColors();

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
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={{
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: destructive ? colors.accent + '10' : colors.surfaceSecondary,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? colors.accent : colors.text}
        />
      </View>
      <Text style={{
        flex: 1, fontSize: 15, fontWeight: '600',
        color: destructive ? colors.accent : colors.text,
      }}>
        {label}
      </Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}
