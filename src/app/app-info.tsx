import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useColorScheme';

const INFO_ROWS = [
  { label: '개발자', value: 'JIGUMIA Team' },
  { label: '문의', value: 'support@jigumia.app' },
  { label: '버전', value: '1.0.0' },
];

export default function AppInfoScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 36, height: 36, borderRadius: 12,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>앱 정보</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Logo + App name */}
        <View style={{ alignItems: 'center', paddingVertical: 36 }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 16 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
            JIGUMIA
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4, fontWeight: '600' }}>
            지구미아
          </Text>
          <View style={{
            marginTop: 10,
            paddingHorizontal: 12, paddingVertical: 4,
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 8,
          }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>v1.0.0</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 10, fontWeight: '500' }}>
            브랜드 할인 캘린더 앱
          </Text>
        </View>

        {/* Info rows */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}>
          {INFO_ROWS.map((row, idx) => (
            <View key={row.label}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
                justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{row.label}</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>{row.value}</Text>
              </View>
              {idx < INFO_ROWS.length - 1 && (
                <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20 }} />
              )}
            </View>
          ))}
        </View>

        {/* Copyright */}
        <Text style={{
          textAlign: 'center',
          marginTop: 32,
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '500',
          opacity: 0.6,
        }}>
          © 2025 JIGUMIA. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
