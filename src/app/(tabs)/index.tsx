import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSaleStore } from '../../store/saleStore';
import HomeSkeleton from '../../components/skeletons/HomeSkeleton';
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';
import { getDday, getSaleStatusLabel } from '../../utils/date';

const BRAND_CARD_COLORS: Record<string, { bg: string }> = {
  '올리브영': { bg: '#4CAF50' },
  '무신사':   { bg: '#5C6BC0' },
  '29cm':     { bg: '#EC407A' },
  '쿠팡':     { bg: '#FFA726' },
  'SSG.COM':  { bg: '#6C63FF' },
  'H&M':      { bg: '#26A69A' },
  'JAJU':     { bg: '#8D6E63' },
};
const FALLBACK_COLORS = [
  { bg: '#6C63FF' },
  { bg: '#EC407A' },
  { bg: '#FFA726' },
  { bg: '#26A69A' },
  { bg: '#4CAF50' },
];

function getCardColor(brandColor?: string | null, brandName?: string, idx = 0) {
  if (brandColor) return { bg: brandColor };
  return BRAND_CARD_COLORS[brandName ?? ''] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요!';
  if (hour < 18) return '좋은 오후에요!';
  return '좋은 저녁이에요!';
}

function SaleCard({
  event,
  colorIdx,
  onPress,
}: {
  event: SaleEvent;
  colorIdx: number;
  onPress: () => void;
}) {
  const color = getCardColor(event.brand?.color, event.brand?.name, colorIdx);
  const brandInitial = event.brand?.name?.charAt(0) ?? '?';
  const statusLabel = getSaleStatusLabel(event.status);
  const dday = getDday(event.status === 'active' ? event.end_date : event.start_date);

  // Strip brand name prefix from title for subtitle
  const brandName = event.brand?.name ?? '';
  const subtitle = event.title.startsWith(brandName)
    ? event.title.slice(brandName.length).trim()
    : event.title;

  const startSlice = event.start_date.slice(5).replace('-', '/');
  const endSlice = event.end_date.slice(5).replace('-', '/');

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        width: '48.5%',
        backgroundColor: color.bg,
        borderRadius: 20,
        marginBottom: 12,
        padding: 16,
        overflow: 'hidden',
        minHeight: 175,
      }}
    >
      {/* decorative blob */}
      <View style={{
        position: 'absolute',
        bottom: -30, right: -20,
        width: 130, height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.12)',
      }} />

      {/* top row: initial circle + status badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900' }}>
            {brandInitial}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3,
          backgroundColor: 'rgba(0,0,0,0.22)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* brand name */}
      <Text style={{
        color: '#FFFFFF', fontSize: 16, fontWeight: '800',
        marginTop: 10,
      }} numberOfLines={1}>
        {brandName}
      </Text>

      {/* subtitle */}
      <Text style={{
        color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500', marginTop: 1,
      }} numberOfLines={1}>
        {subtitle}
      </Text>

      {/* discount rate */}
      <Text style={{
        color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 10,
      }}>
        최대 {event.discount_rate}%
      </Text>

      {/* bottom: dates + dday */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600' }}>
          {startSlice} ~ {endSlice}
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
          {dday}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function UpcomingRow({
  event,
  colorIdx,
  onPress,
}: {
  event: SaleEvent;
  colorIdx: number;
  onPress: () => void;
}) {
  const color = getCardColor(event.brand?.color, event.brand?.name, colorIdx);
  const dday = getDday(event.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      {/* date badge */}
      <View style={{
        width: 46, height: 52,
        backgroundColor: color.bg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700' }}>
          {event.start_date.slice(5, 7)}월
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 24 }}>
          {event.start_date.slice(8)}
        </Text>
      </View>

      {/* info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#111111', marginBottom: 3 }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500' }}>
          {event.brand?.name} · 최대 {event.discount_rate}%
        </Text>
      </View>

      {/* dday pill */}
      <View style={{
        paddingHorizontal: 9, paddingVertical: 4,
        backgroundColor: color.bg + '20',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: color.bg + '55',
        marginLeft: 8,
      }}>
        <Text style={{ fontSize: 12, fontWeight: '900', color: color.bg }}>
          {dday}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { saleEvents, loading } = useSaleStore();
  const { openSheet } = useSheetStore();

  if (loading) return <HomeSkeleton />;

  const activeSales = saleEvents.filter((e) => e.status === 'active');
  const upcomingSales = saleEvents.filter((e) => e.status === 'upcoming');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
        }}>
          <View>
            <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500' }}>
              {getGreeting()}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#111111', marginTop: 2 }}>
              지금이야! 🎁
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, gap: 12 }}>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: 'rgba(255,255,255,0.8)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="notifications-outline" size={20} color="#111111" />
                <View style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 7, height: 7, borderRadius: 3.5,
                  backgroundColor: '#FF2D2D',
                  borderWidth: 1, borderColor: '#F5F3FF',
                }} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.7}
              style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: 'rgba(255,255,255,0.8)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="search-outline" size={20} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Active Sales ── */}
        {activeSales.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#111111' }}>
                🔥 지금 세일 중
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=active')}>
                <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '600' }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {/* 2-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {activeSales.map((event, idx) => (
                <SaleCard
                  key={event.id}
                  event={event}
                  colorIdx={idx}
                  onPress={() => openSheet(event)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Upcoming Sales ── */}
        {upcomingSales.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#111111' }}>
                🚀 예정된 세일
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=upcoming')}>
                <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '600' }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {upcomingSales.map((event, idx) => (
              <UpcomingRow
                key={event.id}
                event={event}
                colorIdx={idx}
                onPress={() => openSheet(event)}
              />
            ))}
          </View>
        )}

        {activeSales.length === 0 && upcomingSales.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🛒</Text>
            <Text style={{ fontSize: 16, color: '#111111', fontWeight: '800', marginBottom: 6 }}>
              세일 정보가 없어요
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 19 }}>
              곧 새로운 세일이 등록될 예정이에요
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
