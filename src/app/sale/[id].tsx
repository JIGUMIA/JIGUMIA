import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSaleStore } from '../../store/saleStore';
import { useThemeColors } from '../../hooks/useColorScheme';
import SaleDetailSheet from '../../components/SaleDetailSheet';
import { SaleEvent } from '../../types';

export default function SaleDeepLink() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { saleEvents, loading } = useSaleStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sale, setSale] = useState<SaleEvent | null>(null);

  useEffect(() => {
    const found = saleEvents.find((e) => e.id === id);
    if (found) {
      setSale(found);
      setTimeout(() => bottomSheetRef.current?.snapToIndex(0), 300);
    }
  }, [id, saleEvents]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!sale && !loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          세일을 찾을 수 없어요
        </Text>
        <Text
          style={{ fontSize: 14, color: colors.brand, fontWeight: '600' }}
          onPress={() => router.replace('/')}
        >
          홈으로 돌아가기
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SaleDetailSheet
        ref={bottomSheetRef}
        sale={sale}
        onClose={() => router.back()}
      />
    </View>
  );
}
