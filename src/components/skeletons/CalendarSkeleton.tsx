import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import SkeletonBox from '../SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = 32;

export default function CalendarSkeleton() {
  return (
    <ScrollView
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
    >
      {/* 월 타이틀 */}
      <SkeletonBox width={140} height={22} borderRadius={6} style={{ marginBottom: 16 }} />

      {/* 요일 헤더 7개 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBox key={i} width={CELL_SIZE} height={14} borderRadius={4} />
        ))}
      </View>

      {/* 6×7 날짜 셀 그리드 */}
      {Array.from({ length: 6 }).map((_, row) => (
        <View
          key={row}
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
        >
          {Array.from({ length: 7 }).map((_, col) => (
            <SkeletonBox
              key={col}
              width={CELL_SIZE}
              height={CELL_SIZE}
              borderRadius={8}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
