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
    └── Tabs.Screen: mypage
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

---

## Components

### PagerView

- Package: `react-native-pager-view`
- `ref={pagerRef}` — used for programmatic navigation on tab press
- `onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}` — syncs tab bar active state
- `scrollEnabled={!selectedSale}` — disables swipe when bottom sheet is open
- `style={{ flex: 1 }}`

### LiquidGlassTabBar (modified)

The existing `LiquidGlassTabBar` receives `state` from `@react-navigation/bottom-tabs`. Since we're no longer using `<Tabs>`, we need to adapt it to receive:

- `currentPage: number` — active tab index (0–3)
- `onTabPress: (index: number) => void` — calls `pagerRef.current.setPage(index)`

The visual design (liquid glass pill, active purple indicator, icons) remains completely unchanged.

### Screen Components

Each screen is imported directly and rendered inside PagerView:

```tsx
import IndexScreen from './index';
import CalendarScreen from './calendar';
import FavoritesScreen from './favorites';
import MypageScreen from './mypage';
```

Each screen must be wrapped in `<View style={{ flex: 1 }}>` inside PagerView.

---

## State Management

```ts
const [currentPage, setCurrentPage] = useState(0);
const pagerRef = useRef<PagerView>(null);
```

- Tab press → `pagerRef.current?.setPage(index)`
- Swipe complete → `onPageSelected` fires → `setCurrentPage(index)`

---

## Bottom Sheet Conflict Prevention

`sheetStore`의 `selectedSale`이 존재하면 PagerView의 `scrollEnabled`를 `false`로 설정해 바텀시트와 스와이프 제스처 충돌 방지.

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
| `src/app/(tabs)/_layout.tsx` | Replace `<Tabs>` with `PagerView`, adapt `LiquidGlassTabBar` props |
| `package.json` / `package-lock.json` | Add `react-native-pager-view` |

No other files need to change. Screen files (`index.tsx`, `calendar.tsx`, etc.) are unchanged.

---

## Trade-offs

| Pro | Con |
|-----|-----|
| Native-feeling swipe (finger follows screen) | Expo Router URL 동기화 없음 (탭 전환 시 URL 안 바뀜) |
| Existing LiquidGlassTabBar design preserved | 새 패키지 1개 추가 |
| No new complex animation code | 각 화면이 항상 마운트됨 (lazy loading 없음) |
| Bottom sheet conflict handled cleanly | |

URL 동기화 미지원은 MVP 단계에서 문제 없음. 딥링크가 필요해지면 추후 `onPageSelected`에서 `router.replace()` 호출로 해결 가능.
