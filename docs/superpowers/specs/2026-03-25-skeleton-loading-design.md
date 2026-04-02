# Skeleton Loading Design

**Date:** 2026-03-25
**Status:** Approved

## Summary

데이터 로딩 중(`saleStore.loading === true`)일 때 빈 화면 대신 shimmer 스켈레톤을 표시한다. 적용 화면: 홈, 브랜드 탐색, 관심, 캘린더 (4개 탭 전체).

---

## Architecture

```
src/components/
  SkeletonBox.tsx          ← 재사용 가능한 shimmer 원시 컴포넌트
  skeletons/
    HomeSkeleton.tsx
    ExploreSkeleton.tsx
    FavoritesSkeleton.tsx
    CalendarSkeleton.tsx
```

No new npm dependencies. Uses `react-native-reanimated` (already installed, v4.2.1) and `react-native-svg` (already installed, v15.15.3).

---

## Store Change: Fix Loading Race Condition

`saleStore.ts` currently has a race condition: `fetchBrands` and `fetchSaleEvents` each independently set `loading: true` / `loading: false`. The first fetch to finish sets `loading: false` before the other completes.

**Fix:** Add a `fetchAll` action that manages `loading` at the top level. Update the `SaleState` TypeScript interface to remove `fetchBrands` and `fetchSaleEvents` from the public API and add `fetchAll`.

```ts
// In SaleState interface: remove fetchBrands / fetchSaleEvents, add:
fetchAll: () => Promise<void>;

// Implementation:
fetchAll: async () => {
  set({ loading: true });
  try {
    await Promise.all([
      get().fetchBrandsInternal(),
      get().fetchSaleEventsInternal(),
    ]);
  } finally {
    set({ loading: false });
  }
},
```

- `fetchBrands` → renamed to `fetchBrandsInternal` (not on the public interface). Internal method no longer sets `loading`.
- `fetchSaleEvents` → renamed to `fetchSaleEventsInternal` (not on the public interface). Same.
- `_layout.tsx` calls `fetchAll()` instead of `fetchBrands()` + `fetchSaleEvents()`.
- `loading` remains `true` until both fetches complete (or either fails).

---

## SkeletonBox Component

**File:** `src/components/SkeletonBox.tsx`

**Props:**
- `width`: number | `'100%'`
- `height`: number
- `borderRadius`: number (default 8)
- `style?`: ViewStyle

**Behavior:**
- Base color: `#E0E0E8`
- Shimmer overlay: A static SVG `LinearGradient` (transparent → `rgba(255,255,255,0.7)` → transparent) rendered inside an `Animated.View`
- Animation: Reanimated `withRepeat(withTiming(...))` on `translateX` of the `Animated.View`, range `-screenWidth` to `+screenWidth` (fixed travel, `Dimensions.get('window').width`). Using a fixed travel for all box sizes is intentional — `overflow: 'hidden'` on the outer box clips the shimmer to the box bounds, so the visual result is correct regardless of whether the box is 64px wide or full-screen.
- No `useAnimatedProps` or `createAnimatedComponent` needed — the SVG is static; only the `Animated.View` moves

---

## Screen Skeletons

### HomeSkeleton

Header row (greeting text + icons) is intentionally omitted — no data-dependent content.

Both sections are rendered unconditionally in the skeleton (no conditional logic mirroring `activeSales.length > 0`). Placeholder counts are fixed:

1. Section title block (100×18, borderRadius 6) — approximates "🔥 지금 세일 중" (emoji deliberately dropped)
2. Two-column grid: **fixed 2** SaleCard placeholders (height 180, borderRadius 24)
3. Section title block (120×18, borderRadius 6) — approximates "📌 예정된 세일"
4. **Fixed 3** UpcomingRow placeholders (height 72, borderRadius 16)

### ExploreSkeleton

1. Search bar block (width `'100%'`, height 44, borderRadius 12)
2. Three category chip blocks (width 64, height 32, borderRadius 99, horizontal row)
3. Six BrandCard row placeholders (height 64, borderRadius 12)

### FavoritesSkeleton

**Integration:** `!user` guard must come **before** the loading check — unauthenticated users see the login prompt immediately, not a skeleton:

```tsx
const { user } = useAuthStore();
if (!user) return <LoginPrompt />;

const { loading } = useSaleStore();
if (loading) return <FavoritesSkeleton />;
```

Skeleton layout:
1. Three brand header card placeholders (height 80, borderRadius 20)
2. Each with two nested sale row placeholders (height 44, borderRadius 14, marginLeft 20)

### CalendarSkeleton

The `Calendar` component (`src/components/Calendar.tsx`) owns both the sticky filter header and the months FlatList. The sticky header must remain visible during loading.

**Integration: Option A — skeleton check inside `Calendar.tsx`**

Inside `Calendar.tsx`, read `loading` from `useSaleStore()` and replace only the `FlatList` area with `CalendarSkeleton` when loading. The sticky filter header `View` (lines 262–303 of `Calendar.tsx`) continues to render normally.

```tsx
// Inside Calendar component, before the FlatList render:
const { loading } = useSaleStore();
// ...
{loading ? (
  <CalendarSkeleton />
) : (
  <FlatList ... />
)}
```

`CalendarScreen.tsx` requires no changes.

Skeleton layout (replaces the FlatList area below the header):
1. Month/year title block (width 140, height 22, borderRadius 6)
2. Row of 7 weekday label blocks (width 32, height 14, equal spacing)
3. 6×7 grid of date cell blocks (width 32, height 32, borderRadius 8) with gap spacing

---

## Integration Pattern (Home, Explore)

```tsx
const { loading } = useSaleStore();
if (loading) return <HomeSkeleton />;
// real content...
```

---

## Design Tokens

| Token | Value |
|-------|-------|
| Skeleton base color | `#E0E0E8` |
| Shimmer highlight | `rgba(255,255,255,0.7)` |
| Animation duration | 1200ms |
| Animation easing | Linear |
| Shimmer travel | `screenWidth * 2` (fixed; clipping handles all sizes) |

---

## Out of Scope

- `sale-list.tsx` — accessed only after data is already loaded
- Pull-to-refresh skeleton
- Per-field loading states — single `loading` boolean is sufficient
- Error state UI — existing `console.error` behavior is unchanged; error handling is a separate concern outside this feature's scope
