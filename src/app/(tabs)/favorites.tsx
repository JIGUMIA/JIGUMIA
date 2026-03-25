import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../../store/saleStore';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useAuthStore } from '../../store/authStore';
import { getDday } from '../../utils/date';
import FavoritesSkeleton from '../../components/skeletons/FavoritesSkeleton';

const FALLBACK = ['#6C63FF', '#EF5350', '#FFA726', '#26A69A', '#EC407A'];

function getBrandColor(color: string | null | undefined, idx: number) {
  return color ?? FALLBACK[idx % FALLBACK.length];
}

export default function FavoritesScreen() {
  const { user } = useAuthStore();
  const { brands, saleEvents, loading } = useSaleStore();
  const { favoriteIds, userId: favoriteStoreUserId } = useFavoriteStore();

  const favoriteBrands =
    user && favoriteStoreUserId === user.id
      ? brands.filter((b) => favoriteIds.has(b.id))
      : [];

  const getUpcomingSales = (brandId: string) =>
    saleEvents.filter(
      (e) => e.brand_id === brandId && (e.status === 'active' || e.status === 'upcoming')
    );

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>나의</Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>관심 브랜드</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 44 }}>💜</Text>
          <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>
            로그인하면 관심 브랜드를 저장할 수 있어요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <FavoritesSkeleton />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>나의</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>관심 브랜드</Text>
      </View>

      <FlatList
        data={favoriteBrands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const color = getBrandColor(item.color, index);
          const sales = getUpcomingSales(item.id);
          return (
            <View style={{ marginBottom: 16 }}>
              {/* Brand header card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL(item.website_url)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: '#6C63FF',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <View style={{
                  width: 52, height: 52, borderRadius: 16,
                  backgroundColor: color,
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
                    {item.name[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.category}</Text>
                </View>
                <Text style={{ fontSize: 13, color: color, fontWeight: '700' }}>
                  {sales.length > 0 ? `${sales.length}개 세일` : '세일 없음'}
                </Text>
              </TouchableOpacity>

              {/* Sale rows */}
              {sales.map((sale) => (
                <View
                  key={sale.id}
                  style={{
                    marginTop: 6,
                    marginLeft: 20,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{
                    width: 6, height: 36, borderRadius: 3,
                    backgroundColor: color, marginRight: 12,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E1B4B' }}>
                      {sale.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                      {sale.start_date} ~ {sale.end_date}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: color }}>
                      {sale.discount_rate}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 2 }}>
                      {getDday(sale.status === 'active' ? sale.end_date : sale.start_date)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="bookmark-outline" size={52} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>
              관심 브랜드를 추가해보세요
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
