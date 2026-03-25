import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useColorScheme';
import SkeletonBox from '../SkeletonBox';

export default function ExploreSkeleton() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* 타이틀 */}
        <SkeletonBox width={120} height={28} borderRadius={6} style={{ marginBottom: 16 }} />

        {/* 검색바 */}
        <SkeletonBox width="100%" height={44} borderRadius={12} style={{ marginBottom: 14 }} />

        {/* 카테고리 칩 */}
        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox
              key={i}
              width={64}
              height={32}
              borderRadius={99}
              style={{ marginRight: 8 }}
            />
          ))}
        </View>

        {/* 브랜드 카드 6개 */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonBox
            key={i}
            width="100%"
            height={64}
            borderRadius={12}
            style={{ marginBottom: 10 }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
