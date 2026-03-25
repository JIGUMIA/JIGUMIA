# Skeleton Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 데이터 로딩 중 shimmer 스켈레톤을 표시해 빈 화면이 보이지 않도록 한다.

**Architecture:** Reanimated + SVG로 shimmer 애니메이션을 제공하는 `SkeletonBox` 원시 컴포넌트를 만들고, 각 화면 레이아웃에 맞는 스켈레톤을 조합한다. `saleStore`의 `loading` 경쟁 상태를 먼저 수정해 신뢰할 수 있는 단일 플래그로 만든다.

**Tech Stack:** react-native-reanimated v4, react-native-svg v15, Zustand, NativeWind/inline styles

**Spec:** `docs/superpowers/specs/2026-03-25-skeleton-loading-design.md`

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/store/saleStore.ts` |
| Modify | `src/app/_layout.tsx` |
| Create | `src/components/SkeletonBox.tsx` |
| Create | `src/components/skeletons/HomeSkeleton.tsx` |
| Create | `src/components/skeletons/ExploreSkeleton.tsx` |
| Create | `src/components/skeletons/FavoritesSkeleton.tsx` |
| Create | `src/components/skeletons/CalendarSkeleton.tsx` |
| Modify | `src/app/(tabs)/index.tsx` |
| Modify | `src/app/(tabs)/explore.tsx` |
| Modify | `src/app/(tabs)/favorites.tsx` |
| Modify | `src/components/Calendar.tsx` |

---

## Task 1: Fix saleStore Loading Race Condition

현재 `fetchBrands`와 `fetchSaleEvents`가 각자 `loading`을 독립적으로 set/clear하므로, 먼저 끝난 fetch가 `loading: false`를 설정해 스켈레톤이 너무 일찍 사라진다.

**Files:**
- Modify: `src/store/saleStore.ts`
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: `saleStore.ts` 수정 — interface + fetchAll 추가**

`src/store/saleStore.ts`를 아래와 같이 교체한다:

```ts
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Brand, SaleEvent, Category, SaleStatus } from '../types';

interface SaleState {
  brands: Brand[];
  saleEvents: SaleEvent[];
  loading: boolean;
  selectedCategory: Category | null;
  searchQuery: string;

  fetchAll: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  getSaleEventsForDate: (date: string) => SaleEvent[];
  getSaleEventsForBrand: (brandId: string) => SaleEvent[];
  getFilteredBrands: () => Brand[];
}

export const useSaleStore = create<SaleState>((set, get) => ({
  brands: [],
  saleEvents: [],
  loading: false,
  selectedCategory: null,
  searchQuery: '',

  fetchAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        (async () => {
          const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');
          if (error) console.error('[fetchBrands] error:', JSON.stringify(error));
          else if (data) {
            console.log('[fetchBrands] 성공, 브랜드 수:', data.length);
            set({ brands: data });
          }
        })(),
        (async () => {
          const { data, error } = await supabase
            .from('sale_events')
            .select('*, brand:brands(*)')
            .order('start_date');
          if (error) console.error('[fetchSaleEvents] error:', JSON.stringify(error));
          else if (data) {
            console.log('[fetchSaleEvents] 성공, 세일 수:', data.length);
            set({ saleEvents: data });
          }
        })(),
      ]);
    } finally {
      set({ loading: false });
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getSaleEventsForDate: (date: string) => {
    const { saleEvents } = get();
    return saleEvents.filter(
      (event) => date >= event.start_date && date <= event.end_date
    );
  },

  getSaleEventsForBrand: (brandId: string) => {
    const { saleEvents } = get();
    return saleEvents.filter((event) => event.brand_id === brandId);
  },

  getFilteredBrands: () => {
    const { brands, selectedCategory, searchQuery } = get();
    let filtered = brands;
    if (selectedCategory) {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) => b.name.toLowerCase().includes(q));
    }
    return filtered;
  },
}));
```

- [ ] **Step 2: `_layout.tsx` 수정 — fetchAll 사용**

`src/app/_layout.tsx`에서 아래 두 줄을:
```ts
const { fetchBrands, fetchSaleEvents } = useSaleStore();
// ...
fetchBrands();
fetchSaleEvents();
```
아래처럼 바꾼다:
```ts
const { fetchAll } = useSaleStore();
// ...
fetchAll();
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

Expected: 에러 없음 (또는 이미 있던 에러만 출력)

- [ ] **Step 4: Commit**

```bash
git add src/store/saleStore.ts src/app/_layout.tsx
git commit -m "fix: fix saleStore loading race condition with fetchAll"
```

---

## Task 2: SkeletonBox 원시 컴포넌트

shimmer 애니메이션을 담당하는 재사용 가능한 컴포넌트.

**Files:**
- Create: `src/components/SkeletonBox.tsx`

- [ ] **Step 1: `src/components/SkeletonBox.tsx` 생성**

```tsx
import React, { useEffect } from 'react';
import { View, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonBoxProps {
  width: number | '100%';
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonBox({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonBoxProps) {
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: 1200, easing: Easing.linear }),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E0E0E8',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH,
          },
          shimmerStyle,
        ]}
      >
        <Svg width={SCREEN_WIDTH} height={height}>
          <Defs>
            <LinearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="white" stopOpacity="0" />
              <Stop offset="0.5" stopColor="white" stopOpacity="0.7" />
              <Stop offset="1" stopColor="white" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={height}
            fill="url(#shimmer)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SkeletonBox.tsx
git commit -m "feat: add SkeletonBox shimmer component"
```

---

## Task 3: HomeSkeleton + 홈 화면 연결

**Files:**
- Create: `src/components/skeletons/HomeSkeleton.tsx`
- Modify: `src/app/(tabs)/index.tsx`

- [ ] **Step 1: `src/components/skeletons/HomeSkeleton.tsx` 생성**

```tsx
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
```

- [ ] **Step 2: `src/app/(tabs)/index.tsx` — loading 체크 추가**

`HomeScreen` 컴포넌트 상단에 아래 코드를 추가한다. `useSaleStore` import는 이미 있으므로 `loading`만 destructure에 추가하면 된다:

파일 상단 import에 `HomeSkeleton` 추가:
```tsx
import HomeSkeleton from '../../components/skeletons/HomeSkeleton';
```

`HomeScreen` 함수 내 상단 (기존 `const { saleEvents }` 바로 아래)에 추가:
```tsx
export default function HomeScreen() {
  const { saleEvents, loading } = useSaleStore();   // loading 추가
  const { openSheet } = useSheetStore();

  if (loading) return <HomeSkeleton />;              // ← 이 줄 추가

  const activeSales = saleEvents.filter((e) => e.status === 'active');
  // ... 나머지 동일
```

- [ ] **Step 3: TypeScript 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

- [ ] **Step 4: 앱 실행 후 홈 화면 스켈레톤 확인**

```bash
npx expo start
```

앱 시작 시 홈 탭에서 shimmer 스켈레톤이 보인 후 실제 데이터로 전환되는지 확인한다. 네트워크가 빠를 경우 [Expo 네트워크 속도 쓰로틀 설정](https://docs.expo.dev/debugging/tools/)으로 로딩 시간을 늘려 확인한다.

- [ ] **Step 5: Commit**

```bash
git add src/components/skeletons/HomeSkeleton.tsx src/app/(tabs)/index.tsx
git commit -m "feat: add HomeSkeleton and integrate into home screen"
```

---

## Task 4: ExploreSkeleton + 탐색 화면 연결

**Files:**
- Create: `src/components/skeletons/ExploreSkeleton.tsx`
- Modify: `src/app/(tabs)/explore.tsx`

- [ ] **Step 1: `src/components/skeletons/ExploreSkeleton.tsx` 생성**

```tsx
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
```

- [ ] **Step 2: `src/app/(tabs)/explore.tsx` — loading 체크 추가**

파일 상단 import에 추가:
```tsx
import ExploreSkeleton from '../../components/skeletons/ExploreSkeleton';
```

`ExploreScreen` 함수 내 상단에 추가:
```tsx
export default function ExploreScreen() {
  const colors = useThemeColors();
  const { selectedCategory, searchQuery, setSelectedCategory, setSearchQuery, getFilteredBrands, saleEvents, loading } = useSaleStore();

  if (loading) return <ExploreSkeleton />;

  const filteredBrands = getFilteredBrands();
  // ... 나머지 동일
```

- [ ] **Step 3: TypeScript 확인 + 앱에서 탐색 탭 스켈레톤 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/skeletons/ExploreSkeleton.tsx src/app/(tabs)/explore.tsx
git commit -m "feat: add ExploreSkeleton and integrate into explore screen"
```

---

## Task 5: FavoritesSkeleton + 관심 화면 연결

**Files:**
- Create: `src/components/skeletons/FavoritesSkeleton.tsx`
- Modify: `src/app/(tabs)/favorites.tsx`

- [ ] **Step 1: `src/components/skeletons/FavoritesSkeleton.tsx` 생성**

```tsx
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
```

- [ ] **Step 2: `src/app/(tabs)/favorites.tsx` — loading 체크 추가**

파일 상단 import에 추가:
```tsx
import FavoritesSkeleton from '../../components/skeletons/FavoritesSkeleton';
```

`FavoritesScreen` 함수 내 `useSaleStore` destructure에 `loading` 추가 (한 번만 호출):
```tsx
const { brands, saleEvents, loading } = useSaleStore();
```

`!user` 조기 반환 **바로 아래**에 loading 체크 추가:
```tsx
if (!user) {
  return ( /* 기존 로그인 안내 UI 동일 */ );
}

if (loading) return <FavoritesSkeleton />;  // ← 이 줄 추가
```

- [ ] **Step 3: TypeScript 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/skeletons/FavoritesSkeleton.tsx src/app/(tabs)/favorites.tsx
git commit -m "feat: add FavoritesSkeleton and integrate into favorites screen"
```

---

## Task 6: CalendarSkeleton + 캘린더 화면 연결

캘린더는 특이한 구조: 고정 헤더(필터 버튼)가 `Calendar.tsx` 내부에 있으므로, `CalendarScreen`이 아닌 `Calendar.tsx` 안에서 loading을 체크해 FlatList만 교체한다.

**Files:**
- Create: `src/components/skeletons/CalendarSkeleton.tsx`
- Modify: `src/components/Calendar.tsx`

- [ ] **Step 1: `src/components/skeletons/CalendarSkeleton.tsx` 생성**

```tsx
import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import SkeletonBox from '../SkeletonBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = 32;
const CELL_GAP = (SCREEN_WIDTH - 40 - CELL_SIZE * 7) / 6; // 좌우 패딩 20씩 제외

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
```

- [ ] **Step 2: `src/components/Calendar.tsx` — FlatList 영역에 loading 체크 추가**

`Calendar.tsx`의 `useSaleStore` destructure에 `loading`을 추가:
```tsx
const { saleEvents, brands, loading } = useSaleStore();
```

`CalendarSkeleton` import 추가:
```tsx
import CalendarSkeleton from './skeletons/CalendarSkeleton';
```

파일의 `{/* ── 월 스크롤 FlatList ── */}` 블록(line 305~324)을 아래처럼 교체한다:
```tsx
{/* ── 월 스크롤 FlatList 또는 스켈레톤 ── */}
{loading ? (
  <CalendarSkeleton />
) : (
  <FlatList
    data={ALL_MONTHS}
    keyExtractor={item => item.key}
    renderItem={({ item }) => (
      <MonthSection
        year={item.year}
        month={item.month}
        today={today}
        events={filteredEvents}
        onSalePress={onSalePress}
      />
    )}
    viewabilityConfig={viewabilityConfig}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 120 }}
    ItemSeparatorComponent={() => (
      <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
    )}
  />
)}
```

- [ ] **Step 3: TypeScript 확인**

```bash
cd /Users/kohjoowon/JIGUMIA && npx tsc --noEmit
```

- [ ] **Step 4: 앱에서 전체 4개 탭 스켈레톤 확인**

```bash
npx expo start
```

확인 항목:
1. 앱 시작 시 스플래시 → 4개 탭 모두 shimmer 스켈레톤 표시
2. 데이터 로드 완료 후 실제 컨텐츠로 자연스럽게 전환
3. 캘린더 탭: 필터 버튼(카테고리/쇼핑몰)은 로딩 중에도 표시됨
4. 관심 탭: 비로그인 상태에서는 스켈레톤 대신 로그인 안내 표시

- [ ] **Step 5: Commit**

```bash
git add src/components/skeletons/CalendarSkeleton.tsx src/components/Calendar.tsx
git commit -m "feat: add CalendarSkeleton and integrate into Calendar component"
```
