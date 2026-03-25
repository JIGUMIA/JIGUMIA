import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useColorScheme';
import { useSaleStore } from '../../store/saleStore';
import BrandCard from '../../components/BrandCard';
import { Category } from '../../types';
import ExploreSkeleton from '../../components/skeletons/ExploreSkeleton';

const CATEGORIES: (Category | null)[] = [null, '패션', '뷰티', '식품', '전자기기', '라이프', '종합'];
const CATEGORY_LABELS: Record<string, string> = {
  null: '전체', '패션': '패션', '뷰티': '뷰티',
  '식품': '식품', '전자기기': '전자기기', '라이프': '라이프', '종합': '종합',
};

export default function ExploreScreen() {
  const colors = useThemeColors();
  const { selectedCategory, searchQuery, setSelectedCategory, setSearchQuery, getFilteredBrands, saleEvents, loading } = useSaleStore();

  if (loading) return <ExploreSkeleton />;

  const filteredBrands = getFilteredBrands();

  const getActiveSaleCount = (brandId: string) =>
    saleEvents.filter((e) => e.brand_id === brandId && e.status === 'active').length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-extrabold px-5 pt-4" style={{ color: colors.text }}>
        브랜드 탐색
      </Text>

      {/* 검색바 */}
      <View
        className="flex-row items-center mx-5 mt-4 px-3.5 py-2.5 rounded-xl border"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <Text className="text-base mr-2">🔍</Text>
        <TextInput
          className="flex-1 text-base"
          placeholder="브랜드 검색"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ color: colors.text }}
        />
      </View>

      {/* 카테고리 필터 */}
      <View className="mt-3.5 pl-5">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => {
            const isActive = item === selectedCategory;
            return (
              <TouchableOpacity
                className="px-4 py-2 rounded-full border mr-2"
                style={{
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.border,
                }}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isActive ? '#FFFFFF' : colors.text }}
                >
                  {CATEGORY_LABELS[String(item)]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 브랜드 리스트 */}
      <FlatList
        data={filteredBrands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 14 }}
        renderItem={({ item }) => (
          <BrandCard
            brand={item}
            activeSaleCount={getActiveSaleCount(item.id)}
            onPress={() => Linking.openURL(item.website_url)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-sm" style={{ color: colors.textSecondary }}>
            검색 결과가 없어요
          </Text>
        }
      />
    </SafeAreaView>
  );
}
