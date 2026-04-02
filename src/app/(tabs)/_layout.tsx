import React, { useRef, useEffect, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import SaleDetailSheet from '../../components/SaleDetailSheet';
import { useSheetStore } from '../../store/sheetStore';
import { useThemeColors, useColorScheme } from '../../hooks/useColorScheme';

import IndexScreen from './index';
import CalendarScreen from './calendar';
import FavoritesScreen from './favorites';
import MypageScreen from './mypage';

const TABS = [
  { name: 'index',     label: '홈',    icon: 'home'     as const, iconOutline: 'home-outline'     as const },
  { name: 'calendar',  label: '캘린더', icon: 'calendar' as const, iconOutline: 'calendar-outline' as const },
  { name: 'favorites', label: '관심',   icon: 'heart'    as const, iconOutline: 'heart-outline'    as const },
  { name: 'mypage',    label: '마이',   icon: 'person'   as const, iconOutline: 'person-outline'   as const },
];

interface LiquidGlassTabBarProps {
  currentPage: number;
  onTabPress: (index: number) => void;
}

function LiquidGlassTabBar({ currentPage, onTabPress }: LiquidGlassTabBarProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12) + 8;

  const tabBg = scheme === 'dark' ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.5)';
  const tabBorder = scheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)';
  const tabHighlight = scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)';
  const inactiveIconColor = scheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(30,27,75,0.4)';

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom,
        left: 20,
        right: 20,
        shadowColor: scheme === 'dark' ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: scheme === 'dark' ? 0.4 : 0.18,
        shadowRadius: 28,
        elevation: 20,
        borderRadius: 36,
      }}
    >
      {/* Main glass pill */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: tabBg,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: tabBorder,
          paddingVertical: 10,
          paddingHorizontal: 6,
          overflow: 'hidden',
        }}
      >
        {/* 상단 하이라이트 선 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 24,
            right: 24,
            height: 1,
            backgroundColor: tabHighlight,
          }}
        />

        {TABS.map((tab, index) => {
          const focused = currentPage === index;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => onTabPress(index)}
              activeOpacity={0.72}
              style={{ flex: 1, alignItems: 'center' }}
            >
              {focused ? (
                /* Active: filled brand pill with glow */
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.brand,
                    borderRadius: 24,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    shadowColor: colors.brand,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.55,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Ionicons name={tab.icon} size={17} color="#FFFFFF" />
                </View>
              ) : (
                /* Inactive: just outline icon, slightly tinted */
                <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                  <Ionicons name={tab.iconOutline} size={22} color={inactiveIconColor} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { selectedSale, closeSheet } = useSheetStore();

  // selectedSale이 바뀔 때 sheet 열기/닫기
  useEffect(() => {
    if (selectedSale) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [selectedSale]);

  const handleTabPress = (index: number) => {
    setCurrentPage(index); // optimistic update — tab bar responds immediately
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        scrollEnabled={!selectedSale}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="0" style={{ flex: 1 }}><IndexScreen /></View>
        <View key="1" style={{ flex: 1 }}><CalendarScreen /></View>
        <View key="2" style={{ flex: 1 }}><FavoritesScreen /></View>
        <View key="3" style={{ flex: 1 }}><MypageScreen /></View>
      </PagerView>

      <LiquidGlassTabBar currentPage={currentPage} onTabPress={handleTabPress} />

      {/* 탭바보다 나중에 렌더링 → 탭바 위에 표시됨 */}
      <SaleDetailSheet
        ref={bottomSheetRef}
        sale={selectedSale}
        onClose={closeSheet}
      />
    </View>
  );
}
