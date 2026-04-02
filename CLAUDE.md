# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Obsidian Blog Seeds

세션에서 블로그 글감이 될 만한 작업을 했을 때, 요약을 아래 경로에 저장:
`/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/`
- 파일명: `YYYY-MM-DD-주제.md`
- 내용: 작업 요약, 핵심 포인트, 블로그 키워드
- 사용자가 "Obsidian에 정리해줘" 또는 "블로그 글 써줘" 요청 시 활용

## Project Overview

**JIGUMIA (지구미아)** — "지금이야" (Now's the time!) — is a brand discount calendar mobile app for Korean shoppers. Users can track and discover sales from brands like Olive Young, Musinsa, 29cm, Coupang, SSG.com, H&M, and JAJU in one place.

**Status**: MVP implemented (Phase 1–3 complete). Source code in `src/`. PRD in `JIGUMIA_기획서.md`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile framework | Expo (React Native) — iOS + Android |
| Styling | NativeWind (Tailwind CSS for RN) |
| Backend/DB | Supabase (Postgres, Auth, Realtime, Storage) |
| Auth | Supabase Auth + Google OAuth via deep linking |
| Push notifications | Expo Notifications + FCM |
| State management | Zustand |
| Build/deploy | EAS Build (Expo Application Services) |

## Commands (once project is initialized)

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for production (EAS)
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Architecture

### Navigation
Bottom tab bar with 4 tabs: Home (Calendar) / Explore / Favorites / My Page
- Home screen has monthly/weekly view toggle at top
- Sale card tap opens a bottom sheet with details

### Screens
- **Home/Calendar**: Monthly and weekly views with brand tags on sale dates
- **Sale Detail** (Bottom Sheet): Brand info, dates, discount rate, benefits, external link
- **Brand Explorer**: Full brand list with category filter and search
- **Favorites**: Bookmarked brands + upcoming sale summary
- **Notification Settings**: Per-brand alert toggles
- **My Page**: Profile, notification history, app settings

### Database (Supabase)

Four core tables:
- `brands` — brand metadata (name, logo_url, category, website_url)
- `sale_events` — sale periods (brand_id FK, title, start_date, end_date, discount_rate, status: upcoming/active/ended)
- `user_favorites` — user ↔ brand bookmarks
- `user_notification_settings` — per-brand notification prefs (notify_day_before, notify_on_start, notify_day_before_end)

### Authentication Flow (Google OAuth + Deep Linking)

```
User taps Google Login
→ WebBrowser.openAuthSessionAsync()
→ Google auth completes
→ Redirect to jigumia://auth/callback
→ App handles deep link, creates session
→ Navigate to Home
```

**Required Supabase redirect URLs** (set in Supabase Dashboard → Auth → Redirect URLs):
- `jigumia://auth/callback` (production)
- `http://localhost:8081/auth/callback` (development)

### Design System

- **Colors**: `#6C63FF` (Brand Purple — primary), `#111111` (Black), `#FF2D2D` (Red — sale status accent), `#FAFAF8` (Off-White)
- **Fonts**: DM Sans (English), Pretendard (Korean)
- **Layout**: 375px base width (iPhone-first), dark/light mode support
- **Logo**: "J" lettermark, 30° tilt, 2 red dot accents diagonal

## Development Roadmap

| Phase | Goals |
|-------|-------|
| Phase 1 | Expo setup, Supabase integration, Google OAuth deep linking |
| Phase 2 | Calendar UI, sale data CRUD, brand list |
| Phase 3 | Favorites, filter/search, sale detail bottom sheet |
| Phase 4 | Push notifications (Expo Notifications + FCM) |
| Phase 5 | EAS Build, App Store/Play Store submission, OAuth production |

## Pre-launch Checklist

- [ ] Google OAuth: promote from test mode → production
- [ ] Add app's OAuth-approved domain after Play Store / App Store registration
- [ ] Confirm Supabase redirect URL includes production deep link
