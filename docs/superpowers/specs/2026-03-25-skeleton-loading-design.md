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

## SkeletonBox Component

**File:** `src/components/SkeletonBox.tsx`

**Props:**
- `width`: number | `'100%'`
- `height`: number
- `borderRadius`: number (default 8)
- `style?`: ViewStyle

**Behavior:**
- Base color: `#E0E0E8` (neutral gray matching app background `#EEEDF8`)
- Shimmer overlay: SVG `LinearGradient` — transparent → `rgba(255,255,255,0.7)` → transparent
- Animation: Reanimated `withRepeat(withTiming(...))` on `translateX`, range `-width` to `+width`, duration 1200ms, linear easing
- `overflow: 'hidden'` clips the shimmer band to the box bounds

---

## Screen Skeletons

### HomeSkeleton

Mirrors `index.tsx` layout:
1. Section title block (100×18, borderRadius 6)
2. Two-column grid: 2× `SaleCard` placeholder (height 180, borderRadius 24)
3. Section title block
4. Three `UpcomingRow` placeholders (height 72, borderRadius 16)

### ExploreSkeleton

Mirrors `explore.tsx` layout:
1. Search bar block (full-width, height 44, borderRadius 12)
2. Three category chip blocks (width 64, height 32, borderRadius 99, horizontal row)
3. Six `BrandCard` row placeholders (height 64, borderRadius 12)

### FavoritesSkeleton

Mirrors `favorites.tsx` layout:
1. Three brand header card placeholders (height 80, borderRadius 20)
2. Each with two nested sale row placeholders (height 44, borderRadius 14, marginLeft 20)

### CalendarSkeleton

Mirrors `Calendar.tsx` layout:
1. Month/year title block (width 140, height 22, borderRadius 6)
2. Row of 7 weekday label blocks (width 32, height 14)
3. 6×7 grid of date cell blocks (width 32, height 32, borderRadius 8) with gap spacing

---

## Integration

Each screen reads `loading` from `useSaleStore()` and conditionally renders:

```tsx
const { loading } = useSaleStore();
if (loading) return <HomeSkeleton />;
// real content...
```

- `loading` is set to `true` at start of `fetchBrands` / `fetchSaleEvents` in `saleStore.ts`
- Set to `false` after both complete
- Currently both fetches run independently and each set `loading` independently — no change needed to store logic

---

## Design Tokens

| Token | Value |
|-------|-------|
| Skeleton base color | `#E0E0E8` |
| Shimmer highlight | `rgba(255,255,255,0.7)` |
| Animation duration | 1200ms |
| Animation easing | Linear |

---

## Out of Scope

- `sale-list.tsx` — accessed only after data is already loaded
- Pull-to-refresh skeleton — not in current scope
- Per-field loading states — single `loading` boolean is sufficient
