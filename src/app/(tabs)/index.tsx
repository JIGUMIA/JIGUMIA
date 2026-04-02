import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import ErrorBanner from '../../components/ErrorBanner';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSaleStore } from '../../store/saleStore';
import HomeSkeleton from '../../components/skeletons/HomeSkeleton';
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';
import { getDday, getSaleStatusLabel } from '../../utils/date';
import { useThemeColors } from '../../hooks/useColorScheme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 10;
const SIDE_PAD = 20;

function getGreeting(t: (key: string) => string) {
  const hour = new Date().getHours();
  if (hour < 12) return t('greeting_morning');
  if (hour < 18) return t('greeting_afternoon');
  return t('greeting_evening');
}

/** Featured hero card — first active sale, full width, brand color */
function FeaturedCard({
  event,
  onPress,
}: {
  event: SaleEvent;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const brandName = event.brand?.name ?? '';
  const brandColor = event.brand?.color ?? colors.surfaceDark;
  const dday = getDday(event.status === 'active' ? event.end_date : event.start_date);
  const startSlice = event.start_date.slice(5).replace('-', '.');
  const endSlice = event.end_date.slice(5).replace('-', '.');

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      accessibilityLabel={`${brandName} ${event.title}`}
      accessibilityRole="button"
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
  const colors = useThemeColors();
  const brandName = event.brand?.name ?? '';
  const brandColor = event.brand?.color ?? colors.surfaceDark;
  const dday = getDday(event.status === 'active' ? event.end_date : event.start_date);
  const cardWidth = isWide
    ? SCREEN_W - SIDE_PAD * 2
    : (SCREEN_W - SIDE_PAD * 2 - CARD_GAP) / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityLabel={`${brandName} ${event.title}`}
      accessibilityRole="button"
      style={{
        width: cardWidth,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: CARD_GAP,
        minHeight: 140,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text, fontSize: 15, fontWeight: '800',
        marginTop: 12,
      }} numberOfLines={1}>
        {brandName}
      </Text>

      {/* sale title */}
      <Text style={{
        color: colors.textSecondary, fontSize: 12, fontWeight: '500',
        marginTop: 2,
      }} numberOfLines={2}>
        {event.title}
      </Text>

      {/* date range */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        marginTop: 10,
      }}>
        <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
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
  const colors = useThemeColors();
  const brandColor = event.brand?.color ?? colors.surfaceDark;
  const dday = getDday(event.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityLabel={`${event.brand?.name} ${event.title}`}
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
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 2 }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
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
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { saleEvents, loading, refreshing, refresh, error, clearError } = useSaleStore();
  const { openSheet } = useSheetStore();

  if (loading) return <HomeSkeleton />;

  const activeSales = saleEvents.filter((e) => e.status === 'active');
  const upcomingSales = saleEvents.filter((e) => e.status === 'upcoming');
  const [featuredSale, ...restActiveSales] = activeSales;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />
        }
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
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
              {getGreeting(t)}
            </Text>
            <Text style={{
              fontSize: 28, fontWeight: '900', color: colors.text,
              marginTop: 2, letterSpacing: -0.5,
            }}>
              {t('app_title')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4, gap: 10 }}>
            <TouchableOpacity
              accessibilityLabel={t('notification_settings')}
              accessibilityRole="button"
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: colors.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <View style={{
                position: 'absolute', top: 9, right: 9,
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: colors.accent,
              }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              activeOpacity={0.7}
              accessibilityLabel="검색"
              accessibilityRole="button"
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: colors.card,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Ionicons name="search-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {error && <ErrorBanner message={error} onRetry={refresh} onDismiss={clearError} />}

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
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                {t('active_sales')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=active')}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>{t('view_all')}</Text>
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
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                {t('upcoming_sales')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/sale-list?type=upcoming')}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>{t('view_all')}</Text>
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
            <Ionicons name="bag-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 17, color: colors.text, fontWeight: '800', marginBottom: 6 }}>
              {t('no_sales')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 }}>
              {t('no_sales_desc')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
