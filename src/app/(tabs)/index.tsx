import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSaleStore } from '../../store/saleStore';
import HomeSkeleton from '../../components/skeletons/HomeSkeleton';
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';
import { getDday, getSaleStatusLabel } from '../../utils/date';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 10;
const SIDE_PAD = 20;

const ACCENT = '#FF2D2D';
const BG = '#FAFAF8';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#8E8E93';
const CARD_BG = '#FFFFFF';
const SURFACE_DARK = '#1A1A1A';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후에요';
  return '좋은 저녁이에요';
}

/** Featured hero card — first active sale, full width, brand color */
function FeaturedCard({
  event,
  onPress,
}: {
  event: SaleEvent;
  onPress: () => void;
}) {
  const brandName = event.brand?.name ?? '';
  const brandColor = event.brand?.color ?? SURFACE_DARK;
  const dday = getDday(event.status === 'active' ? event.end_date : event.start_date);
  const startSlice = event.start_date.slice(5).replace('-', '.');
  const endSlice = event.end_date.slice(5).replace('-', '.');

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={{
        backgroundColor: brandColor,
        borderRadius: 24,
        padding: 24,
        marginHorizontal: SIDE_PAD,
        marginBottom: 20,
        minHeight: 200,
        overflow: 'hidden',
      }}
    >
      {/* decorative circles */}
      <View style={{
        position: 'absolute',
        top: -40, right: -40,
        width: 180, height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.1)',
      }} />
      <View style={{
        position: 'absolute',
        bottom: -30, left: -20,
        width: 120, height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.08)',
      }} />

      {/* status + dday */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          paddingHorizontal: 10, paddingVertical: 4,
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
            {getSaleStatusLabel(event.status)}
          </Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>
          {dday}
        </Text>
      </View>

      {/* brand name */}
      <View style={{ marginTop: 24 }}>
        <Text style={{
          color: '#FFFFFF', fontSize: 28, fontWeight: '900',
          letterSpacing: -0.5,
        }}>
          {brandName}
        </Text>
      </View>

      {/* sale title (대신 할인율 자리) */}
      <Text style={{
        color: '#FFFFFF', fontSize: 20, fontWeight: '800',
        marginTop: 12, letterSpacing: -0.3,
      }} numberOfLines={2}>
        {event.title}
      </Text>

      {/* bottom row: dates */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
      }}>
        <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 6 }} />
        <Text style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600',
        }}>
          {startSlice} — {endSlice}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Compact card for grid — brand color accent */
function CompactCard({
  event,
  onPress,
  isWide,
}: {
  event: SaleEvent;
  onPress: () => void;
  isWide?: boolean;
}) {
  const brandName = event.brand?.name ?? '';
  const brandColor = event.brand?.color ?? SURFACE_DARK;
  const dday = getDday(event.status === 'active' ? event.end_date : event.start_date);
  const cardWidth = isWide
    ? SCREEN_W - SIDE_PAD * 2
    : (SCREEN_W - SIDE_PAD * 2 - CARD_GAP) / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        width: cardWidth,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: CARD_GAP,
        minHeight: 140,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
      }}
    >
      {/* brand color top bar */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4, backgroundColor: brandColor,
      }} />

      {/* top: brand initial + dday */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <View style={{
          width: 34, height: 34, borderRadius: 10,
          backgroundColor: brandColor + '18',
          borderWidth: 1.5,
          borderColor: brandColor + '40',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: brandColor, fontSize: 14, fontWeight: '800' }}>
            {brandName.charAt(0)}
          </Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: '700', color: brandColor }}>
          {dday}
        </Text>
      </View>

      {/* brand name */}
      <Text style={{
        color: TEXT_PRIMARY, fontSize: 15, fontWeight: '800',
        marginTop: 12,
      }} numberOfLines={1}>
        {brandName}
      </Text>

      {/* sale title */}
      <Text style={{
        color: TEXT_SECONDARY, fontSize: 12, fontWeight: '500',
        marginTop: 2,
      }} numberOfLines={2}>
        {event.title}
      </Text>

      {/* date range */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        marginTop: 10,
      }}>
        <Ionicons name="calendar-outline" size={11} color={TEXT_SECONDARY} style={{ marginRight: 4 }} />
        <Text style={{ fontSize: 11, fontWeight: '600', color: TEXT_SECONDARY }}>
          {event.start_date.slice(5).replace('-', '.')} — {event.end_date.slice(5).replace('-', '.')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Upcoming sale row — brand color accent */
function UpcomingRow({
  event,
  onPress,
}: {
  event: SaleEvent;
  onPress: () => void;
}) {
  const brandColor = event.brand?.color ?? SURFACE_DARK;
  const dday = getDday(event.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
      }}
    >
      {/* left brand color bar */}
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: brandColor,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }} />

      {/* brand initial */}
      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: brandColor + '14',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 6, marginRight: 14,
      }}>
        <Text style={{ color: brandColor, fontSize: 16, fontWeight: '800' }}>
          {event.brand?.name?.charAt(0) ?? '?'}
        </Text>
      </View>

      {/* info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 2 }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY, fontWeight: '500' }}>
          {event.brand?.name} · {event.start_date.slice(5).replace('-', '.')} — {event.end_date.slice(5).replace('-', '.')}
        </Text>
      </View>

      {/* dday pill */}
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

export default function HomeScreen() {
  const { saleEvents, loading } = useSaleStore();
  const { openSheet } = useSheetStore();

  if (loading) return <HomeSkeleton />;

  const activeSales = saleEvents.filter((e) => e.status === 'active');
  const upcomingSales = saleEvents.filter((e) => e.status === 'upcoming');
  const [featuredSale, ...restActiveSales] = activeSales;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingHorizontal: SIDE_PAD,
          paddingTop: 16,
          paddingBottom: 24,
        }}>
          <View>
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY, fontWeight: '500' }}>
              {getGreeting()}
            </Text>
            <Text style={{
              fontSize: 28, fontWeight: '900', color: TEXT_PRIMARY,
              marginTop: 2, letterSpacing: -0.5,
            }}>
              지금이야!
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, gap: 10 }}>
            <TouchableOpacity style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: CARD_BG,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: '#F0F0F0',
            }}>
              <Ionicons name="notifications-outline" size={20} color={TEXT_PRIMARY} />
              <View style={{
                position: 'absolute', top: 9, right: 9,
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: ACCENT,
              }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.7}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: CARD_BG,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#F0F0F0',
              }}
            >
              <Ionicons name="search-outline" size={20} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Featured Active Sale ── */}
        {featuredSale && (
          <FeaturedCard
            event={featuredSale}
            onPress={() => openSheet(featuredSale)}
          />
        )}

        {/* ── More Active Sales ── */}
        {restActiveSales.length > 0 && (
          <View style={{ paddingHorizontal: SIDE_PAD }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: TEXT_PRIMARY }}>
                진행 중인 세일
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=active')}>
                <Text style={{ fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {/* Bento-style: first card wide, rest 2-col */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {restActiveSales.map((event, idx) => (
                <CompactCard
                  key={event.id}
                  event={event}
                  isWide={restActiveSales.length % 2 !== 0 && idx === 0}
                  onPress={() => openSheet(event)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Upcoming Sales ── */}
        {upcomingSales.length > 0 && (
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 12 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: TEXT_PRIMARY }}>
                다가오는 세일
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=upcoming')}>
                <Text style={{ fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {upcomingSales.map((event) => (
              <UpcomingRow
                key={event.id}
                event={event}
                onPress={() => openSheet(event)}
              />
            ))}
          </View>
        )}

        {/* ── Empty State ── */}
        {activeSales.length === 0 && upcomingSales.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 }}>
            <Ionicons name="bag-outline" size={48} color={TEXT_SECONDARY} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 17, color: TEXT_PRIMARY, fontWeight: '800', marginBottom: 6 }}>
              세일 정보가 없어요
            </Text>
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 19 }}>
              곧 새로운 세일이 등록될 예정이에요
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
