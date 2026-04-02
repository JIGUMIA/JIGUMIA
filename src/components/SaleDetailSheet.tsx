import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SaleEvent } from '../types';
import { formatDate, getDday } from '../utils/date';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';

const FALLBACK_COLOR = '#6C63FF';

interface SaleDetailSheetProps {
  sale: SaleEvent | null;
  onClose?: () => void;
}

const SaleDetailSheet = forwardRef<BottomSheet, SaleDetailSheetProps>(({ sale, onClose }, ref) => {
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, userId: favoriteStoreUserId } = useFavoriteStore();
  const snapPoints = useMemo(() => ['62%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const brand = sale?.brand;
  const brandColor = brand?.color ?? FALLBACK_COLOR;
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
      backgroundStyle={{ backgroundColor: '#FAFAF8', borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: '#E0DFF5', width: 36, height: 4 }}
      onClose={onClose}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 120 }}>
        {!sale ? null : (<>

        {/* brand color top accent */}
        <View style={{
          height: 3, borderRadius: 2,
          backgroundColor: brandColor,
          marginHorizontal: -24,
          marginBottom: 18,
          marginTop: 2,
        }} />

        {/* brand row + favorite */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: brandColor + '20',
            borderWidth: 1.5, borderColor: brandColor + '44',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}>
            <Text style={{ color: brandColor, fontSize: 16, fontWeight: '900' }}>
              {brand?.name?.[0] ?? '?'}
            </Text>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '800', color: '#111111', flex: 1 }}>
            {brand?.name ?? '브랜드'}
          </Text>

          {/* status badge */}
          <View style={{
            paddingHorizontal: 9, paddingVertical: 4,
            backgroundColor: isActive ? '#FF2D2D' : isUpcoming ? 'rgba(108,99,255,0.12)' : '#F3F4F6',
            borderRadius: 8,
            marginRight: 10,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '800',
              color: isActive ? '#FFFFFF' : isUpcoming ? '#6C63FF' : '#6B7280',
              letterSpacing: 0.3,
            }}>
              {isActive ? '진행 중' : isUpcoming ? '예정' : '종료'}
            </Text>
          </View>

          {user && (
            <TouchableOpacity
              onPress={() => brand && toggleFavorite(user.id, brand.id)}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? '#FF2D2D' : '#D1D5DB'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* sale title */}
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#111111', lineHeight: 28, marginBottom: 6 }}>
          {sale.title}
        </Text>

        {/* discount rate */}
        {sale.discount_rate && (
          <View style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 12, paddingVertical: 5,
            backgroundColor: brandColor + '18',
            borderWidth: 1.5, borderColor: brandColor + '44',
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: brandColor }}>
              {sale.discount_rate}
            </Text>
          </View>
        )}

        {/* period info block */}
        <View style={{
          backgroundColor: '#F0EFF8',
          borderRadius: 18,
          padding: 16,
          marginBottom: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: sale.status !== 'ended' ? 10 : 0 }}>
            <View style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: '#FFFFFF',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 10,
            }}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            </View>
            <Text style={{ fontSize: 14, color: '#111111', fontWeight: '600' }}>
              {formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}
            </Text>
          </View>
          {sale.status !== 'ended' && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: brandColor + '18',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 10,
              }}>
                <Ionicons name="time-outline" size={14} color={brandColor} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: brandColor }}>
                {isUpcoming
                  ? `시작 ${getDday(sale.start_date)}`
                  : `종료 ${getDday(sale.end_date)}`}
              </Text>
            </View>
          )}
        </View>

        {/* category block */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#F0EFF8',
          borderRadius: 18, padding: 16, marginBottom: 10,
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: '#FFFFFF',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10,
          }}>
            <Ionicons name="grid-outline" size={14} color="#6B7280" />
          </View>
          <Text style={{ fontSize: 14, color: '#111111', fontWeight: '600' }}>
            {brand?.category ?? '-'}
          </Text>
        </View>

        {/* description */}
        {sale.description && (
          <View style={{
            backgroundColor: '#F0EFF8',
            borderRadius: 18, padding: 16, marginBottom: 10,
          }}>
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
              {sale.description}
            </Text>
          </View>
        )}

        {/* CTA button */}
        <TouchableOpacity
          style={{
            marginTop: 8, paddingVertical: 17,
            borderRadius: 20, alignItems: 'center',
            backgroundColor: '#0F0F14',
            overflow: 'hidden',
          }}
          onPress={() => brand?.website_url && Linking.openURL(brand.website_url)}
          activeOpacity={0.85}
        >
          {/* button accent line */}
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2, backgroundColor: brandColor,
          }} />
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 }}>
            브랜드 사이트 바로가기  →
          </Text>
        </TouchableOpacity>

        </>)}
      </BottomSheetView>
    </BottomSheet>
  );
});

SaleDetailSheet.displayName = 'SaleDetailSheet';
export default SaleDetailSheet;
