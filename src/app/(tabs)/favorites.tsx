import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../../store/saleStore';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useAuthStore } from '../../store/authStore';
import { getDday } from '../../utils/date';
import FavoritesSkeleton from '../../components/skeletons/FavoritesSkeleton';
import { useThemeColors } from '../../hooks/useColorScheme';
import ErrorBanner from '../../components/ErrorBanner';
import { useTranslation } from 'react-i18next';

export default function FavoritesScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { brands, saleEvents, loading, refreshing, refresh, error, clearError } = useSaleStore();
  const { favoriteIds, userId: favoriteStoreUserId } = useFavoriteStore();

  const favoriteBrands =
    user && favoriteStoreUserId === user.id
      ? brands.filter((b) => favoriteIds.has(b.id))
      : [];

  const getBrandSales = (brandId: string) =>
    saleEvents.filter(
      (e) => e.brand_id === brandId && (e.status === 'active' || e.status === 'upcoming')
    );

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
            {t('favorites')}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: colors.accent + '12',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Ionicons name="heart-outline" size={28} color={colors.accent} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            {t('login_required')}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            {t('login_desc')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <FavoritesSkeleton />;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
          {t('favorites')}
        </Text>
      </View>

      {error && <ErrorBanner message={error} onRetry={refresh} onDismiss={clearError} />}

      <FlatList
        data={favoriteBrands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />
        }
        renderItem={({ item }) => {
          const brandColor = item.color ?? colors.surfaceDark;
          const sales = getBrandSales(item.id);
          return (
            <View style={{ marginBottom: 14 }}>
              {/* Brand header card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL(item.website_url)}
                accessibilityLabel={item.name}
                accessibilityRole="button"
                style={{
                  backgroundColor: brandColor,
                  borderRadius: 20,
                  padding: 18,
                  overflow: 'hidden',
                }}
              >
                {/* decorative circle */}
                <View style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }} />

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '900' }}>
                      {item.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>
                      {item.name}
                    </Text>
                    <Text style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2,
                    }}>
                      {item.category}
                    </Text>
                  </View>
                  {sales.length > 0 ? (
                    <View style={{
                      paddingHorizontal: 9, paddingVertical: 4,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                        {t('sales_count', { count: sales.length })}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                      {t('no_sale')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Sale rows */}
              {sales.map((sale) => {
                const isActive = sale.status === 'active';
                return (
                  <View
                    key={sale.id}
                    accessibilityLabel={sale.title}
                    accessibilityRole="button"
                    style={{
                      marginTop: 6, marginLeft: 12,
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    {/* left stripe */}
                    <View style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, backgroundColor: brandColor,
                      borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
                    }} />
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                        {sale.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                        {sale.start_date.slice(5).replace('-', '.')} ~ {sale.end_date.slice(5).replace('-', '.')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
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
                          {isActive ? t('status_active') : t('status_upcoming')}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '600' }}>
                        {getDday(isActive ? sale.end_date : sale.start_date)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="bookmark-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '700' }}>
              {t('add_favorites')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
              {t('add_favorites_desc')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
