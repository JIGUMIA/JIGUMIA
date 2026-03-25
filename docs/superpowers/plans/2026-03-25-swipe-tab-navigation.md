# Swipe Tab Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Expo Router's `<Tabs>` with `react-native-pager-view` so users can swipe left/right between the 4 main tab screens with a native sliding animation.

**Architecture:** `PagerView` holds the 4 tab screens as pages and handles all swipe gestures natively. `LiquidGlassTabBar` is refactored to accept `currentPage` + `onTabPress` props instead of `BottomTabBarProps`. Tab bar updates optimistically on tap; `onPageSelected` corrects state after swipe completes.

**Tech Stack:** react-native-pager-view, react-native-safe-area-context (edges prop), expo-router (router.push for explore), Zustand (sheetStore)

---

## File Map

| File | What changes |
|------|-------------|
| `package.json` | Add `react-native-pager-view` |
| `src/app/(tabs)/_layout.tsx` | Replace `<Tabs>` + `LiquidGlassTabBar` — main work |
| `src/app/(tabs)/index.tsx` | `SafeAreaView edges={['top']}` + search icon → `TouchableOpacity` |
| `src/app/(tabs)/calendar.tsx` | `SafeAreaView edges={['top']}` |
| `src/app/(tabs)/favorites.tsx` | `SafeAreaView edges={['top']}` × 2 (two return branches) |
| `src/app/(tabs)/mypage.tsx` | `SafeAreaView edges={['top']}` |

---

### Task 1: Install react-native-pager-view

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npx expo install react-native-pager-view
```

Expected output: package added to `package.json` dependencies.

- [ ] **Step 2: Verify installation**

```bash
grep "react-native-pager-view" package.json
```

Expected: line with `"react-native-pager-view"` in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install react-native-pager-view"
```

---

### Task 2: Fix SafeAreaView in all 4 tab screens

**Files:**
- Modify: `src/app/(tabs)/index.tsx:213`
- Modify: `src/app/(tabs)/calendar.tsx:15`
- Modify: `src/app/(tabs)/favorites.tsx:30,46`
- Modify: `src/app/(tabs)/mypage.tsx:67`

**Why:** PagerView mounts all 4 screens simultaneously. Without `edges={['top']}`, each screen applies bottom safe-area insets independently, causing double-padding behind the tab bar on all iPhones with a home indicator.

- [ ] **Step 1: Fix `index.tsx` SafeAreaView**

In `src/app/(tabs)/index.tsx` line 213, change:
```tsx
// Before
<SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
```

- [ ] **Step 2: Fix `calendar.tsx` SafeAreaView**

In `src/app/(tabs)/calendar.tsx` line 15, change:
```tsx
// Before
<SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
```

- [ ] **Step 3: Fix `favorites.tsx` SafeAreaView — both branches**

`favorites.tsx` has two return branches with `SafeAreaView`. Fix both:

Line 30 (unauthenticated branch):
```tsx
// Before
<SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
```

Line 46 (authenticated branch):
```tsx
// Before
<SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
```

- [ ] **Step 4: Fix `mypage.tsx` SafeAreaView**

In `src/app/(tabs)/mypage.tsx` line 67, change:
```tsx
// Before
<SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(tabs\)/index.tsx src/app/\(tabs\)/calendar.tsx src/app/\(tabs\)/favorites.tsx src/app/\(tabs\)/mypage.tsx
git commit -m "fix: apply SafeAreaView edges top-only on all tab screens"
```

---

### Task 3: Wire search icon to explore screen in index.tsx

**Files:**
- Modify: `src/app/(tabs)/index.tsx:235-245`

**Why:** The search icon is currently a bare `<Ionicons>` inside a `<View>`. It needs a `TouchableOpacity` wrapper to be pressable. This connects the hidden `explore.tsx` screen to a navigation entry point.

**Expo Router navigate 동작:** `router.push('/(tabs)/explore')` 호출 시, `(tabs)/_layout.tsx`에 더 이상 `<Tabs>` 네비게이터가 없으므로 Expo Router는 상위 루트 Stack 네비게이터(`_layout.tsx`의 `<Stack>`)를 통해 `explore.tsx`를 새 화면으로 Push한다. Explore 화면이 탭 레이아웃 전체를 덮는 풀스크린 화면으로 등장한다. Expo Router는 파일 시스템에서 라우트를 자동 탐색하므로 루트 `<Stack>`에 명시적으로 등록하지 않아도 동작한다.

- [ ] **Step 1: Replace the search icon wrapper**

In `src/app/(tabs)/index.tsx`, find lines 235–245:

```tsx
// Before
<View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
  <View style={{ position: 'relative', marginRight: 16 }}>
    <Ionicons name="notifications-outline" size={24} color="#1E1B4B" />
    <View style={{
      position: 'absolute', top: 0, right: 0,
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: '#EF5350',
    }} />
  </View>
  <Ionicons name="search-outline" size={24} color="#1E1B4B" />
</View>

// After
<View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
  <View style={{ position: 'relative', marginRight: 16 }}>
    <Ionicons name="notifications-outline" size={24} color="#1E1B4B" />
    <View style={{
      position: 'absolute', top: 0, right: 0,
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: '#EF5350',
    }} />
  </View>
  <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.7}>
    <Ionicons name="search-outline" size={24} color="#1E1B4B" />
  </TouchableOpacity>
</View>
```

`router` is already imported at line 10: `import { router } from 'expo-router';`

- [ ] **Step 2: Commit**

```bash
git add src/app/\(tabs\)/index.tsx
git commit -m "feat: wire search icon to explore screen"
```

---

### Task 4: Rewrite _layout.tsx with PagerView + refactored LiquidGlassTabBar

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx` (full rewrite)

This is the main task. We replace `<Tabs>` with `PagerView` and update `LiquidGlassTabBar` to use simple `currentPage` / `onTabPress` props.

**Expo Router 동작에 대한 중요 참고사항:**
- **직접 import 충돌 없음:** `./index`, `./calendar` 등을 React 컴포넌트로 직접 import해서 PagerView 페이지로 렌더링하는 것은 Expo Router의 라우팅 시스템과 충돌하지 않는다. Expo Router는 URL/네비게이션 상태만 관리하며, 파일을 직접 import해서 컴포넌트로 렌더링하는 것은 완전히 독립적인 작업이다.
- **`as const` 인라인 문법:** TABS 배열의 `'home' as const` 패턴은 표준 TypeScript 문법으로 유효하다. 기존 `_layout.tsx`에서 이미 동일한 패턴을 사용 중이다. `tsc --noEmit`으로 확인.

Key points:
- `LiquidGlassTabBar` loses its `BottomTabBarProps` dependency; gains `currentPage: number` + `onTabPress: (index: number) => void`
- `useSafeAreaInsets()` stays in `LiquidGlassTabBar` for bottom positioning
- `TabLayout` gains `useState(0)` + `useRef<PagerView>(null)` for page state
- `onTabPress` calls both `setCurrentPage(index)` (optimistic) and `pagerRef.current?.setPage(index)`
- `onPageSelected` calls `setCurrentPage` for swipe-completion sync
- `scrollEnabled={!selectedSale}` prevents swipe when bottom sheet is open
- `bottomSheetRef`, `useEffect(selectedSale)`, and `<SaleDetailSheet>` are preserved verbatim

- [ ] **Step 1: Write the new `_layout.tsx`**

Replace the entire contents of `src/app/(tabs)/_layout.tsx` with:

```tsx
import React, { useRef, useEffect, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import SaleDetailSheet from '../../components/SaleDetailSheet';
import { useSheetStore } from '../../store/sheetStore';

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
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom,
        left: 20,
        right: 20,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 20,
        borderRadius: 36,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: 36,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.75)',
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
            backgroundColor: 'rgba(255,255,255,0.9)',
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#6C63FF',
                    borderRadius: 24,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.55,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Ionicons name={tab.icon} size={17} color="#FFFFFF" />
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: '700',
                      marginLeft: 5,
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              ) : (
                <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                  <Ionicons name={tab.iconOutline} size={22} color="rgba(30,27,75,0.4)" />
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
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors. If type errors appear, check the PagerView import and ref type.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(tabs\)/_layout.tsx
git commit -m "feat: replace Tabs with PagerView for swipe tab navigation"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
npx expo start
```

- [ ] **Step 2: Test swipe navigation**

On iOS simulator or device:
- Swipe right → moves to previous tab with sliding animation
- Swipe left → moves to next tab with sliding animation
- Tab bar active indicator updates after swipe completes
- Swiping beyond first/last tab does nothing (PagerView boundary)

- [ ] **Step 3: Test tab bar tap**

- Tap each tab button → screen slides to that tab
- Tab bar active indicator updates immediately (before animation completes)
- Rapid taps between tabs → tab bar stays in sync with PagerView

- [ ] **Step 4: Test bottom sheet conflict**

- Tap a sale card to open the bottom sheet
- While sheet is open, try swiping the screen → swipe should NOT trigger tab change
- Close the sheet → swipe navigation resumes

- [ ] **Step 5: Test search icon → explore navigation**

- Tap the search icon (🔍) in the home screen header
- Expected: `explore.tsx` 화면이 루트 Stack의 새 화면으로 풀스크린 Push 됨 (탭 레이아웃 전체를 덮음)
- Back 제스처로 탭 레이아웃으로 돌아올 수 있어야 함
- 만약 explore 화면이 열리지 않으면: `router.push('/explore')` (경로에서 `(tabs)/` 제거)로 시도해볼 것

- [ ] **Step 6: Test safe area on device**

On a physical iPhone (or iPhone simulator with home indicator):
- Scroll to bottom of Home screen → content stops above tab bar with no double-padding
- Check Favorites and MyPage screens similarly

- [ ] **Step 7: Commit final verification note**

```bash
git commit --allow-empty -m "chore: swipe tab navigation verified manually"
```
