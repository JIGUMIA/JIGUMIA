# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Obsidian Blog Seeds

세션에서 블로그 글감이 될 만한 작업을 했을 때, 요약을 아래 경로에 저장:
`/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/`
- 파일명: `YYYY-MM-DD-주제.md`
- 내용: 작업 요약, 핵심 포인트, 블로그 키워드
- 사용자가 "Obsidian에 정리해줘" 또는 "블로그 글 써줘" 요청 시 활용

## Project Context

**JIGUMIA(지구미아)** — "지금이야"를 컨셉으로 한 브랜드 할인 캘린더 앱. 올리브영, 무신사, 29cm 등 주요 브랜드의 세일 일정을 한눈에 볼 수 있도록 제공. 20대 여성 타겟.

**jigumia-admin** 은 두 가지 목적으로 만든 웹 패널:
1. 앱스토어/플레이스토어 배포 심사용 홍보 사이트
2. Supabase DB(브랜드, 세일 이벤트) 관리용 어드민 패널

모바일 앱은 별도 레포 (`/Users/kohjoowon/JIGUMIA`) — Expo (React Native) SDK 55, expo-router, NativeWind v4, Zustand 기반.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture Overview

Next.js 16 App Router + TypeScript, Supabase Auth/DB, Tailwind CSS 4 (dark slate theme, indigo accents), Lucide React.

### Route Structure

- `/` → redirects to `/dashboard`
- `/(auth)/login` — public login page
- `/(admin)/dashboard` — stats overview + recent sale events
- `/(admin)/brands` — brand CRUD
- `/(admin)/sale-events` — sale event CRUD

### Auth & Authorization Flow

Three layers enforce authentication:

1. **Middleware** (`middleware.ts`) — runs on every request matching `/dashboard`, `/brands`, `/sale-events`, `/api`, `/login`. Refreshes Supabase session, checks `admin_profiles` table for `admin`/`super_admin` role, applies IP masking, enforces Upstash rate limit (60 req/min per IP). Redirects unauthenticated or non-admin users to `/login?error=unauthorized`.

2. **Admin layout** (`app/(admin)/layout.tsx`) — server component that re-validates auth before rendering any admin page.

3. **API routes** — each route calls `verifyAdmin()` before executing any DB operation.

### Supabase Client Usage

Two distinct clients in `lib/supabase/server.ts`:

- `createClient()` — respects RLS, uses the logged-in user's session. Use in server components and API routes for user-scoped queries.
- `createAdminClient()` — uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS. Use only in trusted server-side code (API routes, server components) for admin operations.

`lib/supabase/client.ts` exports a browser-side client (anon key only, for auth state in client components).

### Data Model (Supabase)

Supabase 프로젝트: `hvpmadvwybpkehqqiltw.supabase.co`

**이 어드민에서 관리하는 테이블:**
- **brands** — `id`, `name`, `category`(패션/뷰티/식품/전자기기/라이프/종합), `website_url`, `color`(브랜드 hex, default `#6C63FF`), `logo_url`, `created_at`
- **sale_events** — `id`, `brand_id`, `title`, `start_date`, `end_date`, `discount_rate`, `description`, `status`(upcoming/active/ended), `created_at`

**앱에서 사용하는 테이블 (참조용):**
- **user_favorites** — `id`, `user_id`(FK→auth.users), `brand_id`(FK→brands), `created_at`
- **user_notification_settings** — `id`, `user_id`, `brand_id`, `notify_day_before`, `notify_on_start`, `notify_day_before_end`
- **admin_profiles** — `id`(FK→auth.users), `role`('admin'|'super_admin'), `created_at`

**RLS 정책:** `brands`, `sale_events`는 anon 롤도 SELECT 가능. `user_favorites`는 본인 데이터만.

TypeScript types for all entities are in `types/index.ts`.

### Component Pattern

Pages under `(admin)/` are **server components** that fetch data then pass it to a `*Client.tsx` component marked `'use client'` for interactivity (forms, modals, state). API calls from client components go to the `/api/` routes.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # 절대 클라이언트에 노출 금지
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## Deployment (Vercel)

```bash
vercel --cwd /Users/kohjoowon/jigumia-admin
```

**첫 관리자 계정 생성:**
1. Supabase Dashboard → Authentication → Users → 이메일/비밀번호 계정 생성
2. SQL Editor: `INSERT INTO admin_profiles (id, role) VALUES ('<uuid>', 'super_admin');`

**배포 전 체크리스트:**
- Supabase SQL Editor에서 `supabase/admin_profiles.sql` 실행
- Upstash Redis 계정 생성 후 URL/Token을 Vercel 환경변수에 등록
