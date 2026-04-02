import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useSaleStore } from '../store/saleStore';
import { SaleEvent } from '../types';
import { formatDate, getDday } from '../utils/date';
import { useThemeColors } from '../hooks/useColorScheme';
import SaleDetailSheet from '../components/SaleDetailSheet';
import ErrorBanner from '../components/ErrorBanner';

function SaleRow({ event, onPress }: { event: SaleEvent; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const brandColor = event.brand?.color ?? colors.brand;
  const dday = event.status === 'upcoming'
    ? t('start_dday', { dday: getDday(event.start_date) })
    : t('end_dday', { dday: getDday(event.end_date) });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`${event.brand?.name} ${event.title} ${dday}`}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* left color accent */}
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: brandColor,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }} />

      {/* 브랜드 컬러 아이콘 */}
      <View style={{
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: brandColor + '18',
        borderWidth: 1.5,
        borderColor: brandColor + '40',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 4, marginRight: 14,
      }}>
        <Text style={{ color: brandColor, fontSize: 18, fontWeight: '900' }}>
          {event.brand?.name?.[0] ?? '?'}
        </Text>
      </View>

      {/* 정보 */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 }}>
          {event.brand?.name}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 3 }} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
          </Text>
        </View>
      </View>

      {/* D-day pill */}
      <View style={{
        paddingHorizontal: 9, paddingVertical: 4,
        backgroundColor: brandColor + '12',
        borderRadius: 8,
        marginLeft: 8,
      }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: brandColor }}>
          {dday}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SaleListScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { type } = useLocalSearchParams<{ type: 'active' | 'upcoming' }>();
  const { saleEvents, refreshing, refresh, error, clearError } = useSaleStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedSale, setSelectedSale] = useState<SaleEvent | null>(null);

  const isActive = type === 'active';

  const list = saleEvents
    .filter((e) => e.status === type)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const title = isActive ? t('active_now') : t('upcoming_now');

  useEffect(() => {
    if (selectedSale) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [selectedSale]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* 헤더 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={t('go_back')}
            accessibilityRole="button"
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, flex: 1 }}>
            {title}
          </Text>
          <View style={{
            paddingHorizontal: 10, paddingVertical: 4,
            backgroundColor: isActive ? colors.accent : colors.brand,
            borderRadius: 10,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
              {t('sale_count', { count: list.length })}
            </Text>
          </View>
        </View>

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            onRetry={refresh}
          />
        )}

        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <SaleRow event={item} onPress={() => setSelectedSale(item)} />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <View style={{
                width: 64, height: 64, borderRadius: 20,
                backgroundColor: colors.surfaceSecondary,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="bag-outline" size={28} color={colors.textSecondary} />
              </View>
              <Text style={{ fontSize: 16, color: colors.text, fontWeight: '700' }}>
                {t('no_sale_info')}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
                {t('no_sales_desc')}
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      <SaleDetailSheet
        ref={bottomSheetRef}
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </View>
  );
}
