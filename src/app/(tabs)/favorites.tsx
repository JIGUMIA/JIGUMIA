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

  const getBrandSales = (brandId: string) =>
    saleEvents.filter(
      (e) => e.brand_id === brandId && (e.status === 'active' || e.status === 'upcoming')
    );

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
          <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            나의
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1B4B', marginTop: 2 }}>
            관심 브랜드
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: '#0F0F14',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            <Ionicons name="heart-outline" size={32} color="#FF2D2D" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B', marginBottom: 8, textAlign: 'center' }}>
            로그인이 필요해요
          </Text>
          <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
            관심 브랜드를 저장하고{'\n'}세일 알림을 받아보세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <FavoritesSkeleton />;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          나의
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#111111', marginTop: 2 }}>
          관심 브랜드
        </Text>
      </View>

      <FlatList
        data={favoriteBrands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const color = getBrandColor(item.color, index);
          const sales = getBrandSales(item.id);
          return (
            <View style={{ marginBottom: 14 }}>
              {/* Brand header — dark card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL(item.website_url)}
                style={{
                  backgroundColor: '#0F0F14',
                  borderRadius: 20,
                  padding: 16,
                  overflow: 'hidden',
                }}
              >
                {/* top accent bar */}
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, backgroundColor: color,
                  borderTopLeftRadius: 20, borderTopRightRadius: 20,
                }} />

                {/* subtle glow */}
                <View style={{
                  position: 'absolute', bottom: -20, right: -10,
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: color, opacity: 0.1,
                }} />

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: color + '28',
                    borderWidth: 1.5, borderColor: color + '55',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 14, marginTop: 4,
                  }}>
                    <Text style={{ color: color, fontSize: 20, fontWeight: '900' }}>
                      {item.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                      {item.name}
                    </Text>
                    <Text style={{
                      fontSize: 10, color: color, fontWeight: '700',
                      letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2,
                    }}>
                      {item.category}
                    </Text>
                  </View>
                  {sales.length > 0 ? (
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 4,
                      backgroundColor: '#FF2D2D',
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                        {sales.length}개 세일
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                      세일 없음
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Sale rows — indented below brand card */}
              {sales.map((sale) => {
                const isActive = sale.status === 'active';
                return (
                  <View
                    key={sale.id}
                    style={{
                      marginTop: 6, marginLeft: 16,
                      backgroundColor: '#F3F4F6',
                      borderRadius: 14,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {/* left stripe */}
                    <View style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, backgroundColor: color,
                      borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
                    }} />
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E1B4B' }}>
                        {sale.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {sale.start_date.slice(5).replace('-', '.')} ~ {sale.end_date.slice(5).replace('-', '.')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{
                        paddingHorizontal: 7, paddingVertical: 3,
                        backgroundColor: isActive ? '#FF2D2D' : 'rgba(108,99,255,0.12)',
                        borderRadius: 7,
                        marginBottom: 3,
                      }}>
                        <Text style={{
                          fontSize: 10, fontWeight: '800',
                          color: isActive ? '#FFFFFF' : '#6C63FF',
                        }}>
                          {isActive ? '진행 중' : '예정'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '600' }}>
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
              width: 72, height: 72, borderRadius: 22,
              backgroundColor: '#0F0F14',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="bookmark-outline" size={30} color="rgba(255,255,255,0.3)" />
            </View>
            <Text style={{ fontSize: 16, color: '#9CA3AF', fontWeight: '600' }}>
              관심 브랜드를 추가해보세요
            </Text>
            <Text style={{ fontSize: 13, color: '#C4C4C4', marginTop: 6, textAlign: 'center' }}>
              탐색 탭에서 브랜드 하트를 눌러보세요
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
