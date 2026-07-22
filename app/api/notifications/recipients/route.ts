import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';
import { resolveTargetUserIds, countRecipients, type Target } from '@/lib/notifications/targeting';

/**
 * 발송 전 대상 미리보기.
 * GET /api/notifications/recipients?target=all
 * GET /api/notifications/recipients?target=brand&brand_id=<uuid>
 * → { users, devices, ios, android, unknown }
 */
export async function GET(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target') as Target | null;
  const brandId = searchParams.get('brand_id') ?? undefined;

  if (target !== 'all' && target !== 'brand') {
    return NextResponse.json({ error: 'target must be "all" or "brand"' }, { status: 400 });
  }
  if (target === 'brand' && !brandId) {
    return NextResponse.json({ error: 'brand_id required when target=brand' }, { status: 400 });
  }

  const supabase = createAdminClient();
  try {
    const userIds = await resolveTargetUserIds(supabase, target, brandId);
    const stats = await countRecipients(supabase, userIds);
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed to count recipients' },
      { status: 500 },
    );
  }
}
