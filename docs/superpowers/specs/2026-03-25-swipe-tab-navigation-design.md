# Swipe Tab Navigation Design

**Date:** 2026-03-25
**Project:** JIGUMIA
**Feature:** 화면 스와이프로 바텀 탭 이동

---

## Overview

Replace Expo Router's `<Tabs>` with a `PagerView` + `LiquidGlassTabBar` combination to enable native swipe navigation between the 4 main tab screens. The user can swipe left/right anywhere on the screen to navigate between tabs, with a sliding animation that follows the finger.

---

## Architecture

### Current Structure

```
TabLayout (_layout.tsx)
└── <Tabs> (Expo Router)
    ├── Tabs.Screen: index
    ├── Tabs.Screen: calendar
    ├── Tabs.Screen: favorites
    ├── Tabs.Screen: mypage
    └── Tabs.Screen: explore (href: null — hidden from tab bar)
+ LiquidGlassTabBar (custom tab bar)
+ SaleDetailSheet (bottom sheet overlay)
```

### New Structure

```
TabLayout (_layout.tsx)
└── <View style={{ flex: 1 }}>
    ├── <PagerView> (swipe handling + slide animation)
    │   ├── Page 0: <IndexScreen />
    │   ├── Page 1: <CalendarScreen />
    │   ├── Page 2: <FavoritesScreen />
    │   └── Page 3: <MypageScreen />
    ├── <LiquidGlassTabBar> (existing design, connected to page index)
    └── <SaleDetailSheet> (unchanged)
```

### explore screen 처리

`explore.tsx`는 탭 바에 표시되지 않는 숨겨진 화면(현재 `href: null`)이다. PagerView로 전환 후에도 이 화면은 PagerView 페이지에 포함하지 않는다. `ExploreScreen`은 Expo Router의 파일 기반 라우팅을 통해 `router.push('/(tabs)/explore')`로 접근 가능하며, 향후 브랜드 탐색 진입점(예: 홈 화면의 탐색 버튼)에서 호출된다. `_layout.tsx`에서 `<Tabs>` 제거 후에는 Expo Router가 이 파일을 여전히 라우트로 인식하므로 별도 처리 불필요.

---

## Components

### PagerView

- Package: `react-native-pager-view`
- Import: `import PagerView from 'react-native-pager-view';`
- `ref={pagerRef}` — 탭 탭 시 programmatic navigation
- `initialPage={0}` — 앱 시작 시 홈(index) 탭
- `onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}` — 스와이프 완료 후 탭 바 활성 상태 동기화
- `onPageScroll` — 스크롤 중 탭 바 애니메이션 지원 (아래 참고)
- `scrollEnabled={!selectedSale}` — 바텀시트 열려있을 때 스와이프 비활성화
- `style={{ flex: 1 }}`

**Mid-swipe 탭 바 애니메이션:**
`onPageScroll`은 드래그 중 지속적으로 `{ position, offset }` 값을 제공한다. MVP 단계에서는 이 값을 사용하지 않고 `onPageSelected` 기반의 즉시 전환만 구현한다 (탭 바 활성 인디케이터가 손가락을 따라 이동하지 않고 페이지 확정 후 전환). 추후 개선이 필요하면 `onPageScroll`의 `offset`을 `Reanimated SharedValue`로 연결해 탭 바 인디케이터를 연속 이동시킬 수 있다.

### LiquidGlassTabBar (refactored)

현재 컴포넌트는 `@react-navigation/bottom-tabs`의 `BottomTabBarProps`(`state`, `descriptors`, `navigation`)에 의존한다. `<Tabs>` 제거 후 이 props가 없어지므로 컴포넌트를 새 인터페이스로 교체한다.

**새 props 인터페이스:**

```tsx
interface LiquidGlassTabBarProps {
  currentPage: number;          // 현재 활성 탭 인덱스 (0–3)
  onTabPress: (index: number) => void; // pagerRef.current?.setPage(index) 호출
}
```

**내부 변경 사항:**
- `state.index` → `currentPage`
- `state.routes.findIndex(r => r.name === tab.name)` → `TABS` 배열의 순서 인덱스 (index 0, calendar 1, favorites 2, mypage 3)로 고정
- `navigation.emit({ type: 'tabPress' })` 제거 — React Navigation 이벤트 시스템 불필요
- `navigation.navigate(route.name)` → `onTabPress(tabIndex)` 호출
- `useSafeAreaInsets()` 훅은 그대로 유지 (탭 바 하단 위치 계산에 필요)
- 시각 디자인(liquid glass pill, purple active indicator, icons) 완전 동일

### Screen Components

각 화면을 직접 import해 PagerView 페이지로 렌더링:

```tsx
import IndexScreen from './index';
import CalendarScreen from './calendar';
import FavoritesScreen from './favorites';
import MypageScreen from './mypage';
```

각 페이지는 `<View style={{ flex: 1 }}>` 로 감싸야 한다.

**SafeAreaView 필수 수정:** 모든 탭 화면(`index.tsx`, `calendar.tsx`, `favorites.tsx`, `mypage.tsx`)은 루트에 `SafeAreaView`를 사용 중이다. PagerView로 전환하면 하단 safe area inset이 화면별로 독립 적용되어 탭 바 높이와 이중으로 겹친다 (iPhone X 이후 전 기종에서 발생하는 보장된 버그). 각 화면의 루트 `SafeAreaView`를 다음과 같이 교체해야 한다:

```tsx
// Before
<SafeAreaView style={{ flex: 1 }}>

// After
<SafeAreaView edges={['top']} style={{ flex: 1 }}>
```

`react-native-safe-area-context`의 `edges` prop으로 상단 inset만 적용하고 하단은 각 화면의 기존 `paddingBottom: 120`이 담당한다.

**데이터 페칭 주의:** PagerView는 4개 화면을 동시에 마운트한다. 브랜드/세일 데이터 페칭은 반드시 루트 `_layout.tsx`에 그대로 유지해야 하며, 개별 탭 화면으로 이동하면 안 된다 (개별 화면에 `useEffect` 페칭이 있으면 4회 중복 실행됨).

---

## State Management

```ts
const [currentPage, setCurrentPage] = useState(0);
const pagerRef = useRef<PagerView>(null);
```

- 탭 탭 → `setCurrentPage(index)` 즉시 호출 (optimistic update) + `pagerRef.current?.setPage(index)` → PagerView 슬라이드 애니메이션
- 스와이프 완료 → `onPageSelected` → `setCurrentPage(index)` → 탭 바 활성 상태 보정

탭 버튼 탭 시 `setCurrentPage`를 즉시 호출하는 이유: `setPage`가 애니메이션을 시작하고 `onPageSelected`는 완료 후 발생하므로, 연속 탭 시 탭 바와 PagerView 상태가 일시적으로 불일치한다. Optimistic update로 탭 바를 즉시 반응시켜 이 문제를 방지한다.

---

## Bottom Sheet Conflict Prevention

`sheetStore`의 `selectedSale`이 존재하는 동안 PagerView `scrollEnabled={false}`. `selectedSale`은 바텀시트 열리는 순간 설정되고 `closeSheet()` 호출(onClose 콜백) 시 null로 초기화되므로, 닫힘 애니메이션이 완료되기 전까지 스와이프가 비활성화되어 제스처 충돌이 발생하지 않는다.

```tsx
const { selectedSale } = useSheetStore();
<PagerView scrollEnabled={!selectedSale} ... />
```

---

## Installation

```bash
npx expo install react-native-pager-view
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/(tabs)/_layout.tsx` | `<Tabs>` → `PagerView` + `LiquidGlassTabBar` props 교체. `bottomSheetRef`, `useEffect(selectedSale)`, `<SaleDetailSheet>` 블록은 그대로 유지 |
| `src/app/(tabs)/index.tsx` | 루트 `<SafeAreaView>` → `<SafeAreaView edges={['top']}>` 변경. 검색 아이콘(`<Ionicons name="search-outline">`)을 `<TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>` 로 감싸기 (현재 bare `<View>` 안에 있어 `onPress` 추가만으로 동작 안 함) |
| `src/app/(tabs)/calendar.tsx` | 루트 `<SafeAreaView>` → `<SafeAreaView edges={['top']}>` 변경 |
| `src/app/(tabs)/favorites.tsx` | 루트 `<SafeAreaView>` → `<SafeAreaView edges={['top']}>` 변경 — **비로그인 분기(line 30)와 로그인 분기(line 46) 두 곳 모두 변경** |
| `src/app/(tabs)/mypage.tsx` | 루트 `<SafeAreaView>` → `<SafeAreaView edges={['top']}>` 변경 |
| `package.json` / `package-lock.json` | `react-native-pager-view` 추가 |

---

## Trade-offs

| Pro | Con |
|-----|-----|
| Native-feeling swipe (손가락 따라 화면 이동) | Expo Router URL 동기화 없음 (MVP에서 허용) |
| LiquidGlassTabBar 기존 디자인 완전 유지 | 새 패키지 1개 추가 |
| 추가 애니메이션 코드 불필요 | 4개 화면 항상 마운트됨 (lazy loading 없음) |
| 바텀시트 충돌 깔끔하게 처리 | Android 시스템 백 제스처 충돌 가능 (page 0에서 edge-swipe) |
| `onPageScroll`으로 추후 탭 바 인디케이터 연동 확장 가능 | mid-swipe 탭 바 추적 MVP에서 미구현 |

**Android 시스템 백 제스처:** Android 13+에서 page 0(홈)에서 왼쪽 에지 스와이프 시 시스템 백 제스처와 PagerView 스와이프가 충돌할 수 있다. page 0에서는 PagerView가 스와이프할 페이지가 없으므로 실질적 영향은 제한적이나, 추후 `BackHandler`로 명시적 처리 권장.

**URL 동기화:** `router.replace()` 호출로 URL 동기화를 추가할 경우 PagerView가 화면을 직접 컴포넌트로 렌더링하고 있어 Expo Router의 화면 중복 렌더링 문제가 생길 수 있다. URL 동기화가 필요해지면 PagerView 방식을 버리고 `react-native-tab-view`(Expo Router 통합 지원)로 교체하는 것이 올바른 경로다.
