import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // ── Supabase 세션 갱신 ────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── /login 페이지: 이미 로그인 시 대시보드로 ──────────
  if (pathname === '/login') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return res;
  }

  // ── 보호된 라우트: 미인증 시 로그인으로 ─────────────
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── admin role 검증 ──────────────────────────────────
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    console.warn(`[AUTH] Unauthorized access attempt: ${user.id.slice(0, 8)}***`);
    return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
  }

  // ── /api/* : rate limit 적용 ─────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';

    res.headers.set('X-Admin-ID', profile.role);
    res.headers.set('X-Forwarded-IP', ip.slice(0, 7) + '***');
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/brands/:path*',
    '/sale-events/:path*',
    '/api/:path*',
    '/login',
  ],
};
