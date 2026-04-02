import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const { selectedCategory, searchQuery, setSelectedCategory, setSearchQuery, getFilteredBrands, saleEvents, loading } = useSaleStore();

  if (loading) return <ExploreSkeleton />;

  const filteredBrands = getFilteredBrands();

  const getActiveSaleCount = (brandId: string) =>
    saleEvents.filter((e) => e.brand_id === brandId && e.status === 'active').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          탐색
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>
          브랜드
        </Text>
      </View>

      {/* 검색바 */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 12,
        paddingHorizontal: 14, paddingVertical: 11,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(108,99,255,0.12)',
      }}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, fontSize: 15, color: '#1E1B4B' }}
          placeholder="브랜드 검색"
          placeholderTextColor="#C4C4C4"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#C4C4C4" />
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
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: 20, marginRight: 8,
                  backgroundColor: isActive ? '#1E1B4B' : '#F3F4F6',
                  borderWidth: 1.5,
                  borderColor: isActive ? '#1E1B4B' : 'rgba(0,0,0,0.08)',
                }}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '700',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  letterSpacing: 0.2,
                }}>
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
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
            <Text style={{ fontSize: 15, color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>
              검색 결과가 없어요
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
