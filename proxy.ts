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

  // ── auth callback은 세션 교환 전이므로 그대로 통과 ─
  if (pathname.startsWith('/auth/callback')) return res;

  // ── 비로그인: 보호 라우트 → 로그인으로, /login은 통과 ─
  if (!user) {
    if (pathname === '/login') return res;
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── 로그인 상태: admin role 확인 (service_role로 조회 — admin_profiles는
  //    authenticated 롤에 GRANT가 없어 RLS만으로는 읽을 수 없음) ─
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false },
    }
  );
  const { data: profile } = await adminSupabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role);

  // /login 접근 시: 관리자면 대시보드로, 아니면 로그인 페이지 그대로 표시
  if (pathname === '/login') {
    if (isAdmin) return NextResponse.redirect(new URL('/dashboard', req.url));
    return res; // 권한 없음 — 무한루프 방지, 로그인 페이지에서 에러 표시
  }

  if (!isAdmin) {
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
    '/inquiries/:path*',
    '/api/:path*',
    '/login',
    '/auth/callback',
  ],
};
