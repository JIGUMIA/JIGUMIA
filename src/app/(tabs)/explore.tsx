import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../../store/saleStore';
import BrandCard from '../../components/BrandCard';
import { Category } from '../../types';
import ExploreSkeleton from '../../components/skeletons/ExploreSkeleton';
import { useThemeColors } from '../../hooks/useColorScheme';
import ErrorBanner from '../../components/ErrorBanner';
import { useTranslation } from 'react-i18next';

const CATEGORIES: (Category | null)[] = [null, '패션', '뷰티', '식품', '전자기기', '라이프', '종합'];
const CATEGORY_LABELS: Record<string, string> = {
  null: '전체', '패션': '패션', '뷰티': '뷰티',
  '식품': '식품', '전자기기': '전자기기', '라이프': '라이프', '종합': '종합',
};

export default function ExploreScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { selectedCategory, searchQuery, setSelectedCategory, setSearchQuery, getFilteredBrands, saleEvents, loading, refreshing, refresh, error, clearError } = useSaleStore();

  if (loading) return <ExploreSkeleton />;

  const filteredBrands = getFilteredBrands();

  const getActiveSaleCount = (brandId: string) =>
    saleEvents.filter((e) => e.brand_id === brandId && e.status === 'active').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {t('explore')}
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 2 }}>
          {t('brands')}
        </Text>
      </View>

      {/* 검색바 */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 12,
        paddingHorizontal: 14, paddingVertical: 11,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.brand + '1F',
      }}>
        <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, fontSize: 15, color: colors.text }}
          placeholder={t('search_brand')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel={t('search_brand')}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 카테고리 필터 */}
      <View style={{ paddingLeft: 20, marginBottom: 8 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => {
            const isActive = item === selectedCategory;
            const label = CATEGORY_LABELS[String(item)];
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: 20, marginRight: 8,
                  backgroundColor: isActive ? colors.text : colors.surfaceSecondary,
                  borderWidth: 1.5,
                  borderColor: isActive ? colors.text : 'rgba(0,0,0,0.08)',
                }}
                onPress={() => setSelectedCategory(item)}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '700',
                  color: isActive ? colors.background : colors.textSecondary,
                  letterSpacing: 0.2,
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 에러 배너 */}
      {error && <ErrorBanner message={error} onRetry={refresh} onDismiss={clearError} />}

      {/* 브랜드 리스트 */}
      <FlatList
        data={filteredBrands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />
        }
        renderItem={({ item }) => (
          <BrandCard
            brand={item}
            activeSaleCount={getActiveSaleCount(item.id)}
            onPress={() => Linking.openURL(item.website_url)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 12, fontWeight: '600' }}>
              {t('no_results')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
