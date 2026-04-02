import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SaleEvent } from '../types';
import { formatDate, getDday } from '../utils/date';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';

const ACCENT = '#FF2D2D';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#8E8E93';
const INFO_BG = '#F5F5F5';

interface SaleDetailSheetProps {
  sale: SaleEvent | null;
  onClose?: () => void;
}

const SaleDetailSheet = forwardRef<BottomSheet, SaleDetailSheetProps>(({ sale, onClose }, ref) => {
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
  const brandColor = brand?.color ?? TEXT_PRIMARY;
  const isFav = brand && user && favoriteStoreUserId === user.id ? isFavorite(brand.id) : false;

  const isActive = sale?.status === 'active';
  const isUpcoming = sale?.status === 'upcoming';

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#FAFAF8', borderRadius: 28 }}
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
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
                  {brand?.name?.[0] ?? '?'}
                </Text>
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
                  {brand?.name ?? '브랜드'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' }}>
                  {brand?.category ?? ''}
                </Text>
              </View>
            </View>

            {/* status + favorite */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                paddingHorizontal: 9, paddingVertical: 4,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                  {isActive ? '진행 중' : isUpcoming ? '예정' : '종료'}
                </Text>
              </View>
              {user && (
                <TouchableOpacity
                  onPress={() => brand && toggleFavorite(user.id, brand.id)}
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
          fontSize: 22, fontWeight: '900', color: TEXT_PRIMARY,
          lineHeight: 28, marginBottom: 16, letterSpacing: -0.3,
        }}>
          {sale.title}
        </Text>

        {/* ── Info cards row ── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {/* period card */}
          <View style={{
            flex: 1,
            backgroundColor: INFO_BG,
            borderRadius: 14,
            padding: 14,
          }}>
            <Ionicons name="calendar-outline" size={16} color={TEXT_SECONDARY} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 11, color: TEXT_SECONDARY, fontWeight: '500', marginBottom: 2 }}>
              세일 기간
            </Text>
            <Text style={{ fontSize: 13, color: TEXT_PRIMARY, fontWeight: '700' }}>
              {formatDate(sale.start_date)}
            </Text>
            <Text style={{ fontSize: 13, color: TEXT_PRIMARY, fontWeight: '700' }}>
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
              <Text style={{ fontSize: 11, color: TEXT_SECONDARY, fontWeight: '500', marginBottom: 2 }}>
                {isUpcoming ? '시작까지' : '종료까지'}
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
            backgroundColor: INFO_BG,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 22 }}>
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
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                브랜드 사이트 바로가기
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
