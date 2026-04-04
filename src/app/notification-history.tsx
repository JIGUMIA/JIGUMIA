import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useColorScheme';

export default function NotificationHistoryScreen() {
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
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>알림 내역</Text>
      </View>

      {/* Empty state */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 22,
          backgroundColor: colors.surfaceSecondary,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <Ionicons name="notifications-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text style={{
          fontSize: 17, fontWeight: '800', color: colors.text,
          marginBottom: 8, textAlign: 'center',
        }}>
          아직 알림이 없어요
        </Text>
        <Text style={{
          fontSize: 14, color: colors.textSecondary,
          textAlign: 'center', lineHeight: 20,
        }}>
          세일 알림이 도착하면 여기에 표시돼요
        </Text>
      </View>
    </SafeAreaView>
  );
}
