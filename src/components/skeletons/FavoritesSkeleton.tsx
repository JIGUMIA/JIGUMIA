import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonBox from '../SkeletonBox';

export default function FavoritesSkeleton() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        {/* 헤더 텍스트 */}
        <SkeletonBox width={60} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonBox width={140} height={28} borderRadius={6} style={{ marginBottom: 20 }} />

        {/* 브랜드 카드 3개, 각각 하위 세일 행 2개 */}
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <SkeletonBox width="100%" height={80} borderRadius={20} />
            {[0, 1].map((j) => (
              <SkeletonBox
                key={j}
                width="100%"
                height={44}
                borderRadius={14}
                style={{ marginTop: 6, marginLeft: 20 }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
