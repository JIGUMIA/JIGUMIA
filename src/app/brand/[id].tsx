import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSaleStore } from '../../store/saleStore';
import { useThemeColors } from '../../hooks/useColorScheme';
import { useSheetStore } from '../../store/sheetStore';
import { getDday } from '../../utils/date';
import { SaleEvent } from '../../types';

export default function BrandDeepLink() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { brands, saleEvents, loading } = useSaleStore();
  const { openSheet } = useSheetStore();

  const brand = brands.find((b) => b.id === id);
  const brandSales = saleEvents.filter(
    (e) => e.brand_id === id && e.status !== 'ended'
  );
  const brandColor = brand?.color ?? colors.brand;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!brand) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          브랜드를 찾을 수 없어요
        </Text>
        <Text
          style={{ fontSize: 14, color: colors.brand, fontWeight: '600' }}
          onPress={() => router.replace('/')}
        >
          홈으로 돌아가기
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 12,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, flex: 1 }}>
          {brand.name}
        </Text>
      </View>

      {/* Brand Hero */}
      <View style={{
        backgroundColor: brandColor,
        borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 16,
        overflow: 'hidden',
      }}>
        <View style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {brand.logo_url ? (
            <Image
              source={{ uri: brand.logo_url }}
              style={{ width: 48, height: 48, borderRadius: 14, marginRight: 14 }}
              contentFit="cover"
            />
          ) : (
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
                {brand.name[0]}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>{brand.name}</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{brand.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(brand.website_url)}
          style={{
            marginTop: 16, paddingVertical: 12, borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
          }}
          accessibilityLabel="브랜드 사이트 방문"
          accessibilityRole="link"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>사이트 방문</Text>
        </TouchableOpacity>
      </View>

      {/* Sales */}
      <FlatList
        data={brandSales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 }}>
            세일 ({brandSales.length})
          </Text>
        }
        renderItem={({ item }) => {
          const isActive = item.status === 'active';
          const dday = getDday(isActive ? item.end_date : item.start_date);
          return (
            <TouchableOpacity
              onPress={() => openSheet(item)}
              activeOpacity={0.75}
              style={{
                backgroundColor: colors.card, borderRadius: 16, padding: 14,
                marginBottom: 8, borderWidth: 1, borderColor: colors.border,
                flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
              }}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 3, backgroundColor: brandColor,
              }} />
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {item.start_date.slice(5).replace('-', '.')} ~ {item.end_date.slice(5).replace('-', '.')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{
                  paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, marginBottom: 3,
                  backgroundColor: isActive ? colors.accent : brandColor + '14',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: isActive ? '#FFFFFF' : brandColor }}>
                    {isActive ? '진행 중' : '예정'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>{dday}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>진행 중이거나 예정된 세일이 없어요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
