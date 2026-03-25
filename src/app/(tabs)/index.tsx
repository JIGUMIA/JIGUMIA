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
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';
import { getToday, getDday } from '../../utils/date';

const CARD_GAP = 12;
const FALLBACK_COLOR = '#6C63FF';

const BRAND_CARD_COLORS: Record<string, { bg: string; dot: string }> = {
  '올리브영': { bg: '#EF5350', dot: '#FF8A80' },
  '무신사':   { bg: '#5C6BC0', dot: '#9FA8DA' },
  '29cm':     { bg: '#EC407A', dot: '#F48FB1' },
  '쿠팡':     { bg: '#FFA726', dot: '#FFD54F' },
  'SSG.COM':  { bg: '#6C63FF', dot: '#A89CFF' },
  'H&M':      { bg: '#EF5350', dot: '#FF8A80' },
  'JAJU':     { bg: '#26A69A', dot: '#80CBC4' },
};
const FALLBACK_COLORS = [
  { bg: '#6C63FF', dot: '#A89CFF' },
  { bg: '#EF5350', dot: '#FF8A80' },
  { bg: '#FFA726', dot: '#FFD54F' },
  { bg: '#26A69A', dot: '#80CBC4' },
  { bg: '#EC407A', dot: '#F48FB1' },
];

// brand.color 우선, 없으면 이름 기반 fallback
function getCardColor(brandColor?: string | null, brandName?: string, idx = 0) {
  if (brandColor) return { bg: brandColor, dot: brandColor + 'AA' };
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
  const today = getToday();
  const isActive = today >= event.start_date && today <= event.end_date;
  const ddayLabel = isActive
    ? getDday(event.end_date).replace('D+', 'D+')
    : getDday(event.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: color.bg,
        borderRadius: 24,
        padding: 18,
        minHeight: 180,
        overflow: 'hidden',
      }}
    >
      {/* decorative circles */}
      <View style={{
        position: 'absolute', top: -30, right: -30,
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.15)',
      }} />
      <View style={{
        position: 'absolute', bottom: -25, right: 20,
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.1)',
      }} />

      {/* top row: icon + bookmark */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: '900' }}>
            {event.brand?.name?.[0] ?? '?'}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3,
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
            {isActive ? '진행중' : '예정'}
          </Text>
        </View>
      </View>

      {/* brand name */}
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 4 }} numberOfLines={1}>
        {event.brand?.name}
      </Text>

      {/* sale title */}
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginBottom: 10 }} numberOfLines={2}>
        {event.title}
      </Text>

      {/* discount */}
      <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900' }}>
        {event.discount_rate}
      </Text>

      {/* date + dday */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
          {event.start_date.slice(5).replace('-', '/')} ~ {event.end_date.slice(5).replace('-', '/')}
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
          {ddayLabel}
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
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* date badge */}
      <View style={{
        width: 48, height: 52,
        backgroundColor: color.bg,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', opacity: 0.85 }}>
          {event.start_date.slice(5, 7)}월
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', lineHeight: 22 }}>
          {event.start_date.slice(8)}
        </Text>
      </View>

      {/* info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginBottom: 2 }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
          {event.brand?.name} · {event.discount_rate}
        </Text>
      </View>

      {/* dday */}
      <Text style={{ fontSize: 13, fontWeight: '800', color: color.bg, marginLeft: 8 }}>
        {dday}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { saleEvents } = useSaleStore();
  const { openSheet } = useSheetStore();

  const activeSales = saleEvents.filter((e) => e.status === 'active');
  const upcomingSales = saleEvents.filter((e) => e.status === 'upcoming');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
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
            <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>
              {getGreeting()}
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>
              지금이야! 🛍️
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
            <View style={{ position: 'relative', marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={24} color="#1E1B4B" />
              <View style={{
                position: 'absolute', top: 0, right: 0,
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: '#EF5350',
              }} />
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={24} color="#1E1B4B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Active Sales ── */}
        {activeSales.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>
                🔥 지금 세일 중
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=active')}>
                <Text style={{ fontSize: 13, color: '#6C63FF', fontWeight: '600' }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {/* 2-col grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {activeSales.map((event, idx) => (
                <View key={event.id} style={{
                  width: '50%',
                  paddingLeft: idx % 2 === 0 ? 0 : CARD_GAP / 2,
                  paddingRight: idx % 2 === 0 ? CARD_GAP / 2 : 0,
                  marginBottom: CARD_GAP,
                }}>
                  <SaleCard
                    event={event}
                    colorIdx={idx}
                    onPress={() => openSheet(event)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Upcoming Sales ── */}
        {upcomingSales.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>
                📌 예정된 세일
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
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>
              현재 세일 정보가 없어요
            </Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}
