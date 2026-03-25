import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonBox from '../SkeletonBox';

const GAP = 12;

export default function HomeSkeleton() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
      >
        {/* 지금 세일 중 섹션 */}
        <SkeletonBox width={100} height={18} borderRadius={6} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', marginBottom: GAP }}>
          <View style={{ flex: 1, paddingRight: GAP / 2 }}>
            <SkeletonBox width="100%" height={180} borderRadius={24} />
          </View>
          <View style={{ flex: 1, paddingLeft: GAP / 2 }}>
            <SkeletonBox width="100%" height={180} borderRadius={24} />
          </View>
        </View>

        {/* 예정된 세일 섹션 */}
        <SkeletonBox width={120} height={18} borderRadius={6} style={{ marginTop: 28, marginBottom: 14 }} />
        {[0, 1, 2].map((i) => (
          <SkeletonBox
            key={i}
            width="100%"
            height={72}
            borderRadius={16}
            style={{ marginBottom: 10 }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
