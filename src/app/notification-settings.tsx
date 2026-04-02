import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useColorScheme';
import { useAuthStore } from '../store/authStore';
import { useSaleStore } from '../store/saleStore';
import { useFavoriteStore } from '../store/favoriteStore';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const { brands } = useSaleStore();
  const { favoriteIds, userId: favoriteStoreUserId } = useFavoriteStore();

  const favoriteBrands =
    user && favoriteStoreUserId === user.id
      ? brands.filter((b) => favoriteIds.has(b.id))
      : [];

  const initialToggles = Object.fromEntries(favoriteBrands.map((b) => [b.id, true]));
  const [toggles, setToggles] = useState<Record<string, boolean>>(initialToggles);

  const handleToggle = (brandId: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [brandId]: value }));
  };

  if (!user) {
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
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>알림 설정</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: colors.accent + '12',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Ionicons name="notifications-outline" size={28} color={colors.accent} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            로그인이 필요해요
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            관심 브랜드를 저장하고{'\n'}세일 알림을 받아보세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>알림 설정</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Section header */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
            관심 브랜드 알림
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
            즐겨찾기한 브랜드의 세일 알림을 받아보세요
          </Text>
        </View>

        {favoriteBrands.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 40 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="bookmark-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
              관심 브랜드를 먼저 추가해주세요
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
              탐색 탭에서 브랜드 하트를 눌러보세요
            </Text>
          </View>
        ) : (
          <View style={{
            marginHorizontal: 20,
            backgroundColor: colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            {favoriteBrands.map((brand, idx) => {
              const brandColor = brand.color ?? colors.brand;
              return (
                <View key={brand.id}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                  }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 13,
                      backgroundColor: brandColor,
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 14,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900' }}>
                        {brand.name[0]}
                      </Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }}>
                      {brand.name}
                    </Text>
                    <Switch
                      value={toggles[brand.id] ?? true}
                      onValueChange={(val) => handleToggle(brand.id, val)}
                      trackColor={{ false: colors.border, true: colors.brand + 'AA' }}
                      thumbColor={toggles[brand.id] ? colors.brand : colors.textSecondary}
                    />
                  </View>
                  {idx < favoriteBrands.length - 1 && (
                    <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20 }} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Bottom note */}
        <Text style={{
          marginHorizontal: 20,
          marginTop: 16,
          fontSize: 12,
          color: colors.textSecondary,
          lineHeight: 18,
          fontWeight: '500',
        }}>
          세일 시작 하루 전, 시작일, 종료 하루 전에 알림을 보내드려요
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
