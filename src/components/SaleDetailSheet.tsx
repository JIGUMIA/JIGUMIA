import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Linking, Share } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { SaleEvent } from '../types';
import { formatDate, getDday } from '../utils/date';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { useThemeColors } from '../hooks/useColorScheme';

interface SaleDetailSheetProps {
  sale: SaleEvent | null;
  onClose?: () => void;
}

const SaleDetailSheet = forwardRef<BottomSheet, SaleDetailSheetProps>(({ sale, onClose }, ref) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, userId: favoriteStoreUserId } = useFavoriteStore();
  const snapPoints = useMemo(() => ['65%'], []);
  // CTA를 하단에 고정하기 위해 BottomSheetView 대신 flex 구조 사용

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const brand = sale?.brand;
  const brandColor = brand?.color ?? colors.text;
  const isFav = brand && user && favoriteStoreUserId === user.id ? isFavorite(brand.id) : false;

  const isActive = sale?.status === 'active';
  const isUpcoming = sale?.status === 'upcoming';

  const handleShare = async () => {
    if (!sale || !brand) return;
    const startSlice = sale.start_date.slice(5).replace('-', '.');
    const endSlice = sale.end_date.slice(5).replace('-', '.');
    try {
      await Share.share({
        message: t('share_text', {
          brand: brand.name,
          title: sale.title,
          start: startSlice,
          end: endSlice,
        }),
      });
    } catch {}
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: '#D1D1D6', width: 36, height: 4 }}
      onClose={onClose}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 4 }}>
        {!sale ? null : (<>

        {/* scrollable content area */}
        <View style={{ flex: 1 }}>

        {/* ── Header: brand color banner ── */}
        <View style={{
          backgroundColor: brandColor,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          overflow: 'hidden',
        }}>
          {/* decorative circle */}
          <View style={{
            position: 'absolute', top: -20, right: -20,
            width: 100, height: 100, borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* brand info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ marginRight: 12 }}>
                {brand?.logo_url ? (
                  <Image
                    source={{ uri: brand.logo_url }}
                    style={{ width: 40, height: 40, borderRadius: 12 }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
                      {brand?.name?.[0] ?? '?'}
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
                  {brand?.name ?? t('brands')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' }}>
                  {brand?.category ?? ''}
                </Text>
              </View>
            </View>

            {/* status + share + favorite */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                paddingHorizontal: 9, paddingVertical: 4,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                  {isActive ? t('status_active') : isUpcoming ? t('status_upcoming') : t('status_ended')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleShare}
                accessibilityLabel={t('share_sale')}
                accessibilityRole="button"
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              {user && (
                <TouchableOpacity
                  onPress={() => brand && toggleFavorite(user.id, brand.id)}
                  accessibilityLabel={isFav ? '관심 해제' : '관심 등록'}
                  accessibilityRole="button"
                  style={{
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFav ? '#FFFFFF' : 'rgba(255,255,255,0.8)'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Sale title ── */}
        <Text style={{
          fontSize: 22, fontWeight: '900', color: colors.text,
          lineHeight: 28, marginBottom: 16, letterSpacing: -0.3,
        }}>
          {sale.title}
        </Text>

        {/* ── Info cards row ── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {/* period card */}
          <View style={{
            flex: 1,
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 14,
            padding: 14,
          }}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 }}>
              {t('sale_period')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>
              {formatDate(sale.start_date)}
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>
              ~ {formatDate(sale.end_date)}
            </Text>
          </View>

          {/* dday card */}
          {sale.status !== 'ended' && (
            <View style={{
              flex: 1,
              backgroundColor: brandColor + '10',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: brandColor + '20',
            }}>
              <Ionicons name="time-outline" size={16} color={brandColor} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 }}>
                {isUpcoming ? t('until_start') : t('until_end')}
              </Text>
              <Text style={{ fontSize: 20, color: brandColor, fontWeight: '900' }}>
                {getDday(isUpcoming ? sale.start_date : sale.end_date)}
              </Text>
            </View>
          )}
        </View>

        {/* ── Description ── */}
        {sale.description && (
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
              {sale.description}
            </Text>
          </View>
        )}

        </View>

        {/* ── CTA button — pinned to bottom ── */}
        <View style={{ paddingTop: 12, paddingBottom: 34 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 17,
              borderRadius: 16, alignItems: 'center',
              backgroundColor: brandColor,
            }}
            onPress={() => brand?.website_url && Linking.openURL(brand.website_url)}
            activeOpacity={0.85}
            accessibilityLabel={t('brand_site')}
            accessibilityRole="link"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                {t('brand_site')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        </>)}
      </BottomSheetView>
    </BottomSheet>
  );
});

SaleDetailSheet.displayName = 'SaleDetailSheet';
export default SaleDetailSheet;
