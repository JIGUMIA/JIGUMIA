import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useSaleStore } from '../store/saleStore';
import { useThemeColors } from '../hooks/useColorScheme';
import { Brand, SaleEvent } from '../types';
import { getDday, formatDate } from '../utils/date';
import SaleDetailSheet from '../components/SaleDetailSheet';

export default function SearchScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { brands, saleEvents } = useSaleStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedSale, setSelectedSale] = useState<SaleEvent | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedSale) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [selectedSale]);

  const q = query.trim().toLowerCase();

  const filteredBrands = useMemo(() => {
    if (!q) return [];
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, q]);

  const filteredSales = useMemo(() => {
    if (!q) return [];
    return saleEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.brand?.name?.toLowerCase().includes(q)) ||
        (e.description?.toLowerCase().includes(q))
    );
  }, [saleEvents, q]);

  const recentSales = useMemo(() => {
    return saleEvents
      .filter((e) => e.status === 'active' || e.status === 'upcoming')
      .slice(0, 5);
  }, [saleEvents]);

  const hasResults = filteredBrands.length > 0 || filteredSales.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* 검색 헤더 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={t('go_back')}
            accessibilityRole="button"
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1.5,
            borderColor: query ? colors.brand + '40' : colors.border,
          }}>
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              style={{ flex: 1, fontSize: 15, color: colors.text, padding: 0 }}
              placeholder={t('search_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel={t('search_placeholder')}
              accessibilityRole="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityLabel={t('clear_search')}
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 검색 결과 */}
        {q.length === 0 ? (
          /* 검색 전: 추천 세일 */
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 14 }}>
              {t('current_sales')}
            </Text>
            {recentSales.map((sale) => (
              <SaleRow
                key={sale.id}
                event={sale}
                colors={colors}
                onPress={() => setSelectedSale(sale)}
              />
            ))}
          </View>
        ) : !hasResults ? (
          /* 결과 없음 */
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="search-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {t('no_results')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>
              {t('try_other_keyword')}
            </Text>
          </View>
        ) : (
          /* 결과 있음 */
          <FlatList
            data={[]}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            ListHeaderComponent={
              <>
                {/* 브랜드 결과 */}
                {filteredBrands.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10, letterSpacing: 0.3 }}>
                      {t('brands')} ({filteredBrands.length})
                    </Text>
                    {filteredBrands.map((brand) => (
                      <BrandRow
                        key={brand.id}
                        brand={brand}
                        colors={colors}
                        saleCount={saleEvents.filter((e) => e.brand_id === brand.id && e.status === 'active').length}
                        onPress={() => {
                          const brandSales = saleEvents.filter(
                            (e) => e.brand_id === brand.id && (e.status === 'active' || e.status === 'upcoming')
                          );
                          if (brandSales.length > 0) {
                            setSelectedSale(brandSales[0]);
                          }
                        }}
                      />
                    ))}
                  </View>
                )}

                {/* 세일 결과 */}
                {filteredSales.length > 0 && (
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10, letterSpacing: 0.3 }}>
                      세일 ({filteredSales.length})
                    </Text>
                    {filteredSales.map((sale) => (
                      <SaleRow
                        key={sale.id}
                        event={sale}
                        colors={colors}
                        onPress={() => setSelectedSale(sale)}
                      />
                    ))}
                  </View>
                )}
              </>
            }
          />
        )}
      </SafeAreaView>

      <SaleDetailSheet
        ref={bottomSheetRef}
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </View>
  );
}

function BrandRow({
  brand,
  colors,
  saleCount,
  onPress,
}: {
  brand: Brand;
  colors: ReturnType<typeof useThemeColors>;
  saleCount: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const brandColor = brand.color ?? colors.brand;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`${brand.name} ${brand.category}${saleCount > 0 ? ' ' + t('sales_count', { count: saleCount }) : ''}`}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: brandColor,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }} />

      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: brandColor + '18',
        borderWidth: 1.5,
        borderColor: brandColor + '40',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 4, marginRight: 12,
      }}>
        <Text style={{ color: brandColor, fontSize: 16, fontWeight: '900' }}>
          {brand.name[0]}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
          {brand.name}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
          {brand.category}
        </Text>
      </View>

      {saleCount > 0 && (
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3,
          backgroundColor: colors.accent,
          borderRadius: 7,
        }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
            {t('sales_count', { count: saleCount })} 중
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
}

function SaleRow({
  event,
  colors,
  onPress,
}: {
  event: SaleEvent;
  colors: ReturnType<typeof useThemeColors>;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const brandColor = event.brand?.color ?? colors.brand;
  const isActive = event.status === 'active';
  const dday = getDday(isActive ? event.end_date : event.start_date);
  const statusLabel = isActive ? t('status_active') : t('status_upcoming');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`${event.brand?.name} ${event.title} ${statusLabel} ${dday}`}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: brandColor,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }} />

      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: brandColor + '18',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 4, marginRight: 12,
      }}>
        <Text style={{ color: brandColor, fontSize: 16, fontWeight: '800' }}>
          {event.brand?.name?.[0] ?? '?'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 1 }}>
          {event.brand?.name}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }} numberOfLines={1}>
          {event.title}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
        <View style={{
          paddingHorizontal: 7, paddingVertical: 3,
          backgroundColor: isActive ? colors.accent : brandColor + '14',
          borderRadius: 7,
          marginBottom: 3,
        }}>
          <Text style={{
            fontSize: 10, fontWeight: '800',
            color: isActive ? '#FFFFFF' : brandColor,
          }}>
            {statusLabel}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
          {dday}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
